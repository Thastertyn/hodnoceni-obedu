from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, Query, HTTPException, status

from app.api.dependencies import require_login, SessionDep
from app.core import security
from app.models import Login, RatingCreate, LunchData
from app import crud
from app import scraper

router = APIRouter()


@router.get("/lunch")
async def get_lunch_for_day(
    session: SessionDep,
    day: date = date.today(),
    credentials: Login = Depends(require_login),
    past: Optional[int] = Query(0, ge=0),
    future: Optional[int] = Query(0, ge=0)
) -> LunchData:
    result = await scraper.get_all_days(
        session=session,
        day=day,
        past=past,
        future=future,
        username=credentials.username,
        password=credentials.password
    )
    return result


@router.post("/lunch/{day}/rate")
async def rate_lunch(
    session: SessionDep,
    day: date,
    rating: RatingCreate,
    credentials: Login = Depends(require_login)
) -> bool:
    try:
        has_ordered = await scraper.has_user_ordered_for_day(day=day, username=credentials.username, password=credentials.password)

        if not has_ordered:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Lunch not ordered for this day")

        crud.create_rating(session=session, rating_create=rating, day=day, username=credentials.username)
        return True
    except crud.CrudError:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Rating already exists")

@router.post("/verify-login")
async def verify_login(
    credentials: Login = Depends(require_login)
    ) -> bool:
    await security.login(username=credentials.username, password=credentials.password)
    return True