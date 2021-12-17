#!/bin/sh

curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
apt install -y git nodejs npm mongodb44

export NODE_ENV=local

cd /usr/local/
git clone https://github.com/naturalcrit/homebrewery.git

cd homebrewery
npm install
npm audit fix
npm run postinstall