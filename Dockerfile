FROM node:16.14-alpine
RUN apk --no-cache add git

ENV NODE_ENV=docker

# Create app directory
WORKDIR /usr/src/app

# Copy package.json into the image, then run yarn install
# This improves caching so we don't have to download the dependencies every time the code changes
COPY package.json ./
# --ignore-scripts tells yarn not to run postbuild.  We run it explicitly later
RUN yarn install --ignore-scripts

# Bundle app source and build application
COPY . .
RUN yarn build

EXPOSE 8000
CMD [ "yarn", "start" ]
