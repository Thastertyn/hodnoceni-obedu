from typing import Annotated, Dict

from fastapi import Header, HTTPException, Request, Body
from pydantic import BaseModel


async def get_token_header(x_token: Annotated[str, Header()]):
    if x_token != "fake-super-secret-token":
        raise HTTPException(status_code=400, detail="X-Token header invalid")


async def get_authentication_headers(
    jsessionid: Annotated[str, Header(alias="JSESSIONID")],
    xsrf_token: Annotated[str, Header(alias="XSRF-TOKEN")]
) -> Dict[str, str]:
    """
    Extract JSESSIONID and XSRF-TOKEN from request headers.
    Returns them as a dictionary.
    """
    if not jsessionid:
        raise HTTPException(status_code=400, detail="JSESSIONID header is required")

    if not xsrf_token:
        raise HTTPException(status_code=400, detail="XSRF-TOKEN header is required")

    return {"JSESSIONID": jsessionid, "XSRF-TOKEN": xsrf_token}


async def get_query_token(token: str):
    if token != "jessica":
        raise HTTPException(status_code=400, detail="No Jessica token provided")
