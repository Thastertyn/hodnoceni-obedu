import logging

from fastapi import FastAPI

from .routers import scrape
from .routers import lunch
from .routers import user

app = FastAPI(title="Hodnocení obědů")

logging.basicConfig(level=logging.DEBUG)

app.include_router(scrape.router)
app.include_router(lunch.router)
app.include_router(user.router)

@app.get("/")
async def root():
    return {"message": "Hello Hodnocení obědů!"}
