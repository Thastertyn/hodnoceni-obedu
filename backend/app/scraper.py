import asyncio
import aiohttp
import time

from typing import Optional
import datetime
from datetime import date, timedelta
import re
import logging

from selectolax.parser import HTMLParser
from sqlmodel import Session

from app.models import Lunch
from app.core.security import login
from app.crud import get_rating_for_day

logger = logging.getLogger(__name__)


class ScrapeError(Exception):
    """Custom exception for scraping errors."""


BASE_URL = "https://strav.nasejidelna.cz/0341"
INITIAL_URL = f"{BASE_URL}/login"
LOGIN_URL = f"{BASE_URL}/j_spring_security_check"
PER_DAY_URL = f"{BASE_URL}/faces/secured/db/dbJidelnicekOnDayView.jsp"
MONTH_VIEW_URL = f"{BASE_URL}/faces/secured/main.jsp?terminal=false&keyboard=false&printer=false"
MENU_AJAX_URL = f"{BASE_URL}/faces/secured/month.jsp?terminal=false&keyboard=false"

async def has_user_ordered_for_day(*, day: date, username: str, password: str) -> bool:
    async with aiohttp.ClientSession() as http_session:
        await login(username, password, http_session)

        
        logging.info("Performing get for first url")
        start = time.perf_counter()
        async with http_session.get(MONTH_VIEW_URL) as month_view_response:
            if month_view_response.status != 200:
                raise ScrapeError(f"Failed to access month view: {month_view_response.status}")
        logger.info("First url took %0.2fs", time.perf_counter() - start)


        result = await asyncio.gather(get_lunch_for_day(session=http_session, day=day))
        
        return (result[0][1] is not None)

async def get_all_days(*, session: Session, day: date = None, past: int, future: int, username: str, password: str) -> dict[str, dict]:
    full_start = time.perf_counter()
    if day is None:
        day = date.today()
    start_date = day - timedelta(days=past)
    end_date = day + timedelta(days=future)

    workdays = [
        current_date for i in range((end_date - start_date).days + 1)
        if (current_date := start_date + timedelta(days=i)).weekday() < 5  # Monday - Friday -> 0 - 4
    ]

    async with aiohttp.ClientSession() as http_session:
        logging.info("Logging in as %s", username)
        start = time.perf_counter()
        await login(username, password, http_session)
        logging.info("Login took %0.2fs", time.perf_counter() - start)

        logging.info("Performing get for first url")
        start = time.perf_counter()
        async with http_session.get(MONTH_VIEW_URL) as month_view_response:
            if month_view_response.status != 200:
                raise ScrapeError(f"Failed to access month view: {month_view_response.status}")
        logger.info("First url took %0.2fs", time.perf_counter() - start)


        logging.info("Defining all tasks")
        
        tasks = [
            get_lunch_for_day(session=http_session, day=day)
            for day in workdays
        ]
        logging.info("Waiting for all tasks to finish")
        lunches = await asyncio.gather(*tasks)

        logger.info("Full process took %0.2fs", time.perf_counter() - full_start)

        final_data = {
            day.strftime("%Y-%m-%d"): {
                "lunch": lunch.dict() if lunch else None,
                "rating": get_rating_for_day(session=session, day=day, username=username)
            }
            for day, lunch in lunches
        }

        logger.info("Full process took %0.2fs", time.perf_counter() - full_start)
        return final_data

async def get_lunch_for_day(*, day: date, session: aiohttp.ClientSession) -> tuple[date, Optional[Lunch]]:
    formatted_date = day.strftime("%Y-%m-%d")
    logging.info("Fetching HTML for day %s", day)
    start = time.perf_counter()
    html_content = await scrape(session, formatted_date)
    logging.info("Fetch took %0.2fs", time.perf_counter() - start)


    try:
        logger.info("Parsing data for day %s", day)
        start = time.perf_counter()
        parsed_lunch = parse_selected_lunch(html_content, day)
        logging.info("Parse took %0.2fs", time.perf_counter() - start)

        return day, parsed_lunch
    except ScrapeError:
        return day, None


async def scrape(session: aiohttp.ClientSession, date_str: str) -> str:
    logger.info("Accessing month view")

    logger.info("Requesting menu for date: %s", date_str)
    day_params = {
        "day": date_str,
        "status": "true",
        "keyboard": "false",
        "printer": "false",
        "terminal": "false"
    }

    async with session.get(PER_DAY_URL, params=day_params) as menu_response:
        text = await menu_response.text()
        if menu_response.status == 200 and len(text.strip()) > 10:
            return text

    raise ScrapeError("All attempts to scrape menu failed")


def parse_selected_lunch(html_content: str, date_obj: datetime.date) -> Optional[Lunch]:
    tree = HTMLParser(html_content)
    menu_items = tree.css("div.jidelnicekItem")

    if not menu_items:
        return None

    date_str = date_obj.strftime("%Y-%m-%d")

    for item in menu_items:
        # Look for a `.button-link-tick` inside this item
        if not item.css_first(".button-link-tick"):
            continue

        title_span = item.css_first("span.smallBoldTitle")
        if not title_span:
            continue

        match = re.search(r'\d+', title_span.text(strip=True))
        if not match:
            continue

        lunch_number = int(match.group())
        center_id = f"menu-{lunch_number - 1}-day-{date_str}"
        center_div = tree.css_first(f"div#{center_id}")
        if not center_div:
            continue

        # Remove all <sub> elements (like in BeautifulSoup)
        for sub in center_div.css("sub"):
            sub.remove()

        # Get and process the text
        dishes_text = center_div.text(separator=" ", strip=True)
        parts = [part.strip() for part in re.split(r'\s*[;,]\s*', dishes_text) if part.strip()]

        if len(parts) < 3:
            continue

        soup_item = parts[0]
        drink_item = parts[-1]
        main_course_item = ", ".join(parts[1:-1])

        return Lunch(
            lunch_date=date_obj,
            main_course=main_course_item,
            drink=drink_item,
            soup=soup_item
        )

    return None
