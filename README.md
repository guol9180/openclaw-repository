# 🦀 OpenClaw 控制中心

赛博朋克风格的 AI Agent 实时监控面板。

![Dashboard Preview](./preview.png)

## 功能特性

- **AI 核心面板** - 监控每秒请求数、延迟、活跃任务、Token 使用量
- **网络拓扑图** - MCP/Skills/Tools 网络结构的 2D 可视化
- **系统状态** - CPU、内存、磁盘、网络使用监控
- **事件日志** - 实时滚动日志流
- **性能图表** - 历史指标可视化

## 技术栈

### 后端
- Node.js + Fastify
- Socket.io (WebSocket)
- SystemInformation

### 前端
- React 18 + TypeScript
- TailwindCSS
- PixiJS (2D 图形)
- ECharts (图表)
- Framer Motion (动画)

## 快速开始

```bash
# 安装依赖
npm run install:all

# 开发模式
npm run dev

# 生产构建
npm run build
npm start
```

## 系统架构

```
OpenClaw
   │
   │ 日志 / CLI / 事件
   ▼
事件收集器
   │
后端 API 服务器 (Fastify + Socket.io)
   │
WebSocket (1秒间隔)
   ▼
前端面板 UI (React + PixiJS)
```

## 面板模块

### 1. AI 核心面板
- 每秒请求数
- 延迟 (ms)
- 活跃任务数
- 错误计数
- Token 使用量 (输入/输出)

### 2. 网络拓扑图
交互式 2D 网络拓扑，展示：
- OpenClaw AI 核心
- MCP 服务器
- Skills 引擎
- Web 工具
- 浏览器自动化

功能：
- 点击节点查看详情
- 数据流动画粒子
- 实时活动高亮

### 3. 系统状态
- CPU 使用率（颜色编码）
- 内存使用
- 磁盘使用
- 网络 I/O
- 系统运行时间

### 4. 事件日志
实时日志流，包含：
- 类型图标（请求、MCP、技能、响应、错误）
- 颜色编码级别
- 自动滚动
- 时间戳显示

### 5. 性能图表
- 请求数/秒趋势线
- 延迟趋势线
- 30秒滚动窗口

## API 接口

| 接口 | 描述 |
|------|------|
| `GET /api/status` | 完整系统状态 |
| `GET /api/metrics/ai-core` | AI 核心指标 |
| `GET /api/network` | 网络拓扑 |
| `GET /api/logs` | 最近日志 |
| `GET /api/metrics/history` | 历史指标 |

## WebSocket 事件

### 客户端 → 服务器
- `node:click` - 请求节点详情

### 服务器 → 客户端
- `init` - 连接时初始数据
- `metrics` - 指标更新（1秒间隔）
- `log` - 新日志条目
- `network:update` - 网络活动
- `node:details` - 节点信息

## 开发

```bash
# 仅后端
cd backend && npm run dev

# 仅前端
cd frontend && npm run dev
```

## 生产部署

```bash
# 构建前端
cd frontend && npm run build

# 启动服务器（从 dist/ 提供前端）
cd backend && npm start
```

## 配置

环境变量：
- `PORT` - 服务器端口（默认：3001）
- `HOST` - 服务器主机（默认：0.0.0.0）

## 许可证

MIT
