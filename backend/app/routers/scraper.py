import logging
import requests
from bs4 import BeautifulSoup
from fastapi import APIRouter, HTTPException, Depends

from app.schemas.login_schema import LoginSchema
from app.schemas.lunch_schema import LunchMenuPerDay

from app.dependencies import get_authentication_headers

router = APIRouter(
    prefix="/scraper",
    tags=["scraper"],
    responses={404: {"description": "Not found"}},
)

logger = logging.getLogger(__name__)

BASE_URL = "https://strav.nasejidelna.cz/0341"
INITIAL_URL = f"{BASE_URL}/"
LOGIN_URL = f"{BASE_URL}/j_spring_security_check"
LUNCH_URL = f"{BASE_URL}/faces/secured/month.jsp"


@router.get("/scrape-jidelnicek", response_model=LunchMenuPerDay)
def scrape_jidelnicek(headers = Depends(get_authentication_headers)):
    """
    Scrapes the third column text only if the second column text is "Ječná" from the LOGIN_URL page.
    """
    response = requests.get(LOGIN_URL)

    if response.status_code != 200:
        raise HTTPException(status_code=500, detail="Failed to fetch login page")

    soup = BeautifulSoup(response.text, "html.parser")

    all_days = soup.select("div.jidelnicekDen")
    result_divs = []

    for day in all_days:
        divs = []

        article = day.select_one("article")
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

        result_divs.append(divs)

    if not divs:
        raise HTTPException(status_code=404, detail="No matching jidelnicekDen elements found")

    return result_divs


@router.post(
    "/login",
    summary="Login to scraper",
    description="Authenticates using username and password, retrieves JSESSIONID for scraping.",
)
def login(credentials: LoginSchema):
    session = requests.Session()

    session.head(BASE_URL)

    cookies = session.cookies.get_dict()

    if "JSESSIONID" not in cookies or "XSRF-TOKEN" not in cookies:
        raise HTTPException(status_code=400, detail="Missing required session cookies")

    logger.debug("Initial cookies: %s", cookies)

    csrf_token = cookies.get("XSRF-TOKEN")

    headers = {
        "Host": "strav.nasejidelna.cz",
        "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:134.0) Gecko/20100101 Firefox/134.0",
        "Content-Type": "application/x-www-form-urlencoded",
        "Origin": "https://strav.nasejidelna.cz",
        "Referer": f"{BASE_URL}/login",
    }

    session.cookies.update(cookies)

    form_data = {
        "j_username": credentials.username,
        "j_password": credentials.password,
        "terminal": "false",
        "_csrf": csrf_token,
        "targetUrl": "/faces/secured/main.jsp"
    }

    response = session.post(LOGIN_URL, headers=headers, data=form_data, allow_redirects=False)

    if response.status_code == 302:
        location = response.headers.get("Location", "")

        if "login_error=1" in location:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        elif "faces/secured/main.jsp" in location:
            session_cookies = session.cookies.get_dict()
            return {
                "message": "Login successful",
                "cookies": session_cookies
            }
        else:
            logger.debug("Redirect location: %s", location)
            raise HTTPException(status_code=400, detail="Unexpected redirect location")

    raise HTTPException(status_code=500, detail="Unexpected login response")
