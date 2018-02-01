# Includes chrome and selenium
FROM selenium/standalone-chrome

# Prepare
RUN sudo apt-get update 
RUN sudo apt-get -y upgrade

# Install software properties common
RUN sudo apt-get install -y software-properties-common

# Install curl
RUN sudo apt-get install -y curl

# Install java 7
RUN \
  sudo add-apt-repository ppa:openjdk-r/ppa && \
  sudo apt-get update && \
  sudo apt-get install -y openjdk-7-jdk

# Install maven
ARG MAVEN_VERSION=3.5.2
ARG SHA=707b1f6e390a65bde4af4cdaf2a24d45fc19a6ded00fff02e91626e3e42ceaff

RUN sudo mkdir -p /usr/share/maven /usr/share/maven/ref \
  && sudo curl -fsSL -o /tmp/apache-maven.tar.gz https://apache.osuosl.org/maven/maven-3/${MAVEN_VERSION}/binaries/apache-maven-${MAVEN_VERSION}-bin.tar.gz \
  && echo "${SHA}  /tmp/apache-maven.tar.gz" | sha256sum -c - \
  && sudo tar -xzf /tmp/apache-maven.tar.gz -C /usr/share/maven --strip-components=1 \
  && sudo rm -f /tmp/apache-maven.tar.gz \
  && sudo ln -s /usr/share/maven/bin/mvn /usr/bin/mvn
ENV MAVEN_HOME /usr/share/maven
ENV MAVEN_CONFIG "/root/.m2"

# Install npm
RUN curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
RUN sudo apt-get install -y nodejs

# Install gulp
#RUN sudo npm install -g gulp --silent

# Install jasmine
#RUN sudo npm install -g jasmine --silent

# Copy repository
WORKDIR /app
ADD . /app

# Download dependencies
RUN mvn dependency:resolve

# Run script which starts the devserver and executes the tests
ENTRYPOINT ./testExecuteTests.sh