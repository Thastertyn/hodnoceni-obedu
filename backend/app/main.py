import logging

from fastapi import FastAPI

from .routers import scrape_router
from .routers import lunch_router

app = FastAPI(title="Hodnocení obědů")

logging.basicConfig(level=logging.DEBUG)

app.include_router(scrape_router.router)
app.include_router(lunch_router.router)

@app.get("/")
async def root():
    return {"message": "Hello Hodnocení obědů!"}
