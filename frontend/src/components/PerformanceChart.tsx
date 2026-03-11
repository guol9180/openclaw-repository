import { useData } from '../App';
import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { motion } from 'framer-motion';

function PerformanceChart() {
  const { aiCore } = useData();

  // 生成模拟历史数据
  const chartData = useMemo(() => {
    const now = Date.now();
    const points = 30; // 30秒数据
    
    const requestsData = [];
    const latencyData = [];
    
    for (let i = points; i >= 0; i--) {
      const time = now - i * 1000;
      requestsData.push({
        value: [time, Math.random() * 10 + 5]
      });
      latencyData.push({
        value: [time, Math.random() * 50 + 100]
      });
    }
    
    // 添加当前值
    if (aiCore) {
      requestsData.push({
        value: [aiCore.lastUpdate, aiCore.requestsPerSec]
      });
      latencyData.push({
        value: [aiCore.lastUpdate, aiCore.latency]
      });
    }
    
    return { requestsData, latencyData };
  }, [aiCore]);

  const option = {
    backgroundColor: 'transparent',
    grid: {
      top: 30,
      right: 10,
      bottom: 30,
      left: 40
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(10, 14, 26, 0.9)',
      borderColor: 'rgba(0, 212, 255, 0.3)',
      textStyle: {
        color: '#e0e6ed',
        fontFamily: 'JetBrains Mono'
      }
    },
    legend: {
      data: ['Requests/s', 'Latency'],
      textStyle: {
        color: '#9ca3af',
        fontFamily: 'JetBrains Mono',
        fontSize: 10
      },
      top: 0,
      right: 0
    },
    xAxis: {
      type: 'time',
      axisLine: {
        lineStyle: { color: 'rgba(0, 212, 255, 0.3)' }
      },
      axisLabel: {
        color: '#6b7280',
        fontSize: 10,
        fontFamily: 'JetBrains Mono',
        formatter: (value: number) => {
          return new Date(value).toLocaleTimeString('zh-CN', {
            minute: '2-digit',
            second: '2-digit'
          });
        }
      },
      splitLine: {
        show: false
      }
    },
    yAxis: [
      {
        type: 'value',
        name: 'Req/s',
        nameTextStyle: {
          color: '#6b7280',
          fontSize: 10
        },
        axisLine: {
          lineStyle: { color: 'rgba(0, 212, 255, 0.3)' }
        },
        axisLabel: {
          color: '#6b7280',
          fontSize: 10
        },
        splitLine: {
          lineStyle: { color: 'rgba(0, 212, 255, 0.1)' }
        }
      },
      {
        type: 'value',
        name: 'ms',
        nameTextStyle: {
          color: '#6b7280',
          fontSize: 10
        },
        axisLine: {
          lineStyle: { color: 'rgba(0, 255, 136, 0.3)' }
        },
        axisLabel: {
          color: '#6b7280',
          fontSize: 10
        },
        splitLine: {
          show: false
        }
      }
    ],
    series: [
      {
        name: 'Requests/s',
        type: 'line',
        smooth: true,
        symbol: 'none',
        lineStyle: {
          color: '#00d4ff',
          width: 2
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(0, 212, 255, 0.3)' },
              { offset: 1, color: 'rgba(0, 212, 255, 0)' }
            ]
          }
        },
        data: chartData.requestsData
      },
      {
        name: 'Latency',
        type: 'line',
        smooth: true,
        symbol: 'none',
        yAxisIndex: 1,
        lineStyle: {
          color: '#00ff88',
          width: 2
        },
        data: chartData.latencyData
      }
    ]
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="neon-border rounded-lg p-4 bg-cyber-darker/80 backdrop-blur-sm"
    >
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-semibold text-cyber-blue uppercase tracking-wider">
          Performance
        </h2>
      </div>

      <ReactECharts
        option={option}
        style={{ height: '200px' }}
        opts={{ renderer: 'canvas' }}
      />
    </motion.div>
  );
}

export default PerformanceChart;
