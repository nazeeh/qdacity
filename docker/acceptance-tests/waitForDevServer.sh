#!/bin/bash
# This script waits until the port 8888 is open.

SERVER=localhost
PORT=8888

TIMEOUT=180
TIME_INTERVAL=2

PORT_OPEN=1
PORT_CLOSED=0

time=0
isPortOpen=0

while [ $time -lt $TIMEOUT ] && [ $isPortOpen -eq $PORT_CLOSED ];
do 
	#echo "Waiting for the port: ${time} seconds passed..."
	
	# Connect to the port
	(echo > /dev/tcp/$SERVER/$PORT) >/dev/null 2>&1
	if [ $? -ne 0 ]; then
		isPortOpen=$PORT_CLOSED
	else
		isPortOpen=$PORT_OPEN
	fi
	
	time=$(($time+$TIME_INTERVAL))
    sleep $TIME_INTERVAL
done

if [ $isPortOpen -eq $PORT_OPEN ]; then
	echo "Port is open after ${time} seconds."

	# Give the server more time to properly start
	sleep 10
else
	echo "Reached the timeout (${TIMEOUT} seconds). The port ${SERVER}:${PORT} is not available."
	
	exit 1
fi
