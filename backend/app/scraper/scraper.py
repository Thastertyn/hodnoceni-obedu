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
from app.models.lunch_model import Lunch
from app.crud.lunch_crud import create_lunch, CrudError


logger = logging.getLogger(__name__)


BASE_URL = "https://strav.nasejidelna.cz/0341"
INITIAL_URL = f"{BASE_URL}/login"
LOGIN_URL = f"{BASE_URL}/j_spring_security_check"
PER_DAY_URL = f"{BASE_URL}/faces/secured/db/dbJidelnicekOnDayView.jsp"
MONTH_VIEW_URL = f"{BASE_URL}/faces/secured/main.jsp?terminal=false&keyboard=false&printer=false"
MENU_AJAX_URL = f"{BASE_URL}/faces/secured/month.jsp?terminal=false&keyboard=false"



def scrape_week_ahead(session: Session):
    try:
        credentials = Login(email=settings.CANTEEN_USERNAME, password=settings.CANTEEN_PASSWORD)
        
        # Initialize session with headers
        http_session = requests.Session()
        http_session.headers.update({
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            "Accept-Language": "cs,en-US;q=0.7,en;q=0.3",
        })

        # Login to the session
        login(http_session, credentials)

        # Start scraping from today, skipping weekends
        today = datetime.today()
        days_ahead = 0

        while days_ahead < 5:  # Only scrape weekdays (Monday-Friday)
            scan_date = today + timedelta(days=days_ahead)

            # Skip weekends
            if scan_date.weekday() >= 5:  # 5 = Saturday, 6 = Sunday
                days_ahead += 1
                continue

            formatted_date = scan_date.strftime("%Y-%m-%d")  # Convert date to string

            try:
                # Scrape for the given date
                html_content = scrape(http_session, formatted_date)
                # Parse the HTML content into the expected format
                parsed_menu = parse_menu(html_content, formatted_date)

                # Create Lunch object
                lunch_data = Lunch(
                    option_id=parsed_menu.option_id,  # Assuming option_id exists in parsed data
                    lunch_date=scan_date.date(),
                    main_course=parsed_menu.main_course,
                    soup=parsed_menu.soup,
                    dessert=parsed_menu.dessert,
                    drink=parsed_menu.drink,
                )

                # Store lunch in database
                try:
                    create_lunch(session=session, lunch_create=lunch_data)
                except CrudError as e:
                    print(f"Skipping duplicate entry for {formatted_date}: {e}")

            except Exception as e:
                print(f"Error scraping for {formatted_date}: {e}")

            days_ahead += 1  # Move to the next weekday

    except Exception as e:
        print(f"Critical error in scraping process: {e}")


def extract_view_state(html_content: str) -> Optional[str]:
    """Extract ViewState from HTML content."""
    match = re.search(r'id="j_id__v_0:javax\.faces\.ViewState:1" value="([^"]+)"', html_content)
    if match:
        return match.group(1)
    return None

def scrape(session: requests.Session, date_str: str) -> str:
    """
    Scrape the lunch menu for the specified date.
    Returns the raw HTML content containing the menu.
    """
    logger.info("Accessing month view")
    month_view_response = session.get(MONTH_VIEW_URL)
    if month_view_response.status_code != 200:
        logger.error(f"Failed to access month view: {month_view_response.status_code}")
        raise HTTPException(status_code=500, detail="Failed to access month view page")

    view_state = extract_view_state(month_view_response.text)
    if not view_state:
        logger.warning("Could not extract ViewState, proceeding without it")

    # Hit the AJAX menu page to set cookies/session state.
    menu_page_response = session.get(MENU_AJAX_URL)
    if menu_page_response.status_code != 200:
        logger.error(f"Failed to access menu page: {menu_page_response.status_code}")
        raise HTTPException(status_code=500, detail="Failed to access menu page")

    if view_state:
        form_data = {
            "javax.faces.ViewState": view_state,
            "javax.faces.source": "formJidelnicek:odeslat",
            "javax.faces.partial.execute": "@all",
            "javax.faces.partial.render": "formJidelnicek",
            "formJidelnicek:odeslat": "formJidelnicek:odeslat"
        }
        ajax_headers = {
            "X-Requested-With": "XMLHttpRequest",
            "Faces-Request": "partial/ajax",
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            "Referer": MENU_AJAX_URL
        }
        session.post(MENU_AJAX_URL, data=form_data, headers=ajax_headers)
        time.sleep(0.5)

    logger.info(f"Requesting menu for date: {date_str}")
    day_params = {
        "day": date_str,
        "status": "true",
        "keyboard": "false",
        "printer": "false",
        "terminal": "false"
    }

    # Try with different Referer headers
    for referer in [MENU_AJAX_URL, MONTH_VIEW_URL]:
        day_headers = {
            "Referer": referer,
            "Cache-Control": "no-cache",
            "Pragma": "no-cache"
        }
        menu_response = session.get(PER_DAY_URL, params=day_params, headers=day_headers)
        if menu_response.status_code == 200 and len(menu_response.text.strip()) > 10:
            logger.info(f"Received menu response with {len(menu_response.text)} bytes")
            return menu_response.text
        else:
            logger.warning(f"Request with referer {referer} failed: {menu_response.status_code}")

    # Alternative approach if needed
    logger.info("Trying alternative approach for scraping")
    session.get(f"{BASE_URL}/faces/secured/main.jsp")
    final_attempt = session.get(PER_DAY_URL, params={"day": date_str, "status": "true"},
                                headers={"Referer": f"{BASE_URL}/faces/secured/main.jsp"})
    if final_attempt.status_code == 200 and len(final_attempt.text.strip()) > 10:
        logger.info("Final attempt successful")
        return final_attempt.text

    logger.error("All attempts to scrape menu failed")
    raise HTTPException(status_code=500, detail="All attempts to get menu failed")

