from sqlmodel import SQLModel, Field
from typing import Optional

from .lunch_model import Lunch


class Rating(SQLModel, table=True):
    id: int = Field(primary_key=True)
    lunch_id: int = Field(foreign_key="lunch.lunch_id")
    username: str = Field(max_length=50)

    taste: str = Field(max_length=50)
    temperature: str = Field(max_length=50)
    portion: str = Field(max_length=50)
    soup: str = Field(max_length=50)
    dessert: str = Field(max_length=50)
    would_pay_more: str = Field(max_length=50)
    feedback: Optional[str] = Field(None, max_length=500)


class CreateRating(SQLModel):
    taste: str = Field(max_length=50)
    temperature: str = Field(max_length=50)
    portion: str = Field(max_length=50)
    soup: str = Field(max_length=50)
    dessert: str = Field(max_length=50)
    would_pay_more: str = Field(max_length=50)
    feedback: Optional[str] = Field(None, max_length=500)
