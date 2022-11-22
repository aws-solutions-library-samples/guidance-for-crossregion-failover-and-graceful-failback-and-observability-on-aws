# (SO9100) #
# IMPORTANT #
# Before starting deployment process please update the following three variables.
# ENV - It is the unique variable that indicates the environment name. Global resources created, such as S3 buckets, use this name. (ex: devx)
# DOMAIN_NAME - Please provision a root domain name (ex: root.xyz.com) either using Route 53, a third party vendor or company provided tool. Specify the subdomain name to create under it. (ex: remittance.root.xyz.com)
# UI_DOMAIN_NAME - Please provision a root domain name (ex: root.xyz.com) either using Route 53, a third party vendor or company provided tool. Specify the subdomain name to create under it. (ex: remittanceui.root.xyz.com)
# ADMIN_EMAIL - The admin email id used to create a user in cognito. (ex: joejane@xyz.com)
ENV=ENV_PLACEHOLDER
DOMAIN_NAME=DOMAIN_NAME_PLACEHOLDER
UI_DOMAIN_NAME=UI_DOMAIN_NAME_PLACEHOLDER
ADMIN_EMAIL=ADMIN_EMAIL_PLACEHOLDER

.DEFAULT_GOAL := deploy-base
MAKE=/usr/bin/make

PROJECT_ID="Remittance"
PRIMARY_REGION=us-east-1
SECONDARY_REGION=us-west-2
REGIONS="us-east-1 us-west-2"

ACCOUNT=123456789012
ROLE=deployment-admin-role

STACK_SET_BUCKET=crf-stack-set-bucket-$(ENV)
PRIMARY_CLOUDFRONT_BUCKET=crf-cloudfront-primary-${ENV}
SECONDARY_CLOUDFRONT_BUCKET=crf-cloudfront-seconday-${ENV}
PRIMARY_LAMBDA_LAYER_BUCKET=crf-lambda-layer-bucket-primary-$(ENV)
SECONDARY_LAMBDA_LAYER_BUCKET=crf-lambda-layer-bucket-secondary-$(ENV)
PRIMARY_LAMBDA_BUCKET=crf-lambda-primary-$(ENV)
SECONDARY_LAMBDA_BUCKET=crf-lambda-secondary-$(ENV)
SSM_DOCUMENT_BUCKET=crf-ssm-document-${ENV}

WEB_ACL=crf-web-acl

PRIMARY_CIDR = "10.1.0.0/16"
PRIMARY_PRIVATE_SUBNET_1_CIDR = "10.1.1.0/24"
PRIMARY_PRIVATE_SUBNET_2_CIDR = "10.1.2.0/24"
PRIMARY_PRIVATE_SUBNET_3_CIDR = "10.1.3.0/24"
PRIMARY_PUBLIC_SUBNET_1_CIDR = "10.1.4.0/24"
PRIMARY_PUBLIC_SUBNET_2_CIDR = "10.1.5.0/24"
PRIMARY_PUBLIC_SUBNET_3_CIDR = "10.1.6.0/24"

SECONDARY_CIDR = "10.2.0.0/16"
SECONDARY_PRIVATE_SUBNET_1_CIDR = "10.2.1.0/24"
SECONDARY_PRIVATE_SUBNET_2_CIDR = "10.2.2.0/24"
SECONDARY_PRIVATE_SUBNET_3_CIDR = "10.2.3.0/24"
SECONDARY_PUBLIC_SUBNET_1_CIDR = "10.2.4.0/24"
SECONDARY_PUBLIC_SUBNET_2_CIDR = "10.2.5.0/24"
SECONDARY_PUBLIC_SUBNET_3_CIDR = "10.2.6.0/24"

# 1. Deploy Base Infrastructure - Roles, Buckets, Network, Database, Route 53 etc.
# make deploy-base

# 2. Open hosted zone record for root domain and create 2 NS Records pointing to NS details of "remittance.rootdomain" hosted zone and "remittanceui.rootdomain" hosted zone
# Reference: https://aws.amazon.com/premiumsupport/knowledge-center/create-subdomain-route-53/

# 3. Deploy App - Cloudfront, Cognito, APIs, CloudWatch, Web App,  etc.
# make deploy-app

# 4. Manually open API Gateway on management console, open "remittance" API and run "CreateDatabaseTable" API to create the database table

