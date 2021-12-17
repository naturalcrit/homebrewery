#!/bin/sh

apt install -y curl
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -

apt satisfy -y git nodejs npm mongodb

NODE_ENV=local
export NODE_ENV

git clone https://github.com/naturalcrit/homebrewery.git

cd homebrewery
npm install
npm audit fix
npm run postinstall