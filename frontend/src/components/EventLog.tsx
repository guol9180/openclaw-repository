import { useData } from '../App';
import { motion, AnimatePresence } from 'framer-motion';
import { useRef, useEffect } from 'react';

function EventLog() {
  const { logs } = useData();
  const containerRef = useRef<HTMLDivElement>(null);

  // 自动滚动到顶部
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, [logs]);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'success': return 'text-cyber-green';
      case 'warning': return 'text-cyber-orange';
      case 'error': return 'text-cyber-red';
      default: return 'text-gray-300';
    }
  };

  const getLevelBg = (level: string) => {
    switch (level) {
      case 'success': return 'border-l-cyber-green';
      case 'warning': return 'border-l-cyber-orange';
      case 'error': return 'border-l-cyber-red';
      default: return 'border-l-cyber-blue';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'request': return '📥';
      case 'mcp': return '🔌';
      case 'skill': return '⚡';
      case 'response': return '📤';
      case 'error': return '❌';
      default: return '📋';
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="neon-border rounded-lg p-4 bg-cyber-darker/80 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-cyber-blue uppercase tracking-wider">
          Event Log
        </h2>
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <div className="w-1.5 h-1.5 rounded-full bg-cyber-green animate-pulse" />
          LIVE
        </div>
      </div>

      {/* 日志列表 */}
      <div 
        ref={containerRef}
        className="h-64 overflow-y-auto space-y-2 pr-2"
      >
        <AnimatePresence mode="popLayout">
          {logs.slice(0, 50).map((log, index) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, x: -20, height: 0 }}
              animate={{ opacity: 1, x: 0, height: 'auto' }}
              exit={{ opacity: 0, x: 20, height: 0 }}
              transition={{ duration: 0.2, delay: index * 0.02 }}
              className={`p-2 rounded bg-cyber-dark/50 border-l-2 ${getLevelBg(log.level)}`}
            >
              <div className="flex items-start gap-2">
                <span className="text-sm">{getTypeIcon(log.type)}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-medium ${getLevelColor(log.level)}`}>
                      {log.type.toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-500 font-mono">
                      {formatTime(log.timestamp)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-300 mt-1 truncate">
                    {log.message}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {logs.length === 0 && (
          <div className="text-center text-gray-500 text-sm py-8">
            Waiting for events...
          </div>
        )}
      </div>
    </div>
  );
}

export default EventLog;
