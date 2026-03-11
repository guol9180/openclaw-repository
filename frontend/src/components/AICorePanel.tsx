import { useData } from '../App';
import { motion } from 'framer-motion';
import { Cpu, Zap, Activity, AlertTriangle } from 'lucide-react';

function AICorePanel() {
  const { aiCore } = useData();

  if (!aiCore) {
    return (
      <div className="neon-border rounded-lg p-4 bg-cyber-darker/80">
        <div className="text-center text-gray-500">Loading...</div>
      </div>
    );
  }

  const metrics = [
    { 
      label: 'Requests/sec', 
      value: aiCore.requestsPerSec.toFixed(1), 
      icon: Zap, 
      color: 'cyber-blue',
      unit: '/s'
    },
    { 
      label: 'Latency', 
      value: aiCore.latency.toFixed(0), 
      icon: Activity, 
      color: 'cyber-green',
      unit: 'ms'
    },
    { 
      label: 'Active Tasks', 
      value: aiCore.activeTasks, 
      icon: Cpu, 
      color: 'cyber-orange',
      unit: ''
    },
    { 
      label: 'Errors', 
      value: aiCore.errorCount, 
      icon: AlertTriangle, 
      color: aiCore.errorCount > 0 ? 'cyber-red' : 'gray-500',
      unit: ''
    }
  ];

  return (
    <div className="neon-border rounded-lg p-4 bg-cyber-darker/80 backdrop-blur-sm">
      {/* 标题 */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-cyber-blue uppercase tracking-wider">
          AI Core
        </h2>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-cyber-green animate-pulse" />
          <span className="text-xs text-cyber-green">ONLINE</span>
        </div>
      </div>

      {/* AI Core 中心节点 */}
      <div className="flex justify-center mb-4">
        <div className="relative">
          {/* 脉冲环 */}
          <div className="absolute inset-0 rounded-full bg-cyber-blue/20 pulse-ring" />
          <div className="absolute inset-0 rounded-full bg-cyber-blue/10 pulse-ring" style={{ animationDelay: '0.5s' }} />
          
          {/* 核心图标 */}
          <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-cyber-blue/30 to-cyber-purple/30 flex items-center justify-center border-2 border-cyber-blue/50 animate-pulse-glow">
            <span className="text-3xl">🧠</span>
          </div>
        </div>
      </div>

      {/* 指标列表 */}
      <div className="space-y-3">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between p-2 rounded bg-cyber-dark/50"
          >
            <div className="flex items-center gap-2">
              <metric.icon size={14} className={`text-${metric.color}`} />
              <span className="text-xs text-gray-400">{metric.label}</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className={`text-lg font-bold text-${metric.color}`}>
                {metric.value}
              </span>
              <span className="text-xs text-gray-500">{metric.unit}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Token 使用量 */}
      <div className="mt-4 pt-3 border-t border-cyber-blue/20">
        <div className="text-xs text-gray-500 mb-2">Token Usage</div>
        <div className="flex gap-4">
          <div className="flex-1">
            <div className="text-xs text-gray-400">Input</div>
            <div className="text-sm font-mono text-cyber-blue">
              {aiCore.tokenUsage.input.toLocaleString()}
            </div>
          </div>
          <div className="flex-1">
            <div className="text-xs text-gray-400">Output</div>
            <div className="text-sm font-mono text-cyber-green">
              {aiCore.tokenUsage.output.toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AICorePanel;
