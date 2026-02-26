from celery import Celery
from app.core.config import settings
from app.services.scraper_service import scraper_service
import asyncio

celery_app = Celery("tasks", broker=settings.REDIS_URL)

@celery_app.task
def run_scheduled_scrape(scraper_id: str, url: str, selector_config: dict):
    loop = asyncio.get_event_loop()
    if loop.is_running():
        return loop.create_task(scraper_service.scrape_data(url, selector_config))
    else:
        return asyncio.run(scraper_service.scrape_data(url, selector_config))
