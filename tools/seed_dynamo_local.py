import os, boto3
endpoint = os.getenv("DYNAMODB_ENDPOINT_URL","http://localhost:8000")
table = os.getenv("DYNAMODB_TABLE","CompBiomarkerEvents")
dynamodb = boto3.resource("dynamodb", endpoint_url=endpoint, region_name="us-east-1")
exists = table in [t.name for t in dynamodb.tables.all()]
if not exists:
    dynamodb.create_table(
        TableName=table,
        KeySchema=[{"AttributeName":"PK","KeyType":"HASH"},{"AttributeName":"SK","KeyType":"RANGE"}],
        AttributeDefinitions=[{"AttributeName":"PK","AttributeType":"S"},{"AttributeName":"SK","AttributeType":"S"}],
        BillingMode="PAY_PER_REQUEST"
    ).wait_until_exists()
print("DynamoDB table ready:", table)
