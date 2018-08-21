FROM node:8

# Create app directory
WORKDIR /usr/src/app

# Bundle app source
COPY . .

ENV NODE_ENV=docker

RUN yarn

EXPOSE 8000
CMD [ "yarn", "start" ]