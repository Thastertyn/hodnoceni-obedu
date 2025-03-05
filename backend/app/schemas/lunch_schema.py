from typing import Dict, Optional
from pydantic import BaseModel, Field, RootModel


class LunchItem(BaseModel):
    main_course: str = Field(..., example="Kuřečí řízek, bramborová kaše")
    soup: str = Field(..., example="Dýňová polévka")
    dessert: Optional[str] = Field(None, example="Makovec")
    drink: str = Field(..., examples=["Čaj", "Šťáva", "Džus", "Voda", "Kakao"])


class LunchMenuPerDay(RootModel):
    root: Dict[int, LunchItem] = Field(
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
