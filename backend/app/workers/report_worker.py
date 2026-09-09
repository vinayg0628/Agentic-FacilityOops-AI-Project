import os
from celery import Celery
import logging

logger = logging.getLogger(__name__)

redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")

celery_app = Celery(
    "facilityops_tasks",
    broker=redis_url,
    backend=redis_url
)

celery_app.conf.update(
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='UTC',
    enable_utc=True,
)

@celery_app.task
def send_scheduled_report(report_id: str):
    logger.info(f"Generating and sending scheduled report {report_id}")
    return {"status": "success", "report_id": report_id}
