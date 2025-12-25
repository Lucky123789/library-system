import express from 'express';
import http from 'http';
import { WebSocketServer } from 'ws';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import bookRoutes from './routes/books.js';
import borrowingRoutes from './routes/borrowings.js';
import { addClient, removeClient, setWebSocketServer } from './utils/websocket.js';

// 加载环境变量
dotenv.config();

// 连接数据库
connectDB();

// 创建 Express 应用
const app = express();
const PORT = process.env.PORT || 4000;

// 创建 HTTP 服务器
const server = http.createServer(app);

// 创建 WebSocket 服务器
const wss = new WebSocketServer({ server });

// 保存 WebSocketServer 实例
setWebSocketServer(wss);

/**
 * WebSocket 连接处理
 */
wss.on('connection', (ws) => {
  console.log('✅ Client connection successful');
  addClient(ws);

  // 发送欢迎消息
  ws.send(JSON.stringify({ type: 'connected', message: 'WebSocket connected successfully' }));

  // 处理客户端消息
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      console.log('收到消息:', data);
    } catch (error) {
      console.error('解析消息失败:', error);
    }
  });

  // 处理连接关闭
  ws.on('close', () => {
    console.log('❌ WebSocket connection closed');
    removeClient(ws);
  });

  // 处理错误
  ws.on('error', (error) => {
    console.error('WebSocket 错误:', error);
    removeClient(ws);
  });
});

// 中间件
app.use(cors()); // 允许跨域请求
app.use(express.json()); // 解析 JSON 请求体

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/borrowings', borrowingRoutes);

// 健康检查路由
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running normally' });
});

// 404 处理
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({ 
    message: 'Internal server error', 
    error: process.env.NODE_ENV === 'development' ? err.message : '服务器错误' 
  });
});

// 启动服务器
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 WebSocket server started`);
});

// 导出 app 和 broadcast 函数供其他模块使用
export { app };

