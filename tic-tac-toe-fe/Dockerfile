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

RUN npm run build


# ---------- Stage 3: Run ----------
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Only copy necessary files
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

# Expose Next.js port
EXPOSE 3000

# Start app
CMD ["npm", "start"]