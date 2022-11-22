import json
import base64
from botocore.exceptions import ClientError
import boto3
import logging
import traceback
from psycopg2.extras import RealDictCursor
import psycopg2
import os


def enable_logging():
    root = logging.getLogger()
    if root.handlers:
        for handler in root.handlers:
            root.removeHandler(handler)
    logging.basicConfig(format='%(asctime)s %(message)s', level=logging.DEBUG)


enable_logging()


def get_secret():
    secret_name = 'database'
    region_name = "us-east-1"
    secret = None
    # Create a Secrets Manager client
    session = boto3.session.Session()
    print("before secret")
    endpoint_url = "https://secretsmanager.us-east-1.amazonaws.com"
    client = session.client(
        service_name='secretsmanager',
        region_name=region_name,
        endpoint_url=endpoint_url
    )

    try:
        get_secret_value_response = client.get_secret_value(SecretId=secret_name)
    except ClientError as e:
        if e.response['Error']['Code'] == 'DecryptionFailureException':
            # Secrets Manager can't decrypt the protected secret text using the provided KMS key.
            # Deal with the exception here, and/or rethrow at your discretion.
            raise e
        elif e.response['Error']['Code'] == 'InternalServiceErrorException':
            # An error occurred on the server side.
            # Deal with the exception here, and/or rethrow at your discretion.
            raise e
        elif e.response['Error']['Code'] == 'InvalidParameterException':
            # You provided an invalid value for a parameter.
            # Deal with the exception here, and/or rethrow at your discretion.
            raise e
        elif e.response['Error']['Code'] == 'InvalidRequestException':
            # You provided a parameter value that is not valid for the current state of the resource.
            # Deal with the exception here, and/or rethrow at your discretion.
            raise e
        elif e.response['Error']['Code'] == 'ResourceNotFoundException':
            # We can't find the resource that you asked for.
            # Deal with the exception here, and/or rethrow at your discretion.
            raise e
    except Exception as e:
        raise e
    else:
        # Decrypts secret using the associated KMS CMK.
        # Depending on whether the secret is a string or binary, one of these fields will be populated.
        if 'SecretString' in get_secret_value_response:
            secret = get_secret_value_response['SecretString']
        else:
            decoded_binary_secret = base64.b64decode(get_secret_value_response['SecretBinary'])
    print("after secret")
    return json.loads(secret)  # returns the secret as dictionary


def cors_headers():
    return {
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'OPTIONS,POST,GET,HEAD,PUT,DELETE,PATCH'
    }


def lambda_handler(event, context):
    logging.debug("HTTP OPTIONS: Returning CORS Headers")
    return {'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'OPTIONS,POST,GET,HEAD,PUT,DELETE,PATCH'
            },
            'body': json.dumps('Hello from CLS UI Service!')
            }


def get_db_connection():

    connection = None
    secret_result = get_secret()
    username = secret_result['username']
    password = secret_result['password']
    dbname = secret_result['dbname']
    host = secret_result['host']
    port = secret_result['port']

    try:
        print("Connecting to DB and Push statements")
        connection = psycopg2.connect(
            host=host,
            database=dbname,
            user=username,
            password=password,
            port=port)
    except (Exception, psycopg2.Error) as error:
        print("Failed to init DB connection", error)

    return connection


def create_remittance_table(event, context):

    result = ''
    status_code = 500
    try:
        db_connection = get_db_connection()
        query = """CREATE TABLE remittance (
        id BIGSERIAL PRIMARY KEY,
        sender_name varchar(100) NOT NULL,
        sender_bank varchar(100) NOT NULL,
        sender_account varchar(100) NOT NULL,
        receiver_name varchar(100) NOT NULL NOT NULL,
        receiver_bank varchar(100) NOT NULL,
        receiver_account varchar(100) NOT NULL,
        amount integer NOT NULL CHECK (amount > 0),
        creation_timestamp timestamp NOT NULL);"""

        cursor = db_connection.cursor(cursor_factory=RealDictCursor)
        cursor.execute(query)
        db_connection.commit()
        status_code = 200

    except Exception as error:
        print("Error  creating remittance table: " + str(error))
        traceback.print_exc()
        result = str(error)

    response = {
        "statusCode": status_code,
        'headers': cors_headers(),
        "body": json.dumps(result, indent=2, sort_keys=True, default=str)
    }

    return response


def drop_remittance_table(event, context):

    result = ''
    status_code = 500
    try:
        db_connection = get_db_connection()
        query = """DROP TABLE remittance;"""

        cursor = db_connection.cursor(cursor_factory=RealDictCursor)
        cursor.execute(query)
        db_connection.commit()
        status_code = 200

    except Exception as error:
        print("Error dropping remittance table: " + str(error))
        traceback.print_exc()
        result = str(error)

    response = {
        "statusCode": status_code,
        'headers': cors_headers(),
        "body": json.dumps(result, indent=2, sort_keys=True, default=str)
    }

    return response


def get_remittances(event, context):

    result = ''
    status_code = 500
    remittances = list()
    try:
        db_connection = get_db_connection()
        query = """SELECT * FROM remittance"""
        cursor = db_connection.cursor(cursor_factory=RealDictCursor)
        cursor.execute(query)
        records = cursor.fetchall()
        for record in records:
            remittance = Remittance(record)
            remittances.append(remittance)
        if remittances:
            result = [remittance.to_dict() for remittance in remittances]
        status_code = 200
    except Exception as error:
        print("Error getting remittances", error)
        traceback.print_exc()
        result = str(error)

    response = {
        "statusCode": status_code,
        'headers': cors_headers(),
        "body": json.dumps(result, indent=2, sort_keys=True, default=str)
    }

    return response


