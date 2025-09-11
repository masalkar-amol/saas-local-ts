#!/usr/bin/env bash
set -euo pipefail
curl -s -X PUT "http://localhost:9200/biomarkers" -H 'Content-Type: application/json' -d '{
  "settings": {"index": {"number_of_shards": 1}},
  "mappings": {"properties": {"text":{"type":"text"}}}
}' || true
echo "OpenSearch index ready."
