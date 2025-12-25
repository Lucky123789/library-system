/**
 * WebSocket 初始化模块
 * 连接到 WebSocket 服务器，收到消息后通过 CustomEvent 分发
 */

/**
 * 初始化 WebSocket 连接
 */
export function initWS() {
  // 确定 WebSocket 地址
  const wsHost = import.meta.env.DEV 
    ? 'localhost:4000' 
    : `${window.location.hostname}:4000`;
  
  const wsUrl = `ws://${wsHost}`;
  
  try {
    const ws = new WebSocket(wsUrl);

    // 明确注册 onopen 监听
    ws.onopen = () => {
      console.log('WS connected');
      console.log('WebSocket message listener added');
    };

    // 明确注册 onmessage 监听
    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        // 打印收到的完整消息对象
        console.log('Received WebSocket message:', msg);
        
        // 分发消息到 window
        window.dispatchEvent(new CustomEvent('ws-message', { detail: msg }));
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket connection closed');
      // 可选：尝试重连
      setTimeout(() => {
        console.log('Attempting to reconnect WebSocket...');
        initWS();
      }, 3000);
    };

    // 将 ws 实例保存到 window，方便调试
    window.__ws = ws;
  } catch (error) {
    console.error('WebSocket connection failed:', error);
  }
}

