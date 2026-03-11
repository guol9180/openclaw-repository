import { useData } from '../App';
import { motion } from 'framer-motion';
import { HardDrive, MemoryStick, Wifi, Clock } from 'lucide-react';

function SystemStatus() {
  const { system } = useData();

  if (!system) {
    return (
      <div className="neon-border rounded-lg p-4 bg-cyber-darker/80">
        <div className="text-center text-gray-500">Loading...</div>
      </div>
    );
  }

  const formatBytes = (bytes: number) => {
    const gb = bytes / (1024 * 1024 * 1024);
    return `${gb.toFixed(1)} GB`;
  };

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${mins}m`;
  };

  const metrics = [
    {
      label: 'CPU',
      value: system.cpu,
      icon: HardDrive,
      color: system.cpu > 80 ? 'cyber-red' : system.cpu > 50 ? 'cyber-orange' : 'cyber-blue'
    },
    {
      label: 'Memory',
      value: system.memory.percentage,
      detail: `${formatBytes(system.memory.used)} / ${formatBytes(system.memory.total)}`,
      icon: MemoryStick,
      color: system.memory.percentage > 80 ? 'cyber-red' : system.memory.percentage > 50 ? 'cyber-orange' : 'cyber-green'
    },
    {
      label: 'Disk',
      value: system.disk.percentage,
      icon: HardDrive,
      color: system.disk.percentage > 80 ? 'cyber-red' : system.disk.percentage > 50 ? 'cyber-orange' : 'cyber-blue'
    }
  ];

  return (
    <div className="neon-border rounded-lg p-4 bg-cyber-darker/80 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-cyber-blue uppercase tracking-wider">
          System Status
        </h2>
      </div>

      {/* 资源使用条 */}
      <div className="space-y-4">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <metric.icon size={14} className={`text-${metric.color}`} />
                <span className="text-xs text-gray-400">{metric.label}</span>
              </div>
              <span className={`text-xs font-mono text-${metric.color}`}>
                {metric.value.toFixed(1)}%
              </span>
            </div>
            
            {/* 进度条 */}
            <div className="h-2 bg-cyber-dark rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${metric.value}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className={`h-full bg-gradient-to-r from-${metric.color}/50 to-${metric.color} rounded-full`}
                style={{
                  boxShadow: `0 0 10px var(--${metric.color.replace('cyber-', '')})`
                }}
              />
            </div>
            
            {metric.detail && (
              <div className="text-xs text-gray-500 mt-1">{metric.detail}</div>
            )}
          </motion.div>
        ))}
      </div>

      {/* 网络和运行时间 */}
      <div className="mt-4 pt-3 border-t border-cyber-blue/20 grid grid-cols-2 gap-4">
        <div>
          <div className="flex items-center gap-1 mb-1">
            <Wifi size={12} className="text-cyber-green" />
            <span className="text-xs text-gray-400">Network</span>
          </div>
          <div className="text-xs font-mono">
            <span className="text-cyber-green">↓{(system.network.rx_sec / 1024).toFixed(1)} KB/s</span>
            <span className="mx-1 text-gray-600">|</span>
            <span className="text-cyber-blue">↑{(system.network.tx_sec / 1024).toFixed(1)} KB/s</span>
          </div>
        </div>
        <div>
          <div className="flex items-center gap-1 mb-1">
            <Clock size={12} className="text-cyber-purple" />
            <span className="text-xs text-gray-400">Uptime</span>
          </div>
          <div className="text-xs font-mono text-cyber-purple">
            {formatUptime(system.uptime)}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SystemStatus;
