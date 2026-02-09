FROM node:22-alpine
RUN apk --no-cache add git

ENV NODE_ENV=docker

# Create app directory
WORKDIR /usr/src/app

# Copy package.json into the image, then run yarn install
# This improves caching so we don't have to download the dependencies every time the code changes
COPY package.json ./
COPY config/docker.json usr/src/app/config
# --ignore-scripts tells yarn not to run postbuild.  We run it explicitly later
RUN node --version
RUN npm --version
RUN npm install --ignore-scripts

# Bundle app source and build application
COPY . .
RUN npm run build

EXPOSE 8000
CMD [ "npm", "start" ]
