#!/bin/bash

# Set working directory to parent folder of this script
cd `dirname $0`

# Install nodejs if not present
echo -n "See if nodejs is already installed... "
which node &> /dev/null;
if [ "$?" -eq "1" ]; then
  echo "No."
  curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -;
  sudo apt-get update && sudo apt-get install -y nodejs;
else
  echo "Yes."
fi

# Install yarn if not present
echo -n "See if yarn is already installed... "
which yarn &> /dev/null;
if [ "$?" -eq "1" ]; then
  echo "No."
  curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -;
  echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list;
  sudo apt-get update && sudo apt-get install -y yarn;
else
  echo "Yes."
fi

# Install and configure nginx if not present, configure firewall
echo -n "See if nginx is already installed... "
which nginx &> /dev/null;
if [ "$?" -eq "1" ]; then
  echo "No."
  sudo apt-get update && sudo apt-get install -y nginx;
  cat ./nginx_http.conf | sudo tee /etc/nginx/sites-available/default > /dev/null;
  sudo nginx -s reload;
  sudo ufw allow 'Nginx Full';
  sudo ufw allow 'OpenSSH';
  yes | sudo ufw enable;
else
  echo "Yes."
fi

# Go to project root, install node_modules and run application
echo "Install nodejs application and start it..."
cd ..
yarn run post-deployment

