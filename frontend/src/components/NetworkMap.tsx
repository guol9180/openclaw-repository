import { useData, useSocket } from '../App';
import { motion, AnimatePresence } from 'framer-motion';
import { useRef, useEffect } from 'react';

function NetworkMap() {
  const { network, nodeDetails } = useData();
  const socket = useSocket();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 节点颜色配置
  const nodeColors = {
    core: { bg: '#00d4ff', glow: 'rgba(0, 212, 255, 0.3)' },
    tool: { bg: '#00ff88', glow: 'rgba(0, 255, 136, 0.3)' },
    skill: { bg: '#ff8800', glow: 'rgba(255, 136, 0, 0.3)' },
    mcp: { bg: '#8844ff', glow: 'rgba(136, 68, 255, 0.3)' }
  };

  // Canvas 绘制
  useEffect(() => {
    if (!network || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 设置 canvas 尺寸
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    let animationId: number;
    let particles: Array<{
      from: string;
      to: string;
      progress: number;
      speed: number;
    }> = [];

    // 添加粒子
    const addParticle = (from: string, to: string) => {
      particles.push({
        from,
        to,
        progress: 0,
        speed: 0.02 + Math.random() * 0.02
      });
    };

    // 随机生成粒子
    setInterval(() => {
      if (network.links.length > 0) {
        const link = network.links[Math.floor(Math.random() * network.links.length)];
        addParticle(link.from, link.to);
        if (Math.random() > 0.5) {
          addParticle(link.to, link.from);
        }
      }
    }, 500);

    // 绘制函数
    const draw = () => {
      ctx.clearRect(0, 0, rect.width, rect.height);

      // 绘制连接线
      network.links.forEach(link => {
        const fromNode = network.nodes.find(n => n.id === link.from);
        const toNode = network.nodes.find(n => n.id === link.to);
        if (!fromNode || !toNode) return;

        // 缩放坐标
        const scale = rect.width / 800;
        const fromX = fromNode.x * scale;
        const fromY = fromNode.y * scale;
        const toX = toNode.x * scale;
        const toY = toNode.y * scale;

        // 绘制线条
        ctx.beginPath();
        ctx.moveTo(fromX, fromY);
        ctx.lineTo(toX, toY);
        ctx.strokeStyle = 'rgba(0, 212, 255, 0.2)';
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // 绘制粒子
      particles = particles.filter(p => p.progress < 1);
      particles.forEach(particle => {
        const fromNode = network.nodes.find(n => n.id === particle.from);
        const toNode = network.nodes.find(n => n.id === particle.to);
        if (!fromNode || !toNode) return;

        const scale = rect.width / 800;
        const x = (fromNode.x + (toNode.x - fromNode.x) * particle.progress) * scale;
        const y = (fromNode.y + (toNode.y - fromNode.y) * particle.progress) * scale;

        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#00ff88';
        ctx.fill();

        // 发光效果
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 255, 136, 0.3)';
        ctx.fill();

        particle.progress += particle.speed;
      });

      // 绘制节点
      network.nodes.forEach(node => {
        const scale = rect.width / 800;
        const x = node.x * scale;
        const y = node.y * scale;
        const colors = nodeColors[node.type];
        const radius = node.type === 'core' ? 35 : 25;

        // 发光效果
        if (node.active) {
          ctx.beginPath();
          ctx.arc(x, y, radius + 10, 0, Math.PI * 2);
          ctx.fillStyle = colors.glow;
          ctx.fill();
        }

        // 节点背景
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, colors.bg);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.5)');
        ctx.fillStyle = gradient;
        ctx.fill();

        // 边框
        ctx.strokeStyle = colors.bg;
        ctx.lineWidth = 2;
        ctx.stroke();

        // 标签
        ctx.fillStyle = '#fff';
        ctx.font = '10px JetBrains Mono';
        ctx.textAlign = 'center';
        ctx.fillText(node.label, x, y + radius + 15);

        // 图标
        ctx.font = `${node.type === 'core' ? '20' : '16'}px serif`;
        ctx.fillText(
          node.type === 'core' ? '🧠' :
          node.type === 'tool' ? '🔧' :
          node.type === 'skill' ? '⚡' : '🔌',
          x,
          y + 5
        );
      });

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [network]);

  // 处理节点点击
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!network || !socket) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const scale = rect.width / 800;

    // 检查点击的节点
    for (const node of network.nodes) {
      const nodeX = node.x * scale;
      const nodeY = node.y * scale;
      const radius = node.type === 'core' ? 35 : 25;

      const distance = Math.sqrt((x - nodeX) ** 2 + (y - nodeY) ** 2);
      if (distance <= radius) {
        socket.emit('node:click', node.id);
        break;
      }
    }
  };

  return (
    <div className="neon-border rounded-lg p-4 bg-cyber-darker/80 backdrop-blur-sm h-full min-h-[500px]">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-cyber-blue uppercase tracking-wider">
          AI Network Map
        </h2>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-cyber-blue" />
            <span className="text-gray-400">Core</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-cyber-green" />
            <span className="text-gray-400">Tool</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-cyber-orange" />
            <span className="text-gray-400">Skill</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-cyber-purple" />
            <span className="text-gray-400">MCP</span>
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div className="relative w-full h-[420px] rounded bg-cyber-dark/50 overflow-hidden">
        <canvas
          ref={canvasRef}
          className="w-full h-full cursor-pointer"
          onClick={handleCanvasClick}
        />
      </div>

      {/* 节点详情弹窗 */}
      <AnimatePresence>
        {nodeDetails && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mt-4 p-3 rounded bg-cyber-dark/50 border border-cyber-blue/30"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-cyber-blue">
                {nodeDetails.node?.label}
              </span>
              <span className="text-xs text-gray-500">
                {nodeDetails.node?.type}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-4 text-xs">
              <div>
                <div className="text-gray-400">Calls</div>
                <div className="text-cyber-green font-mono">{nodeDetails.stats?.calls || 0}</div>
              </div>
              <div>
                <div className="text-gray-400">Avg Latency</div>
                <div className="text-cyber-blue font-mono">{nodeDetails.stats?.avgLatency?.toFixed(0) || 0}ms</div>
              </div>
              <div>
                <div className="text-gray-400">Errors</div>
                <div className="text-cyber-red font-mono">{nodeDetails.stats?.errors || 0}</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default NetworkMap;
