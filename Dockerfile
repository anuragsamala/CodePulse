# Multi-stage build for CodePulse DSA Platform
FROM node:20-alpine AS client-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

FROM node:20-alpine AS server-runner
WORKDIR /app

# Install openssl for Prisma on Alpine
RUN apk add --no-cache openssl

COPY server/package*.json ./server/
WORKDIR /app/server
RUN npm install --production=false
COPY server/ ./
RUN npx prisma generate

# Copy built frontend into client/dist
COPY --from=client-builder /app/client/dist /app/client/dist

ENV NODE_ENV=production
ENV PORT=5000
EXPOSE 5000

CMD ["node", "server.js"]
