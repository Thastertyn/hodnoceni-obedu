import datetime
from fastapi import APIRouter


from app.models.lunch_model import LunchDayMenu

from app.crud.lunch_crud import get_lunch_by_date

from app.api.dependencies import SessionDep, CurrentUser


router = APIRouter(
    prefix="/lunch",
    tags=["Lunch"],
)

@router.get("", response_model=LunchDayMenu, name="Get lunch options for a day")
def get_lunch_for_day(session: SessionDep, date: datetime.date):
    return get_lunch_by_date(lunch_date=date, session=session)

@router.post("/rate")
def rate_lunch():
    pass