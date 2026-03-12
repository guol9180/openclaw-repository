/**
 * OpenClaw 事件类型定义
 */

// OpenClaw 原始事件（从日志解析）
export interface RawOpenClawEvent {
  timestamp: Date;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  source?: string;
  metadata?: Record<string, any>;
}

// 结构化事件（映射后的）
export interface OpenClawEvent {
  id: string;
  timestamp: number;
  type: EventType;
  source: string;
  description: string;
  data?: any;
}

// 事件类型
export type EventType =
  | 'request_received'      // 收到用户请求
  | 'thinking'              // AI 思考中
  | 'web_search'            // 执行网页搜索
  | 'skill_call'            // 调用技能
  | 'mcp_call'              // 调用 MCP
  | 'api_call'              // API 调用
  | 'memory_access'         // 访问记忆
  | 'tool_call'            // 调用工具（CLI/Python）
  | 'response_generated'    // 生成响应
  | 'task_complete'         // 任务完成
  | 'error';                // 错误

// AI 动作（映射到角色行为）
export interface AIAction {
  eventType: EventType;
  characterAction: CharacterAction;
  targetDevice?: DeviceType;
  duration?: number;
}

// 角色动作
export type CharacterAction =
  | 'idle'
  | 'thinking'
  | 'walking'
  | 'typing'
  | 'searching'
  | 'using_tool';

// 设备类型
export type DeviceType =
  | 'memory_shelf'
  | 'search_terminal'
  | 'network_console'
  | 'skill_workbench'
  | 'code_console'
  | 'ai_core';
