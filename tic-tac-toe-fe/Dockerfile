# build
FROM node:20-slim AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN npm run build

# start
FROM node:20-slim

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/.next ./.next
COPY package*.json ./
RUN npm install --omit=dev

EXPOSE 3000

CMD ["npm", "start"]