/**
 * AI 状态管理器 - 管理 AI 角色的状态和行为
 */

import { EventEmitter } from 'events';
import type { AIState, AIStatus, Position3D, DeviceType } from '../types/state.js';
import type { OpenClawEvent, EventType } from '../types/events.js';
import { DEVICE_POSITIONS } from '../types/state.js';

// 状态转换规则
const STATE_TRANSITIONS: Record<AIStatus, AIStatus[]> = {
  'idle': ['thinking'],
  'thinking': ['searching', 'using_tool', 'generating'],
  'searching': ['using_tool', 'generating', 'idle'],
  'using_tool': ['searching', 'generating', 'idle'],
  'generating': ['idle']
};

// 事件到状态的映射
const EVENT_TO_STATE: Record<EventType, { status: AIStatus; device?: DeviceType }> = {
  'request_received': { status: 'thinking', device: 'ai_core' },
  'thinking': { status: 'thinking', device: 'ai_core' },
  'web_search': { status: 'searching', device: 'search_terminal' },
  'skill_call': { status: 'using_tool', device: 'skill_workbench' },
  'mcp_call': { status: 'using_tool', device: 'network_console' },
  'api_call': { status: 'using_tool', device: 'network_console' },
  'memory_access': { status: 'using_tool', device: 'memory_shelf' },
  'tool_call': { status: 'using_tool', device: 'code_console' },
  'response_generated': { status: 'generating', device: 'ai_core' },
  'task_complete': { status: 'idle', device: 'ai_core' },
  'error': { status: 'idle', device: 'ai_core' }
};

export class AIStateManager extends EventEmitter {
  private state: AIState;
  private moveSpeed: number = 2; // 单位/秒

  constructor() {
    super();
    this.state = this.getInitialState();
  }

  /**
   * 初始状态
   */
  private getInitialState(): AIState {
    return {
      status: 'idle',
      position: { ...DEVICE_POSITIONS.ai_core },
      animation: 'idle',
      lastUpdate: Date.now()
    };
  }

  /**
   * 获取当前状态
   */
  getState(): AIState {
    return { ...this.state };
  }

  /**
   * 处理事件
   */
  handleEvent(event: OpenClawEvent) {
    const mapping = EVENT_TO_STATE[event.type];
    if (!mapping) return;

    // 检查状态转换是否合法
    if (!STATE_TRANSITIONS[this.state.status].includes(mapping.status)) {
      console.warn(`[AIState] Invalid transition: ${this.state.status} -> ${mapping.status}`);
      return;
    }

    // 更新状态
    this.state.status = mapping.status;
    this.state.lastUpdate = Date.now();

    // 如果需要移动到设备
    if (mapping.device) {
      this.moveToDevice(mapping.device);
    }

    // 更新动画
    this.updateAnimation();

    // 发送状态更新
    this.emit('state-update', this.getState());
  }

  /**
   * 移动到设备
   */
  private moveToDevice(device: DeviceType) {
    const targetPosition = DEVICE_POSITIONS[device];
    if (!targetPosition) return;

    this.state.targetPosition = { ...targetPosition };
    this.state.currentDevice = device;

    console.log(`[AIState] Moving to ${device}`, targetPosition);

    // 计算移动时间
    const distance = this.calculateDistance(this.state.position, targetPosition);
    const moveTime = (distance / this.moveSpeed) * 1000; // 毫秒

    // 模拟移动（实际应该由前端处理）
    setTimeout(() => {
      this.state.position = { ...targetPosition };
      this.state.targetPosition = undefined;
      this.emit('position-update', this.getState());
    }, moveTime);
  }

  /**
   * 计算距离
   */
  private calculateDistance(from: Position3D, to: Position3D): number {
    return Math.sqrt(
      Math.pow(to.x - from.x, 2) +
      Math.pow(to.z - from.z, 2)
    );
  }

  /**
   * 更新动画
   */
  private updateAnimation() {
    switch (this.state.status) {
      case 'idle':
        this.state.animation = 'idle';
        break;
      case 'thinking':
      case 'generating':
        this.state.animation = 'thinking';
        break;
      case 'searching':
      case 'using_tool':
        this.state.animation = 'typing';
        break;
    }
  }

  /**
   * 强制设置状态
   */
  setStatus(status: AIStatus, device?: DeviceType) {
    this.state.status = status;
    this.state.lastUpdate = Date.now();

    if (device) {
      this.moveToDevice(device);
    }

    this.updateAnimation();
    this.emit('state-update', this.getState());
  }

  /**
   * 重置状态
   */
  reset() {
    this.state = this.getInitialState();
    this.emit('state-update', this.getState());
  }
}
