# Multi-stage build for Mediasoup
FROM node:20-bullseye AS builder

# Install build dependencies for Mediasoup
RUN apt-get update && apt-get install -y \
    build-essential \
    python3 \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files
COPY backend/package*.json ./

# Install dependencies and build Mediasoup
RUN npm ci --only=production

# Production stage
FROM node:20-bullseye-slim

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy built node_modules from builder
COPY --from=builder /app/node_modules ./node_modules

# Copy application code
COPY backend/ .

# Create non-root user for security
RUN useradd -m -u 1001 nodeuser && \
    chown -R nodeuser:nodeuser /app

USER nodeuser

# Expose ports
# 3000 for API
# 10000-11000 for WebRTC media
EXPOSE 3000
EXPOSE 10000-11000/udp
EXPOSE 10000-11000/tcp

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["node", "src/server.js"]
