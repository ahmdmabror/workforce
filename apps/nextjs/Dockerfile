# syntax=docker/dockerfile:1

# ============================================
# Base stage - Bun runtime
# ============================================
FROM oven/bun:1.1.38 AS base
WORKDIR /app

# ============================================
# Dependencies stage - Install all dependencies
# ============================================
FROM base AS deps

# Copy root workspace files
COPY package.json bun.lock ./
COPY bunfig.toml* ./

# Copy workspace package.json files to establish workspace structure
COPY apps/nextjs/package.json ./apps/nextjs/
COPY packages/convex/package.json ./packages/convex/

# Install dependencies
RUN bun install --frozen-lockfile

# ============================================
# Builder stage - Build the Next.js application
# ============================================
FROM base AS builder

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/nextjs/node_modules ./apps/nextjs/node_modules
COPY --from=deps /app/packages/convex/node_modules ./packages/convex/node_modules

# Copy source files
COPY package.json bun.lock ./
COPY bunfig.toml* ./
COPY tsconfig.json ./
COPY apps/nextjs ./apps/nextjs
COPY packages/convex ./packages/convex

# Build the Next.js app
WORKDIR /app/apps/nextjs
ENV NEXT_TELEMETRY_DISABLED=1
RUN bun run build

# ============================================
# Runner stage - Production image
# ============================================
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy the standalone output
COPY --from=builder /app/apps/nextjs/.next/standalone ./
COPY --from=builder /app/apps/nextjs/.next/static ./apps/nextjs/.next/static
COPY --from=builder /app/apps/nextjs/public ./apps/nextjs/public 2>/dev/null || true

# Set proper ownership
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Run the standalone server with Bun
CMD ["bun", "run", "apps/nextjs/server.js"]

