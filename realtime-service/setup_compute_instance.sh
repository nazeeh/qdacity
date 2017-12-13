#!/bin/bash

# Authenticate at correct service account
echo $DEPLOY_KEY_FILE_PRODUCTION > /tmp/$CI_PIPELINE_ID.json;
gcloud auth activate-service-account --key-file /tmp/$CI_PIPELINE_ID.json;

# Get description of compute instance
description=`gcloud \
  --project=$PROJECT_ID_PRODUCTION \
  compute instances describe realtime-service \
    --zone=us-central1-c
  2> /dev/null`;

# Get status from description
status=`echo "$description" | grep status | awk '{ print $2 }'`;

# Instance is already up and running
if [ "$status" = "RUNNING" ]; then
  ip=`echo "$description" | grep natIP | awk '{ print $2}'`;
  echo "Instance is already running. External IP: $ip";

# No instance found, create it
elif [ "$status" = "" ]; then
  gcloud \
    --project=$PROJECT_ID_PRODUCTION \
    compute instances create realtime-service \
      --boot-disk-device-name=realtime-service-boot-disk \
      --boot-disk-size=10GB \
      --boot-disk-type=pd-standard \
      --image-family=ubuntu-1604-lts \
      --image-project=ubuntu-os-cloud \
      --machine-type=f1-micro \
      --metadata=startup-script=/home/ubuntu/realtime-service/startup.sh \
      --tags http-server,https-server \
      --zone=us-central1-c;

# Other status, display it and exit with code 1
else
  echo "Unknown state of instance:";
  echo $description;
  exit 1;
fi

