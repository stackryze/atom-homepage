# Dockerfile — Optimized multi-stage build
FROM node:24-alpine AS base
RUN apk add --no-cache libc6-compat

# === Dependencies ===
FROM base AS deps
WORKDIR /app

# Copy only package files first for better layer caching
COPY package.json package-lock.json* ./

# Install native build tools only in deps stage
RUN apk add --no-cache python3 make g++ && \
    npm ci --ignore-scripts=false && \
    # Remove native build tools after install to save layer space
    apk del python3 make g++

# === Builder ===
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Build with reduced memory overhead
RUN npm run build

# === Production Runner ===
FROM node:24-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Only install runtime deps (sqlite, curl for healthcheck, su-exec for entrypoint)
RUN apk add --no-cache sqlite-libs curl su-exec && \
    addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy standalone output
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Copy SQL schemas
COPY --from=builder /app/src/lib/schema.sql ./src/lib/schema.sql
COPY --from=builder /app/src/lib/schema_oauth.sql ./src/lib/schema_oauth.sql
COPY --from=builder /app/src/lib/schema_federated.sql ./src/lib/schema_federated.sql
COPY --from=builder /app/src/lib/schema_features.sql ./src/lib/schema_features.sql

# Data directory with proper permissions
RUN mkdir -p /app/data && chown -R nextjs:nodejs /app/data

# Copy entrypoint
COPY docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

ENV DATA_DIR="/app/data"
VOLUME ["/app/data"]

# Run as root initially so entrypoint can fix volume permissions, then drops to nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

HEALTHCHECK --interval=30s --timeout=3s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

ENTRYPOINT ["/app/docker-entrypoint.sh"]