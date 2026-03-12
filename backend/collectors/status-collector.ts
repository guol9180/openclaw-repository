/**
 * 状态收集器 - 从 OpenClaw CLI 获取运行状态
 */

import { spawn } from 'child_process';
import { EventEmitter } from 'events';

export interface OpenClawStatus {
  running: boolean;
  version?: string;
  uptime?: number;
  sessions?: number;
  memoryUsage?: number;
}

export class StatusCollector extends EventEmitter {
  private interval?: NodeJS.Timeout;
  private isRunning = false;
  private pollInterval: number;

  constructor(pollInterval: number = 5000) {
    super();
    this.pollInterval = pollInterval;
  }

  /**
   * 启动状态收集
   */
  start() {
    if (this.isRunning) return;
    this.isRunning = true;

    console.log('[StatusCollector] Starting...');

    // 立即收集一次
    this.collect();

    // 定期收集
    this.interval = setInterval(() => {
      this.collect();
    }, this.pollInterval);
  }

  /**
   * 收集 OpenClaw 状态
   */
  private async collect() {
    try {
      const status = await this.getOpenClawStatus();
      this.emit('status', status);
    } catch (error) {
      console.error('[StatusCollector] Error collecting status:', error);
      this.emit('status', { running: false });
    }
  }

  /**
   * 获取 OpenClaw 状态
   */
  private async getOpenClawStatus(): Promise<OpenClawStatus> {
    return new Promise((resolve) => {
      const child = spawn('openclaw', ['status', '--json'], {
        shell: true,
        timeout: 5000
      });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', (code) => {
        if (code === 0 && stdout) {
          try {
            // 尝试解析 JSON
            const data = JSON.parse(stdout);
            resolve({
              running: true,
              version: data.version,
              uptime: data.uptime,
              sessions: data.sessions?.length || 0,
              memoryUsage: data.memory?.used
            });
          } catch {
            // 如果不是 JSON，检查是否包含运行信息
            const running = stdout.includes('running') || stdout.includes('active');
            resolve({ running });
          }
        } else {
          resolve({ running: false });
        }
      });

      child.on('error', () => {
        resolve({ running: false });
      });
    });
  }

  /**
   * 停止收集
   */
  stop() {
    if (this.interval) {
      clearInterval(this.interval);
    }
    this.isRunning = false;
    console.log('[StatusCollector] Stopped');
  }
}
