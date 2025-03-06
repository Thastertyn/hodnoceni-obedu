import datetime
from fastapi import APIRouter, Depends

from app.models.lunch_model import Lunch
from app.models.rating_model import CreateRating
from app.models.user_model import Login

from app.crud import lunch_crud, rating_crud

from app.api.dependencies import SessionDep, require_login


router = APIRouter(
    prefix="/lunch",
    tags=["Lunch"],
    dependencies=[Depends(require_login)]
)


@router.get("", response_model=Lunch, name="Get lunch options for a day")
def get_lunch_for_day(session: SessionDep, date: datetime.date):
    return lunch_crud.get_lunch_by_date(lunch_date=date, session=session)


@router.get("/all", response_model=list[Lunch])
def get_all_lunches(session: SessionDep):
    return lunch_crud.get_all_lunches(session=session)


@router.post("/rating")
def rate_lunch(rating: CreateRating, session: SessionDep, credentials: Login = Depends(require_login)):
    rating_crud.create_rating(session=session, rating_create=rating, username=credentials.username)
    return {"message": "Successfully submitted rating"}


@router.get("/rating")
def get_all_lunch_ratings(session: SessionDep, credentials: Login = Depends(require_login)):
    return rating_crud.get_all_lunches_with_ratings(session=session, username=credentials.username)
