import logging
from typing import List, Tuple, Dict
import requests
from bs4 import BeautifulSoup
from fastapi import APIRouter, Depends, HTTPException

from ..dependencies import get_credentials, get_jsession_cookies

router = APIRouter(
    prefix="/scraper",
    tags=["scraper"],
    responses={404: {"description": "Not found"}},
)

logger = logging.getLogger(__name__)

BASE_URL = "https://strav.nasejidelna.cz/0341"
INITIAL_URL = f"{BASE_URL}/"
LOGIN_URL = f"{BASE_URL}/login"
LUNCH_URL = f"{BASE_URL}/faces/secured/month.jsp"


@router.post(
    "/login",
    summary="Login to scraper",
    description="Authenticates using username and password, retrieves JSESSIONID for scraping.",
)
def login(credentials: dict = Depends(get_credentials)):
    session = requests.Session()

    # Fetch the login page first to ensure we have all required cookies
    session.get(LOGIN_URL)

    cookies = session.cookies.get_dict()

    if "JSESSIONID" not in cookies or "XSRF-TOKEN" not in cookies:
        raise HTTPException(status_code=400, detail="Missing required session cookies")

    logger.debug("Initial cookies: %s", cookies)

    csrf_token = cookies.get("XSRF-TOKEN")

    headers = {
        "Host": "strav.nasejidelna.cz",
        "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:134.0) Gecko/20100101 Firefox/134.0",
        "Accept": "text/html",
        "Accept-Language": "cs",
        "Content-Type": "application/x-www-form-urlencoded",
        "Origin": "https://strav.nasejidelna.cz",
        "Sec-GPC": "1",
        "Referer": f"{BASE_URL}/login",
        "Upgrade-Insecure-Requests": "1",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "same-origin",
        "Sec-Fetch-User": "?1",
        "Priority": "u=0, i",
        "X-XSRF-TOKEN": csrf_token,  # Send CSRF token in headers
        "Connection": "keep-alive"
    }

    session.cookies.update(cookies)  # Ensure cookies persist

    form_data = {
        "j_username": credentials["username"],
        "j_password": credentials["password"],
        "terminal": "false",
        "_csrf": csrf_token,  # Change from "_csrf"
        "targetUrl": "/faces/secured/main.jsp?status=true&printer=&keyboard="
    }

    response = session.post(LOGIN_URL, headers=headers, data=form_data, allow_redirects=False)

    logger.debug("Response headers: %s", response.headers)
    logger.debug("Cookies after login: %s", session.cookies.get_dict())
    logger.debug("Response body: %s", response.text[:500])

    # Check for expected redirection
    if response.status_code == 302:
        location = response.headers.get("Location", "")

        if "login_error=1" in location:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        elif "faces/secured/main.jsp" in location:
            # Capture new session cookies after login
            session_cookies = session.cookies.get_dict()
            return {
                "message": "Login successful",
                "cookies": session_cookies
            }
        else:
            logger.debug("Redirect location: %s", location)
            raise HTTPException(status_code=400, detail="Unexpected redirect location")

    # Fallback: If no redirect, check response content for failure indicators
    if response.status_code == 200:
        if "login-failed" in response.text or "login_error=1" in response.url:
            raise HTTPException(status_code=401, detail="Invalid credentials")

    raise HTTPException(status_code=500, detail="Unexpected login response")


@router.get("/scrape-jidelnicek", response_model=List[str])
def scrape_jidelnicek():
    """
    Scrapes the third column text only if the second column text is "Ječná" from the LOGIN_URL page.
    """
    response = requests.get(LOGIN_URL)

    if response.status_code != 200:
        raise HTTPException(status_code=500, detail="Failed to fetch login page")

    soup = BeautifulSoup(response.text, "html.parser")

    divs = []
    article = soup.select_one("article")
    if not article:
        raise HTTPException(status_code=404, detail="No article element found")

    for container in article.select("div.container"):
        second_column_elements = container.select(".shrinkedColumn.jidelnicekItem")
        second_column = second_column_elements[1] if len(second_column_elements) > 1 else None
        third_column = container.select_one(".column.jidelnicekItem")

        if second_column and third_column:
            second_text = second_column.get_text(strip=True)
            third_text = third_column.get_text(separator=" ", strip=True)

            if second_text == "Ječná":
                divs.append(third_text)
                logger.debug(f"Matched 'Ječná': {third_text}")

    if not divs:
        raise HTTPException(status_code=404, detail="No matching jidelnicekDen elements found")

    return divs


def fetch_lunch_options(date: str, cookies: dict) -> List[Tuple[int, str]]:
    """Scrape lunch options for a given date"""
    session = requests.Session()

    headers = {
        "Cookie": f"JSESSIONID={cookies['JSESSIONID']}; XSRF-TOKEN={cookies['XSRF-TOKEN']}"
    }

    response = session.get(LUNCH_URL, headers=headers)

    if response.status_code != 200:
        raise HTTPException(status_code=500, detail="Failed to fetch lunch page")

    soup = BeautifulSoup(response.text, "html.parser")

    lunch_options = []

    # Extract 1st option
    option_1 = soup.select_one(f"#menu-0-day-{date}")
    if option_1:
        lunch_options.append((1, option_1.get_text(strip=True)))

    # Extract 2nd option
    option_2 = soup.select_one(f"#menu-1-day-{date}")
    if option_2:
        lunch_options.append((2, option_2.get_text(strip=True)))

    return lunch_options


@router.get("/scrape-lunch/{date}", response_model=List[Tuple[int, str]])
def scrape_lunch(
    date: str,
    cookies: dict = Depends(get_jsession_cookies)  # Use new dependency
):
    """
    Fetches the lunch options for the given date.
    :param date: Date in the format YYYY-MM-DD
    :return: List of tuples (option_number, lunch_name)
    """
    return fetch_lunch_options(date, cookies)
