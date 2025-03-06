from collections.abc import Generator
from typing import Annotated
from pydantic import ValidationError

from fastapi import Depends, HTTPException, status, Header
from sqlmodel import Session

from app.core.db import engine
from app.core.security import login

from app.models.user_model import Login

def require_login(
    username: str = Header(..., convert_underscores=False, alias="X-USERNAME"),
    password: str = Header(..., convert_underscores=False, alias="X-PASSWORD")
) -> Login:
    if not username or not password:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Missing credentials")

    credentials = Login(username=username, password=password)

    try:
        login(credentials)
        return credentials
    except:
        raise HTTPException(status_code=401, detail="Invalid credentials")

def get_db() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session


SessionDep = Annotated[Session, Depends(get_db)]
