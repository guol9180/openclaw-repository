// 类型定义

export interface MetricsData {
  requestsPerSec: number;
  latency: number;
  activeTasks: number;
  errorCount: number;
  tokenUsage: {
    input: number;
    output: number;
  };
  lastUpdate: number;
}

export interface SystemStatus {
  cpu: number;
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  disk: {
    used: number;
    total: number;
    percentage: number;
  };
  network: {
    rx_sec: number;
    tx_sec: number;
  };
  uptime: number;
}

export interface LogEntry {
  id: string;
  type: string;
  message: string;
  level: 'info' | 'success' | 'warning' | 'error';
  timestamp: number;
}

export interface NetworkNode {
  id: string;
  label: string;
  type: 'core' | 'tool' | 'skill' | 'mcp';
  x: number;
  y: number;
  active: boolean;
}

export interface NetworkLink {
  from: string;
  to: string;
}

export interface NetworkData {
  nodes: NetworkNode[];
  links: NetworkLink[];
}

export interface NodeDetails {
  node: NetworkNode;
  stats: {
    calls: number;
    avgLatency: number;
    errors: number;
    lastCall: number | null;
  };
  connections: NetworkLink[];
}
