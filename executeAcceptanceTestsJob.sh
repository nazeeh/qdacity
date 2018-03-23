#!/bin/bash

# Create api_config and .env
echo $API_CONFIG_PRODUCTION > ./war/api_config.json
echo $RTCSVC_ENV | sed -e 's/\r/\n/g' > ./realtime-service/.env

# Install npm packages
cd realtime-service
npm prune
npm install
cd ..

cd localization
npm prune
npm install
cd ..

cd war
npm prune
npm install
cd ..

# Local frontend build
cd war
gulp bundle-task --local
cd ..

# Show docker containers and images
echo "Existing containers"
docker container ls -a

echo "Existing images"
docker image ls

echo "Clear dangling images" 
docker rmi $(docker images -qa -f "dangling=true")

# Build docker images 
BASE_IMAGE_TAG="qdacity-tests-base:latest"
TEST_IMAGE_TAG="qdacity-tests-${CI_PROJECT_ID}"

# Build the base image if it does not exist
[ ! -z $(docker images -q $BASE_IMAGE_TAG) ] || docker build -f ./docker/acceptance-tests/Dockerfile.base -t qdacity-tests-base .

# Build the test image
echo "Building the image" 

# Clean old image
docker image rm $TEST_IMAGE_TAG

# Build test image
docker build --no-cache -f ./docker/acceptance-tests/Dockerfile.tests -t $TEST_IMAGE_TAG .
 
# Run docker image
echo "Running the image" 
docker run --rm -v /dev/shm:/dev/shm $TEST_IMAGE_TAG