#!/bin/bash

# Authenticate at correct service account
echo $DEPLOY_KEY_FILE_PRODUCTION > /tmp/$CI_PIPELINE_ID.json
gcloud auth activate-service-account --key-file /tmp/$CI_PIPELINE_ID.json

# if COMPUTE_ENGINE_ZONE is not set in environment, fallback to us-central1-c
if [ "$COMPUTE_ENGINE_ZONE" = "" ]; then
  COMPUTE_ENGINE_ZONE='us-central1-c'
fi

# Get status of compute instance
description=`gcloud compute instances describe realtime-service \
  --zone=$COMPUTE_ENGINE_ZONE \
  --project=$PROJECT_ID_PRODUCTION \
  2> /dev/null`;
status=`echo "$description" | grep status | awk '{ print $2 }'`;

# Instance is not set up, exit
if [ "$status" != "RUNNING" ]; then
  echo "Compute engine instance is not set up. Skipping deployment"
  exit 0;
fi

# Remove node_modules. They should not be transferred via scp
rm -rf node_modules

# Get .env from Gitlab secret variables
echo "$RTCSVC_ENV" | sed -e 's/\r/\n/g' > .env

# Upload data to server
gcloud compute scp ./ ubuntu@realtime-service:/home/ubuntu/realtime-service/ \
  --recurse \
  --quiet \
  --zone=$COMPUTE_ENGINE_ZONE \
  --project=$PROJECT_ID_PRODUCTION;

# Run startup script on server
gcloud compute ssh ubuntu@realtime-service \
  --command="bash /home/ubuntu/realtime-service/deployment/files/basic_setup.sh" \
  --quiet \
  --zone=$COMPUTE_ENGINE_ZONE \
  --project=$PROJECT_ID_PRODUCTION;

