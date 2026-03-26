# ---------- Stage 1: Install deps ----------
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm install

# ---------- Stage 2: Build ----------
FROM node:18-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# ← Declare build args
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

# ---------- Stage 3: Run ----------
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000
CMD ["npm", "start"]