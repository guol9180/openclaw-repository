import { motion } from 'framer-motion';
import AICorePanel from './AICorePanel';
import NetworkMap from './NetworkMap';
import SystemStatus from './SystemStatus';
import EventLog from './EventLog';
import PerformanceChart from './PerformanceChart';

function Dashboard() {
  return (
    <div className="min-h-screen p-4 scanlines">
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-3xl font-bold text-cyber-blue neon-text">
              🦀 OpenClaw Control Center
            </div>
            <div className="text-sm text-gray-500">
              AI Agent Monitoring System v1.0
            </div>
          </div>
          <div className="text-xs text-gray-600 font-mono">
            {new Date().toLocaleString('zh-CN')}
          </div>
        </div>
      </motion.header>

      {/* Main Grid */}
      <div className="grid grid-cols-12 gap-4">
        {/* 左侧 - AI Core & System Status */}
        <div className="col-span-3 space-y-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <AICorePanel />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <SystemStatus />
          </motion.div>
        </div>

        {/* 中间 - Network Map */}
        <div className="col-span-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="h-full"
          >
            <NetworkMap />
          </motion.div>
        </div>

        {/* 右侧 - Event Log & Performance */}
        <div className="col-span-3 space-y-4">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <EventLog />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <PerformanceChart />
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <motion.footer 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-4 text-center text-xs text-gray-600"
      >
        <span className="text-cyber-blue">●</span> Real-time monitoring 
        <span className="mx-2">|</span>
        WebSocket connected
        <span className="mx-2">|</span>
        Update: 1s interval
      </motion.footer>
    </div>
  );
}

export default Dashboard;
