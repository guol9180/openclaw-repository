/**
 * OpenClaw Event Collector
 * 收集 OpenClaw 日志、MCP 调用、Skill 执行等事件
 */

import { spawn } from 'child_process';
import { watch, readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import si from 'systeminformation';

export function initCollector(eventBus, metrics) {
  let statusInterval;
  let logWatcher;
  
  const OPENCLAW_LOGS = [
    join(process.env.HOME, '.openclaw/logs'),
    '/var/log/openclaw'
  ];
  
  // 收集系统指标
  async function collectSystemMetrics() {
    try {
      const [cpu, mem, disk, network] = await Promise.all([
        si.currentLoad(),
        si.mem(),
        si.fsSize(),
        si.networkStats()
      ]);
      
      const systemStatus = {
        cpu: cpu.currentLoad,
        memory: {
          used: mem.used,
          total: mem.total,
          percentage: (mem.used / mem.total) * 100
        },
        disk: disk[0] ? {
          used: disk[0].used,
          total: disk[0].size,
          percentage: disk[0].use
        } : { used: 0, total: 0, percentage: 0 },
        network: network[0] ? {
          rx_sec: network[0].rx_sec,
          tx_sec: network[0].tx_sec
        } : { rx_sec: 0, tx_sec: 0 },
        uptime: process.uptime()
      };
      
      metrics.updateSystemStatus(systemStatus);
      return systemStatus;
    } catch (err) {
      console.error('收集系统指标失败:', err.message);
      return null;
    }
  }
  
  // 获取 OpenClaw 状态
  async function collectOpenClawStatus() {
    return new Promise((resolve) => {
      const proc = spawn('openclaw', ['status', '--json'], {
        shell: true
      });
      
      let output = '';
      proc.stdout.on('data', (data) => {
        output += data.toString();
      });
      
      proc.on('close', (code) => {
        try {
          if (output && output.includes('{')) {
            const jsonMatch = output.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              const status = JSON.parse(jsonMatch[0]);
              metrics.updateOpenClawStatus(status);
              eventBus.emit('openclaw:status', status);
            }
          }
        } catch (err) {
          // 解析失败，忽略
        }
        resolve();
      });
      
      // 超时处理
      setTimeout(() => {
        proc.kill();
        resolve();
      }, 5000);
    });
  }
  
  // 模拟 AI 核心指标（实际应从 OpenClaw 获取）
  function generateAICoreMetrics() {
    const prev = metrics.getAICoreMetrics();
    const now = Date.now();
    
    // 模拟实时数据变化
    const aiCore = {
      requestsPerSec: Math.max(0, (prev.requestsPerSec || 5) + (Math.random() - 0.5) * 2),
      latency: Math.max(10, (prev.latency || 150) + (Math.random() - 0.5) * 30),
      activeTasks: Math.max(0, Math.min(10, (prev.activeTasks || 3) + Math.floor((Math.random() - 0.5) * 3))),
      errorCount: Math.max(0, prev.errorCount || 0),
      tokenUsage: {
        input: (prev.tokenUsage?.input || 0) + Math.floor(Math.random() * 100),
        output: (prev.tokenUsage?.output || 0) + Math.floor(Math.random() * 50)
      },
      lastUpdate: now
    };
    
    metrics.updateAICoreMetrics(aiCore);
    
    // 模拟网络活动
    if (Math.random() > 0.7) {
      const nodes = ['web-search', 'skills', 'browser', 'python-mcp'];
      const from = nodes[Math.floor(Math.random() * nodes.length)];
      const to = nodes[Math.floor(Math.random() * nodes.length)];
      if (from !== to) {
        eventBus.emit('network:update', {
          type: 'data_flow',
          from,
          to,
          timestamp: now
        });
      }
    }
    
    // 模拟日志事件
    if (Math.random() > 0.6) {
      const logTypes = [
        { type: 'request', message: 'AI request received', level: 'info' },
        { type: 'mcp', message: 'MCP call: web-search', level: 'info' },
        { type: 'skill', message: 'Skill execution: tavily-search', level: 'info' },
        { type: 'response', message: 'Response generated', level: 'success' },
        { type: 'error', message: 'Connection timeout', level: 'error' }
      ];
      const log = logTypes[Math.floor(Math.random() * logTypes.length)];
      eventBus.emit('log', {
        ...log,
        id: `log-${now}`,
        timestamp: now
      });
    }
    
    return aiCore;
  }
  
  // 监控日志文件
  async function watchLogs() {
    for (const logPath of OPENCLAW_LOGS) {
      if (existsSync(logPath)) {
        try {
          const watcher = watch(logPath, { persistent: false });
          for await (const event of watcher) {
            if (event.eventType === 'change') {
              // 读取新日志
              const content = await readFile(join(logPath, event.filename), 'utf8');
              const lines = content.split('\n').filter(Boolean);
              const lastLine = lines[lines.length - 1];
              if (lastLine) {
                eventBus.emit('log', {
                  id: `log-${Date.now()}`,
                  type: 'system',
                  message: lastLine,
                  level: 'info',
                  timestamp: Date.now()
                });
              }
            }
          }
        } catch (err) {
          console.error(`监控日志失败 ${logPath}:`, err.message);
        }
      }
    }
  }
  
  return {
    start() {
      console.log('🔍 启动数据收集器...');
      
      // 每秒收集指标
      statusInterval = setInterval(() => {
        collectSystemMetrics();
        collectOpenClawStatus();
        generateAICoreMetrics();
      }, 1000);
      
      // 初始收集
      collectSystemMetrics();
      collectOpenClawStatus();
      
      // 启动日志监控（异步）
      watchLogs().catch(console.error);
      
      console.log('✅ 数据收集器已启动');
    },
    
    stop() {
      if (statusInterval) {
        clearInterval(statusInterval);
      }
      console.log('🛑 数据收集器已停止');
    }
  };
}
