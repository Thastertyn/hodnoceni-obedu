from pydantic import BaseModel, EmailStr


class Login(BaseModel):
    email: str
    password: str
