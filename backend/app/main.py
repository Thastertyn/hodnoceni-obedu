import logging

from fastapi import FastAPI

from .routers import scrape
from .routers import lunch

app = FastAPI(title="Hodnocení obědů")

logging.basicConfig(level=logging.DEBUG)

app.include_router(scrape.router)
app.include_router(lunch.router)

@app.get("/")
async def root():
    return {"message": "Hello Hodnocení obědů!"}
