/**
 * OpenClaw Control Center - Backend Server
 * Fastify + Socket.io 实时监控 API
 */

import Fastify from 'fastify';
import cors from '@fastify/cors';
import staticPlugin from '@fastify/static';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { EventEmitter } from 'events';
import { initCollector } from './collector.js';
import { MetricsCollector } from './metrics.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 全局事件总线
export const eventBus = new EventEmitter();

// 创建 Fastify 服务器
const fastify = Fastify({
  logger: {
    transport: {
      target: 'pino-pretty',
      options: { colorize: true }
    }
  }
});

// CORS 配置
await fastify.register(cors, {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE']
});

// 静态文件服务（生产环境）
await fastify.register(staticPlugin, {
  root: join(__dirname, '../frontend/dist'),
  prefix: '/'
});

// 创建 Socket.io
const io = new Server(fastify.server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// 初始化指标收集器
const metrics = new MetricsCollector();
const collector = initCollector(eventBus, metrics);

// WebSocket 连接处理
io.on('connection', (socket) => {
  fastify.log.info(`客户端连接: ${socket.id}`);
  
  // 发送初始数据
  socket.emit('init', {
    nodes: metrics.getNetworkNodes(),
    systemStatus: metrics.getSystemStatus(),
    recentLogs: metrics.getRecentLogs(20)
  });
  
  // 订阅实时更新
  const updateInterval = setInterval(() => {
    socket.emit('metrics', {
      aiCore: metrics.getAICoreMetrics(),
      system: metrics.getSystemStatus(),
      timestamp: Date.now()
    });
  }, 1000);
  
  socket.on('disconnect', () => {
    clearInterval(updateInterval);
    fastify.log.info(`客户端断开: ${socket.id}`);
  });
  
  // 处理节点点击事件
  socket.on('node:click', (nodeId) => {
    const nodeDetails = metrics.getNodeDetails(nodeId);
    socket.emit('node:details', nodeDetails);
  });
});

// 事件广播
eventBus.on('log', (log) => {
  io.emit('log', log);
});

eventBus.on('network:update', (data) => {
  io.emit('network:update', data);
});

// REST API 路由

// 获取系统状态
fastify.get('/api/status', async () => {
  return {
    success: true,
    data: await metrics.getFullStatus()
  };
});

// 获取 AI 核心指标
fastify.get('/api/metrics/ai-core', async () => {
  return {
    success: true,
    data: metrics.getAICoreMetrics()
  };
});

// 获取网络拓扑
fastify.get('/api/network', async () => {
  return {
    success: true,
    data: metrics.getNetworkNodes()
  };
});

// 获取日志
fastify.get('/api/logs', async (request) => {
  const limit = request.query.limit || 50;
  return {
    success: true,
    data: metrics.getRecentLogs(limit)
  };
});

// 获取性能历史
fastify.get('/api/metrics/history', async (request) => {
  const duration = request.query.duration || '1h';
  return {
    success: true,
    data: metrics.getMetricsHistory(duration)
  };
});

// 启动服务器
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';

try {
  await fastify.listen({ port: PORT, host: HOST });
  fastify.log.info(`🦀 OpenClaw Control Center running on http://${HOST}:${PORT}`);
  
  // 启动数据收集器
  collector.start();
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}

// 优雅关闭
process.on('SIGTERM', async () => {
  fastify.log.info('收到 SIGTERM，正在关闭...');
  collector.stop();
  await fastify.close();
  process.exit(0);
});
