import datetime
from fastapi import APIRouter, Depends


from app.models.lunch_model import LunchDayMenu

from app.crud.lunch_crud import get_lunch_by_date

from app.api.dependencies import SessionDep, get_credentials


router = APIRouter(
    prefix="/lunch",
    tags=["Lunch"],
    dependencies=[Depends(get_credentials)]
)

@router.get("", response_model=LunchDayMenu, name="Get lunch options for a day")
def get_lunch_for_day(session: SessionDep, date: datetime.date):
    return get_lunch_by_date(lunch_date=date, session=session)

@router.post("/rate")
def rate_lunch():
    pass