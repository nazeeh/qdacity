#!/bin/bash

# Set defaults
INSTANCE_NAME='realtime-service'
DEFAULT_ZONE='us-central1-c'

# Verify the user has logged in
account=`gcloud config get-value core/account 2> /dev/null`;
if [ "$account" = "" ]; then
  echo "Please run 'gcloud auth login' first"
  exit 1;
fi

# Verify the user has selected a project
project=`gcloud config get-value core/project 2> /dev/null`;
if [ "$project" = "" ]; then
  projectList=`gcloud projects list`;
  echo "You did not set a default project in your gcloud config"
  echo "You can do that by running 'gcloud config set project PROJECT_ID'"
  echo ""
  echo "These are your projects:"
  echo "$projectList"
  echo ""
  echo -n "Please specify the PROJECT_ID to use for now: "
  read project
  echo ""
fi

# Verify the user has selected a zone to deploy to
zone=`gcloud config get-value compute/zone 2> /dev/null`;
if [ "$zone" = "" ]; then
  echo "You did not set a default zone in your gcloud config"
  echo "You can do that by running 'gcloud config set compute/zone ZONE'"
  echo "To see all available zones run 'gcloud compute zones list'"
  echo ""
  echo -n "Should the default zone '$DEFAULT_ZONE' be used (Y/n)? "
  read useDefaultZone
  if [ "$useDefaultZone" = "Y" ]; then
    zone=$DEFAULT_ZONE
  else
    echo -n "Please specify the ZONE to use for now: "
    read zone
  fi
  echo ""
fi

# Let the user verify his data
echo "Make sure the following data is correct before proceeding:"
echo ""
echo "account:      [$account]"
echo "project:      [$project]"
echo "compute zone: [$zone]"
echo ""
echo -n "Continue with this data (Y/n)? "
read dataConfirmation
if [ "$dataConfirmation" != "Y" ]; then
  echo "Aborted by user."
  exit 1
fi