# 5. Manually open Route 53 Application Recovery Controller, open "Remittance-ControlPanel", select "Remittance-Region1", click "Change routing control states", change the state to "On" and save it

# 6. Go to "us-east-1" and find the admin user password in "crf-cognito-admin-password" in secrets manager

# 7. Open the application using the UI_DOMAIN_NAME set at the top of the make file and login with admin user email id and admin password


deploy-initialization:
	@echo "Started Deploying Initialization"
	# sh auth.sh $(ACCOUNT) $(ROLE) $(REGIONS);
	$(eval result:=$(shell aws cloudformation create-stack --stack-name CRF-INIT --region $(PRIMARY_REGION) --output text --template-body file://templates/initialization.yaml --capabilities CAPABILITY_NAMED_IAM --parameters \
		ParameterKey=StackSetBucketName,ParameterValue=$(STACK_SET_BUCKET) | awk '{print $2}'))
	(aws cloudformation wait stack-create-complete --stack-name ${result})
	@echo "Finished Deploying Initialization"

update-initialization:
	@echo "Started Updating Initialization"
	# sh auth.sh $(ACCOUNT) $(ROLE) $(REGIONS);
	$(eval result:=$(shell aws cloudformation update-stack --stack-name CRF-INIT --region $(PRIMARY_REGION) --output text --template-body file://templates/initialization.yaml --capabilities CAPABILITY_NAMED_IAM --parameters \
		ParameterKey=StackSetBucketName,ParameterValue=$(STACK_SET_BUCKET) | awk '{print $2}'))
	(aws cloudformation wait stack-create-complete --stack-name ${result})
	@echo "Finished Updating Initialization"

destroy-initialization:
	@echo "Started Destroying Initialization"
	# sh auth.sh $(ACCOUNT) $(ROLE) $(REGIONS);
	$(eval result:=$(shell aws cloudformation delete-stack --stack-name CRF-INIT --region $(PRIMARY_REGION) --output text | awk '{print $2}'))
	(aws cloudformation wait stack-create-complete --stack-name ${result})
	@echo "Finished Destroying Initialization"

deploy-buckets:
	@echo "Started Deploying Buckets"
	# sh auth.sh $(ACCOUNT) $(ROLE) $(REGIONS);
	$(eval result:=$(shell aws cloudformation create-stack --stack-name CRF-BUCKETS --region $(PRIMARY_REGION) --output text --template-body file://templates/create-buckets.yaml --capabilities CAPABILITY_NAMED_IAM --parameters \
		ParameterKey=ENV,ParameterValue=$(ENV) \
		ParameterKey=PrimaryRegion,ParameterValue=$(PRIMARY_REGION) \
		ParameterKey=SecondaryRegion,ParameterValue=$(SECONDARY_REGION) \
		ParameterKey=PrimaryCloudFrontBucketName,ParameterValue=${PRIMARY_CLOUDFRONT_BUCKET} \
		ParameterKey=SecondaryCloudFrontBucketName,ParameterValue=${SECONDARY_CLOUDFRONT_BUCKET} \
		ParameterKey=PrimaryLambdaLayerBucketName,ParameterValue=${PRIMARY_LAMBDA_LAYER_BUCKET} \
		ParameterKey=SecondaryLambdaLayerBucketName,ParameterValue=${SECONDARY_LAMBDA_LAYER_BUCKET} \
		ParameterKey=PrimaryLambdaBucketName,ParameterValue=${PRIMARY_LAMBDA_BUCKET} \
		ParameterKey=SecondaryLambdaBucketName,ParameterValue=${SECONDARY_LAMBDA_BUCKET} \
		ParameterKey=DocumentBucketName,ParameterValue=$(SSM_DOCUMENT_BUCKET) | awk '{print $2}'))
	(aws cloudformation wait stack-create-complete --stack-name ${result})
	@echo "Finished Deploying Buckets"

