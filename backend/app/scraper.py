from apscheduler.schedulers.background import BackgroundScheduler
import time

class TaskScheduler:
    def __init__(self):
        self.scheduler = BackgroundScheduler()

    def daily_scrape(self):
        pass

    def initialize(self):
        self.scheduler.add_job(self.daily_scrape, 'cron', hour=0, minute=0, second=0)
        self.scheduler.start()

    def cleanup(self):
        self.scheduler.shutdown()
