from typing import Dict, Optional
from pydantic import BaseModel, Field, RootModel


class LunchItem(BaseModel):
    main_course: str = Field(..., example="Kuřečí řízek, bramborová kaše")
    soup: str = Field(..., example="Dýňová polévka")
    dessert: Optional[str] = Field(None, example="Makovec")
    drink: str = Field(..., examples=["Čaj", "Šťáva", "Džus", "Voda", "Kakao"])
    was_ordered: bool = Field(..., examples=[True, False])


class LunchMenuPerDay(RootModel):
    root: Dict[str, Dict[int, LunchItem]] = Field(
        ...,
        example={
            "2025-02-26": {
                1: {
                    "main_course": "Kuřecí řízek, bramborová kaše",
                    "soup": "Dýňová polévka",
                    "dessert": "Makovec",
                    "drink": "Čaj",
                    "was_ordered": True
                },
                2: {
                    "main_course": "Bezmasá čína, rýžové nudle",
                    "soup": "Hovězí vývar s fridátovými nudlemi",
                    "dessert": None,
                    "drink": "Džus",
                    "was_ordered": False
                }
            },
            "2025-02-27": {
                1: {
                    "main_course": "Kuřecí řízek, bramborová kaše",
                    "soup": "Dýňová polévka",
                    "dessert": "Makovec",
                    "drink": "Čaj",
                    "was_ordered": True
                },
                2: {
                    "main_course": "Bezmasá čína, rýžové nudle",
                    "soup": "Hovězí vývar s fridátovými nudlemi",
                    "dessert": None,
                    "drink": "Džus",
                    "was_ordered": False
                }
            },
            "2025-02-28": {
                1: {
                    "main_course": "Kuřecí řízek, bramborová kaše",
                    "soup": "Dýňová polévka",
                    "dessert": "Makovec",
                    "drink": "Čaj",
                    "was_ordered": True
                },
                2: {
                    "main_course": "Bezmasá čína, rýžové nudle",
                    "soup": "Hovězí vývar s fridátovými nudlemi",
                    "dessert": None,
                    "drink": "Džus",
                    "was_ordered": False
                }
            }
        }
    )
