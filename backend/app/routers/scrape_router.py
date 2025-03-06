from fastapi import APIRouter, HTTPException
from app.scraper.scraper import scrape_week_ahead

from app.api.dependencies import SessionDep

router = APIRouter(
    prefix="/scrape",
    tags=["Scraping"]
)


@router.get("")
async def scrape_jidelnicek(session: SessionDep):
    """
        Forces the lunches to be scraped right now, instead of waiting until midnight
    """
    try:
        scrape_week_ahead(session)
        return {"message": "Scraped successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error scraping menu: {str(e)}")
