from pydantic import BaseModel, Field


class LoginResponse(BaseModel):
    JSESSIONID: str = Field(..., example="80F35A0EB8CD3C184DA7C9D5B88445E7")
    XSRF_TOKEN: str = Field(..., example="6c4ff71c-6544-4b11-bc22-87c2fc7078b9")
