from collections.abc import Generator
from typing import Annotated
from pydantic import EmailStr, ValidationError

import jwt
from fastapi import Depends, HTTPException, status, Header
from jwt.exceptions import InvalidTokenError
from sqlmodel import Session

from app.core import security
from app.core.config import settings
from app.core.db import engine

from app.models.token_model import TokenPayload
from app.models.user_model import Login


def get_credentials(
    username: str = Header(..., convert_underscores=False, alias="X-USERNAME"),
    password: str = Header(..., convert_underscores=False, alias="X-PASSWORD")
) -> Login:
    if not username or not password:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Missing credentials")

    return Login(email=username, password=password)


def get_db() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session


SessionDep = Annotated[Session, Depends(get_db)]
LoginDep = Annotated[Login, Depends(get_credentials)]


def get_current_user_email(token: LoginDep) -> EmailStr:
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[security.ALGORITHM]
        )
        token_data = TokenPayload(**payload)
        return token_data.sub
    except (InvalidTokenError, ValidationError):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Could not validate credentials",
        )


CurrentUser = Annotated[EmailStr, Depends(get_current_user_email)]
