import datetime
import logging
import requests
from bs4 import BeautifulSoup
from fastapi import APIRouter, HTTPException, Depends

from app.schemas.login_schema import LoginSchema
from app.schemas.lunch_schema import LunchMenuPerDay, LunchItem
from app.schemas.resposne_schema import LoginResponse

from app.dependencies import get_authentication_headers

router = APIRouter(
    prefix="/scraper",
    tags=["scraper"],
)

logger = logging.getLogger(__name__)

BASE_URL = "https://strav.nasejidelna.cz/0341"
INITIAL_URL = f"{BASE_URL}/login"
LOGIN_URL = f"{BASE_URL}/j_spring_security_check"
LUNCH_URL = f"{BASE_URL}/faces/secured/month.jsp"

PER_DAY_URL = f"{BASE_URL}/faces/secured/db/dbJidelnicekOnDayView.jsp"


@router.post("/scrape-jidelnicek")
def scrape_jidelnicek(credentials: LoginSchema, date: datetime.date):
    session = requests.Session()

    session.head(INITIAL_URL)

    cookies = session.cookies.get_dict()

    if "JSESSIONID" not in cookies or "XSRF-TOKEN" not in cookies:
        logger.info("%s", str(cookies))
        raise HTTPException(status_code=400, detail="Missing required session cookies")

    csrf_token = cookies.get("XSRF-TOKEN")

    headers = {
        "Host": "strav.nasejidelna.cz",
        "Accept": "text/html",
        "Content-Type": "application/x-www-form-urlencoded",
        "Origin": "https://strav.nasejidelna.cz",
    }

    session.cookies.update(cookies)

    form_data = {
        "j_username": credentials.username,
        "j_password": credentials.password,
        "terminal": "false",
        "type": "web",
        "_csrf": csrf_token,
        "targetUrl": "/faces/secured/main.jsp"
    }

    response = session.post(LOGIN_URL, data=form_data, allow_redirects=False)

    if response.status_code == 302:
        location = response.headers.get("Location", "")

        if "login_error=1" in location:
            raise HTTPException(status_code=401, detail="Invalid credentials")

    response = session.get(PER_DAY_URL, timeout=10, params={"day": str(date), "status": True, "keyboard": False, "printer": False, "terminal": False})

    if response.status_code != 200:
        raise HTTPException(status_code=500, detail="Failed to fetch lunch data")

    logger.info(response.headers)

    soup = BeautifulSoup(response.text, "html.parser")

    return response.text
    all_days = []
    result_data = {}

    print(len(all_days))
    for day in all_days:
        date_div = day.select_one("div.jidelnicekTop")
        if not date_div:
            continue
        date_text = date_div.get_text(strip=True)

        lunches = {}
        for idx, item in enumerate(day.select(".jidelnicekItem"), start=1):
            menu_text_element = item.select_one(".jidWrapCenter")
            order_button = item.select_one(".btn.button-link")

            if menu_text_element:
                menu_text_parts = menu_text_element.get_text(separator=", ", strip=True).split("; ")
                main_course = menu_text_parts[1] if len(menu_text_parts) > 1 else "Unknown"
                soup = menu_text_parts[0] if menu_text_parts else "Unknown"
                dessert = menu_text_parts[2] if len(menu_text_parts) > 2 else None
                drink = "Unknown"
                ordered = "fa-check" in str(order_button) if order_button else False

                lunches[idx] = LunchItem(
                    main_course=main_course,
                    soup=soup,
                    dessert=dessert,
                    drink=drink,
                    was_ordered=ordered
                )

        result_data[date_text] = lunches

    if not result_data:
        raise HTTPException(status_code=404, detail="No lunch data found")

    return LunchMenuPerDay(root=result_data)
