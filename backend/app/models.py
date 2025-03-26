from datetime import date
from enum import Enum as PyEnum

from sqlmodel import SQLModel, Enum, Field, UniqueConstraint
from sqlalchemy import Column
from pydantic import RootModel, BaseModel
from typing import Optional


class QualityRating(PyEnum):
    NOT_APPLICABLE = 0
    BAD = 1
    OKAY = 2
    GOOD = 3


class RatingBase(SQLModel):
    taste: QualityRating = Field(sa_column=Column(Enum(QualityRating), nullable=False))
    temperature: QualityRating = Field(sa_column=Column(Enum(QualityRating), nullable=False))
    portion_size: QualityRating = Field(sa_column=Column(Enum(QualityRating), nullable=False))
    soup: QualityRating = Field(sa_column=Column(Enum(QualityRating), nullable=False))
    dessert: QualityRating = Field(sa_column=Column(Enum(QualityRating), nullable=False))
    would_pay_more: QualityRating = Field(sa_column=Column(Enum(QualityRating), nullable=False))
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