update-buckets:
	@echo "Started Updating Buckets"
	# sh auth.sh $(ACCOUNT) $(ROLE) $(REGIONS);
	$(eval result:=$(shell aws cloudformation update-stack --stack-name CRF-BUCKETS --region $(PRIMARY_REGION) --output text --template-body file://templates/create-buckets.yaml --capabilities CAPABILITY_NAMED_IAM --parameters \
		ParameterKey=ENV,ParameterValue=$(ENV) \
		ParameterKey=PrimaryRegion,ParameterValue=$(PRIMARY_REGION) \
		ParameterKey=SecondaryRegion,ParameterValue=$(SECONDARY_REGION) \
		ParameterKey=PrimaryCloudFrontBucketName,ParameterValue=${PRIMARY_CLOUDFRONT_BUCKET} \
		ParameterKey=SecondaryCloudFrontBucketName,ParameterValue=${SECONDARY_CLOUDFRONT_BUCKET} \
		ParameterKey=PrimaryLambdaLayerBucketName,ParameterValue=${PRIMARY_LAMBDA_LAYER_BUCKET} \
		ParameterKey=SecondaryLambdaLayerBucketName,ParameterValue=${SECONDARY_LAMBDA_LAYER_BUCKET} \
		ParameterKey=PrimaryLambdaBucketName,ParameterValue=${PRIMARY_LAMBDA_BUCKET} \
		ParameterKey=SecondaryLambdaBucketName,ParameterValue=${SECONDARY_LAMBDA_BUCKET} \
		ParameterKey=DocumentBucketName,ParameterValue=$(SSM_DOCUMENT_BUCKET) | awk '{print $2}'))
	(aws cloudformation wait stack-create-complete --stack-name ${result})
	@echo "Finished Updating Buckets"

destroy-buckets:
	@echo "Started Destroying Buckets"
	# sh auth.sh $(ACCOUNT) $(ROLE) $(REGIONS);
	$(eval result:=$(shell aws cloudformation delete-stack --stack-name CRF-BUCKETS --region $(PRIMARY_REGION) --output text | awk '{print $2}'))
	(aws cloudformation wait stack-create-complete --stack-name ${result})
	@echo "Finished Destroying Buckets"

