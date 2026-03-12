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
  
  // 使用环境变量配置路径，避免硬编码
  const OPENCLAW_ROOT = process.env.OPENCLAW_PATH || join(process.env.HOME, '.openclaw');
  const OPENCLAW_LOGS = [
    join(OPENCLAW_ROOT, 'logs'),
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
            const status = JSON.parse(stdout);
            resolve(status);
          } catch {
            resolve(null);
          }
        } else {
          resolve(null);
        }
      });
      
      child.on('error', () => {
        resolve(null);
      });
    });
  }
  
  // 解析日志行
  function parseLogLine(line) {
    const timestampMatch = line.match(/\[(\d{4}-\d{2}-\d{2}T[\d:.]+Z?)\]/);
    const timestamp = timestampMatch ? new Date(timestampMatch[1]) : new Date();
    
    let type = 'info';
    if (line.includes('[ERROR]') || line.includes('error')) type = 'error';
    else if (line.includes('[WARN]') || line.includes('warn')) type = 'warn';
    else if (line.includes('[MCP]') || line.includes('mcp')) type = 'mcp';
    else if (line.includes('[SKILL]') || line.includes('skill')) type = 'skill';
    else if (line.includes('request') || line.includes('response')) type = 'request';
    
    return {
      timestamp,
      type,
      message: line.slice(0, 200)
    };
  }
  
  // 读取最新日志
  async function readRecentLogs(logPath, lines = 50) {
    try {
      if (!existsSync(logPath)) return [];
      
      const content = await readFile(logPath, 'utf-8');
      const logLines = content.split('\n').filter(Boolean).slice(-lines);
      
      return logLines.map(parseLogLine);
    } catch {
      return [];
    }
  }
  
  // 启动收集器
  async function start() {
    // 定期收集系统指标
    statusInterval = setInterval(async () => {
      const systemStatus = await collectSystemMetrics();
      const openclawStatus = await collectOpenClawStatus();
      
      if (systemStatus) {
        eventBus.emit('system:status', systemStatus);
      }
      
      if (openclawStatus) {
        eventBus.emit('openclaw:status', openclawStatus);
      }
    }, 1000);
    
    // 监听日志变化
    for (const logDir of OPENCLAW_LOGS) {
      if (existsSync(logDir)) {
        try {
          const watcher = watch(logDir);
          (async () => {
            for await (const event of watcher) {
              if (event.eventType === 'change') {
                const logs = await readRecentLogs(join(logDir, event.filename));
                logs.forEach(log => {
                  eventBus.emit('log', log);
                  metrics.addLog(log);
                });
              }
            }
          })();
        } catch {
          // 忽略无法监听的目录
        }
      }
    }
  }
  
  // 停止收集器
  function stop() {
    if (statusInterval) {
      clearInterval(statusInterval);
    }
  }
  
  start();
  
  return {
    stop
  };
}
