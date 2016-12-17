#!/bin/sh
cd /app/naturalcrit
/usr/bin/mongod &
npm run watch
