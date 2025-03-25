from datetime import date

from sqlmodel import SQLModel, Field, UniqueConstraint
from pydantic import RootModel, BaseModel
from typing import Optional

class RatingBase(SQLModel):
    taste: str = Field(max_length=50, nullable=False)
    temperature: str = Field(max_length=50, nullable=False)
    portion_size: str = Field(max_length=50, nullable=False)
    soup: str = Field(max_length=50, nullable=False)
    dessert: str = Field(max_length=50, nullable=False)
    would_pay_more: str = Field(max_length=50, nullable=False)
    feedback: Optional[str] = Field(None, max_length=500, nullable=True)


class RatingCreate(RatingBase):
    pass


class Rating(RatingBase, table=True):
    __table_args__ = (
        UniqueConstraint("lunch_day", "username", name="uq_rating_lunch_day_option_user"),
    )

    rating_id: int = Field(primary_key=True)
    lunch_day: date = Field(nullable=False)

    username: str = Field(max_length=50, nullable=False)


class RatingPublic(RatingBase):
    pass


class Lunch(SQLModel):
    main_course: str
    soup: str | None
    drink: str | None


class LunchEntry(BaseModel):
    lunch: Optional[Lunch]
    rating: Optional[RatingPublic]


class LunchData(RootModel[dict[date, LunchEntry]]):
    pass


class Login(SQLModel):
    username: str
    password: str
