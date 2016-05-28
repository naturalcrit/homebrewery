#!/bin/bash
cd /opt/apps/naturalcrit/
/usr/bin/mongod --config /etc/mongodb.conf &
gulp
