from sqlmodel import create_engine, SQLModel

from app.core.config import settings

from app.models import Rating  # noqa: F401


engine = create_engine(str(settings.SQLALCHEMY_DATABASE_URI))
SQLModel.metadata.create_all(engine)
