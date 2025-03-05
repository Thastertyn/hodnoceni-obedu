from typing import Dict
from datetime import date
from sqlmodel import Field as sqlmodel_field, SQLModel
from pydantic import Field as pydantic_field, RootModel


class Lunch(SQLModel, table=True):
    option_id: int = sqlmodel_field(primary_key=True)
    lunch_date: date = sqlmodel_field(primary_key=True)
    main_course: str = sqlmodel_field(max_length=100)
    soup: str | None = sqlmodel_field(default=None, max_length=100)
    dessert: str | None = sqlmodel_field(default=None, max_length=100)
    drink: str | None = sqlmodel_field(default=None, max_length=100)


class LunchDayMenu(RootModel):
    root: Dict[int, Lunch] = pydantic_field(
        ...,
        example={
            1: {
                "main_course": "Kuřecí řízek, bramborová kaše",
                "soup": "Dýňová polévka",
                "dessert": "Makovec",
                "drink": "Čaj",
            },
            2: {
                "main_course": "Bezmasá čína, rýžové nudle",
                "soup": "Hovězí vývar s fridátovými nudlemi",
                "dessert": None,
                "drink": "Džus",
            }
        }
    )


__all__ = ["Lunch"]
