from pydantic import BaseModel, Field

class LoginSchema(BaseModel):
    username: str = Field(..., example="my_username")
    password: str = Field(..., example="my_password")
