# saas-local-ts

**Cloud-free, end-to-end SaaS starter** for life sciences data apps — with **Django/DRF**, **PostgreSQL**, **Celery/Redis**, **React TypeScript**, and **AI semantic search** (FastAPI + Sentence-Transformers + FAISS).  
Runs 100% locally via **Docker Compose** — **no cloud credentials required**.

---

## Table of Contents

- [Stack Overview](#stack-overview)
- [Architecture](#architecture)
- [Seeding Data](#seeding-data)
---

## Stack Overview

- **API**: Django + DRF + Gunicorn (REST endpoints, business logic).
- **DB**: PostgreSQL (authoritative system of record).
- **Async**: Celery Worker + Redis (background jobs).
- **AI**: FastAPI + Sentence-Transformers + FAISS (semantic search).
- **Web**: React + TypeScript + Webpack + LESS (SPA UI).
- **Extras**: MinIO (S3-compatible), DynamoDB-Local (NoSQL demo), OpenSearch (optional text/vector search).

## Architecture :
<img width="838" height="936" alt="c3" src="https://github.com/user-attachments/assets/20c9e4f1-5d86-48bc-b552-ce0065fd18cb" />

## Demo Video
[![Watch the demo](https://github.com/masalkar-amol/saas-local-ts/blob/master/z_flow_diagrams/screenshots/v1_recording.mp4)]

## Table creation & seed data insertion 
docker compose exec api python manage.py migrate
docker compose exec api python manage.py loaddata biomarkers_seed.json
