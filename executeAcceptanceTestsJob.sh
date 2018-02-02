#!/bin/bash

echo "ALL CONTAINERS"
docker container ls -a
echo "RUNNING CONTAINERS"
docker container ls
echo "AVAILABLE IMAGES"
docker image ls
    
echo "CLEAR EVERYTHING" 
docker container stop $(docker container ls -a -q) || true
docker container rm $(docker container ls -a -q) || true
docker image rm $(docker image ls -a -q) || true

echo "ALL CONTAINERS"
docker container ls -a
echo "RUNNING CONTAINERS"
docker container ls
echo "AVAILABLE IMAGES"
docker image ls
    
echo "START BUILD"

IMAGE_NAME="qdatest${CI_PROJECT_ID}"

echo "IMAGE NAME ${IMAGE_NAME}"

docker build -t $IMAGE_NAME .
docker run -t -v /dev/shm:/dev/shm -v ~/.m2:/root/.m2 $IMAGE_NAME