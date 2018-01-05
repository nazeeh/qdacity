#!/bin/bash

if [ "$#" -lt "1" ]; then 
  echo "Please provide the domain to be used for the SSL certificate:"
  echo "$0 DOMAIN"
  exit 1
fi

domain="$1"

# get configuration values
source "$(dirname $0)/files/get_config.sh"

# Create application directory on server
echo "Running configuration script on server..."
gcloud compute ssh ubuntu@$INSTANCE_NAME \
  --command="/home/ubuntu/realtime-service/deployment/files/configure_nginx_https.sh $domain $account" \
  --zone=$zone \
  --quiet \
  --project=$project;
