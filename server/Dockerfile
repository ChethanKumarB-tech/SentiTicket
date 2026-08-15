FROM node:20-alpine AS builder

WORKDIR /app

# Install build tools for native compilation if required (argon2)
RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm ci --only=production

COPY . .

# Production Image
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

# Run as non-root user
USER node

COPY --chown=node:node --from=builder /app /app

EXPOSE 5000

CMD ["node", "src/server.js"]
