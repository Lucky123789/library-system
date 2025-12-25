/**
 * WebSocket 工具模块
 * 用于管理 WebSocket 连接和广播消息
 */

// 存储所有连接的客户端
let clients = new Set();

// 保存 WebSocketServer 实例
let wss = null;

/**
 * 设置 WebSocketServer 实例
 * @param {WebSocketServer} server - WebSocketServer 实例
 */
export const setWebSocketServer = (server) => {
  wss = server;
};

/**
 * 获取 WebSocketServer 实例
 * @returns {WebSocketServer} WebSocketServer 实例
 */
export const getWebSocketServer = () => {
  return wss;
};

/**
 * 添加客户端连接
 * @param {WebSocket} ws - WebSocket 连接
 */
export const addClient = (ws) => {
  clients.add(ws);
  console.log(`✅ Client connected. Total clients: ${clients.size}`);
};

/**
 * 移除客户端连接
 * @param {WebSocket} ws - WebSocket 连接
 */
export const removeClient = (ws) => {
  clients.delete(ws);
  console.log(`❌ Client disconnected. Total clients: ${clients.size}`);
};

/**
 * 广播消息给所有连接的客户端
 * @param {Object} data - 要广播的数据
 */
export const broadcast = (data) => {
  const message = JSON.stringify(data);
  let sentCount = 0;
  
  clients.forEach((client) => {
    if (client.readyState === 1) { // WebSocket.OPEN
      client.send(message);
      sentCount++;
    }
  });
  
  console.log(`📢 Broadcasting message to ${sentCount} client(s):`, data);
};

