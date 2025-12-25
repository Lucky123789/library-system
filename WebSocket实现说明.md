# WebSocket 实时更新实现说明

## ✅ 已完成的修改

### 1. 新建文件：`client/src/ws.js`

创建了 WebSocket 初始化模块，实现 `initWS()` 函数：

```javascript
// 连接 ws://localhost:4000（开发环境）或 ws://${window.location.hostname}:4000（生产环境）
// 收到消息后通过 window.dispatchEvent 分发 CustomEvent
```

**关键特性：**
- 自动连接 WebSocket 服务器
- 收到消息后触发 `ws-message` CustomEvent
- 连接断开后自动重连（3秒后）
- 控制台打印 "✅ WS connected"

### 2. 修改文件：`client/src/main.jsx`

**修改内容：**
- 导入 `initWS` 函数
- 在文件顶部调用 `initWS()` 初始化 WebSocket 连接
- 控制台会打印 "✅ WS connected"

**代码差异：**
```diff
+ import { initWS } from './ws';
+ 
+ // 初始化 WebSocket 连接
+ initWS();
```

### 3. 修改文件：`client/src/components/BookList.jsx`

**修改内容：**
- 移除了 `wsService` 的导入
- 使用 `window.addEventListener('ws-message', handler)` 监听 WebSocket 消息
- 在 `useEffect` 中添加监听器（相当于 Vue 的 `onMounted`）
- 在 `useEffect` 的清理函数中移除监听器（相当于 Vue 的 `onBeforeUnmount`）
- 当收到 `booksUpdated` 消息时，调用 `fetchBooks()` 刷新图书列表

**代码差异：**
```diff
- import wsService from '../services/websocket';

  // 在 useEffect 中：
- wsService.on('booksUpdated', handleBooksUpdated);
- return () => { wsService.off('booksUpdated', handleBooksUpdated); };
+ const handler = (e) => {
+   if (e.detail.type === 'booksUpdated') {
+     fetchBooks();
+   }
+ };
+ window.addEventListener('ws-message', handler);
+ return () => { window.removeEventListener('ws-message', handler); };
```

### 4. 修改文件：`client/src/components/MyBorrowings.jsx`

**修改内容：**
- 移除了 `wsService` 的导入
- 使用 `window.addEventListener('ws-message', handler)` 监听 WebSocket 消息
- 当收到 `booksUpdated` 消息时，调用 `fetchBorrowings()` 刷新借阅记录

**代码差异：**
```diff
- import wsService from '../services/websocket';

  // 在 useEffect 中：
- wsService.on('booksUpdated', handleBooksUpdated);
- return () => { wsService.off('booksUpdated', handleBooksUpdated); };
+ const handler = (e) => {
+   if (e.detail.type === 'booksUpdated') {
+     fetchBorrowings();
+   }
+ };
+ window.addEventListener('ws-message', handler);
+ return () => { window.removeEventListener('ws-message', handler); };
```

### 5. 修改文件：`client/src/App.jsx`

**修改内容：**
- 移除了 `wsService` 的导入和相关代码
- 移除了根据用户登录状态连接/断开 WebSocket 的逻辑（现在在 main.jsx 中全局初始化）

**代码差异：**
```diff
- import wsService from './services/websocket';
- import React, { useEffect } from 'react';
+ import React from 'react';

- // 移除了 useEffect 中的 wsService.connect() 和 disconnect()
- wsService.disconnect(); // 在 handleLogout 中移除
```

## 📋 完整文件内容

### `client/src/ws.js`（新建）

```javascript
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
  
  console.log(`正在连接 WebSocket: ${wsUrl}`);
  
  try {
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('✅ WS connected');
      // 可以发送连接成功事件（可选）
      window.dispatchEvent(new CustomEvent('ws-message', {
        detail: { type: 'connected', message: 'WebSocket 连接成功' }
      }));
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        // 分发消息到 window
        window.dispatchEvent(new CustomEvent('ws-message', { detail: msg }));
      } catch (error) {
        console.error('解析 WebSocket 消息失败:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket 错误:', error);
    };

    ws.onclose = () => {
      console.log('❌ WebSocket 连接关闭');
      // 可选：尝试重连
      setTimeout(() => {
        console.log('尝试重新连接 WebSocket...');
        initWS();
      }, 3000);
    };

    // 将 ws 实例保存到 window，方便调试（可选）
    window.__ws = ws;
  } catch (error) {
    console.error('WebSocket 连接失败:', error);
  }
}
```

