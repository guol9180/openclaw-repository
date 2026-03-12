/**
 * WebSocket 处理器 - 处理与前端的双向通信
 */

import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import type { AIState } from '../types/state.js';
import type { OpenClawEvent } from '../types/events.js';
import type { SystemMetrics, AIMetrics } from '../types/metrics.js';

export interface WebSocketMessage {
  type: 'init' | 'state_update' | 'event' | 'metrics' | 'task_update';
  data: any;
  timestamp: number;
}

export class WebSocketHandler {
  private io: SocketIOServer;
  private clients: Set<Socket> = new Set();

  constructor(httpServer: HttpServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST']
      }
    });

    this.setupEventHandlers();
  }

  /**
   * 设置事件处理器
   */
  private setupEventHandlers() {
    this.io.on('connection', (socket: Socket) => {
      console.log(`[WebSocket] Client connected: ${socket.id}`);
      this.clients.add(socket);

      // 发送欢迎消息
      socket.emit('connected', {
        message: 'Connected to OpenClaw AI Room',
        timestamp: Date.now()
      });

      // 处理断开连接
      socket.on('disconnect', () => {
        console.log(`[WebSocket] Client disconnected: ${socket.id}`);
        this.clients.delete(socket);
      });

      // 处理客户端请求
      socket.on('request-init', () => {
        // 客户端请求初始化数据
        // 这将由外部提供
        socket.emit('init-required');
      });
    });
  }

  /**
   * 发送初始化数据
   */
  sendInit(socket: Socket, data: {
    aiState: AIState;
    currentTask: any;
    recentLogs: OpenClawEvent[];
    systemMetrics: SystemMetrics;
    aiMetrics: AIMetrics;
  }) {
    const message: WebSocketMessage = {
      type: 'init',
      data,
      timestamp: Date.now()
    };
    socket.emit('init', message);
  }

  /**
   * 广播状态更新
   */
  broadcastStateUpdate(aiState: AIState) {
    const message: WebSocketMessage = {
      type: 'state_update',
      data: { aiState },
      timestamp: Date.now()
    };
    this.io.emit('state-update', message);
  }

  /**
   * 广播事件
   */
  broadcastEvent(event: OpenClawEvent) {
    const message: WebSocketMessage = {
      type: 'event',
      data: event,
      timestamp: Date.now()
    };
    this.io.emit('event', message);
  }

  /**
   * 广播指标更新
   */
  broadcastMetrics(system: SystemMetrics, ai: AIMetrics) {
    const message: WebSocketMessage = {
      type: 'metrics',
      data: { system, ai },
      timestamp: Date.now()
    };
    this.io.emit('metrics', message);
  }

  /**
   * 广播任务更新
   */
  broadcastTaskUpdate(task: any) {
    const message: WebSocketMessage = {
      type: 'task_update',
      data: task,
      timestamp: Date.now()
    };
    this.io.emit('task-update', message);
  }

  /**
   * 获取连接的客户端数量
   */
  getClientCount(): number {
    return this.clients.size;
  }

  /**
   * 关闭连接
   */
  close() {
    this.io.close();
    console.log('[WebSocket] Server closed');
  }
}
