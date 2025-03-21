import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routers import scrape_router
from .routers import lunch_router

app = FastAPI(title="Hodnocení obědů")

logging.basicConfig(level=logging.DEBUG)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the application routers
app.include_router(scrape_router.router)
app.include_router(lunch_router.router)

@app.get("/")
async def root():
    return {"message": "Hello Hodnocení obědů!"}