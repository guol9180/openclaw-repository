/**
 * Metrics Store
 * 存储和管理所有监控指标
 */

export class MetricsCollector {
  constructor() {
    // AI 核心指标
    this.aiCore = {
      requestsPerSec: 0,
      latency: 0,
      activeTasks: 0,
      errorCount: 0,
      tokenUsage: { input: 0, output: 0 },
      lastUpdate: Date.now()
    };
    
    // 系统状态
    this.systemStatus = {
      cpu: 0,
      memory: { used: 0, total: 0, percentage: 0 },
      disk: { used: 0, total: 0, percentage: 0 },
      network: { rx_sec: 0, tx_sec: 0 },
      uptime: 0
    };
    
    // OpenClaw 状态
    this.openClawStatus = {
      version: '2026.3.2',
      status: 'running',
      uptime: 0,
      sessions: 0
    };
    
    // 网络节点
    this.networkNodes = [
      { id: 'ai-core', label: 'OpenClaw AI', type: 'core', x: 400, y: 300, active: true },
      { id: 'web-search', label: 'Web Search', type: 'tool', x: 200, y: 150, active: false },
      { id: 'skills', label: 'Skills Engine', type: 'skill', x: 600, y: 150, active: false },
      { id: 'browser', label: 'Browser', type: 'tool', x: 200, y: 450, active: false },
      { id: 'python-mcp', label: 'Python MCP', type: 'mcp', x: 600, y: 450, active: false },
      { id: 'mcp-server', label: 'MCP Server', type: 'mcp', x: 400, y: 500, active: false }
    ];
    
    // 网络连接
    this.networkLinks = [
      { from: 'ai-core', to: 'web-search' },
      { from: 'ai-core', to: 'skills' },
      { from: 'ai-core', to: 'browser' },
      { from: 'ai-core', to: 'python-mcp' },
      { from: 'ai-core', to: 'mcp-server' },
      { from: 'skills', to: 'web-search' },
      { from: 'mcp-server', to: 'python-mcp' }
    ];
    
    // 日志历史
    this.logs = [];
    this.maxLogs = 100;
    
    // 指标历史
    this.metricsHistory = {
      requestsPerSec: [],
      latency: [],
      errorRate: [],
      tokenUsage: []
    };
    this.maxHistoryLength = 300; // 5分钟数据
    
    // 节点统计
    this.nodeStats = this.initNodeStats();
  }
  
  initNodeStats() {
    const stats = {};
    this.networkNodes.forEach(node => {
      stats[node.id] = {
        calls: 0,
        avgLatency: 0,
        errors: 0,
        lastCall: null
      };
    });
    return stats;
  }
  
  // 更新 AI 核心指标
  updateAICoreMetrics(data) {
    this.aiCore = { ...this.aiCore, ...data };
    
    // 记录历史
    this.metricsHistory.requestsPerSec.push({
      time: data.lastUpdate,
      value: data.requestsPerSec
    });
    this.metricsHistory.latency.push({
      time: data.lastUpdate,
      value: data.latency
    });
    
    // 限制历史长度
    Object.keys(this.metricsHistory).forEach(key => {
      if (this.metricsHistory[key].length > this.maxHistoryLength) {
        this.metricsHistory[key].shift();
      }
    });
  }
  
  // 更新系统状态
  updateSystemStatus(data) {
    this.systemStatus = { ...this.systemStatus, ...data };
  }
  
  // 更新 OpenClaw 状态
  updateOpenClawStatus(data) {
    this.openClawStatus = { ...this.openClawStatus, ...data };
  }
  
  // 添加日志
  addLog(log) {
    this.logs.unshift(log);
    if (this.logs.length > this.maxLogs) {
      this.logs.pop();
    }
  }
  
  // 获取 AI 核心指标
  getAICoreMetrics() {
    return this.aiCore;
  }
  
  // 获取系统状态
  getSystemStatus() {
    return this.systemStatus;
  }
  
  // 获取完整状态
  async getFullStatus() {
    return {
      aiCore: this.aiCore,
      system: this.systemStatus,
      openClaw: this.openClawStatus,
      network: {
        nodes: this.networkNodes,
        links: this.networkLinks
      }
    };
  }
  
  // 获取网络节点
  getNetworkNodes() {
    return {
      nodes: this.networkNodes,
      links: this.networkLinks
    };
  }
  
  // 获取节点详情
  getNodeDetails(nodeId) {
    const node = this.networkNodes.find(n => n.id === nodeId);
    const stats = this.nodeStats[nodeId] || {};
    return {
      node,
      stats,
      connections: this.networkLinks.filter(l => l.from === nodeId || l.to === nodeId)
    };
  }
  
  // 获取最近日志
  getRecentLogs(limit = 50) {
    return this.logs.slice(0, limit);
  }
  
  // 获取指标历史
  getMetricsHistory(duration = '1h') {
    const now = Date.now();
    const durationMs = {
      '5m': 5 * 60 * 1000,
      '1h': 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000
    }[duration] || 60 * 60 * 1000;
    
    const cutoff = now - durationMs;
    
    return {
      requestsPerSec: this.metricsHistory.requestsPerSec.filter(d => d.time > cutoff),
      latency: this.metricsHistory.latency.filter(d => d.time > cutoff)
    };
  }
  
  // 记录节点调用
  recordNodeCall(nodeId, latency = 0, error = false) {
    if (this.nodeStats[nodeId]) {
      const stats = this.nodeStats[nodeId];
      stats.calls++;
      stats.avgLatency = (stats.avgLatency * (stats.calls - 1) + latency) / stats.calls;
      if (error) stats.errors++;
      stats.lastCall = Date.now();
      
      // 更新节点活跃状态
      const node = this.networkNodes.find(n => n.id === nodeId);
      if (node) {
        node.active = true;
        setTimeout(() => { node.active = false; }, 1000);
      }
    }
  }
}