# ------------------- Method 3: Parse -------------------

def parse_menu(html_content: str, date_obj: datetime.date) -> LunchMenuPerDay:
    """
    Parse the scraped HTML content into a LunchMenuPerDay model.
    It now locates the dish details using an element id in the form:
    "menu-{lunch number - 1}-day-{YYYY-MM-DD}".
    """
    soup = BeautifulSoup(html_content, "html.parser")
    menu_items = soup.find_all("div", class_="jidelnicekItem")
    if not menu_items:
        logger.error("No menu items found in the scraped content")
        raise HTTPException(status_code=500, detail="No menu items found")
    
    day_menu: Dict[int, LunchItem] = {}
    # Convert date object to string in expected format (YYYY-MM-DD)
    date_str = date_obj.strftime("%Y-%m-%d") if isinstance(date_obj, datetime.date) else date_obj
    
    for item in menu_items:
        # Extract the lunch number from the 'smallBoldTitle' span (e.g., "Oběd 1")
        lunch_title_span = item.find("span", class_="smallBoldTitle")
        if not lunch_title_span:
            logger.warning("Missing lunch title span; skipping item")
            continue
        text = lunch_title_span.get_text(strip=True)
        match = re.search(r'\d+', text)
        if match:
            lunch_number = int(match.group())
        else:
            logger.warning("Could not determine lunch number; skipping item")
            continue
        
        # Check if this lunch item was ordered by examining the 'a' tag's classes.
        a_tag = item.find("a", class_="btn")
        was_ordered = a_tag is not None and "ordered" in a_tag.get("class", [])
        
        # Use the reliable element id: "menu-{lunch number - 1}-day-{YYYY-MM-DD}"
        center_id = f"menu-{lunch_number - 1}-day-{date_str}"
        center_div = soup.find("div", id=center_id)
        if not center_div:
            logger.warning(f"Center div with id {center_id} not found; skipping lunch {lunch_number}")
            continue
        
        # Remove any extraneous <sub> tags before extracting the text
        for sub in center_div.find_all("sub"):
            sub.decompose()
        dishes_text = center_div.get_text(separator=" ", strip=True)
        # Split the dish text on commas or semicolons with optional whitespace around them
        parts = [part.strip() for part in re.split(r'\s*[;,]\s*', dishes_text) if part.strip()]
        
        # Map the parts to our model fields based on the expected format:
        # 3 parts: [soup, main course, drink] (dessert is None)
        # 4 parts: [soup, main course, dessert, drink]
        if len(parts) == 3:
            soup_item, main_course_item, drink_item = parts
            dessert_item = None
        elif len(parts) == 4:
            soup_item, main_course_item, dessert_item, drink_item = parts
        else:
            logger.warning(f"Unexpected dish parts format for lunch {lunch_number}: {parts}")
            soup_item = parts[0] if len(parts) > 0 else ""
            main_course_item = parts[1] if len(parts) > 1 else ""
            drink_item = parts[-1] if parts else ""
            dessert_item = None

        lunch_item = LunchItem(
            soup=soup_item,
            main_course=main_course_item,
            dessert=dessert_item,
            drink=drink_item,
            was_ordered=was_ordered
        )
        day_menu[lunch_number] = lunch_item
    
    if not day_menu:
        logger.error("No valid menu items parsed")
        raise HTTPException(status_code=500, detail="Failed to parse any menu items")
    
    return LunchMenuPerDay(root=day_menu)
