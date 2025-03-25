from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends

from app.api.dependencies import require_login
from app.models import Login, Lunch
from app.scraper import scraper

router = APIRouter(
    prefix="/lunch",
)


@router.get("")
async def get_lunch_for_day(
    day: date,
    credentials: Login = Depends(require_login),
    past: Optional[int] = 30,
    future: Optional[int] = 7
) -> list[Lunch]:
    return await scraper.get_all_days(day=day, past=past, future=future, username=credentials.username, password=credentials.password)
