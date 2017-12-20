#!/bin/bash

# get configuration values
source "$(dirname $0)/files/get_config.sh"

# Allow ingress HTTP traffic
echo -n "See if firewall rule default-allow-http is already defined... "
gcloud compute firewall-rules describe default-allow-http &> /dev/null;
if [ "$?" = "1" ]; then
  echo "No."
  gcloud compute firewall-rules create default-allow-http \
    --allow=tcp:80 \
    --target-tags=http-server \
    --project=$project;
else
  echo "Yes."
fi

# Allow ingress HTTPS traffic
echo -n "See if firewall rule default-allow-https is already defined... "
gcloud compute firewall-rules describe default-allow-https &> /dev/null;
if [ "$?" = "1" ]; then
  echo "No."
  gcloud compute firewall-rules create default-allow-https \
    --allow=tcp:443 \
    --target-tags=https-server \
    --project=$project;
else
  echo "Yes."
fi

# Get description of compute instance
echo -n "See if there is already an instance running with name '$INSTANCE_NAME'... "
description=`gcloud compute instances describe $INSTANCE_NAME \
  --zone=$zone \
  --project=$project \
  2> /dev/null`;

# Get status from description
status=`grep status <<< "$description" | awk '{ print $2 }'`;

# No instance found, create it
if [ "$status" = "" ]; then
  echo "No."
  echo "Creating instance..."
  # Setup compute instance
  gcloud compute instances create $INSTANCE_NAME \
    --boot-disk-device-name=$INSTANCE_NAME-boot-disk \
    --boot-disk-size=10GB \
    --boot-disk-type=pd-standard \
    --image-family=ubuntu-1604-lts \
    --image-project=ubuntu-os-cloud \
    --machine-type=f1-micro \
    --metadata=startup-script=/home/ubuntu/realtime-service/deployment/startup.sh \
    --tags http-server,https-server \
    --zone=$zone \
    --project=$project;

elif [ "$status" = "RUNNING" ]; then
  echo "Yes."

# Other status, display it and exit with code 1
else
  echo "Kind of?!"
  echo "Instance has unknown state:";
  echo $description;
  exit 1;
fi

# Wait until the server is reachable via ssh
echo -n "Wait for the instance to be connectable via SSH..."
gcloud compute ssh ubuntu@$INSTANCE_NAME \
  --command="echo UP" \
  --zone=$zone \
  --quiet \
  --project=$project \
  -- \
  -o "ConnectTimeout 3" &> /dev/null;
while [ "$?" != "0" ]; do
  echo -n "."
  gcloud compute ssh ubuntu@$INSTANCE_NAME \
    --command="echo UP" \
    --zone=$zone \
    --quiet \
    --project=$project \
    -- \
    -o "ConnectTimeout 3" &> /dev/null;
done
echo " OK."

# Create application directory on server
echo "Create application directory..."
gcloud compute ssh ubuntu@$INSTANCE_NAME \
  --command="mkdir -p /home/ubuntu/realtime-service/" \
  --zone=$zone \
  --quiet \
  --project=$project;

# Upload project and setup script to server
echo "Upload project and setup script to server..."
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

# Fetch fresh description to get the IP
description=`gcloud compute instances describe $INSTANCE_NAME \
  --zone=$zone \
  --project=$project \
  2> /dev/null`;
ip=`grep natIP <<< "$description" | awk '{ print $2}'`;

# Instance is already up and running
echo ""
echo "Instance is running. Try access at http://$ip/";
