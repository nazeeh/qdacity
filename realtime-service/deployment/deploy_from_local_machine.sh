#!/bin/bash

# get configuration values
source "$(dirname $0)/files/get_config.sh"

# Upload project and setup script to server
echo "Upload data to server..."
gcloud compute scp \
  ./.env \
  ./deployment/ \
  ./index.js \
  ./package.json \
  ./src/ \
  ./yarn.lock \
  ubuntu@$INSTANCE_NAME:/home/ubuntu/realtime-service/ \
  --recurse \
  --zone=$zone \
  --quiet \
  --project=$project;

# Run basic setup script on server
echo "Run setup script on server"
gcloud compute ssh ubuntu@$INSTANCE_NAME \
  --command="bash /home/ubuntu/realtime-service/deployment/files/basic_setup.sh" \
  --zone=$zone \
  --quiet \
  --project=$project;

echo ""
echo "Deployment finished.";
