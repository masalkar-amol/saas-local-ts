import logging
from celery import shared_task
from django.conf import settings
from .models import Biomarker


logger = logging.getLogger(__name__)

try:
    endpoint_url = settings.S3_ENDPOINT_URL
    aws_access_key_id = settings.AWS_ACCESS_KEY_ID
    aws_secret_access_key = settings.AWS_SECRET_ACCESS_KEY
    bucket_name = settings.S3_BUCKET_NAME
except AttributeError:
    endpoint_url = None
    aws_access_key_id = None
    aws_secret_access_key = None
    bucket_name = None
    logger.warning("S3 configuration is missing. S3-related tasks may not function.")


@shared_task
def uppercase_names():
    for b in Biomarker.objects.all():
        b.name = b.name.upper()
        b.save(update_fields=["name"])
    return "ok"

@shared_task
def ingest_to_s3(data, file_name):
    """
    Example task that uploads data to S3, if S3 is configured.
    """
    if not all([endpoint_url, aws_access_key_id, aws_secret_access_key, bucket_name]):
        logger.warning("S3 is not configured. Skipping upload.")
        return "S3 not configured"

    import boto3
    from botocore.exceptions import BotoCoreError, ClientError

    try:
        s3_client = boto3.client(
            's3',
            endpoint_url=endpoint_url,
            aws_access_key_id=aws_access_key_id,
            aws_secret_access_key=aws_secret_access_key
        )

        s3_client.put_object(Bucket=bucket_name, Key=file_name, Body=data)
        logger.info(f"File '{file_name}' uploaded successfully to S3 bucket '{bucket_name}'")
        return "Upload successful"

    except (BotoCoreError, ClientError) as e:
        logger.error(f"Failed to upload to S3: {e}")
        return f"Upload failed: {str(e)}"
