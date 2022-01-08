FROM node:16-alpine AS dev
RUN apk add --no-cache ffmpeg bash
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

ENV NODE_ENV=development
CMD npm run server:dev

FROM dev AS prod
ENV NODE_ENV=production
COPY . .

RUN npm run build:prod
# it's called prebuild, but the order doesn't really matter,
# running this after the regular build so vite doesn't delete
# files copied by this script!
RUN ./prebuild.sh

CMD node build/server/server.js
