# Starts the selenium server and the local dev-server.

# Start RTCS
ls
cd realtime-service
npm run start &
cd ..

# Start selenium
echo "Start the selenium server"

/opt/bin/entry_point.sh &

sleep 5

# Start the dev-server
echo "Start the devserver"

sudo /usr/local/gcloud/google-cloud-sdk/bin/java_dev_appserver.sh --disable_update_check --port=8888 /app/target/qdacity-war/ &

# Run a script which starts the acceptance-tests as soon as the specified port is open (=> the dev-server is running)
./docker/acceptance-tests/startTests.sh