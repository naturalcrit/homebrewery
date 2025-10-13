# Offline Install Instructions: Docker

These instructions are for setting up a persistent instance of the Homebrewery application locally using Docker.

If you intend to develop with Homebrewery, following the Homebrewery application section of this guide is not recommended. Using docker to deploy MongoDB locally for development is not a bad idea at all, however.

# Install Docker

## Docker Desktop (MacOS/Windows)

Windows and Mac installs use Docker Desktop. Current install instructions are below.

* [Mac](https://docs.docker.com/desktop/mac/install/)
* [Windows](https://docs.docker.com/desktop/windows/install/)

You can set up the docker engine to start on boot via the Docker desktop UI.

## Docker Engine

Linux installs use Docker Engine. Docker provides installers and instructions for several of the most common distrubutions. If you do not see yours listed, it is very likely supported indirectly by your distribution.

* [Arch](https://docs.docker.com/desktop/setup/install/linux/archlinux/)
* [CentOS](https://docs.docker.com/engine/install/centos/)
* [Debian](https://docs.docker.com/engine/install/debian/)
* [Fedora](https://docs.docker.com/engine/install/fedora/)
* [RHEL](https://docs.docker.com/engine/install/rhel/)
* [Ubuntu](https://docs.docker.com/engine/install/ubuntu/)

### Post installation steps
[Manage Docker as a non-root user (highly recommended)](https://docs.docker.com/engine/install/linux-postinstall/#manage-docker-as-a-non-root-user) 
[Enable Docker to start on boot (highly recommended)](https://docs.docker.com/engine/install/linux-postinstall/#configure-docker-to-start-on-boot)

# Build Homebrewery Image

Next we build the homebrewery docker image. Start by cloning the repository. 

```shell
git clone https://github.com/naturalcrit/homebrewery.git
cd homebrewery
```

Make an changes you need to `config/docker.json` then build the image. If it does not exist,the below as a template.

```
{
"host" : "localhost:8000",
"naturalcrit_url" : "local.naturalcrit.com:8010",
"secret" : "secret",
"web_port" : 8000,
"mongodb_uri": "mongodb://172.17.0.2/homebrewery",
}
```

```shell
docker-compose build homebrewery
```

# Add Mongo container

Once docker is installed and running, it is time to set up the containers. First up, Mongo.

```shell
docker run --name homebrewery-mongodb -d --restart unless-stopped -v mongodata:/data/db -p 27017:27017 mongo:latest
```

Older CPUs may run into an issue with AVX support. 
```
WARNING: MongoDB 5.0+ requires a CPU with AVX support, and your current system does not appear to have that!
 see https://jira.mongodb.org/browse/SERVER-54407
 see also https://www.mongodb.com/community/forums/t/mongodb-5-0-cpu-intel-g4650-compatibility/116610/2
 see also https://github.com/docker-library/mongo/issues/485#issuecomment-891991814
```
If you see a message similar to this, try using the bitnami mongo instead.

```shell
docker run --name homebrewery-mongodb -d --restart unless-stopped -v mongodata:/data/db -p 27017:27017 bitnami/mongo:latest
```

If your distribution is running on an arm device such as a Raspberry Pi, you will need to run the arm-built MongoDB v4.4.

```shell
docker run --name homebrewery-mongodb -d --restart unless-stopped -v mongodata:/data/db -p 27017:27017 arm64v8/mongo:4.4
```

## Run the Homebrewery Image
```shell
# Make sure you run this in the homebrewery directory
docker run --name homebrewery-app -d --restart unless-stopped -e NODE_ENV=docker -v $(pwd)/config/docker.json:/usr/src/app/config/docker.json -p 8000:8000 docker.io/library/homebrewery:latest
```

**NOTE:** If you are running from the Windows command line, this will not work as `$(pwd)` is not valid syntax. Use this command instead:
```shell
# Make sure you run this in the homebrewery directory
docker run --name homebrewery-app -d --restart unless-stopped -e NODE_ENV=docker -v %cd%/config/docker.json:/usr/src/app/config/docker.json -p 8000:8000 docker.io/library/homebrewery:latest
```


## Updating the Image

When Homebrewery code updates, your docker container will not automatically follow the changes. To do so you will need to rebuild your homebrewery image. 

First, return to your homebrewery clone (from Build Homebrewery Image above) or recreate the clone if you deleted your copy of the code. 

First, delete the existing image.

```shell
docker rm -f homebrewery-app
```

Next, update the clone's code to the latest version.

```shell
cd homebrewery
git checkout master
git pull upstream master
```

Finally, rebuild and restart the homebrewery image.

```shell
docker-compose build homebrewery
docker run --name homebrewery-app -d --restart unless-stopped -e NODE_ENV=docker -v $(pwd)/config/docker.json:/usr/src/app/config/docker.json -p 8000:8000 docker.io/library/homebrewery:latest
```

**NOTE:** If you are running from the Windows command line, this will not work as `$(pwd)` is not valid syntax. Use this command instead:
```shell
# Make sure you run this in the homebrewery directory
docker run --name homebrewery-app -d --restart unless-stopped -e NODE_ENV=docker -v %cd%/config/docker.json:/usr/src/app/config/docker.json -p 8000:8000 docker.io/library/homebrewery:latest
```

