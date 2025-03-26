import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from . import routes
from app.core.scheduler import start_scheduler

app = FastAPI(title="Hodnocení obědů")

@app.on_event("startup")
async def startup_event():
    start_scheduler()

logging.basicConfig(level=logging.DEBUG)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(routes.router)
