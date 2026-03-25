# ---------- Stage 1: Build TypeScript ----------
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY tsconfig.json ./
COPY src ./src

RUN npx tsc


# ---------- Stage 2: Nakama ----------
FROM registry.heroiclabs.com/heroiclabs/nakama:3.26.0

# Create modules dir
RUN mkdir -p /nakama/data/modules

# Copy compiled JS
COPY --from=builder /app/build/ /nakama/data/modules/

# Copy config
COPY local.yml /nakama/data/local.yml

EXPOSE 7349 7350 7351

ENTRYPOINT ["/bin/sh", "-ecx", "\
/nakama/nakama migrate up --database.address \"$DATABASE_URL\" && \
exec /nakama/nakama \
--config /nakama/data/local.yml \
--database.address \"$DATABASE_URL\" \
"]