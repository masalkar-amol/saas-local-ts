up:        ## Start all services
\tdocker compose up --build -d
down:      ## Stop & remove
\tdocker compose down -v
logs:      ## Tail important logs
\tdocker compose logs -f api worker ai
seed:      ## Create MinIO bucket + DynamoDB table + OpenSearch index
\tbash tools/minio_create_bucket.sh
\tpython tools/seed_dynamo_local.py
\tbash tools/seed_opensearch.sh
etl:       ## Run DuckDB/Arrow ETL
\tpython data/etl.py
test-e2e:  ## Playwright tests
\tcd tests && npm i && npx playwright install && npx playwright test
help:
\t@grep -E '^[a-zA-Z_-]+:.*?##' Makefile | awk 'BEGIN {FS = \": .*?## \"}; {printf \"\\033[36m%-12s\\033[0m %s\\n\", $$1, $$2}'
