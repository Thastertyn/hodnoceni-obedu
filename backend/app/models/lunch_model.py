from datetime import date
from sqlmodel import Field, SQLModel


class Lunch(SQLModel, table=True):
    lunch_id: int = Field(primary_key=True)
    lunch_date: date = Field()
    first_option: str = Field(max_length=100)
    second_option: str = Field(max_length=100)
    soup: str | None = Field(default=None, max_length=100)
    drink: str | None = Field(default=None, max_length=100)

class LunchCreate(SQLModel):
    lunch_date: date = Field()
    first_option: str = Field()
    second_option: str = Field()
    soup: str | None = Field(default=None)
    drink: str | None = Field(default=None)