from typing import Annotated
from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordRequestForm 

from datetime import timedelta

from app.core.config import settings
from app.core import security

from app.models.lunch_model import LunchDayMenu
from app.models.token_model import Token

from app.crud.lunch_crud import get_lunch_by_date

from app.api.dependencies import SessionDep, CurrentUser


router = APIRouter(
    prefix="/login",
    tags=["Login"],
)

@router.post("/login/access-token")
def login_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()]
) -> Token:
    """
    OAuth2 compatible token login, get an access token for future requests
    """
    user = security.authenticate(
        email=form_data.username
    )
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    elif not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return Token(
        access_token=security.create_access_token(
            user.id, expires_delta=access_token_expires
        )
    )
