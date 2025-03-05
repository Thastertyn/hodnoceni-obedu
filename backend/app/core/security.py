import requests
from datetime import datetime, timedelta, timezone
from typing import Any
import jwt
from passlib.context import CryptContext

from app.core.config import settings

from app.models.user_model import Login


class SecurityError(Exception):
    def __init__(self, message: str):
        super().__init__(message)
        self.message = message


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

ALGORITHM = "HS256"


def authenticate(credentials: Login) -> bool:
    try:
        login(credentials)
        return True
    except SecurityError:
        return False


BASE_URL = "https://strav.nasejidelna.cz/0341"
INITIAL_URL = f"{BASE_URL}/login"
LOGIN_URL = f"{BASE_URL}/j_spring_security_check"


def login(credentials: Login, session: requests.Session = None) -> None:

    if session is None:
        session = requests.Session()

    initial_response = session.get(INITIAL_URL)
    if initial_response.status_code != 200:
        raise SecurityError(f"Failed to load initial page (status code: {initial_response.status_code})")

    cookies = session.cookies.get_dict()
    csrf_token = cookies.get("XSRF-TOKEN")
    if not csrf_token:
        raise SecurityError("No CSRF token found in cookies")

    login_data = {
        "j_username": credentials.email,
        "j_password": credentials.password,
        "terminal": "false",
        "type": "web",
        "_csrf": csrf_token,
        "targetUrl": "/faces/secured/main.jsp"
    }
    headers = {
        "Content-Type": "application/x-www-form-urlencoded",
        "Origin": BASE_URL,
        "Referer": INITIAL_URL
    }

    login_response = session.post(LOGIN_URL, data=login_data, headers=headers, allow_redirects=False)
    if login_response.status_code != 302:
        raise SecurityError(f"Login failed (status code: {login_response.status_code})")

    redirect_location = login_response.headers.get("Location", "")
    if "login_error=1" in redirect_location:
        raise SecurityError("Invalid credentials")

    redirect_url = redirect_location if redirect_location.startswith("http") else f"{BASE_URL}{redirect_location}"
    session.get(redirect_url)
