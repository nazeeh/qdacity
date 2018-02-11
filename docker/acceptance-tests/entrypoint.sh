# Starts the selenium server and the local dev-server.


echo "--------------------------------------------------------------------------------"
echo "--------------------------------------------------------------------------------"
ls
ls ./target/classes/com/qdacity/
ls ./target/classes/com/qdacity/servlet
echo "--------------------------------------------------------------------------------"
echo "--------------------------------------------------------------------------------"

# Start selenium
echo "Start the selenium server"

/opt/bin/entry_point.sh &

sleep 5

# This is a temporary hack. Selenium server requires java 8 and the dev-server requires java 7
sudo update-java-alternatives -s java-1.7.0-openjdk-amd64

# Start the dev-server
echo "Start the devserver"

/opt/appengine-java-sdk/appengine-java-sdk-1.9.62/bin/dev_appserver.sh --port=8888 ./target/qdacity-war/ &



# Try curl
sleep 50
curl localhost:8888
curl google.de


# Run a script which starts the acceptance-tests as soon as the specified port is open (=> the dev-server is running)
./docker/acceptance-tests/startTests.sh