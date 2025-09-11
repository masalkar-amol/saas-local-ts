# api/Dockerfile
FROM python:3.12-slim

# Ensure Python doesn’t write .pyc files and buffers stdout
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Install dependencies first for better layer caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project code
COPY . /app

# Expose container’s internal port (Gunicorn will bind to 8000)
EXPOSE 8000

# (We don’t set CMD here — docker-compose provides the command
# to run migrations + start Gunicorn.)
