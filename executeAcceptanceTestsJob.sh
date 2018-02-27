#!/bin/bash

echo "Existing containers"
docker container ls -a

echo "Existing images"
docker image ls

echo "Clear dangling images" 
docker rmi $(docker images -qa -f "dangling=true")


BASE_IMAGE_TAG="qdacity-tests-base:latest"
IMAGE_NAME_TESTS="qdacity-tests-${CI_PROJECT_ID}"

# Build the base image if it does not exist
[ ! -z $(docker images -q $BASE_IMAGE_TAG) ] || docker build -f ./docker/acceptance-tests/Dockerfile.base -t qdacity-tests-base .


#
mkdir MY-TEST-FOLDER

cd MY-TEST-FOLDER

npm install gulp

cd ..




# Build the test image
docker build -f ./docker/acceptance-tests/Dockerfile.tests -t $IMAGE_NAME_TESTS .

# Run docker image
docker run --rm -v /dev/shm:/dev/shm $IMAGE_NAME_TESTS