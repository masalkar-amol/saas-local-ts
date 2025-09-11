#!/usr/bin/env bash
set -euo pipefail
MC="docker run --rm --network host -e MC_HOST_local=http://minioadmin:minioadmin@localhost:9000 minio/mc:latest"
$MC mb --ignore-existing local/biomarker-raw
$MC ls local
echo "MinIO bucket ready."
