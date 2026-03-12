/**
 * Quest Log 面板 - 任务追踪
 */

import { useAIRoomStore } from '../../stores/useAIRoomStore';

export function QuestLog() {
  const { currentTask } = useAIRoomStore();

  if (!currentTask) {
    return (
      <div className="quest-log">
        <h3>📋 Quest Log</h3>
        <p className="no-task">No active quest</p>
      </div>
    );
  }

  return (
    <div className="quest-log">
      <h3>📋 Quest Log</h3>

      <div className="quest-info">
        <div className="quest-id">{currentTask.id}</div>
        <div className="quest-request">"{currentTask.userRequest}"</div>
      </div>

      <div className="quest-steps">
        {currentTask.steps.map((step) => (
          <div key={step.id} className={`step ${step.status}`}>
            <span className="step-checkbox">
              {step.status === 'completed' ? '✅' :
               step.status === 'running' ? '⏳' :
               step.status === 'failed' ? '❌' : '⬜'}
            </span>
            <span className="step-description">{step.description}</span>
            {step.status === 'running' && (
              <span className="step-indicator">...</span>
            )}
          </div>
        ))}
      </div>

      <style jsx>{`
        .quest-log {
          position: fixed;
          top: 20px;
          left: 20px;
          width: 300px;
          background: rgba(0, 0, 0, 0.85);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 16px;
          color: white;
          font-family: 'JetBrains Mono', monospace;
          backdrop-filter: blur(10px);
        }

        h3 {
          margin: 0 0 12px 0;
          font-size: 14px;
          color: #4ade80;
        }

        .no-task {
          color: #666;
          font-size: 12px;
        }

        .quest-info {
          margin-bottom: 12px;
        }

        .quest-id {
          font-size: 10px;
          color: #888;
          margin-bottom: 4px;
        }

        .quest-request {
          font-size: 12px;
          color: #fff;
          font-style: italic;
        }

        .quest-steps {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .step {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 11px;
          padding: 4px;
          border-radius: 4px;
          transition: all 0.2s;
        }

        .step.running {
          background: rgba(251, 191, 36, 0.2);
          color: #fbbf24;
        }

        .step.completed {
          color: #4ade80;
        }

        .step.failed {
          color: #f87171;
        }

        .step-checkbox {
          font-size: 12px;
        }

        .step-description {
          flex: 1;
        }

        .step-indicator {
          animation: pulse 1s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}
