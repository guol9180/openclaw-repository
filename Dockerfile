# Build stage for backend
FROM node:20-alpine AS backend-builder

WORKDIR /app/backend

COPY backend/package*.json ./
RUN npm ci

COPY backend/tsconfig.json ./
COPY backend/ ./
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy backend
COPY --from=backend-builder /app/backend/dist ./dist
COPY --from=backend-builder /app/backend/node_modules ./node_modules
COPY --from=backend-builder /app/backend/package.json ./

# Copy frontend (pre-built by GitHub Actions)
COPY frontend/dist ./public

ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

CMD ["node", "dist/server.js"]
