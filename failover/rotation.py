import json
import time

import boto3
from datetime import datetime
import logging


def invoke(event, context):
    logging.basicConfig(format='%(asctime)s %(message)s', level=logging.INFO)

    function = event["FUNCTION"]

    if function == "get_regions":
        return get_regions(event, context)
    elif function == "rotate_arc_controls":
        rotate_arc_controls(event, context)
    elif function == "rotate_aurora_global_database":
        return rotate_aurora_global_database(event, context)
    elif function == "wait_for_aurora_to_be_available":
        wait_for_aurora_to_be_available(event, context)
    elif function == "update_database_secret":
        update_database_secret(event, context)
    else:
        dummy(event, context)


def get_regions(event, context):

    print(datetime.now().strftime("%m/%d/%Y, %H:%M:%S") + " get_regions Invoked")
    aws_region = event['AWS_REGION']
    aws_region1 = event['AWS_REGION1']
    aws_region2 = event['AWS_REGION2']

    client = boto3.client('secretsmanager', region_name=aws_region)
    cluster = client.get_secret_value(SecretId='arc-cluster')['SecretString']
    control1 = client.get_secret_value(SecretId='arc-control1')['SecretString']
    control2 = client.get_secret_value(SecretId='arc-control2')['SecretString']

    client = boto3.client('route53-recovery-control-config', region_name='us-west-2')
    cluster = client.describe_cluster(ClusterArn=cluster)
    endpoints = cluster['Cluster']['ClusterEndpoints']
    regions = ["us-east-1", "us-west-2", "eu-west-1", "ap-northeast-1", "ap-southeast-2"]
    counter = 0
    sorted_endpoints = []
    for region in regions:
        for endpoint in endpoints:
            if endpoint["Region"] == region:
                sorted_endpoints.append(endpoint["Endpoint"])

    for endpoint in sorted_endpoints:

        try:
            print(datetime.now().strftime("%m/%d/%Y, %H:%M:%S") + " route 53 recover cluster endpoint: " + endpoint)
            client = boto3.client('route53-recovery-cluster', region_name=aws_region, endpoint_url=endpoint)
            region1_control_state = client.get_routing_control_state(RoutingControlArn=control1)
            region2_control_state = client.get_routing_control_state(RoutingControlArn=control2)

            print(datetime.now().strftime("%m/%d/%Y, %H:%M:%S") + " " + aws_region1 + " is " + region1_control_state["RoutingControlState"])
            print(datetime.now().strftime("%m/%d/%Y, %H:%M:%S") + " " + aws_region2 + " is " + region2_control_state["RoutingControlState"])

            active_region = ""
            passive_region = ""
            if region1_control_state["RoutingControlState"] == "On":
                active_region = aws_region1
                passive_region = aws_region2
            else:
                active_region = aws_region2
                passive_region = aws_region1

            print(datetime.now().strftime("%m/%d/%Y, %H:%M:%S") + " Active Region = " + active_region + " Passive Region = " + passive_region)

            # regions = Regions()
            # regions.active_region = active_region
            # regions.passive_region = passive_region
            # print(regions.to_dict())
            return {'active_region': active_region, 'passive_region': passive_region}
        except Exception as e:
            print(e)


def rotate_arc_controls(event, context):

    print(datetime.now().strftime("%m/%d/%Y, %H:%M:%S") + " update_arc_control Invoked")
    aws_region = event['AWS_REGION']

    client = boto3.client('secretsmanager', region_name=aws_region)
    cluster = client.get_secret_value(SecretId='arc-cluster')['SecretString']
    control1 = client.get_secret_value(SecretId='arc-control1')['SecretString']
    control2 = client.get_secret_value(SecretId='arc-control2')['SecretString']

    client = boto3.client('route53-recovery-control-config', region_name='us-west-2')
    cluster = client.describe_cluster(ClusterArn=cluster)
    endpoints = cluster['Cluster']['ClusterEndpoints']
    regions = ["us-east-1", "us-west-2", "eu-west-1", "ap-northeast-1", "ap-southeast-2"]
    done = False
    for region in regions:
        for endpoint in endpoints:
            if endpoint["Region"] == region:

                try:
                    print(datetime.now().strftime("%m/%d/%Y, %H:%M:%S") + " route 53 recovery cluster endpoint: " + endpoint["Endpoint"])
                    client = boto3.client('route53-recovery-cluster', region_name=region, endpoint_url=endpoint["Endpoint"])

                    print(datetime.now().strftime("%m/%d/%Y, %H:%M:%S") + " rotating control1")
                    region1_control_state = client.get_routing_control_state(RoutingControlArn=control1)
                    if region1_control_state["RoutingControlState"] == "On":
                        client.update_routing_control_state(RoutingControlArn=control1, RoutingControlState="Off")
                    else:
                        client.update_routing_control_state(RoutingControlArn=control1, RoutingControlState="On")

                    print(datetime.now().strftime("%m/%d/%Y, %H:%M:%S") + " rotating control2")
                    region2_control_state = client.get_routing_control_state(RoutingControlArn=control2)
                    if region2_control_state["RoutingControlState"] == "On":
                        client.update_routing_control_state(RoutingControlArn=control2, RoutingControlState="Off")
                    else:
                        client.update_routing_control_state(RoutingControlArn=control2, RoutingControlState="On")

                    region2_control_state = client.get_routing_control_state(RoutingControlArn=control2)

                    done = True
                    break
                except Exception as e:
                    print(e)
        if done:
            break


