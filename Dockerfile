# Build stage
FROM oven/bun:1.0.25 as build

WORKDIR /app

# Copy package files
COPY package.json bun.lock ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy all files needed for build
COPY . .

# Build the application
RUN bun run build

# Production stage
FROM oven/bun:1.0.25-slim

WORKDIR /app

# Copy package files
COPY package.json bun.lock ./

# Install production dependencies only
RUN bun install --production

# Copy built application from build stage
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/next.config.js ./
COPY --from=build /app/.eslintrc.json ./
COPY --from=build /app/tsconfig.json ./

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose the port
EXPOSE 3000

# Start the application
CMD ["bun", "run", "start"] 