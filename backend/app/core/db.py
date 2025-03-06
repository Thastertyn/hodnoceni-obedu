from sqlmodel import Session, create_engine, select, SQLModel

from app.core.config import settings
from app.models.lunch_model import Lunch
from app.models.rating_model import Rating


engine = create_engine(str(settings.SQLALCHEMY_DATABASE_URI))
SQLModel.metadata.create_all(engine)
