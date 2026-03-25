FROM node:18-alpine AS node-builder

WORKDIR /backend

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src

RUN npx tsc


FROM registry.heroiclabs.com/heroiclabs/nakama:3.22.0

COPY --from=node-builder /backend/build /nakama/data/modules/build

COPY local.yml /nakama/data/

CMD ["/bin/sh", "-ecx", "\
    /nakama/nakama migrate up --database.address $DATABASE_URL && \
    exec /nakama/nakama \
    --name nakama1 \
    --database.address $DATABASE_URL \
    --config /nakama/data/local.yml \
    --logger.level INFO \
    "]