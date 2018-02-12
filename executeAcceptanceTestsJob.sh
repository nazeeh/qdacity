#!/bin/bash

echo "ALL CONTAINERS"
docker container ls -a
echo "RUNNING CONTAINERS"
docker container ls
echo "AVAILABLE IMAGES"
docker image ls
    
echo "CLEAR EVERYTHING" 
#docker container stop $(docker container ls -a -q) || true
#docker container rm $(docker container ls -a -q) || true
#docker image rm $(docker image ls -a -q) || true


# Remove dangling images
docker rmi $(docker images -qa -f "dangling=true")

echo "ALL CONTAINERS"
docker container ls -a
echo "RUNNING CONTAINERS"
docker container ls
echo "AVAILABLE IMAGES"
docker image ls
    
echo "START BUILD"

IMAGE_NAME_BASE="qdacity-tests-base"
IMAGE_NAME_TESTS="qdacity-tests-${CI_PROJECT_ID}"

# Build base
docker build -f ./docker/acceptance-tests/Dockerfile.base -t $IMAGE_NAME_BASE .

# Build test image
docker build -f ./docker/acceptance-tests/Dockerfile.tests -t $IMAGE_NAME_TESTS .

# Run test image
docker run --rm -v /dev/shm:/dev/shm $IMAGE_NAME_TESTS