from typing import Dict, Optional
from pydantic import BaseModel, Field


class LunchSchema(BaseModel):
    main_course: str = Field(..., example="Kuřečí řízek, bramborová kaše")
    soup: str = Field(..., example="Dýňová polévka")
    dessert: Optional[str] = Field(None, example="Makovec")
    drink: str = Field(..., example="Čaj")


class LunchDaySchema(BaseModel):
    options: Dict[int, LunchSchema]


class LunchMenuPerDay(BaseModel):
    days: Dict[str, LunchDaySchema]
