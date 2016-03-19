FROM node:latest

MAINTAINER David Hudson <jendave@yahoo.com>

# System update
RUN apt-get -q -y update

RUN apt-get -q -y install npm
RUN apt-get -q -y install mongodb

RUN apt-get clean && rm -r /var/lib/apt/lists/*

EXPOSE 22 
EXPOSE 8000

ADD start.sh /start.sh 
RUN chmod +x /start.sh 

VOLUME ["/opt/apps"]
COPY . /opt/apps/naturalcrit/
WORKDIR /opt/apps/naturalcrit/

RUN npm install 
RUN npm install -g gulp-cli
RUN npm install gulp
RUN gulp fresh

CMD ["/start.sh"] 

