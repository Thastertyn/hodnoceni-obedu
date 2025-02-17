from typing import Dict
import requests

from fastapi import APIRouter, Depends, HTTPException

from ..dependencies import get_credentials

router = APIRouter(
    prefix="/scraper",
    tags=["scraper"],
    responses={404: {"description": "Not found"}},
)

BASE_URL = "https://strav.nasejidelna.cz/0341"
INITIAL_URL = f"{BASE_URL}/"
LOGIN_URL = f"{BASE_URL}/login"


def fetch_initial_session() -> Dict[str, str]:
    session = requests.Session()
    session.head(INITIAL_URL)

    cookies = session.cookies.get_dict()

    if "JSESSIONID" not in cookies or "XSRF-TOKEN" not in cookies:
        raise HTTPException(status_code=400, detail="Missing required session cookies")

    return cookies

@router.post(
    "/login",
    summary="Login to scraper",
    description="Authenticates using username and password, retrieves JSESSIONID for scraping.",
)
def login(credentials: dict = Depends(get_credentials)):
    session_cookies = fetch_initial_session()
    session = requests.Session()

    csrf_token = session_cookies.get("XSRF-TOKEN")

    headers = {
        "Content-Type": "application/x-www-form-urlencoded"
    }

    form_data = {
        "j_username": credentials["username"],
        "j_password": credentials["password"],
        "terminal": "false",
        "_csrf": csrf_token,
        "targetUrl": "/faces/secured/main.jsp?status=true&printer=&keyboard="
    }

    response = session.post(LOGIN_URL, headers=headers, data=form_data, cookies=session_cookies)

    if response.status_code != 200:
        raise HTTPException(status_code=401, detail="Login failed")

    final_cookies = session.cookies.get_dict()

    return {
        "message": "Login successful",
        "cookies": final_cookies
    }