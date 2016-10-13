FROM alpine:latest

RUN echo http://dl-cdn.alpinelinux.org/alpine/edge/testing >> /etc/apk/repositories && \
    apk --no-cache -U -f upgrade && \
    apk --no-cache add nodejs mongodb

VOLUME [ "/data/db" ]
EXPOSE 8000

COPY . /app/naturalcrit
WORKDIR /app/naturalcrit

RUN chmod +x start.sh && \
    npm install && \
    npm run libs

CMD [ "/app/naturalcrit/start.sh" ]
