FROM node:16-alpine AS dev
RUN apk add --no-cache ffmpeg
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

ENV NODE_ENV=development
CMD npm run server:dev

FROM dev AS prod
ENV NODE_ENV=production
COPY . .

RUN npm run build:prod

CMD node build/server/server.js
