from sqlmodel import create_engine, SQLModel

from app.core.config import settings


engine = create_engine(str(settings.SQLALCHEMY_DATABASE_URI))
SQLModel.metadata.create_all(engine)
