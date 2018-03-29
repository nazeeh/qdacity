#!/bin/bash

# Create api_config and .env
echo $API_CONFIG_PRODUCTION > ./war/api_config.json
echo $RTCSVC_ENV | sed -e 's/\r/\n/g' > ./realtime-service/.env

# Install npm packages
cd realtime-service
npm prune
# The docker image requires a special grpc binary
echo "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
echo "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
echo "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
echo "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
echo "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
echo "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
echo "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
npm install --target=9.0.0 --target_platform=linux --target_arch=x64

#https://storage.googleapis.com/grpc-precompiled-binaries/node/grpc/v1.7.1/node-v59-linux-x64.tar.gz

#Expected directory: node-v59-linux-x64-glibc
#Found: [node-v57-linux-x64-glibc]


echo "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
echo "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
echo "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
echo "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
echo "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
echo "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
echo "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
ls ./node_modules/grpc
echo "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
echo "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
ls ./node_modules/grpc/src
echo "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
echo "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
ls ./node_modules/grpc/src/node
echo "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
echo "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
ls ./node_modules/grpc/src/node/extension_binary
echo "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
echo "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
echo "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
echo "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
echo "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
echo "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
echo "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
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



#FORCE REBUILD !!!!!!!!!!!!!!!!!!!!!!!!!!!
docker build --no-cache -f ./docker/acceptance-tests/Dockerfile.base -t qdacity-tests-base .




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