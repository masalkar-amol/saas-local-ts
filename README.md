# saas-local-ts

**Cloud-free, end-to-end SaaS starter** for life sciences data apps — with **Django/DRF**, **PostgreSQL**, **Celery/Redis**, **React TypeScript**, and **AI semantic search** (FastAPI + Sentence-Transformers + FAISS).  
Runs 100% locally via **Docker Compose** — **no cloud credentials required**.

---

## Table of Contents

- [Stack Overview](#stack-overview)
- [Services & Ports](#services--ports)
- [Quick Start](#quick-start)
- [Seeding Data](#seeding-data)
- [Regular vs AI Search](#regular-vs-ai-search)
- [Configuration](#configuration)
- [Health Checks & Useful Commands](#health-checks--useful-commands)
- [Troubleshooting](#troubleshooting)
- [Project Structure](#project-structure)
- [License](#license)

---

## Stack Overview

- **API**: Django + DRF + Gunicorn (REST endpoints, business logic).
- **DB**: PostgreSQL (authoritative system of record).
- **Async**: Celery Worker + Redis (background jobs).
- **AI**: FastAPI + Sentence-Transformers + FAISS (semantic search).
- **Web**: React + TypeScript + Webpack + LESS (SPA UI).
- **Extras**: MinIO (S3-compatible), DynamoDB-Local (NoSQL demo), OpenSearch (optional text/vector search).

Mermaid (architecture):

```mermaid
graph LR
  UI["React TS localhost:3000"] -->|Regular| API["Django/DRF localhost:9070"]
  UI -->|AI| AI["FastAPI AI localhost:8001"]
  API <--> PG[("PostgreSQL")]
  API -.tasks.-> WKR["Celery Worker"]
  WKR -.broker.-> RDS[("Redis")]
  API <--> MINIO[("MinIO")]
  API <--> DDB[("DynamoDB-Local")]
  API <--> OS[("OpenSearch")]
  AI --> API



docker compose exec api python manage.py migrate
docker compose exec api python manage.py loaddata biomarkers_seed.json
