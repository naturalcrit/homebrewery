FROM alpine:latest

RUN echo http://dl-4.alpinelinux.org/alpine/edge/testing >> /etc/apk/repositories && \
    apk -U -f upgrade && \
    apk add nodejs mongodb 

VOLUME [ "/data/db" ]
EXPOSE 8000

COPY . /app/naturalcrit
WORKDIR /app/naturalcrit

RUN chmod +x start.sh && \
    npm install && \
    npm install -g gulp && \
    npm install gulp --save-dev && \
    gulp fresh

CMD [ "/app/naturalcrit/start.sh" ]
