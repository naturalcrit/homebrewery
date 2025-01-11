#!/bin/sh

# Install CURL and add required NodeJS source to package repo
echo ::Install CURL
apt install -y curl
echo ::Add NodeJS source to package repo
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Add Mongo CE Source
echo ::Add Mongo CE source to package repo
curl -fsSL https://www.mongodb.org/static/pgp/server-8.0.asc | \
   sudo gpg -o /usr/share/keyrings/mongodb-server-8.0.gpg \
   --dearmor
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-8.0.gpg ] https://repo.mongodb.org/apt/ubuntu noble/mongodb-org/8.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-8.0.list
sudo apt-get update

# Install required packages
echo ::Install Homebrewery requirements
apt satisfy -y git nodejs npm mongodb-org

# Enable and start Mongo
systemctl enable mongod
systemctl start mongod

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
echo ::Create systemctl daemon-reload
echo ::Set Homebrewery to start automatically
systemctl enable homebrewery

# Start Homebrewery
echo ::Start Homebrewery
systemctl start homebrewery