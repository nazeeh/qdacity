# This script waits until the port 8888 is open and then launches the acceptance-tests.

SERVER=localhost
PORT=8888

TIMEOUT=120
TIME_OFFSET=3

echo "Starting shell script which runs the acceptance tests."

let isPortOpen=0
let time=0

while [ $time -lt $TIMEOUT -a "$isPortOpen" == 0 ]
do 
	echo "Waiting for the port: ${time} seconds passed..."
	
	# Connect to the port
	</dev/tcp/$SERVER/$PORT
	if [ "$?" -ne 0 ]; then
		let isPortOpen=0
	else
		let isPortOpen=1
	fi
	
	let time=$time+$TIME_OFFSET	
    sleep $TIME_OFFSET
done

if [ $isPortOpen -eq 1 ]; then
	echo "Port is open. Start acceptance tests now."
	
	# Give the server more time to properly start
	#sleep 5
	sleep 70
	echo "SERVER IS RUNNING NOW"
	
	# Start Xvfb
	echo "START XVFB"
	Xvfb :2 -screen 5 1024x768x8 &
    export DISPLAY=:2.5
	
	sleep 10
	
	# Start the selenium server
	echo "START SELENIUM SERVER"
    java -jar selenium-server-standalone-3.8.1.jar &
	
	sleep 10
	
	# Start the acceptance tests
	echo "START ACCEPTANCE TESTS NOW"
	gulp acceptance-tests
	
	echo "EXIT 0"
	exit 0
else
	echo "Reached the timeout (${TIMEOUT} seconds). The port ${SERVER}:${PORT} is not available."
	
	exit 1
fi
