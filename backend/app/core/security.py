import aiohttp

from fastapi import HTTPException


class SecurityError(Exception):
    pass


BASE_URL = "https://strav.nasejidelna.cz/0341"
INITIAL_URL = f"{BASE_URL}/login"
LOGIN_URL = f"{BASE_URL}/j_spring_security_check"


async def login(username: str, password: str, session: aiohttp.ClientSession = None) -> aiohttp.ClientSession:
    """Performs async login and returns the session with valid cookies."""

    if session is None:
        session = aiohttp.ClientSession()

    async with session.get(INITIAL_URL) as initial_response:
        if initial_response.status != 200:
            raise SecurityError(f"Failed to load initial page (status code: {initial_response.status})")

        # aiohttp stores cookies in the session's cookie_jar
        cookies = session.cookie_jar.filter_cookies(BASE_URL)
        csrf_token = cookies.get("XSRF-TOKEN")
        if not csrf_token:
            raise SecurityError("No CSRF token found in cookies")

        login_data = {
            "j_username": username,
            "j_password": password,
            "terminal": "false",
            "type": "web",
            "_csrf": csrf_token.value,
            "targetUrl": "/faces/secured/main.jsp"
        }

        headers = {
            "Content-Type": "application/x-www-form-urlencoded",
            "Origin": BASE_URL,
            "Referer": INITIAL_URL
        }

        async with session.post(LOGIN_URL, data=login_data, headers=headers, allow_redirects=False) as login_response:
            if login_response.status != 302:
                raise SecurityError(f"Login failed (status code: {login_response.status})")

            redirect_location = login_response.headers.get("Location", "")
            if "login_error=1" in redirect_location:
                raise HTTPException(status_code=401, detail="Invalid credentials")

    return session