## 🧪 验证步骤

### 准备工作

1. **启动后端服务器**
   ```bash
   cd server
   npm start
   ```
   确保后端运行在 `http://localhost:4000`

2. **启动前端开发服务器**
   ```bash
   cd client
   npm run dev
   ```
   确保前端运行在 `http://localhost:5173`

3. **确保 MongoDB 运行**
   ```bash
   # 检查 MongoDB 是否运行
   mongosh
   ```

### 验证流程

1. **打开第一个浏览器窗口（窗口 A）**
   - 访问 `http://localhost:5173`
   - 打开浏览器开发者工具（F12），查看 Console 标签
   - 应该看到 "✅ WS connected" 日志
   - 注册或登录账号
   - 进入"图书列表"页面

2. **打开第二个浏览器窗口（窗口 B）**
   - 访问 `http://localhost:5173`（或使用无痕模式）
   - 打开浏览器开发者工具（F12），查看 Console 标签
   - 应该看到 "✅ WS connected" 日志
   - 使用**不同的账号**登录（或注册新账号）
   - 进入"图书列表"页面

3. **测试借书功能**
   - 在**窗口 A** 中，点击某本图书的"借阅"按钮
   - 观察**窗口 B**：
     - ✅ 图书列表应该自动刷新（不需要手动刷新页面）
     - ✅ 可借册数应该减少
   - 在**窗口 B** 中，切换到"我的借阅"页面：
     - ✅ 应该能看到窗口 A 的借阅记录（如果使用同一账号）
     - ✅ 或者图书列表的可借册数已更新（如果使用不同账号）

4. **测试还书功能**
   - 在**窗口 A** 中，进入"我的借阅"页面
   - 点击某本已借阅图书的"归还"按钮
   - 观察**窗口 B**：
     - ✅ 如果窗口 B 在"图书列表"页面，可借册数应该自动增加
     - ✅ 如果窗口 B 在"我的借阅"页面，借阅记录应该自动更新

5. **验证控制台日志**
   - 在两个窗口的 Console 中，应该能看到：
     - `✅ WS connected` - 连接成功
     - 当有借书/还书操作时，可能会看到 WebSocket 消息（取决于后端实现）

### 预期结果

✅ **窗口 A 借书/还书后，窗口 B 不刷新，图书列表和"我的借阅"自动更新**

### 故障排查

如果 WebSocket 没有工作：

1. **检查后端是否运行**
   - 访问 `http://localhost:4000/health` 应该返回 `{"status":"ok"}`

2. **检查控制台错误**
   - 查看浏览器 Console 是否有 WebSocket 连接错误
   - 检查是否有 CORS 或网络错误

3. **检查后端 WebSocket**
   - 查看后端控制台，应该能看到 "✅ 新的 WebSocket 连接" 日志

4. **手动测试 WebSocket**
   - 在浏览器 Console 中执行：
     ```javascript
     window.__ws  // 应该能看到 WebSocket 实例
     window.__ws.readyState  // 应该是 1 (OPEN)
     ```

## 📝 技术说明

### 实现方式

- **最小改动**：使用原生 `window.addEventListener` 和 `CustomEvent`，不依赖额外的库
- **全局初始化**：在 `main.jsx` 中初始化，应用启动时自动连接
- **事件驱动**：通过 `window.dispatchEvent` 分发消息，组件通过 `addEventListener` 监听
- **自动清理**：使用 React 的 `useEffect` 清理函数自动移除事件监听器

### 与原有代码的区别

- **之前**：使用 `wsService` 单例，通过 `.on()` 和 `.off()` 管理事件
- **现在**：使用原生 DOM 事件系统，通过 `window.addEventListener` 监听 `ws-message` 事件

### 优势

1. ✅ 更简单，不依赖额外的服务类
2. ✅ 更符合原生 Web API 标准
3. ✅ 易于调试（可以通过浏览器事件监听器查看）
4. ✅ 最小改动，不影响其他功能

