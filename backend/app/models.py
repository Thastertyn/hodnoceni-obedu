from enum import Enum as PyEnum
from datetime import date

from sqlalchemy import Column
from sqlmodel import SQLModel, Field, UniqueConstraint, Enum
from typing import Optional


class Login(SQLModel):
    username: str
    password: str

class Lunch(SQLModel):
    main_course: str
    soup: str | None
    drink: str | None

class LunchOption(PyEnum):
    option_1 = "1"
    option_2 = "2"


class RatingBase(SQLModel):
    taste: str = Field(max_length=50, nullable=False)
    temperature: str = Field(max_length=50, nullable=False)
    portion_size: str = Field(max_length=50, nullable=False)
    soup: str = Field(max_length=50, nullable=False)
    dessert: str = Field(max_length=50, nullable=False)
    would_pay_more: str = Field(max_length=50, nullable=False)
    feedback: Optional[str] = Field(None, max_length=500, nullable=True)


class Rating(RatingBase, table=True):
    __table_args__ = (
        UniqueConstraint("lunch_day", "lunch_option", "username", name="uq_rating_lunch_day_option_user"),
    )

    rating_id: int = Field(primary_key=True)
    lunch_option: LunchOption = Field(sa_column=Column(Enum(LunchOption)))
    lunch_day: date = Field(nullable=False)

    username: str = Field(max_length=50, nullable=False)


class RatingPublic(RatingBase):
    lunch_option: str
    lunch_day: date

    username: str
