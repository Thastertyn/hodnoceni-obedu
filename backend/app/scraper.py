from apscheduler.schedulers.background import BackgroundScheduler
import time

from sqlmodel import Session

def scrape_lunches(session: session):
    pass

scheduler = BackgroundScheduler()

scheduler.add_job(scrape_lunches, 'cron', hour=3, minute=0)

scheduler.start()
