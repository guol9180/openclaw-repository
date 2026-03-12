/**
 * 任务管理器 - 管理当前任务和步骤
 */

import { EventEmitter } from 'events';
import type { Task, TaskStep, TaskStatus, DeviceType } from '../types/state';
import type { OpenClawEvent, EventType } from '../types/events';

// 默认任务步骤模板
const DEFAULT_STEPS: Array<{ description: string; device?: DeviceType }> = [
  { description: 'Understand request', device: 'ai_core' },
  { description: 'Search information', device: 'search_terminal' },
  { description: 'Process results', device: 'ai_core' },
  { description: 'Generate response', device: 'ai_core' },
  { description: 'Return answer', device: 'ai_core' }
];

export class TaskManager extends EventEmitter {
  private currentTask: Task | null = null;
  private taskCounter = 0;

  constructor() {
    super();
  }

  /**
   * 获取当前任务
   */
  getCurrentTask(): Task | null {
    return this.currentTask;
  }

  /**
   * 创建新任务
   */
  createTask(userRequest: string): Task {
    this.taskCounter++;

    const task: Task = {
      id: `quest-${this.taskCounter}`,
      userRequest,
      status: 'pending',
      steps: DEFAULT_STEPS.map((step, index) => ({
        id: `step-${index + 1}`,
        order: index + 1,
        description: step.description,
        status: 'pending',
        device: step.device
      })),
      startTime: Date.now()
    };

    this.currentTask = task;
    this.emit('task-created', task);

    console.log(`[TaskManager] Created task: ${task.id}`, userRequest);

    return task;
  }

  /**
   * 处理事件（更新任务状态）
   */
  handleEvent(event: OpenClawEvent) {
    if (!this.currentTask) return;

    // 根据事件类型更新步骤
    switch (event.type) {
      case 'request_received':
        this.currentTask.status = 'in_progress';
        this.updateStep(1, 'running');
        break;

      case 'thinking':
        if (this.currentTask.steps[0]?.status === 'pending') {
          this.updateStep(1, 'completed');
        }
        break;

      case 'web_search':
        this.updateStep(2, 'running');
        if (this.currentTask.steps[1]?.status === 'pending') {
          this.updateStep(1, 'completed');
          this.updateStep(2, 'running');
        }
        break;

      case 'response_generated':
        // 标记所有未完成步骤为完成
        this.currentTask.steps.forEach((step, index) => {
          if (step.status === 'pending' || step.status === 'running') {
            this.updateStep(index + 1, 'completed');
          }
        });
        break;

      case 'task_complete':
        this.completeTask();
        break;

      case 'error':
        this.failTask(event.description);
        break;
    }

    this.emit('task-update', this.currentTask);
  }

  /**
   * 更新步骤状态
   */
  private updateStep(stepOrder: number, status: TaskStatus) {
    if (!this.currentTask) return;

    const step = this.currentTask.steps.find(s => s.order === stepOrder);
    if (!step) return;

    step.status = status;

    if (status === 'running') {
      step.startTime = Date.now();
    } else if (status === 'completed' || status === 'failed') {
      step.endTime = Date.now();
    }

    console.log(`[TaskManager] Step ${stepOrder}: ${status}`);
    this.emit('step-update', step);
  }

  /**
   * 完成任务
   */
  private completeTask() {
    if (!this.currentTask) return;

    this.currentTask.status = 'completed';
    this.currentTask.endTime = Date.now();

    console.log(`[TaskManager] Task completed: ${this.currentTask.id}`);
    this.emit('task-completed', this.currentTask);

    // 清空当前任务
    setTimeout(() => {
      this.currentTask = null;
    }, 3000);
  }

  /**
   * 任务失败
   */
  private failTask(reason: string) {
    if (!this.currentTask) return;

    this.currentTask.status = 'failed';
    this.currentTask.endTime = Date.now();

    console.log(`[TaskManager] Task failed: ${this.currentTask.id}`, reason);
    this.emit('task-failed', this.currentTask, reason);

    // 清空当前任务
    setTimeout(() => {
      this.currentTask = null;
    }, 3000);
  }

  /**
   * 取消任务
   */
  cancelTask() {
    if (!this.currentTask) return;

    this.currentTask.status = 'failed';
    this.currentTask.endTime = Date.now();

    console.log(`[TaskManager] Task cancelled: ${this.currentTask.id}`);
    this.emit('task-cancelled', this.currentTask);

    this.currentTask = null;
  }
}