def create_remittance(event, context):

    result = ''
    status_code = 500
    try:
        input_body = event.get("body")
        if input_body:
            json_param = json.loads(input_body)
            sender_name = json_param["senderName"]
            sender_bank = json_param["senderBank"]
            sender_account = json_param["senderAccount"]
            receiver_name = json_param["receiverName"]
            receiver_bank = json_param["receiverBank"]
            receiver_account = json_param["receiverAccount"]
            amount = json_param["amount"]

            db_connection = get_db_connection()

            query = """INSERT INTO remittance (sender_name, sender_bank, sender_account, receiver_name, receiver_bank, receiver_account, amount, creation_timestamp) VALUES (%s, %s, %s, %s, %s, %s, %s, current_timestamp);"""
            cursor = db_connection.cursor(cursor_factory=RealDictCursor)
            cursor.execute(query, (sender_name, sender_bank, sender_account, receiver_name, receiver_bank, receiver_account, amount))
            db_connection.commit()
            status_code = 200
        else:
            result = "Error, incorrect post body"
            status_code = 400
    except Exception as error:
        print("Error creating remittance" + str(error))
        traceback.print_exc()
        result = str(error)

    response = {
        "statusCode": status_code,
        'headers': cors_headers(),
        "body": json.dumps(result, indent=2, sort_keys=True, default=str)
    }

    return response


def update_remittance(event, context):

    result = ''
    status_code = 500
    try:
        input_body = event.get("body")
        if input_body:
            json_param = json.loads(input_body)
            remittance_id = json_param["id"]
            sender_name = json_param["senderName"]
            sender_bank = json_param["senderBank"]
            sender_account = json_param["senderAccount"]
            receiver_name = json_param["receiverName"]
            receiver_bank = json_param["receiverBank"]
            receiver_account = json_param["receiverAccount"]
            amount = json_param["amount"]

            db_connection = get_db_connection()

            query = """update remittance set sender_name = %s, sender_bank = %s, sender_account = %s, receiver_name = %s, receiver_bank = %s, receiver_account = %s, amount = %s  where id = %s"""
            cursor = db_connection.cursor(cursor_factory=RealDictCursor)
            cursor.execute(query, (sender_name, sender_bank, sender_account, receiver_name, receiver_bank, receiver_account, amount, remittance_id))
            db_connection.commit()
            status_code = 200
        else:
            result = "Error, incorrect post body"
            status_code = 400
    except Exception as error:
        print("Error updating remittance" + str(error))
        traceback.print_exc()
        result = str(error)

    response = {
        "statusCode": status_code,
        'headers': cors_headers(),
        "body": json.dumps(result, indent=2, sort_keys=True, default=str)
    }

    return response


def delete_remittance(event, context):

    result = ''
    status_code = 500
    try:
        input_body = event.get("body")
        if input_body:
            json_param = json.loads(input_body)
            remittance_id = json_param["id"]

            db_connection = get_db_connection()

            query = """delete from remittance where id = %s"""
            cursor = db_connection.cursor(cursor_factory=RealDictCursor)
            cursor.execute(query, (remittance_id,))
            db_connection.commit()
            status_code = 200
        else:
            result = "Error, incorrect post body"
            status_code = 400
    except Exception as error:
        print("Error deleting remittance" + str(error))
        traceback.print_exc()
        result = str(error)

    response = {
        "statusCode": status_code,
        'headers': cors_headers(),
        "body": json.dumps(result, indent=2, sort_keys=True, default=str)
    }

    return response


def clear_remittances(event, context):

    result = ''
    status_code = 500
    try:
        db_connection = get_db_connection()
        query = """DELETE FROM remittance;"""

        cursor = db_connection.cursor(cursor_factory=RealDictCursor)
        cursor.execute(query)
        db_connection.commit()
        status_code = 200

    except Exception as error:
        print("Error clearing remittance table: " + str(error))
        traceback.print_exc()
        result = str(error)

    response = {
        "statusCode": status_code,
        'headers': cors_headers(),
        "body": json.dumps(result, indent=2, sort_keys=True, default=str)
    }

    return response


class Remittance:
    """
    It represents a remittance.
    """

    def __init__(self,
                 record):
        """
        Initializes the Remittance from the database record.

        :param record:   The database record.
        """

        self.id = record['id']
        self.senderName = record['sender_name']
        self.senderBank = record['sender_bank']
        self.senderAccount = record['sender_account']
        self.receiverName = record['receiver_name']
        self.receiverBank = record['receiver_bank']
        self.receiverAccount = record['receiver_account']
        self.amount = record['amount']
        self.creationTimestamp = record['creation_timestamp']

    def to_dict(self):
        return {
            'id': self.id,
            'senderName': self.senderName,
            'senderBank': self.senderBank,
            'senderAccount': self.senderAccount,
            'receiverName': self.receiverName,
            'receiverBank': self.receiverBank,
            'receiverAccount': self.receiverAccount,
            'amount': self.amount,
            'creationTimestamp': self.creationTimestamp
        }


def execute_runbook(event, context):

    result = ''
    status_code = 500

    try:
        input_body = event.get("body")
        if input_body:
            json_param = json.loads(input_body)
            region = json_param["region"]
            document = json_param["document"]

            client = boto3.client('ssm', region_name=region)
            client.start_automation_execution(DocumentName=document)

            status_code = 200
        else:
            result = "Error, incorrect post body"
            status_code = 400
    except Exception as error:
        print("Error running execute_run_book " + str(error))
        traceback.print_exc()
        result = str(error)

    response = {
        "statusCode": status_code,
        'headers': cors_headers(),
        "body": json.dumps(result, indent=2, sort_keys=True, default=str)
    }

    return response
