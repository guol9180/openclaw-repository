# 🦀 OpenClaw Control Center

Real-time AI Agent Monitoring Dashboard with Cyberpunk UI.

![Dashboard Preview](./preview.png)

## Features

- **AI Core Panel** - Monitor requests/sec, latency, active tasks, and token usage
- **Network Map** - 2D visualization of MCP/Skills/Tools network topology
- **System Status** - CPU, Memory, Disk, Network usage monitoring
- **Event Log** - Real-time scrolling log stream
- **Performance Charts** - Historical metrics visualization

## Tech Stack

### Backend
- Node.js + Fastify
- Socket.io (WebSocket)
- SystemInformation

### Frontend
- React 18 + TypeScript
- TailwindCSS
- PixiJS (2D Graphics)
- ECharts (Charts)
- Framer Motion (Animations)

## Quick Start

```bash
# Install dependencies
npm run install:all

# Development mode
npm run dev

# Production build
npm run build
npm start
```

## Architecture

```
OpenClaw
   │
   │ logs / CLI / events
   ▼
Event Collector
   │
Backend API Server (Fastify + Socket.io)
   │
WebSocket (1s interval)
   ▼
Frontend Dashboard UI (React + PixiJS)
```

## Dashboard Modules

### 1. AI Core Panel
- Requests per second
- Latency (ms)
- Active tasks
- Error count
- Token usage (input/output)

### 2. Network Map
Interactive 2D network topology showing:
- OpenClaw AI Core
- MCP Servers
- Skills Engine
- Web Tools
- Browser Automation

Features:
- Click nodes for details
- Animated data flow particles
- Real-time activity highlighting

### 3. System Status
- CPU usage (with color coding)
- Memory usage
- Disk usage
- Network I/O
- System uptime

### 4. Event Log
Real-time log stream with:
- Type icons (request, mcp, skill, response, error)
- Color-coded levels
- Auto-scroll
- Timestamp display

### 5. Performance Chart
- Requests/sec trend line
- Latency trend line
- 30-second rolling window

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/status` | Full system status |
| `GET /api/metrics/ai-core` | AI core metrics |
| `GET /api/network` | Network topology |
| `GET /api/logs` | Recent logs |
| `GET /api/metrics/history` | Historical metrics |

## WebSocket Events

### Client → Server
- `node:click` - Request node details

### Server → Client
- `init` - Initial data on connect
- `metrics` - Metrics update (1s interval)
- `log` - New log entry
- `network:update` - Network activity
- `node:details` - Node information

## Development

```bash
# Backend only
cd backend && npm run dev

# Frontend only
cd frontend && npm run dev
```

## Production

```bash
# Build frontend
cd frontend && npm run build

# Start server (serves frontend from dist/)
cd backend && npm start
```

## Configuration

Environment variables:
- `PORT` - Server port (default: 3001)
- `HOST` - Server host (default: 0.0.0.0)

## License

MIT
