from typing import Any

from sqlmodel import Session, select

from app.core.security import get_password_hash, verify_password
from app.models import LunchCreate

def create_lunch(*, session: Session, lunch_create: LunchCreate) -> LunchCreate:
    pass