deploy-stack-set-templates:
	@echo "Started Deploying Stack Set Templates"
	(aws s3 cp ./templates s3://$(STACK_SET_BUCKET)/ --recursive;)
	@echo "Finished Deploying Stack Set Templates"

deploy-psycopg2-zip:
	@echo "Started Deploying Psycopg2 Zip"
	# sh auth.sh $(ACCOUNT) $(ROLE) $(REGIONS) infrastructure destroy-all;
	(mkdir temp; \
	 cd temp; \
	 mkdir -p python/lib/python3.8/site-packages; \
	 curl https://pypi.tuna.tsinghua.edu.cn/packages/20/06/4581d1d6e35f2290319501708658208be0e57549b03ac733926a722d47d1/psycopg2_binary-2.9.5-cp38-cp38-manylinux_2_17_x86_64.manylinux2014_x86_64.whl#sha256=dc85b3777068ed30aff8242be2813038a929f2084f69e43ef869daddae50f6ee -o psycopg2.whl; \
	 unzip psycopg2.whl -d ./; \
	 cp -r psycopg2 python/lib/python3.8/site-packages; \
	 cp -r psycopg2_binary-2.9.5.dist-info python/lib/python3.8/site-packages; \
	 cp -r psycopg2_binary.libs python/lib/python3.8/site-packages; \
	 zip -r python.zip python; \
	 aws s3 cp ./python.zip s3://$(PRIMARY_LAMBDA_LAYER_BUCKET)/ --region $(PRIMARY_REGION); \
	 aws s3 cp ./python.zip s3://$(SECONDARY_LAMBDA_LAYER_BUCKET)/ --region $(SECONDARY_REGION); \
	 cd ..;  \
	 rm -r temp;)
	@echo "Finished Deploying Psycopg2 Zip"

deploy-stack-set-1:
	@echo "Started Deploying Stack Set 1"
	# sh auth.sh $(ACCOUNT) $(ROLE) $(REGIONS);
	$(eval result:=$(shell aws cloudformation create-stack --stack-name CRF-BASE-1 --region $(PRIMARY_REGION) --output text --template-body file://templates/stackset1.yaml --capabilities CAPABILITY_NAMED_IAM CAPABILITY_AUTO_EXPAND --parameters \
		ParameterKey=ENV,ParameterValue=$(ENV) \
		ParameterKey=PrimaryRegion,ParameterValue=$(PRIMARY_REGION) \
		ParameterKey=SecondaryRegion,ParameterValue=$(SECONDARY_REGION) \
		ParameterKey=VPCName,ParameterValue=remittance-vpc \
		ParameterKey=PrimaryCIDR,ParameterValue=$(PRIMARY_CIDR) \
		ParameterKey=PrimaryPrivateSubnet1CIDR,ParameterValue=$(PRIMARY_PRIVATE_SUBNET_1_CIDR) \
		ParameterKey=PrimaryPrivateSubnet2CIDR,ParameterValue=$(PRIMARY_PRIVATE_SUBNET_2_CIDR) \
		ParameterKey=PrimaryPrivateSubnet3CIDR,ParameterValue=$(PRIMARY_PRIVATE_SUBNET_3_CIDR) \
		ParameterKey=PrimaryPublicSubnet1CIDR,ParameterValue=$(PRIMARY_PUBLIC_SUBNET_1_CIDR) \
		ParameterKey=PrimaryPublicSubnet2CIDR,ParameterValue=$(PRIMARY_PUBLIC_SUBNET_2_CIDR) \
		ParameterKey=PrimaryPublicSubnet3CIDR,ParameterValue=$(PRIMARY_PUBLIC_SUBNET_3_CIDR) \
		ParameterKey=PrimaryVPCSecretName,ParameterValue=vpc1 \
		ParameterKey=SecondaryCIDR,ParameterValue=$(SECONDARY_CIDR) \
		ParameterKey=SecondaryPrivateSubnet1CIDR,ParameterValue=$(SECONDARY_PRIVATE_SUBNET_1_CIDR) \
		ParameterKey=SecondaryPrivateSubnet2CIDR,ParameterValue=$(SECONDARY_PRIVATE_SUBNET_2_CIDR) \
		ParameterKey=SecondaryPrivateSubnet3CIDR,ParameterValue=$(SECONDARY_PRIVATE_SUBNET_3_CIDR) \
		ParameterKey=SecondaryPublicSubnet1CIDR,ParameterValue=$(SECONDARY_PUBLIC_SUBNET_1_CIDR) \
		ParameterKey=SecondaryPublicSubnet2CIDR,ParameterValue=$(SECONDARY_PUBLIC_SUBNET_2_CIDR) \
		ParameterKey=SecondaryPublicSubnet3CIDR,ParameterValue=$(SECONDARY_PUBLIC_SUBNET_3_CIDR) \
		ParameterKey=SecondaryVPCSecretName,ParameterValue=vpc2 \
		ParameterKey=VPCPeeringSecretName,ParameterValue=peering \
		ParameterKey=ProjectId,ParameterValue=$(PROJECT_ID) \
        ParameterKey=DomainName,ParameterValue=$(DOMAIN_NAME) \
        ParameterKey=UIDomainName,ParameterValue=$(UI_DOMAIN_NAME) | awk '{print $2}')) \
    (aws cloudformation wait stack-create-complete --stack-name ${result})
	@echo "Finished Deploying Stack Set 1"

update-stack-set-1:
	@echo "Started Updating Stack Set 1"
	# sh auth.sh $(ACCOUNT) $(ROLE) $(REGIONS);
	$(eval result:=$(shell aws cloudformation update-stack --stack-name CRF-BASE-1 --region $(PRIMARY_REGION) --output text --template-body file://templates/stackset1.yaml --capabilities CAPABILITY_NAMED_IAM CAPABILITY_AUTO_EXPAND --parameters \
		ParameterKey=ENV,ParameterValue=$(ENV) \
		ParameterKey=PrimaryRegion,ParameterValue=$(PRIMARY_REGION) \
		ParameterKey=SecondaryRegion,ParameterValue=$(SECONDARY_REGION) \
		ParameterKey=VPCName,ParameterValue=remittance-vpc \
		ParameterKey=PrimaryCIDR,ParameterValue=$(PRIMARY_CIDR) \
		ParameterKey=PrimaryPrivateSubnet1CIDR,ParameterValue=$(PRIMARY_PRIVATE_SUBNET_1_CIDR) \
		ParameterKey=PrimaryPrivateSubnet2CIDR,ParameterValue=$(PRIMARY_PRIVATE_SUBNET_2_CIDR) \
		ParameterKey=PrimaryPrivateSubnet3CIDR,ParameterValue=$(PRIMARY_PRIVATE_SUBNET_3_CIDR) \
		ParameterKey=PrimaryPublicSubnet1CIDR,ParameterValue=$(PRIMARY_PUBLIC_SUBNET_1_CIDR) \
		ParameterKey=PrimaryPublicSubnet2CIDR,ParameterValue=$(PRIMARY_PUBLIC_SUBNET_2_CIDR) \
		ParameterKey=PrimaryPublicSubnet3CIDR,ParameterValue=$(PRIMARY_PUBLIC_SUBNET_3_CIDR) \
		ParameterKey=PrimaryVPCSecretName,ParameterValue=vpc1 \
		ParameterKey=SecondaryCIDR,ParameterValue=$(SECONDARY_CIDR) \
		ParameterKey=SecondaryPrivateSubnet1CIDR,ParameterValue=$(SECONDARY_PRIVATE_SUBNET_1_CIDR) \
		ParameterKey=SecondaryPrivateSubnet2CIDR,ParameterValue=$(SECONDARY_PRIVATE_SUBNET_2_CIDR) \
		ParameterKey=SecondaryPrivateSubnet3CIDR,ParameterValue=$(SECONDARY_PRIVATE_SUBNET_3_CIDR) \
		ParameterKey=SecondaryPublicSubnet1CIDR,ParameterValue=$(SECONDARY_PUBLIC_SUBNET_1_CIDR) \
		ParameterKey=SecondaryPublicSubnet2CIDR,ParameterValue=$(SECONDARY_PUBLIC_SUBNET_2_CIDR) \
		ParameterKey=SecondaryPublicSubnet3CIDR,ParameterValue=$(SECONDARY_PUBLIC_SUBNET_3_CIDR) \
		ParameterKey=SecondaryVPCSecretName,ParameterValue=vpc2 \
		ParameterKey=VPCPeeringSecretName,ParameterValue=peering \
		ParameterKey=ProjectId,ParameterValue=${PROJECT_ID} \
        ParameterKey=DomainName,ParameterValue=$(DOMAIN_NAME) \
        ParameterKey=UIDomainName,ParameterValue=$(UI_DOMAIN_NAME) | awk '{print $2}')) \
    (aws cloudformation wait stack-create-complete --stack-name ${result})
	@echo "Finished Updating Stack Set 1"

destroy-stack-set-1:
	@echo "Started Destroying Stack Set 1"
	$(eval result:=$(shell aws cloudformation delete-stack --stack-name CRF-BASE-1 --region $(PRIMARY_REGION) --output text | awk '{print $2}'))
	(aws cloudformation wait stack-create-complete --stack-name ${result})
	@echo "Finished Destroying Stack Set 1"

zip-lambda-source:
	@echo "Started Creating Lambda Source Zip File"
	(cd ./database/src; zip -r database.zip . *.*)
	@echo "Finished Creating Lambda Source Zip File"

add-files-lambda-s3-bucket-primary:
	@echo "Started Adding Files to Lambda S3 Bucket in Primary"
	 aws s3 cp ./database/src/database.zip s3://$(PRIMARY_LAMBDA_BUCKET)/;
	@echo "Finished Adding Files to Lambda S3 Bucket in Primary"

add-files-lambda-s3-bucket-secondary:
	@echo "Started Adding Files to Lambda S3 Bucket in Secondary"
	 aws s3 cp ./database/src/database.zip s3://$(SECONDARY_LAMBDA_BUCKET)/ --region $(SECONDARY_REGION);
	@echo "Finished Adding Files to Lambda S3 Bucket in Secondary"

zip-document-source:
	@echo "Started Creating Document Source Zip File"
	(cd ./failover; zip rotation.zip rotation.py)
	@echo "Finished Creating Document Source Zip File"

add-files-document-s3-bucket:
	@echo "Started Adding Files to SSM Document S3 Bucket"
	 aws s3 cp ./failover/rotation.zip s3://$(SSM_DOCUMENT_BUCKET)/;
	@echo "Finished Adding Files to SSM Document S3 Bucket"

deploy-stack-set-2:
	@echo "Started Deploying Stack Set 2"
	# sh auth.sh $(ACCOUNT) $(ROLE) $(REGIONS);
	$(eval result:=$(shell aws cloudformation create-stack --stack-name CRF-BASE-2 --region $(PRIMARY_REGION) --output text --template-body file://templates/stackset2.yaml --capabilities CAPABILITY_NAMED_IAM --parameters \
		ParameterKey=ENV,ParameterValue=$(ENV) \
		ParameterKey=PrimaryRegion,ParameterValue=$(PRIMARY_REGION) \
		ParameterKey=SecondaryRegion,ParameterValue=$(SECONDARY_REGION) \
		ParameterKey=DomainName,ParameterValue=$(DOMAIN_NAME) \
		ParameterKey=UIDomainName,ParameterValue=$(UI_DOMAIN_NAME) \
		ParameterKey=PrimaryCloudFrontBucketName,ParameterValue=$(PRIMARY_CLOUDFRONT_BUCKET) \
		ParameterKey=SecondaryCloudFrontBucketName,ParameterValue=$(SECONDARY_CLOUDFRONT_BUCKET) \
		ParameterKey=WebACLName,ParameterValue=$(WEB_ACL) \
		ParameterKey=UserEmail,ParameterValue=$(ADMIN_EMAIL) | awk '{print $2}'))
	(aws cloudformation wait stack-create-complete --stack-name ${result})
	@echo "Finished Deploying Stack Set 2"

update-stack-set-2:
	@echo "Started Updating Stack Set 2"
	# sh auth.sh $(ACCOUNT) $(ROLE) $(REGIONS);
	$(eval result:=$(shell aws cloudformation update-stack --stack-name CRF-BASE-2 --region $(PRIMARY_REGION) --output text --template-body file://templates/stackset2.yaml --capabilities CAPABILITY_NAMED_IAM --parameters \
		ParameterKey=ENV,ParameterValue=$(ENV) \
		ParameterKey=PrimaryRegion,ParameterValue=$(PRIMARY_REGION) \
		ParameterKey=SecondaryRegion,ParameterValue=$(SECONDARY_REGION) \
		ParameterKey=DomainName,ParameterValue=$(DOMAIN_NAME) \
		ParameterKey=UIDomainName,ParameterValue=$(UI_DOMAIN_NAME) \
		ParameterKey=PrimaryCloudFrontBucketName,ParameterValue=$(PRIMARY_CLOUDFRONT_BUCKET) \
		ParameterKey=SecondaryCloudFrontBucketName,ParameterValue=$(SECONDARY_CLOUDFRONT_BUCKET) \
		ParameterKey=WebACLName,ParameterValue=$(WEB_ACL) \
		ParameterKey=UserEmail,ParameterValue=$(ADMIN_EMAIL) | awk '{print $2}'))
	(aws cloudformation wait stack-create-complete --stack-name ${result})
	@echo "Finished Updating Stack Set 2"

destroy-stack-set-2:
	@echo "Started Destroying Stack Set 2"
	# sh auth.sh $(ACCOUNT) $(ROLE) $(REGIONS);
	$(eval result:=$(shell aws cloudformation delete-stack --stack-name CRF-BASE-2 --region $(PRIMARY_REGION) --output text | awk '{print $2}'))
	(aws cloudformation wait stack-create-complete --stack-name ${result})
	@echo "Finished Destroying Stack Set 2"

deploy-stack-set-3:
	@echo "Started Deploying Stack Set 3"
	# sh auth.sh $(ACCOUNT) $(ROLE) $(REGIONS);
	$(eval result:=$(shell aws cloudformation create-stack --stack-name CRF-APP --region $(PRIMARY_REGION) --output text --template-body file://templates/stackset3.yaml --capabilities CAPABILITY_NAMED_IAM --parameters \
		ParameterKey=ENV,ParameterValue=$(ENV) \
		ParameterKey=PrimaryRegion,ParameterValue=$(PRIMARY_REGION) \
		ParameterKey=SecondaryRegion,ParameterValue=$(SECONDARY_REGION) \
		ParameterKey=PrimaryLambdaBucketName,ParameterValue=$(PRIMARY_LAMBDA_BUCKET) \
		ParameterKey=SecondaryLambdaBucketName,ParameterValue=$(SECONDARY_LAMBDA_BUCKET) \
		ParameterKey=PrimaryLambdaLayerBucketName,ParameterValue=$(PRIMARY_LAMBDA_LAYER_BUCKET) \
		ParameterKey=SecondaryLambdaLayerBucketName,ParameterValue=$(SECONDARY_LAMBDA_LAYER_BUCKET) \
		ParameterKey=DomainName,ParameterValue=$(DOMAIN_NAME) \
		ParameterKey=UIDomainName,ParameterValue=$(UI_DOMAIN_NAME) \
		ParameterKey=DocumentBucketName,ParameterValue=$(SSM_DOCUMENT_BUCKET) \
		ParameterKey=Checksum,ParameterValue=$(shell shasum -a 256 ./failover/rotation.zip | grep -o "^\w*\b") | awk '{print $2}'))
	(aws cloudformation wait stack-create-complete --stack-name ${result})
	@echo "Finished Deploying Stack Set 2"

update-stack-set-3:
	@echo "Started Updating Stack Set 3"
	# sh auth.sh $(ACCOUNT) $(ROLE) $(REGIONS);
	$(eval result:=$(shell aws cloudformation create-stack --stack-name CRF-APP --region $(PRIMARY_REGION) --output text --template-body file://templates/stackset3.yaml --capabilities CAPABILITY_NAMED_IAM --parameters \
		ParameterKey=ENV,ParameterValue=$(ENV) \
		ParameterKey=PrimaryRegion,ParameterValue=$(PRIMARY_REGION) \
		ParameterKey=SecondaryRegion,ParameterValue=$(SECONDARY_REGION) \
		ParameterKey=PrimaryLambdaBucketName,ParameterValue=$(PRIMARY_LAMBDA_BUCKET) \
		ParameterKey=SecondaryLambdaBucketName,ParameterValue=$(SECONDARY_LAMBDA_BUCKET) \
		ParameterKey=PrimaryLambdaLayerBucketName,ParameterValue=$(PRIMARY_LAMBDA_LAYER_BUCKET) \
		ParameterKey=SecondaryLambdaLayerBucketName,ParameterValue=$(SECONDARY_LAMBDA_LAYER_BUCKET) \
		ParameterKey=DomainName,ParameterValue=$(DOMAIN_NAME) \
		ParameterKey=UIDomainName,ParameterValue=$(UI_DOMAIN_NAME) \
		ParameterKey=DocumentBucketName,ParameterValue=$(SSM_DOCUMENT_BUCKET) \
		ParameterKey=Checksum,ParameterValue=$(shell shasum -a 256 ./failover/rotation.zip | grep -o "^\w*\b") | awk '{print $2}'))
	(aws cloudformation wait stack-create-complete --stack-name ${result})
	@echo "Finished Updating Stack Set 2"

destroy-stack-set-3:
	@echo "Started Destroying Stack Set 3"
	# sh auth.sh $(ACCOUNT) $(ROLE) $(REGIONS);
	$(eval result:=$(shell aws cloudformation create-stack --stack-name CRF-APP --region $(PRIMARY_REGION) --output text | awk '{print $2}'))
	(aws cloudformation wait stack-create-complete --stack-name ${result})
	@echo "Finished Destroying Stack Set e"

build-web-app:
	@echo "Started Building Web App"
	# sh auth.sh $(ACCOUNT) $(ROLE) $(REGIONS) infrastructure destroy-all;
	(sed -i '' "s|USER_POOL_ID_PLACEHOLDER|$(shell aws ssm --region us-east-1 get-parameter --name /crf/cognito/user-pool-id  --query Parameter.Value --output text)|g" ui/src/components/home/cognito.tsx; \
     sed -i '' "s|IDENTITY_POOL_ID_PLACEHOLDER|$(shell aws ssm --region us-east-1 get-parameter --name /crf/cognito/identity-pool-id --query Parameter.Value --output text)|g" ui/src/components/home/cognito.tsx; \
     sed -i '' "s|WEB_CLIENT_ID_PLACEHOLDER|$(shell aws ssm --region us-east-1 get-parameter --name /crf/cognito/app-client --query Parameter.Value --output text)|g" ui/src/components/home/cognito.tsx; \
     sed -i '' "s|DOMAIN_PLACEHOLDER|remittance.auth.us-east-1.amazoncognito.com|g" ui/src/components/home/cognito.tsx; \
     sed -i '' "s|DOMAIN_NAME_PLACEHOLDER|$(DOMAIN_NAME)|g" ui/src/config/index.ts; \
     sed -i '' "s|CLOUDFRONT_PLACEHOLDER|$(shell aws secretsmanager --region us-east-1 get-secret-value --secret-id cloudfront-primary-domain-name --query SecretString --output text)|g" ui/src/components/home/cognito.tsx; \
     cd ./ui; \
	 npm run build; \
     cd ..; \
     sed -i '' "s|$(shell aws ssm --region us-east-1 get-parameter --name /crf/cognito/user-pool-id  --query Parameter.Value --output text)|USER_POOL_ID_PLACEHOLDER|g" ui/src/components/home/cognito.tsx; \
     sed -i '' "s|$(shell aws ssm --region us-east-1 get-parameter --name /crf/cognito/identity-pool-id --query Parameter.Value --output text)|IDENTITY_POOL_ID_PLACEHOLDER|g" ui/src/components/home/cognito.tsx; \
     sed -i '' "s|$(shell aws ssm --region us-east-1 get-parameter --name /crf/cognito/app-client --query Parameter.Value --output text)|WEB_CLIENT_ID_PLACEHOLDER|g" ui/src/components/home/cognito.tsx; \
     sed -i '' "s|remittance.auth.us-east-1.amazoncognito.com|DOMAIN_PLACEHOLDER|g" ui/src/components/home/cognito.tsx; \
     sed -i '' "s|$(DOMAIN_NAME)|DOMAIN_NAME_PLACEHOLDER|g" ui/src/config/index.ts; \
     sed -i '' "s|$(shell aws secretsmanager --region us-east-1 get-secret-value --secret-id cloudfront-primary-domain-name --query SecretString --output text)|CLOUDFRONT_PLACEHOLDER|g" ui/src/components/home/cognito.tsx;)
	@echo "Finished Building Web App"

deploy-web-app-primary:
	@echo "Started Deploying Web App Upload to Primary"
	(aws s3 cp ./ui/build s3://$(PRIMARY_CLOUDFRONT_BUCKET)/ --recursive;)
	@echo "Finished Deploying Web App Upload to Primary"

deploy-web-app-secondary:
	@echo "Started Deploying Web App Upload to Secondary"
	(aws s3 cp ./ui/build s3://$(SECONDARY_CLOUDFRONT_BUCKET)/ --recursive;)
	@echo "Finished Deploying Web App Upload to Secondary"

deploy-cognito-configuration:
	@echo "Started Deploying Cognito Configuration"
	# sh auth.sh $(ACCOUNT) $(ROLE) $(REGIONS) infrastructure destroy-all;
	($(eval password1:=${shell openssl rand -base64 6}) \
	 aws secretsmanager --region us-east-1 create-secret --name crf-cognito-admin-password --secret-string ${password1}; \
	 aws secretsmanager --region us-east-1 update-secret --secret-id crf-cognito-admin-password --secret-string ${password1}; \
	 aws cognito-idp admin-set-user-password --region us-east-1 --user-pool-id ${shell aws ssm get-parameter --region us-east-1 --name /crf/cognito/user-pool-id --query Parameter.Value --output text} --username $(ADMIN_EMAIL) --password ${password1} --permanent;)
	@echo "Finished Deploying Cognito Configuration"

create-role:
	@echo "Creating role for account $(ACCOUNT)"
	(aws iam create-role --role-name $(ROLE) --assume-role-policy-document file://trust-policy.json; \
	aws iam attach-role-policy --role-name $(ROLE) --policy-arn arn:aws:iam::aws:policy/AdministratorAccess;)
	@echo "Finished creating role for account $(ACCOUNT)"

test-creds:
	sh auth.sh $(ACCOUNT) $(ROLE) $(REGIONS);

deploy-base: deploy-initialization deploy-stack-set-templates deploy-buckets deploy-psycopg2-zip deploy-stack-set-1
deploy-app: zip-lambda-source add-files-lambda-s3-bucket-primary add-files-lambda-s3-bucket-secondary zip-document-source add-files-document-s3-bucket deploy-stack-set-2 deploy-stack-set-3 build-web-app deploy-web-app-primary deploy-web-app-secondary deploy-cognito-configuration

