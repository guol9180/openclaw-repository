# OpenClaw Dashboard - Backend only (轻量版)
FROM node:20-alpine

WORKDIR /app

# 安装依赖
COPY backend/package*.json ./
RUN npm install --production --no-audit --no-fund

# 复制后端代码
COPY backend/ ./

# 复制已构建的前端
COPY frontend/dist ./public

# 嚴格限制内存使用
ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

CMD ["node", "server.js"]
