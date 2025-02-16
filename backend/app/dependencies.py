from typing import Annotated

from pydantic import BaseModel

from fastapi import Header, HTTPException, Request, Body


async def get_token_header(x_token: Annotated[str, Header()]):
    if x_token != "fake-super-secret-token":
        raise HTTPException(status_code=400, detail="X-Token header invalid")


class LoginRequest(BaseModel):
    username: str
    password: str

async def get_jsession_id(request: Request):
    jsessionid = (
        request.headers.get("JSESSIONID")
        or request.cookies.get("JSESSIONID")
        or request.query_params.get("jsessionid")
    )

    if not jsessionid:
        raise HTTPException(status_code=400, detail="JSESSIONID is required for this operation")

    return jsessionid

async def get_credentials(credentials: LoginRequest = Body(...)):
    return credentials.dict()



async def get_query_token(token: str):
    if token != "jessica":
        raise HTTPException(status_code=400, detail="No Jessica token provided")
