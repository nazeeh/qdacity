#!/bin/bash

# Authenticate at correct service account
echo $DEPLOY_KEY_FILE_PRODUCTION > /tmp/$CI_PIPELINE_ID.json
gcloud auth activate-service-account --key-file /tmp/$CI_PIPELINE_ID.json

# Get status of compute instance
description=`gcloud \
  --project=$PROJECT_ID_PRODUCTION \
  compute instances describe realtime-service \
    --zone=us-central1-c
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
echo $RTCSVC_ENV | sed -e 's/\r/\n/g' > .env

# Upload data to server
gcloud \
  --quiet \
  --project=$PROJECT_ID_PRODUCTION \
  compute scp \
    --zone=us-central1-c \
    --recurse \
    ./ ubuntu@realtime-service:/home/ubuntu/realtime-service/

# Run startup script on server
gcloud \
  --quiet \
  --project=$PROJECT_ID_PRODUCTION \
  compute ssh ubuntu@realtime-service \
    --zone=us-central1-c \
    --command="bash /home/ubuntu/realtime-service/startup.sh"

