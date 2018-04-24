
# Start selenium
echo "#######################################################################################"
echo "########                      Start the selenium server                        ########"
echo "#######################################################################################"

/opt/bin/entry_point.sh &

#cd war
#sudo npm ci
#cd ..

sleep 10

#sudo touch devserver.log
echo "Setting ownership for seluser"
sudo chown -R $USER:$(id -gn $USER) /Users/seluser/.config
sudo chown $USER -R ./

# Start the dev-server
echo "#######################################################################################"
echo "########                         Start the devserver                           ########"
echo "#######################################################################################"

sudo /usr/local/gcloud/google-cloud-sdk/bin/java_dev_appserver.sh --disable_update_check --port=8888 /app/target/qdacity-war/ >devserver.log 2>&1 &

# Run a script which waits until the specified port is open (=> the dev-server is running)
./docker/acceptance-tests/waitForDevServer.sh

# Start RTCSVC
echo "#######################################################################################"
echo "########                      Start the realtime service                       ########"
echo "#######################################################################################"

cd realtime-service
npm run start &
cd ..

sleep 10

# Start the tests
echo "#######################################################################################"
echo "########                            Start the tests                            ########"
echo "#######################################################################################"

cd war
npm run acceptance-test
