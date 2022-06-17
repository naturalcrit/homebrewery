#!/bin/sh

# Install CURL and add required NodeJS source to package repo
echo ::Install CURL
apt install -y curl
echo ::Add NodeJS source to package repo
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -

# Install required packages
echo ::Install Homebrewery requirements
apt satisfy -y git nodejs npm mongodb

# Clone Homebrewery repo
echo ::Get Homebrewery files
cd /usr/local/
git clone https://github.com/naturalcrit/homebrewery.git

# Install Homebrewery
echo ::Install Homebrewery
cd homebrewery
npm install
npm audit fix
npm run postinstall

# Create Homebrewery service
echo ::Create Homebrewery service
ln -s /usr/local/homebrewery/install/ubuntu/etc/systemd/system/homebrewery.service /etc/systemd/system/homebrewery.service
systemctl daemon-reload
echo ::Set Homebrewery to start automatically
systemctl enable homebrewery

# Start Homebrewery
echo ::Start Homebrewery
systemctl start homebrewery