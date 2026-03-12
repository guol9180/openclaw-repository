/**
 * AI Room 状态管理
 */

import { create } from 'zustand';
import type { AIState, Task, Position3D, DeviceType } from '../types';
import { DEVICE_POSITIONS } from '../types';

interface AIRoomState {
  // AI 状态
  aiState: AIState;

  // 当前任务
  currentTask: Task | null;

  // 事件日志
  eventLog: any[];

  // 系统指标
  systemMetrics: any;
  aiMetrics: any;

  // 连接状态
  connected: boolean;

  // Actions
  updateAIState: (state: Partial<AIState>) => void;
  moveAIToDevice: (device: DeviceType) => void;
  updateTask: (task: Task | null) => void;
  addEvent: (event: any) => void;
  updateMetrics: (system: any, ai: any) => void;
  setConnected: (connected: boolean) => void;
  reset: () => void;
}

// 初始 AI 状态
const initialAIState: AIState = {
  status: 'idle',
  position: { ...DEVICE_POSITIONS.ai_core },
  animation: 'idle',
  lastUpdate: Date.now()
};

export const useAIRoomStore = create<AIRoomState>((set, get) => ({
  // 初始状态
  aiState: initialAIState,
  currentTask: null,
  eventLog: [],
  systemMetrics: null,
  aiMetrics: null,
  connected: false,

  // 更新 AI 状态
  updateAIState: (newState) =>
    set((state) => ({
      aiState: {
        ...state.aiState,
        ...newState,
        lastUpdate: Date.now()
      }
    })),

  // 移动 AI 到设备
  moveAIToDevice: (device) => {
    const targetPosition = DEVICE_POSITIONS[device];
    if (!targetPosition) return;

    set((state) => ({
      aiState: {
        ...state.aiState,
        targetPosition,
        currentDevice: device,
        animation: 'walking',
        lastUpdate: Date.now()
      }
    }));

    // 模拟移动完成（实际应该由 3D 引擎处理）
    setTimeout(() => {
      set((state) => ({
        aiState: {
          ...state.aiState,
          position: targetPosition,
          targetPosition: undefined,
          lastUpdate: Date.now()
        }
      }));
    }, 1000);
  },

  // 更新任务
  updateTask: (task) => set({ currentTask: task }),

  // 添加事件
  addEvent: (event) =>
    set((state) => ({
      eventLog: [event, ...state.eventLog].slice(0, 100) // 保留最近 100 条
    })),

  // 更新指标
  updateMetrics: (system, ai) =>
    set({
      systemMetrics: system,
      aiMetrics: ai
    }),

  // 设置连接状态
  setConnected: (connected) => set({ connected }),

  // 重置
  reset: () =>
    set({
      aiState: initialAIState,
      currentTask: null,
      eventLog: [],
      systemMetrics: null,
      aiMetrics: null,
      connected: false
    })
}));
