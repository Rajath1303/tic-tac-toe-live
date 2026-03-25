# ---------- Stage 1: Build TypeScript ----------
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY tsconfig.json ./
COPY src ./src

# Build TS -> JS
RUN npx tsc


# ---------- Stage 2: Nakama ----------
FROM registry.heroiclabs.com/heroiclabs/nakama:3.26.0

# Copy compiled JS into Nakama modules directory
COPY --from=builder /app/build /nakama/data/modules

EXPOSE 7349 7350 7351

ENTRYPOINT ["/bin/sh", "-ecx", "\
    /nakama/nakama migrate up --database.address $DATABASE_URL && \
    exec /nakama/nakama \
    --name nakama1 \
    --database.address $DATABASE_URL \
    --runtime.path /nakama/data/modules \
    --logger.level DEBUG \
    --session.token_expiry_sec 7200 \
    "]