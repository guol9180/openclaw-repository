# OpenClaw Dashboard - Production Image
FROM node:20-alpine

# 安装必要工具
RUN apk add --no-cache tini wget

WORKDIR /app

# 复制后端
COPY backend/package*.json ./
RUN npm install --production --no-audit --no-fund && \
    npm cache clean --force

COPY backend/ ./

# 复制已构建的前端
COPY frontend/dist ./public

# 安全配置
RUN addgroup -g 1001 -S appgroup && \
    adduser -u 1001 -S appuser -G appgroup && \
    chown -R appuser:appgroup /app

USER appuser

ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/api/status || exit 1

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "server.js"]
