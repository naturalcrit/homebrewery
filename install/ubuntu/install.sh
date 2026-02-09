#!/bin/sh

# Detect Ubuntu Version
export DISTRO=$(grep "^NAME=" /etc/os-release | awk -F '=' '{print $2}' | sed 's/"//g')
export DISTRO_VER=$(grep "VERSION_ID=" /etc/os-release | awk -F '=' '{print $2}' | sed 's/"//g')
export MATCHED="Yes"

if [ "${DISTRO}" != "Ubuntu" ]; 
then
  echo :: Ubuntu not detected. Are you using an alternate spin or derivative?
  echo ::  Detected - ${DISTRO}
  read -p [y/N] YESNO
  if [ "${YESNO}" != "Y" ] && [ ]"${YESNO}" != "y" ]; then 
    exit
  fi

  MATCHED="No"
fi

# Install CURL and add required NodeJS source to package repo
echo ::Install CURL
apt install -y curl
echo ::Add NodeJS source to package repo
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Add Mongo CE Source
if [ ${DISTRO} = "Ubuntu" ];
    then
        echo ::Add Mongo CE source to package repo
        curl -fsSL https://www.mongodb.org/static/pgp/server-8.0.asc | \
            sudo gpg -o /usr/share/keyrings/mongodb-server-8.0.gpg \
            --dearmor
        if [ "${DISTRO_VER}" == "24.04" ]; then 
            echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-8.0.gpg ] https://repo.mongodb.org/apt/ubuntu noble/mongodb-org/8.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-8.0.list
        elif [ "${DISTRO_VER}" == "22.04" ]; then 
            echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-8.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/8.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-8.0.list
        elif [ "${DISTRO_VER}" == "20.04" ]; then 
            echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-8.0.gpg ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/8.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-8.0.list
        else
            MATCHED="No"
        fi
    sudo apt-get update
fi

if [ ${MATCHED} == "No" ]; then
    echo :: WARNING
    echo :: Unable to determine Ubuntu version for Mongo installation purposes.
    echo :: Please check your spin/distro documentation to install Mongo CE and enable it on startup.
fi
    
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
echo ::Create Homebrewery service
ln -s /usr/local/homebrewery/install/ubuntu/etc/systemd/system/homebrewery.service /etc/systemd/system/homebrewery.service
systemctl daemon-reload
echo ::Set Homebrewery to start automatically
systemctl enable homebrewery

# Start Homebrewery
echo ::Start Homebrewery
systemctl start homebrewery