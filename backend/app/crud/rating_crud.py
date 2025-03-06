from sqlmodel import Session, select
from app.models.rating_model import CreateRating, Rating, RatingWithLunch
from app.models.lunch_model import Lunch
from .errors import CrudError


def create_rating(*, session: Session, rating_create: CreateRating, username: str) -> None:

    stmt = select(Rating).where(Rating.username == username and Rating.lunch_id == rating_create.lunch_id)
    existing_rating = session.execute(stmt).one_or_none()

    if existing_rating is not None:
        raise CrudError(f"Rating by username={username} for lunch_id={rating_create.lunch_id} already exists")

    new_rating = Rating(
        lunch_id=rating_create.lunch_id,
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


def get_all_lunches_with_ratings(*, session: Session, username: str) -> list[RatingWithLunch]:
    stmt = select(Lunch)
    lunches = session.execute(stmt).scalars().all()

    stmt = select(Rating).where(Rating.username == username)
    user_ratings = session.execute(stmt).scalars().all()

    ratings_map = {rating.lunch_id: rating for rating in user_ratings}

    result = []
    for lunch in lunches:
        rating = ratings_map.get(lunch.lunch_id)
        result.append(RatingWithLunch(lunch=lunch, rating=rating))

    return result
