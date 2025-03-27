from datetime import date, timedelta
from typing import Optional

from sqlmodel import Session, select
from app.models import RatingCreate, Rating


class CrudError(Exception):
    """Representing generic error during CRUD operations"""


def create_rating(*, session: Session, rating_create: RatingCreate, day: date, username: str) -> None:

    stmt = select(Rating).where(Rating.username == username).where(Rating.lunch_day == day)
    existing_rating = session.execute(stmt).one_or_none()

    if existing_rating is not None:
        raise CrudError(f"Rating by username={username} for day={day} already exists")

    new_rating = Rating(
        lunch_day=day,
        username=username,
        taste=rating_create.taste,
        temperature=rating_create.temperature,
        portion_size=rating_create.portion_size,
        soup=rating_create.soup,
        dessert=rating_create.dessert,
        would_pay_more=rating_create.would_pay_more,
        feedback=rating_create.feedback
    )

    session.add(new_rating)

    session.commit()


def get_rating_for_day(*, session: Session, day: date, username: str) -> Optional[Rating]:
    stmt = select(Rating).where(Rating.username == username).where(Rating.lunch_day == day)
    rating = session.execute(stmt).scalar_one_or_none()

    return rating


def get_all_users(*, session: Session) -> list[str]:
    stmt = select(Rating.username).distinct()
    users = session.execute(stmt).scalars().all()

    return users


def get_past_ratings(*, session: Session, day_delta: int = 7) -> list[Rating]:
    today = date.today()
    start_date = today - timedelta(days=day_delta)
    end_date = today - timedelta(days=1)
    
    stmt = select(Rating).where(Rating.lunch_day >= start_date).where(Rating.lunch_day <= end_date)
    ratings: list[Rating] = session.execute(stmt).scalars().all()

    return ratings