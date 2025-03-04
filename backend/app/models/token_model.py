from sqlmodel import SQLModel


class TokenPayload(SQLModel):
    sub: str | None = None

class Token(SQLModel):
    access_token: str
    token_type: str = "bearer"

__all__ = ["TokenPayload"]
