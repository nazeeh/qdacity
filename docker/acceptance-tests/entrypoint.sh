
# Start selenium
echo "#######################################################################################"
echo "########                      Start the selenium server                        ########"
echo "#######################################################################################"

/opt/bin/entry_point.sh &

sleep 10

# Start the dev-server
echo "#######################################################################################"
echo "########                         Start the devserver                           ########"
echo "#######################################################################################"

sudo /usr/local/gcloud/google-cloud-sdk/bin/java_dev_appserver.sh --disable_update_check --port=8888 /app/target/qdacity-war/ 2>&1 | sudo tee /app/devserver.log > /dev/null &

# Run a script which waits until the specified port is open (=> the dev-server is running)
./docker/acceptance-tests/waitForDevServer.sh

# Start RTCSVC
echo "#######################################################################################"
echo "########                      Start the realtime service                       ########"
echo "#######################################################################################"

cd realtime-service
npm run start 2>&1 | sudo tee /app/rtcs.log > /dev/null &
cd ..

sleep 10

# Start the tests
echo "#######################################################################################"
echo "########                            Start the tests                            ########"
echo "#######################################################################################"

cd war
npm run acceptance-test
