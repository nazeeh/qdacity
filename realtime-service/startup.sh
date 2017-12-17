#!/bin/bash

# Set working directory to folder of this script
cd `dirname $0`

# Install nodejs if not present
which node &> /dev/null;
if [ "$?" -eq "1" ]; then
  curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -;
  sudo apt-get update && sudo apt-get install -y nodejs;
fi

# Install yarn if not present
which yarn &> /dev/null;
if [ "$?" -eq "1" ]; then
  curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -;
  echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list;
  sudo apt-get update && sudo apt-get install -y yarn;
fi

# Install and configure nginx if not present, configure firewall
which nginx &> /dev/null;
if [ "$?" -eq "1" ]; then
  sudo apt-get update && sudo apt-get install -y nginx;
  cat ./nginx.conf | sudo tee /etc/nginx/sites-available/default;
  sudo nginx -s reload;
  sudo ufw allow 'Nginx Full';
  sudo ufw allow 'OpenSSH';
  yes | sudo ufw enable;
fi

yarn install --pure-lockfile
yarn run start:daemon

