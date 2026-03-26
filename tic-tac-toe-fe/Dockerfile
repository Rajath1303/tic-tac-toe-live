# build
FROM node:20-slim AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Declare build args
ARG NEXT_PUBLIC_NAKAMA_HOST
ARG NEXT_PUBLIC_NAKAMA_PORT
ARG NEXT_PUBLIC_NAKAMA_SERVER_KEY
ARG NEXT_PUBLIC_NAKAMA_USE_SSL

# ← Expose as env vars during build
ENV NEXT_PUBLIC_NAKAMA_HOST=$NEXT_PUBLIC_NAKAMA_HOST
ENV NEXT_PUBLIC_NAKAMA_PORT=$NEXT_PUBLIC_NAKAMA_PORT
ENV NEXT_PUBLIC_NAKAMA_SERVER_KEY=$NEXT_PUBLIC_NAKAMA_SERVER_KEY
ENV NEXT_PUBLIC_NAKAMA_USE_SSL=$NEXT_PUBLIC_NAKAMA_USE_SSL

RUN npm run build

# start
FROM node:20-slim

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY package*.json ./
RUN npm install --omit=dev

EXPOSE 3000

CMD ["npm", "start"]