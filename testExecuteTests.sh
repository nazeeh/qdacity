# Starts the selenium server and the local dev-server.

echo "Start the selenium server"

# Start selenium
/opt/bin/entry_point.sh &

sleep 5

# This is a temporary hack. Selenium server requires java 8 and the dev-server requires java 7
sudo update-java-alternatives -s java-1.7.0-openjdk-amd64

echo "Start the devserver"

sudo mvn appengine:devserver -DskipTests &

# Run a script which starts the acceptance-tests as soon as the specified port is open (=> the dev-server is running then)
cd ./war/
./startAcceptanceTests.sh