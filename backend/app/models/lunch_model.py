from typing import Literal
from pydantic import date
from sqlmodel import Field, SQLModel


class Lunch(SQLModel, table=True):
    id: int = Field(primary_key=True)
    lunch_date: date
    option: Literal[1, 2]
    main_course: str = Field(max_length=64)
    dessert: str | None = Field(default=None, max_length=64)
    drink: str = Field(max_length=64)
    soup: str = Field(max_length=64)

class LunchCreate(SQLModel):
    lunch_date: date
    option: Literal[1, 2]
    main_course: str = Field(max_length=64)
    dessert: str | None = Field(default=None, max_length=64)
    drink: str = Field(max_length=64)
    soup: str = Field(max_length=64)

__all__ = ["Lunch", "LunchCreate"]
