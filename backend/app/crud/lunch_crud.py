import datetime

from sqlmodel import Session, select

from app.models.lunch_model import Lunch

from .errors import CrudError


def create_lunch(*, session: Session, lunch_create: Lunch) -> Lunch:
    stmt = select(Lunch).where(Lunch.option_id == lunch_create.option_id and Lunch.lunch_date == lunch_create.lunch_date)

    existing_lunch = session.execute(stmt).one_or_none()
    if existing_lunch is not None:
        raise CrudError("Lunch already exists")
    session.add(lunch_create)
    session.commit()
    session.refresh()
    return lunch_create


def get_lunch_by_date(*, session: Session, lunch_date: datetime.date) -> Lunch:
    stmt = select(Lunch).where(Lunch.lunch_date == lunch_date)
    lunches = session.execute(stmt).all()
    return lunches
