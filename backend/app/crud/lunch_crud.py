import datetime

from sqlmodel import Session, select
from app.models.lunch_model import Lunch, LunchDayMenu
from app.schemas.lunch_schema import LunchItem, LunchMenuPerDay
from .errors import CrudError


def create_lunch(*, session: Session, lunch_create: LunchDayMenu) -> None:

    print(lunch_create)

    for option_id, lunch in lunch_create.root.items():
        stmt = select(Lunch).where(
            (Lunch.option_id == option_id) & (Lunch.lunch_date == lunch.lunch_date)
        )
        existing_lunch = session.execute(stmt).one_or_none()

        if existing_lunch is not None:
            raise CrudError(f"Lunch with option_id={option_id} and date={lunch.lunch_date} already exists")

        new_lunch = Lunch(
            option_id=option_id,
            lunch_date=lunch.lunch_date,
            main_course=lunch.main_course,
            soup=lunch.soup,
            dessert=lunch.dessert,
            drink=lunch.drink,
        )

        session.add(new_lunch)

    session.commit()


def get_lunch_by_date(*, session: Session, lunch_date: datetime.date) -> LunchMenuPerDay:
    stmt = select(Lunch).where(Lunch.lunch_date == lunch_date)
    lunches = session.execute(stmt).scalars().all()

    lunch_dict = {
        lunch.option_id: LunchItem(
            main_course=lunch.main_course,
            soup=lunch.soup,
            dessert=lunch.dessert,
            drink=lunch.drink,
        )
        for lunch in lunches
    }

    return LunchMenuPerDay(root=lunch_dict)
