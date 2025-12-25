# 图书管理系统

一个基于 React + Node.js + MongoDB 的全栈图书管理系统，支持用户注册/登录、图书管理、借阅/归还等功能，并使用 WebSocket 实现实时更新。

## 技术栈

### 前端
- React 18
- Vite
- React Router
- Axios
- WebSocket (ws)

### 后端
- Node.js
- Express
- MongoDB (Mongoose)
- JWT (jsonwebtoken)
- bcryptjs
- WebSocket (ws)

## 项目结构

```
图书管理系统/
├── server/                 # 后端项目
│   ├── config/            # 配置文件
│   │   └── db.js          # 数据库连接
│   ├── models/            # 数据模型
│   │   ├── User.js        # 用户模型
│   │   ├── Book.js        # 图书模型
│   │   └── Borrowing.js   # 借阅记录模型
│   ├── routes/            # 路由
│   │   ├── auth.js        # 认证路由
│   │   ├── books.js       # 图书路由
│   │   └── borrowings.js  # 借阅路由
│   ├── middleware/        # 中间件
│   │   └── auth.js        # 认证中间件
│   ├── utils/             # 工具函数
│   │   └── websocket.js   # WebSocket 工具
│   ├── server.js          # 服务器入口
│   ├── package.json       # 依赖配置
│   └── .env.example       # 环境变量示例
├── client/                # 前端项目
│   ├── src/
│   │   ├── components/    # 组件
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── BookList.jsx
│   │   │   ├── BookForm.jsx
│   │   │   └── MyBorrowings.jsx
│   │   ├── context/       # 上下文
│   │   │   └── AuthContext.jsx
│   │   ├── services/      # 服务
│   │   │   ├── api.js
│   │   │   └── websocket.js
│   │   ├── App.jsx        # 主应用组件
│   │   ├── main.jsx       # 入口文件
│   │   └── index.css      # 样式文件
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## 安装和运行

### 前置要求

- Node.js (v16 或更高版本)
- MongoDB (本地安装或使用 MongoDB Atlas)

### 1. 安装后端依赖

```bash
cd server
npm install
```

### 2. 配置后端环境变量

在 `server` 目录下创建 `.env` 文件（参考 `.env.example`）：

```env
MONGODB_URI=mongodb://localhost:27017/book-management
JWT_SECRET=your-secret-key-change-this-in-production
PORT=4000
```

### 3. 启动后端服务器

```bash
cd server
npm start
# 或开发模式（自动重启）
npm run dev
```

后端服务器将在 `http://localhost:4000` 启动。

### 4. 安装前端依赖

```bash
cd client
npm install
```

### 5. 启动前端开发服务器

```bash
cd client
npm run dev
```

前端应用将在 `http://localhost:5173` 启动。

## 功能说明

### 用户功能

1. **注册/登录**
   - 用户可以使用用户名或邮箱登录
   - 密码使用 bcrypt 加密存储
   - 使用 JWT 进行身份认证

2. **浏览图书**
   - 查看所有图书列表
   - 支持按书名、作者、ISBN 搜索
   - 分页显示

3. **借阅图书**
   - 普通用户可以借阅有库存的图书
   - 系统自动检查库存和重复借阅

4. **我的借阅**
   - 查看自己的所有借阅记录
   - 可以归还已借阅的图书

### 管理员功能

1. **图书管理（CRUD）**
   - 添加新图书
   - 编辑图书信息
   - 删除图书（需确保无未归还记录）
   - 管理图书库存

2. **实时更新**
   - 通过 WebSocket 实时接收图书更新通知
   - 借书/还书后自动刷新列表

## API 接口

### 认证接口

- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/me` - 获取当前用户信息

### 图书接口

- `GET /api/books` - 获取图书列表（支持分页和搜索）
- `GET /api/books/:id` - 获取单本图书
- `POST /api/books` - 创建图书（管理员）
- `PUT /api/books/:id` - 更新图书（管理员）
- `DELETE /api/books/:id` - 删除图书（管理员）

### 借阅接口

- `GET /api/borrowings` - 获取我的借阅记录
- `POST /api/borrowings` - 借阅图书
- `PUT /api/borrowings/:id/return` - 归还图书

## WebSocket 事件

- `booksUpdated` - 当有图书被借阅或归还时，服务器会广播此事件，客户端自动刷新列表

## 默认管理员账号

系统默认所有新注册用户都是普通用户。如需创建管理员账号，可以在 MongoDB 中手动修改用户角色：

```javascript
db.users.updateOne(
  { username: "your-username" },
  { $set: { role: "admin" } }
)
```

## 注意事项

1. 确保 MongoDB 服务已启动
2. 生产环境请修改 JWT_SECRET 为强密码
3. 建议使用环境变量管理敏感信息
4. WebSocket 连接在用户登录后自动建立

## 开发说明

- 后端使用 ES6 模块（`type: "module"`）
- 前端使用 React Hooks 和 Context API
- 所有 API 请求都通过 axios 拦截器自动添加 token
- WebSocket 连接在用户登录后建立，登出后断开

## 许可证

ISC

