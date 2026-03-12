/**
 * 日志收集器 - 从 OpenClaw 日志文件收集事件
 */

import { watch, readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { EventEmitter } from 'events';
import type { RawOpenClawEvent, OpenClawEvent, EventType } from '../types/events.js';

export class LogCollector extends EventEmitter {
  private openclawRoot: string;
  private logPaths: string[];
  private watchers: AsyncIterable<any>[] = [];
  private isRunning = false;

  constructor(openclawRoot: string = process.env.OPENCLAW_PATH || join(process.env.HOME!, '.openclaw')) {
    super();
    this.openclawRoot = openclawRoot;
    this.logPaths = [
      join(this.openclawRoot, 'logs'),
      '/var/log/openclaw'
    ];
  }

  /**
   * 启动日志收集
   */
  async start() {
    if (this.isRunning) return;
    this.isRunning = true;

    console.log('[LogCollector] Starting...');
    console.log('[LogCollector] Watching paths:', this.logPaths);

    // 监听每个日志目录
    for (const logPath of this.logPaths) {
      if (existsSync(logPath)) {
        this.watchLogDirectory(logPath);
      }
    }
  }

  /**
   * 监听日志目录
   */
  private async watchLogDirectory(logPath: string) {
    try {
      const watcher = watch(logPath);
      this.watchers.push(watcher);

      console.log(`[LogCollector] Watching: ${logPath}`);

      for await (const event of watcher) {
        if (event.eventType === 'change' && event.filename) {
          const filePath = join(logPath, event.filename);
          await this.processLogFile(filePath);
        }
      }
    } catch (error) {
      console.error(`[LogCollector] Error watching ${logPath}:`, error);
    }
  }

  /**
   * 处理日志文件
   */
  private async processLogFile(filePath: string) {
    try {
      const content = await readFile(filePath, 'utf-8');
      const lines = content.split('\n').filter(Boolean);

      // 只处理最后几行（避免重复处理）
      const recentLines = lines.slice(-10);

      for (const line of recentLines) {
        const rawEvent = this.parseLogLine(line);
        if (rawEvent) {
          const structuredEvent = this.mapToEvent(rawEvent);
          if (structuredEvent) {
            this.emit('event', structuredEvent);
          }
        }
      }
    } catch (error) {
      console.error(`[LogCollector] Error reading ${filePath}:`, error);
    }
  }

  /**
   * 解析日志行
   */
  private parseLogLine(line: string): RawOpenClawEvent | null {
    if (!line.trim()) return null;

    // 提取时间戳
    const timestampMatch = line.match(/\[(\d{4}-\d{2}-\d{2}T[\d:.]+Z?)\]/);
    const timestamp = timestampMatch ? new Date(timestampMatch[1]) : new Date();

    // 提取日志级别
    let level: RawOpenClawEvent['level'] = 'info';
    if (line.includes('[ERROR]') || line.includes('error')) level = 'error';
    else if (line.includes('[WARN]') || line.includes('warn')) level = 'warn';
    else if (line.includes('[DEBUG]') || line.includes('debug')) level = 'debug';

    return {
      timestamp,
      level,
      message: line,
      source: 'openclaw'
    };
  }

  /**
   * 映射原始事件到结构化事件
   */
  private mapToEvent(raw: RawOpenClawEvent): OpenClawEvent | null {
    const message = raw.message.toLowerCase();
    const timestamp = raw.timestamp.getTime();

    // 事件映射规则
    const eventPatterns: Array<{ pattern: RegExp; type: EventType; description: string }> = [
      {
        pattern: /received message|user.*asked/i,
        type: 'request_received',
        description: 'User request received'
      },
      {
        pattern: /thinking|processing/i,
        type: 'thinking',
        description: 'AI is thinking'
      },
      {
        pattern: /web.?search|tavily|searching/i,
        type: 'web_search',
        description: 'Executing web search'
      },
      {
        pattern: /skill.*execution|skill.*call/i,
        type: 'skill_call',
        description: 'Executing skill'
      },
      {
        pattern: /mcp.*call|mcp.*server/i,
        type: 'mcp_call',
        description: 'Calling MCP server'
      },
      {
        pattern: /memory|vector.*db|recall/i,
        type: 'memory_access',
        description: 'Accessing memory'
      },
      {
        pattern: /response.*generated|reply|answer/i,
        type: 'response_generated',
        description: 'Response generated'
      },
      {
        pattern: /error|failed/i,
        type: 'error',
        description: 'Error occurred'
      }
    ];

    // 匹配事件模式
    for (const { pattern, type, description } of eventPatterns) {
      if (pattern.test(message)) {
        return {
          id: `event-${timestamp}-${Math.random().toString(36).substr(2, 9)}`,
          timestamp,
          type,
          source: 'openclaw',
          description,
          data: { raw: raw.message }
        };
      }
    }

    return null;
  }

  /**
   * 停止收集
   */
  stop() {
    this.isRunning = false;
    console.log('[LogCollector] Stopped');
  }
}
