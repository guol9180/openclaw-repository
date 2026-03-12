/**
 * AI 状态类型定义
 */

import { DeviceType } from './events';

// AI 状态
export interface AIState {
  status: AIStatus;
  position: Position3D;
  targetPosition?: Position3D;
  currentDevice?: DeviceType;
  animation: AnimationType;
  lastUpdate: number;
}

// AI 状态枚举
export type AIStatus =
  | 'idle'           // 空闲
  | 'thinking'       // 思考中
  | 'searching'      // 搜索中
  | 'using_tool'     // 使用工具
  | 'generating';    // 生成响应

// 3D 位置
export interface Position3D {
  x: number;
  y: number;
  z: number;
}

// 动画类型
export type AnimationType =
  | 'idle'       // 待机
  | 'walking'    // 行走
  | 'typing'     // 打字
  | 'thinking';  // 思考

// 任务
export interface Task {
  id: string;
  userRequest: string;
  status: TaskStatus;
  steps: TaskStep[];
  startTime: number;
  endTime?: number;
}

// 任务状态
export type TaskStatus =
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'failed';

// 任务步骤
export interface TaskStep {
  id: string;
  order: number;
  description: string;
  status: TaskStatus;
  device?: DeviceType;
  startTime?: number;
  endTime?: number;
  result?: string;
}

// 设备位置映射
export const DEVICE_POSITIONS: Record<DeviceType, Position3D> = {
  ai_core: { x: 0, y: 0, z: 0 },
  memory_shelf: { x: -4, y: 0, z: -3 },
  search_terminal: { x: -4, y: 0, z: 0 },
  code_console: { x: -4, y: 0, z: 3 },
  network_console: { x: 4, y: 0, z: -3 },
  skill_workbench: { x: 4, y: 0, z: 0 }
};
