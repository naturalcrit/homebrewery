FROM node:8

# Create app directory
WORKDIR /usr/src/app

# Bundle app source
COPY client client
COPY config config
COPY scripts scripts
COPY server server
COPY shared shared
COPY changelog.md package*json *.css *.js ./

ENV NODE_ENV=docker

RUN yarn

EXPOSE 8000
CMD [ "yarn", "start" ]
