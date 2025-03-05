import datetime
from datetime import datetime, timedelta
import re
import logging
import time
import requests
from bs4 import BeautifulSoup
from typing import Optional, Dict

from app.models.user_model import Login
from app.schemas.lunch_schema import LunchItem, LunchMenuPerDay
from app.core.security import login
from app.core.config import settings
from sqlmodel import Session
from app.models.lunch_model import Lunch, LunchDayMenu
from app.crud.lunch_crud import create_lunch, CrudError

logger = logging.getLogger(__name__)


class ScrapeError(Exception):
    """Custom exception for scraping errors."""

    def __init__(self, message: str):
        super().__init__(message)
        logger.error(message)


BASE_URL = "https://strav.nasejidelna.cz/0341"
INITIAL_URL = f"{BASE_URL}/login"
LOGIN_URL = f"{BASE_URL}/j_spring_security_check"
PER_DAY_URL = f"{BASE_URL}/faces/secured/db/dbJidelnicekOnDayView.jsp"
MONTH_VIEW_URL = f"{BASE_URL}/faces/secured/main.jsp?terminal=false&keyboard=false&printer=false"
MENU_AJAX_URL = f"{BASE_URL}/faces/secured/month.jsp?terminal=false&keyboard=false"


def scrape_week_ahead(session: Session):
    try:
        credentials = Login(email=settings.CANTEEN_USERNAME, password=settings.CANTEEN_PASSWORD)

        http_session = requests.Session()
        http_session.headers.update({
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            "Accept-Language": "cs,en-US;q=0.7,en;q=0.3",
        })

        login(credentials, http_session)

        today = datetime.today()
        days_ahead = 0

        while days_ahead < 5:
            scan_date = today + timedelta(days=days_ahead)
            if scan_date.weekday() >= 5:
                days_ahead += 1
                continue

            formatted_date = scan_date.strftime("%Y-%m-%d")

            try:
                html_content = scrape(http_session, formatted_date)
                parsed_menu = parse_menu(html_content, scan_date.date())

                try:
                    create_lunch(session=session, lunch_create=parsed_menu)
                except CrudError as e:
                    logger.warning(f"Skipping duplicate entry for {formatted_date}: {e}")

            except ScrapeError as e:
                logger.error(f"Error scraping for {formatted_date}: {e}")

            days_ahead += 1

    except ScrapeError as e:
        logger.critical(f"Critical error in scraping process: {e}")


def extract_view_state(html_content: str) -> Optional[str]:
    """Extract ViewState from HTML content."""
    match = re.search(r'id="j_id__v_0:javax\.faces\.ViewState:1" value="([^"]+)"', html_content)
    if match:
        return match.group(1)
    return None


def scrape(session: requests.Session, date_str: str) -> str:
    logger.info("Accessing month view")
    month_view_response = session.get(MONTH_VIEW_URL)
    if month_view_response.status_code != 200:
        raise ScrapeError(f"Failed to access month view: {month_view_response.status_code}")

    view_state = extract_view_state(month_view_response.text)

    menu_page_response = session.get(MENU_AJAX_URL)
    if menu_page_response.status_code != 200:
        raise ScrapeError(f"Failed to access menu page: {menu_page_response.status_code}")

    logger.info(f"Requesting menu for date: {date_str}")
    day_params = {"day": date_str, "status": "true", "keyboard": "false", "printer": "false", "terminal": "false"}

    for referer in [MENU_AJAX_URL, MONTH_VIEW_URL]:
        day_headers = {"Referer": referer, "Cache-Control": "no-cache", "Pragma": "no-cache"}
        menu_response = session.get(PER_DAY_URL, params=day_params, headers=day_headers)
        if menu_response.status_code == 200 and len(menu_response.text.strip()) > 10:
            return menu_response.text

    raise ScrapeError("All attempts to scrape menu failed")


def parse_menu(html_content: str, date_obj: datetime.date) -> LunchMenuPerDay:
    soup = BeautifulSoup(html_content, "html.parser")
    menu_items = soup.find_all("div", class_="jidelnicekItem")
    if not menu_items:
        raise ScrapeError("No menu items found in the scraped content")

    day_menu: Dict[int, Lunch] = {}
    date_str = date_obj.strftime("%Y-%m-%d")

    for item in menu_items:
        lunch_title_span = item.find("span", class_="smallBoldTitle")
        if not lunch_title_span:
            continue
        match = re.search(r'\d+', lunch_title_span.get_text(strip=True))
        if match:
            lunch_number = int(match.group())
        else:
            continue

        a_tag = item.find("a", class_="btn")
        was_ordered = a_tag is not None and "ordered" in a_tag.get("class", [])
        center_id = f"menu-{lunch_number - 1}-day-{date_str}"
        center_div = soup.find("div", id=center_id)
        if not center_div:
            continue

        for sub in center_div.find_all("sub"):
            sub.decompose()
        dishes_text = center_div.get_text(separator=" ", strip=True)
        parts = [part.strip() for part in re.split(r'\s*[;,]\s*', dishes_text) if part.strip()]

        if len(parts) < 3:
            continue  # Invalid parsing case

        soup_item = parts[0]
        drink_item = parts[-1]
        main_course_item = None
        dessert_item = None

        if len(parts) == 4:
            main_course_item = f"{parts[1]}, {parts[2]}"
            dessert_item = parts[3]
        else:
            main_course_item = f"{parts[1]}, {parts[2]}"
            dessert_item = None

            # Attempt to detect if last item before drink is dessert
            if parts[2] and re.match(r'^(ovoce|pudink|kompot|dort|sušenka|zákusek)$', parts[2], re.IGNORECASE):
                dessert_item = parts[2]
                main_course_item = parts[1]  # Only the second part is the main course

        lunch_item = Lunch(
            option_id=lunch_number,
            lunch_date=date_str,
            soup=soup_item,
            main_course=main_course_item,
            dessert=dessert_item,
            drink=drink_item,
            # was_ordered=was_ordered Removed for simplicity
        )
        day_menu[lunch_number] = lunch_item

    if not day_menu:
        raise ScrapeError("No valid menu items parsed")

    return LunchDayMenu(root=day_menu)
