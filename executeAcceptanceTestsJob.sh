#!/bin/bash

echo "Existing container"
docker container ls -a

echo "Existing images"
docker image ls

echo "Clear dangling images" 
docker rmi $(docker images -qa -f "dangling=true")


# Build docker image
IMAGE_NAME_TESTS="qdacity-tests-${CI_PROJECT_ID}"

# Build test image
docker build -f ./docker/acceptance-tests/Dockerfile.tests -t $IMAGE_NAME_TESTS .

# Run test image
docker run --rm -v /dev/shm:/dev/shm $IMAGE_NAME_TESTS