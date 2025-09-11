# api/comp_api/celery.py
import os
from celery import Celery

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "comp_api.settings")

app = Celery("comp_api")
# Read from env, default to Redis (safe dev defaults)
app.conf.broker_url = os.getenv("CELERY_BROKER_URL", "redis://redis:6379/0")
app.conf.result_backend = os.getenv("CELERY_RESULT_BACKEND", "redis://redis:6379/1")

# Optional: JSON serialization
app.conf.accept_content = ["json"]
app.conf.task_serializer = "json"
app.conf.result_serializer = "json"
app.conf.timezone = "UTC"

# Auto-discover tasks.py in installed apps
app.autodiscover_tasks()
