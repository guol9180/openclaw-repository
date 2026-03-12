/**
 * Event Log 面板 - 实时事件流
 */

import { useEffect, useRef } from 'react';
import { useAIRoomStore } from '../../stores/useAIRoomStore';

export function EventLog() {
  const { eventLog } = useAIRoomStore();
  const logEndRef = useRef<HTMLDivElement>(null);

  // 自动滚动到底部
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [eventLog]);

  return (
    <div className="event-log">
      <h3>📜 Event Log</h3>

      <div className="log-stream">
        {eventLog.length === 0 ? (
          <p className="no-events">Waiting for events...</p>
        ) : (
          eventLog.map((event) => (
            <div key={event.id} className={`log-entry log-${event.type}`}>
              <span className="log-time">
                {formatTime(event.timestamp)}
              </span>
              <span className="log-icon">
                {getEventIcon(event.type)}
              </span>
              <span className="log-message">
                {event.description}
              </span>
            </div>
          ))
        )}
        <div ref={logEndRef} />
      </div>

      <style jsx>{`
        .event-log {
          position: fixed;
          top: 20px;
          right: 20px;
          width: 350px;
          max-height: 400px;
          background: rgba(0, 0, 0, 0.85);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 16px;
          color: white;
          font-family: 'JetBrains Mono', monospace;
          backdrop-filter: blur(10px);
          display: flex;
          flex-direction: column;
        }

        h3 {
          margin: 0 0 12px 0;
          font-size: 14px;
          color: #60a5fa;
        }

        .log-stream {
          flex: 1;
          overflow-y: auto;
          max-height: 340px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .no-events {
          color: #666;
          font-size: 11px;
          text-align: center;
          margin-top: 20px;
        }

        .log-entry {
          display: flex;
          gap: 8px;
          font-size: 10px;
          padding: 4px 6px;
          border-radius: 3px;
          background: rgba(255, 255, 255, 0.03);
        }

        .log-time {
          color: #666;
          font-size: 9px;
          min-width: 50px;
        }

        .log-icon {
          font-size: 12px;
          min-width: 16px;
        }

        .log-message {
          flex: 1;
          color: #ccc;
        }

        .log-request_received {
          border-left: 2px solid #4ade80;
        }

        .log-thinking {
          border-left: 2px solid #fbbf24;
        }

        .log-web_search {
          border-left: 2px solid #60a5fa;
        }

        .log-skill_call,
        .log-mcp_call,
        .log-api_call {
          border-left: 2px solid #ec4899;
        }

        .log-response_generated {
          border-left: 2px solid #a78bfa;
        }

        .log-error {
          border-left: 2px solid #f87171;
          background: rgba(248, 113, 113, 0.1);
        }

        .log-stream::-webkit-scrollbar {
          width: 4px;
        }

        .log-stream::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
        }

        .log-stream::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 2px;
        }
      `}</style>
    </div>
  );
}

// 格式化时间
function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

// 获取事件图标
function getEventIcon(type: string): string {
  switch (type) {
    case 'request_received':
      return '📨';
    case 'thinking':
      return '🤔';
    case 'web_search':
      return '🔍';
    case 'skill_call':
      return '⚙️';
    case 'mcp_call':
      return '🌐';
    case 'api_call':
      return '📡';
    case 'memory_access':
      return '📚';
    case 'tool_call':
      return '🛠️';
    case 'response_generated':
      return '✨';
    case 'task_complete':
      return '✅';
    case 'error':
      return '❌';
    default:
      return '📋';
  }
}
