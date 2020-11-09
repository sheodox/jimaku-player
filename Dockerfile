FROM node:12-alpine AS dev
RUN apk add --no-cache ffmpeg
WORKDIR /usr/src/app
RUN npm i -g typeorm

COPY package*.json ./
RUN npm install

ENV NODE_ENV=development
CMD typeorm migration:run && npm run server:dev

FROM dev AS prod
ENV NODE_ENV=production
COPY . .

RUN npm run build-server:prod
RUN npm run build

# need to build in the CMD, because assets are bind mounted and served by nginx instead
CMD typeorm migration:run && node server/server.js