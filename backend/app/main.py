import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routers import scrape_router
from .routers import lunch_router

app = FastAPI(title="Hodnocení obědů")

logging.basicConfig(level=logging.DEBUG)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow requests from your React frontend
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],  # Allow all headers
)

# Include routers
app.include_router(scrape_router.router)
app.include_router(lunch_router.router)

@app.get("/")
async def root():
    return {"message": "Hello Hodnocení obědů!"}
