#!/bin/bash

#docker container stop $(docker container ls -a -q)
#docker container rm $(docker container ls -a -q)
#docker image rm $(docker image ls -a -q)
#docker volume rm $(docker volume ls -qf dangling=true)

#docker build --no-cache -f ./docker/acceptance-tests/Dockerfile.base -t qdacity-tests-base .


docker container stop -f 1906c444672f
docker container kill 1906c444672f
docker container rm 1906c444672f


# Local build
cd war
gulp bundle-task --local
cd ..

echo "Existing containers"
docker container ls -a

echo "Existing images"
docker image ls

echo "Clear dangling images" 
docker rmi $(docker images -qa -f "dangling=true")


BASE_IMAGE_TAG="qdacity-tests-base:latest"
TEST_IMAGE_TAG="qdacity-tests-${CI_PROJECT_ID}"

# Build the base image if it does not exist
[ ! -z $(docker images -q $BASE_IMAGE_TAG) ] || docker build -f ./docker/acceptance-tests/Dockerfile.base -t qdacity-tests-base .

echo "Building the image" 
# Build the test image
docker build --no-cache -f ./docker/acceptance-tests/Dockerfile.tests -t $TEST_IMAGE_TAG .
 
echo "Running the image" 
# Run docker image
docker run --rm -v /dev/shm:/dev/shm $TEST_IMAGE_TAG