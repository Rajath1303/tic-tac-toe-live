FROM node:18-alpine AS node-builder

WORKDIR /backend

COPY package*.json ./
RUN npm i

COPY tsconfig.json ./
COPY src ./src

RUN npx tsc

FROM registry.heroiclabs.com/heroiclabs/nakama:3.22.0

COPY --from=node-builder /backend/build/*.js /nakama/data/modules/build/
COPY local.yml /nakama/data/