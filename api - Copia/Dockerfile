FROM node:20-alpine AS builder

RUN apk add --no-cache git python3 make g++

WORKDIR /build

COPY baileys/lib/ ./baileys/lib/
COPY baileys/WAProto/ ./baileys/WAProto/
COPY baileys/engine-requirements.js ./baileys/

RUN echo '{"name":"baileys","type":"module","version":"7.0.0-rc.9","main":"lib/index.js","dependencies":{"@cacheable/node-cache":"^1.4.0","@hapi/boom":"^9.1.3","async-mutex":"^0.5.0","libsignal":"git+https://github.com/whiskeysockets/libsignal-node","lru-cache":"^11.1.0","music-metadata":"^11.7.0","node-addon-api":"^8.5.0","p-queue":"^9.0.0","pino":"^9.6","protobufjs":"^7.2.4","ws":"^8.13.0"},"peerDependencies":{"jimp":"^1.6.0","link-preview-js":"^3.0.0","sharp":"*"},"peerDependenciesMeta":{"jimp":{"optional":true},"link-preview-js":{"optional":true}}}' > ./baileys/package.json

COPY api/package*.json ./
RUN sed -i 's|"baileys": "file:../baileys"|"baileys": "file:./baileys"|g' package.json
RUN npm install --legacy-peer-deps --omit=dev

COPY api/prisma/ ./prisma/
RUN npx prisma@5.22.0 generate

FROM node:20-alpine

LABEL maintainer="GO-API"

RUN apk add --no-cache curl openssl ffmpeg nginx bash netcat-openbsd && rm -rf /var/cache/apk/*

WORKDIR /app

COPY --from=builder /build/node_modules ./node_modules
COPY --from=builder /build/baileys ./baileys
COPY --from=builder /build/prisma ./prisma
COPY api/dist/ ./dist/
COPY api/docker/nginx.conf /etc/nginx/http.d/default.conf
COPY api/docker/start.sh /app/start.sh

RUN chmod +x /app/start.sh
RUN mkdir -p /app/sessions && chmod 777 /app/sessions

EXPOSE 3000

VOLUME ["/app/sessions"]

CMD ["/app/start.sh"]
