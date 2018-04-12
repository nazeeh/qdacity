#!/bin/bash

DOMAIN="$1"
ACCOUNT="$2"

echo "Create document root for letsencrypt challenges..."
sudo mkdir -p /var/www/letsencrypt/.well-known/acme-challenge

echo -n "Check if there is already a dhparam file... "
if [ -f /etc/nginx/dhparam.pem ] ; then
  echo "Yes."
else
  echo "No."
  echo "Create Diffie-Hellman parameters. This might take some minutes!"
  sudo openssl dhparam -out /etc/nginx/dhparam.pem 2048
  echo ""
  echo "Done."
fi

echo "Install Let's Encrypt Certbot"
sudo apt-get install software-properties-common
sudo add-apt-repository ppa:certbot/certbot
sudo apt-get update
sudo apt-get install -y certbot

echo "Get certificate from Let's Encrypt..."
sudo certbot certonly \
  --webroot \
  --agree-tos \
  --no-eff-email \
  --email $ACCOUNT \
  -w /var/www/letsencrypt \
  -d $DOMAIN

echo "Write nginx ssl configuration file..."
sed "s/###HOSTNAME###/$DOMAIN/g" "$(dirname $0)/nginx_https.conf" | sudo tee /etc/nginx/sites-available/$DOMAIN > /dev/null;

echo "Activate new site configuration for $DOMAIN"
sudo ln -s /etc/nginx/sites-{available,enabled}/$DOMAIN;
sudo nginx -s reload

echo "Setup cronjob for certificate renewal..."
chmod +x "$(dirname $0)/certbot_renew_hook.sh"
sudo crontab -l > "$(dirname $0)/temp_crontab"
cronjob='30 22 * * 1 certbot renew --noninteractive --renew-hook /home/ubuntu/realtime-service/deployment/files/certbot_renew_hook.sh'
cronjob_for_grep="^$(sed -e 's/*/\\*/g' <<< $cronjob)\$"
grep -q "$cronjob_for_grep" "$(dirname $0)/temp_crontab"
if [ "$?" = "1" ]; then
  echo "$cronjob" >> "$(dirname $0)/temp_crontab"
  sudo crontab "$(dirname $0)/temp_crontab"
fi
rm "$(dirname $0)/temp_crontab"
echo "Done."

echo ""
echo "Congratulations. HTTPS is all set up."
echo "Try to open https://$DOMAIN/ in your browser!"

