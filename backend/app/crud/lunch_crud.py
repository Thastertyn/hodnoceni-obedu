import datetime

from sqlmodel import Session, select
from app.models.lunch_model import LunchCreate, Lunch
from .errors import CrudError


def create_lunch(*, session: Session, lunch_create: LunchCreate) -> None:

    stmt = select(Lunch).where(Lunch.lunch_date == lunch_create.lunch_date)
    existing_lunch = session.execute(stmt).one_or_none()

    if existing_lunch is not None:
        raise CrudError(f"Lunch with date={lunch_create.lunch_date} already exists")

    new_lunch = Lunch(
        lunch_date=lunch_create.lunch_date,
        first_option=lunch_create.first_option,
        second_option=lunch_create.second_option,
        soup=lunch_create.soup,
        drink=lunch_create.drink
    )

    session.add(new_lunch)

    session.commit()


def get_lunch_by_date(*, session: Session, lunch_date: datetime.date) -> Lunch:
    stmt = select(Lunch).where(Lunch.lunch_date == lunch_date)
    lunches = session.execute(stmt).scalars().one_or_none()

    return lunches


def get_all_lunches(*, session: Session) -> list[Lunch]:
    stmt = select(Lunch)
    lunches = session.execute(stmt).scalars().all()

    return lunches
