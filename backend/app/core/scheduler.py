from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from app.email import send_monthly_report

scheduler = AsyncIOScheduler()

def start_scheduler():
    scheduler.add_job(
        send_monthly_report,
        CronTrigger(second=0, minute="*"),
        id="monthly_report_job",
        replace_existing=True
    )
    scheduler.start()
