import { AIRoom } from './scenes/AIRoom';

function App() {
  return <AIRoom />;
}

export default App;

    newSocket.on('disconnect', () => {
      console.log('与服务器断开连接');
      setConnected(false);
    });

    // 初始数据
    newSocket.on('init', (initData) => {
      setData(prev => ({
        ...prev,
        network: initData.nodes,
        system: initData.systemStatus,
        logs: initData.recentLogs || []
      }));
    });

    // 实时指标
    newSocket.on('metrics', (metrics) => {
      setData(prev => ({
        ...prev,
        aiCore: metrics.aiCore,
        system: metrics.system
      }));
    });

    // 实时日志
    newSocket.on('log', (log) => {
      setData(prev => ({
        ...prev,
        logs: [log, ...prev.logs].slice(0, 100)
      }));
    });

    // 网络更新
    newSocket.on('network:update', (update) => {
      // 可以在这里更新网络动画状态
      console.log('Network update:', update);
    });

    // 节点详情
    newSocket.on('node:details', (details) => {
      setData(prev => ({
        ...prev,
        nodeDetails: details
      }));
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      <DataContext.Provider value={data}>
        <div className="min-h-screen bg-cyber-darker">
          {/* 连接状态指示器 */}
          <div className="fixed top-4 right-4 z-50">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
              connected 
                ? 'bg-cyber-green/20 text-cyber-green border border-cyber-green/30' 
                : 'bg-cyber-red/20 text-cyber-red border border-cyber-red/30'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                connected ? 'bg-cyber-green animate-pulse' : 'bg-cyber-red'
              }`} />
              {connected ? 'LIVE' : 'OFFLINE'}
            </div>
          </div>
          
          <Dashboard />
        </div>
      </DataContext.Provider>
    </SocketContext.Provider>
  );
}

export default App;
