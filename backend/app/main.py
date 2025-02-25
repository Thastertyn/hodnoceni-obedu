import logging

from fastapi import Depends, FastAPI

from .dependencies import get_token_header
from .internal import admin
from .routers import items, users, scraper

app = FastAPI(title="Hodnocení obědů")

logging.basicConfig(level=logging.DEBUG)

app.include_router(scraper.router)


@app.get("/")
async def root():
    return {"message": "Hello Bigger Applications!"}
