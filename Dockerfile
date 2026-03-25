# ---------- Stage 1: Build TypeScript ----------
FROM node:18-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source and config
COPY tsconfig.json ./
COPY src ./src

# Build TS -> JS
RUN npx tsc


# ---------- Stage 2: Nakama ----------
FROM registry.heroiclabs.com/heroiclabs/nakama:3.26.0

# Create modules directory
RUN mkdir -p /nakama/data/modules

# Copy compiled JS
COPY --from=builder /app/build/ /nakama/data/modules/

# Copy config
COPY local.yml /nakama/data/local.yml

# Expose ports
EXPOSE 7349 7350 7351

# Start Nakama with migration
ENTRYPOINT /bin/sh -ecx "\
/nakama/nakama migrate up --database.address $DATABASE_URL && \
exec /nakama/nakama \
  --name nakama1 \
  --config /nakama/data/local.yml \
  --database.address $DATABASE_URL \
  --logger.level DEBUG \
  --session.token_expiry_sec 7200
"