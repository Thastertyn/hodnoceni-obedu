import logging

from fastapi import FastAPI

from .routers import scraper

app = FastAPI(title="Hodnocení obědů")

logging.basicConfig(level=logging.DEBUG)

app.include_router(scraper.router)


@app.get("/")
async def root():
    return {"message": "Hello Bigger Applications!"}
