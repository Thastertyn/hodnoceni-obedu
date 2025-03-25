from collections.abc import Generator
from typing import Annotated

from fastapi import Depends, HTTPException, status, Header
from pydantic import SecretStr
from sqlmodel import Session

from app.core.db import engine

from app.models import Login

def require_login(
    username: str = Header(..., convert_underscores=False, alias="X-USERNAME"),
    password: SecretStr = Header(..., convert_underscores=False, alias="X-PASSWORD")
) -> Login:
    if not username or not password:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Missing credentials")

    credentials = Login(username=username, password=password.get_secret_value())

    return credentials

def get_db() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session


SessionDep = Annotated[Session, Depends(get_db)]
