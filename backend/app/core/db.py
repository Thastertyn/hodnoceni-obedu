from sqlmodel import Session, create_engine, select

from app import crud
from app.core.config import settings
from app.models.lunch_model import Lunch

engine = create_engine(str(settings.SQLALCHEMY_DATABASE_URI))