def rotate_aurora_global_database(event, context):

    print(datetime.now().strftime("%m/%d/%Y, %H:%M:%S") + " rotate_aurora_global_database Invoked")
    aws_region = event['AWS_REGION']

    global_cluster_name = "remittance"

    client = boto3.client('rds', region_name=aws_region)
    response = client.describe_global_clusters(GlobalClusterIdentifier=global_cluster_name)
    reader_cluster = ""
    if response['GlobalClusters'][0]['GlobalClusterMembers'][0]['IsWriter']:
        reader_cluster = response['GlobalClusters'][0]['GlobalClusterMembers'][1]['DBClusterArn']
    else:
        reader_cluster = response['GlobalClusters'][0]['GlobalClusterMembers'][0]['DBClusterArn']

    print(datetime.now().strftime("%m/%d/%Y, %H:%M:%S") + " global cluster: " + global_cluster_name)
    print(datetime.now().strftime("%m/%d/%Y, %H:%M:%S") + " rotating to db cluster: " + reader_cluster)
    client.failover_global_cluster(GlobalClusterIdentifier=global_cluster_name, TargetDbClusterIdentifier=reader_cluster)
    print(datetime.now().strftime("%m/%d/%Y, %H:%M:%S") + " successfully rotated global database cluster")

    return {'global_cluster': global_cluster_name}


def wait_for_aurora_to_be_available(event, context):

    print(datetime.now().strftime("%m/%d/%Y, %H:%M:%S") + " wait_for_aurora_to_be_available Invoked")
    aws_region = event['AWS_REGION']

    global_cluster_name = "remittance"

    client = boto3.client('rds', region_name=aws_region)
    global_cluster_available = False
    while not global_cluster_available:
        response = client.describe_global_clusters(GlobalClusterIdentifier=global_cluster_name)
        if response["GlobalClusters"][0]["Status"] == "available":
            global_cluster_available = True
        else:
            time.sleep(5)

    print(datetime.now().strftime("%m/%d/%Y, %H:%M:%S") + " global cluster is available ")


def update_database_secret(event, context):

    print(datetime.now().strftime("%m/%d/%Y, %H:%M:%S") + " update_database_secret Invoked")
    aws_region = event['AWS_REGION']

    global_cluster_name = "remittance"

    client = boto3.client('secretsmanager', region_name=aws_region)
    database_secret = client.get_secret_value(SecretId="database")['SecretString']
    database_secret_data = json.loads(database_secret)

    client = boto3.client('rds', region_name=aws_region)
    response = client.describe_global_clusters(GlobalClusterIdentifier=global_cluster_name)
    writer_cluster = ""
    if response['GlobalClusters'][0]['GlobalClusterMembers'][0]['IsWriter']:
        writer_cluster = response['GlobalClusters'][0]['GlobalClusterMembers'][0]['DBClusterArn']
    else:
        writer_cluster = response['GlobalClusters'][0]['GlobalClusterMembers'][1]['DBClusterArn']

    print(datetime.now().strftime("%m/%d/%Y, %H:%M:%S") + " global cluster writer cluster arn : " + writer_cluster)

    writer_cluster_identifier = writer_cluster.split(":")[-1]

    db_cluster_info = client.describe_db_clusters(DBClusterIdentifier=writer_cluster_identifier)
    print(db_cluster_info["DBClusters"][0])
    writer_cluster_endpoint = db_cluster_info["DBClusters"][0]["Endpoint"]
    print(datetime.now().strftime("%m/%d/%Y, %H:%M:%S") + " global cluster writer cluster endpoint : " + writer_cluster_endpoint)

    database_secret_data["host"] = writer_cluster_endpoint
    # print(datetime.now().strftime("%m/%d/%Y, %H:%M:%S") + " database secret " + json.dumps(database_secret_data))

    client = boto3.client('secretsmanager', region_name="us-east-1")
    client.put_secret_value(SecretId="database", SecretString=json.dumps(database_secret_data))

    print(datetime.now().strftime("%m/%d/%Y, %H:%M:%S") + " updated database secret ")


def dummy(event, context):
    print("dummy")


if __name__ == "__main__":
    event = dict()
    event["FUNCTION"] = "dummy"
    invoke(event, None)