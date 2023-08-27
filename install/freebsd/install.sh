#!/bin/sh

pkg install -y git nano node npm mongodb44

sysrc mongod_enable=YES
service mongod start

cd /usr/local/
git clone https://github.com/naturalcrit/homebrewery.git

cd homebrewery
npm install
npm audit fix
npm run postinstall

cp install/freebsd/rc.d/homebrewery /usr/local/etc/rc.d/
chmod +x /usr/local/etc/rc.d/homebrewery

sysrc homebrewery_enable=YES
service homebrewery start