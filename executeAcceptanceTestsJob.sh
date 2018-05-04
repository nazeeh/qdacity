#!/bin/bash

# Create api_config and .env
echo $API_CONFIG_PRODUCTION > ./war/api_config.json
echo "$RTCSVC_ENV" | sed -e 's/\r/\n/g' > ./realtime-service/.env

#creating directory where generated files from the devserver are stored, so we can later delete it
mkdir ./target/qdacity-war/WEB-INF/appengine-generated

# Install npm packages
cd realtime-service
yarn install
cd ..

# Copy package without a set configuration to target and set config with --local
cd war
npm ci
cp ./dist/js/index.dist.js ../target/qdacity-war/dist/js/index.dist.js
gulp set-config-target --local --noTranslation
cd ..

# Show docker containers and images
echo "Existing containers"
docker container ls -a

echo "Existing images"
docker image ls

# Build docker images 
BASE_IMAGE_TAG="qdacity-tests-base:latest"
TEST_IMAGE_TAG="qdacity-tests-${CI_PROJECT_ID}"

# Build the base image if it does not exist
[ ! -z $(docker images -q $BASE_IMAGE_TAG) ] || docker build --no-cache -f ./docker/acceptance-tests/Dockerfile.base -t qdacity-tests-base .

# Build the test image
echo "Building the image" 

# Build test image
docker build -f ./docker/acceptance-tests/Dockerfile.tests -t $TEST_IMAGE_TAG .

mkdir logs
 
# Run docker image
echo "Running the image" 
docker run --rm \
  -v /dev/shm:/dev/shm \
  --mount type=bind,source="$(pwd)"/war,target=/app/war \
  --mount type=bind,source="$(pwd)"/target,target=/app/target \
  --mount type=bind,source="$(pwd)"/realtime-service,target=/app/realtime-service \
  --mount type=bind,source="$(pwd)"/logs,target=/app/logs \
  $TEST_IMAGE_TAG