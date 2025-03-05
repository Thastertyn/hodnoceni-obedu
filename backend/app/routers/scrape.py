import requests
from fastapi import APIRouter, HTTPException
from app.scraper.scraper import scrape_week_ahead

# ------------------- Router and Constants -------------------

router = APIRouter(
    prefix="/scrape",
    tags=["Scraping"]
)


@router.post("")
async def scrape_jidelnicek():
    """
        Forces the lunches to be scraped right now, instead of waiting until midnight
    """
    try:
        scrape_week_ahead()

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error scraping menu: {str(e)}")
