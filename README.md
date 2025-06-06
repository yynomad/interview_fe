# 面试助手前端

这是面试助手系统的前端部分，使用 Next.js 14 和 TypeScript 构建。

## 🚀 快速开始

### 安装依赖
```bash
npm install
```

### 开发模式
```bash
npm run dev
```

### 构建生产版本
```bash
npm run build
npm start
```

## 🛠️ 技术栈

- **Next.js 14**: React 框架，支持 App Router
- **TypeScript**: 类型安全的 JavaScript
- **Tailwind CSS**: 实用优先的 CSS 框架
- **Socket.IO Client**: WebSocket 客户端
- **React Hooks**: 状态管理和副作用处理

## 📁 项目结构

```
frontend/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── globals.css     # 全局样式
│   │   ├── layout.tsx      # 根布局
│   │   └── page.tsx        # 主页面
│   └── components/         # React 组件
│       └── ChatInterface.tsx
├── public/                 # 静态资源
├── package.json           # 项目配置
├── tailwind.config.js     # Tailwind 配置
└── tsconfig.json          # TypeScript 配置
```

## 🔧 配置

### 环境变量
复制 `.env.local.example` 为 `.env.local` 并配置：

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:5001
NEXT_PUBLIC_WS_URL=http://localhost:5001
```

### 后端连接
前端通过 WebSocket 连接到后端服务器：
- 健康检查: `http://localhost:5001/health`
- WebSocket: `ws://localhost:5001`

## 🎨 界面特性

### 实时聊天界面
- 💬 消息气泡样式
- 🎨 渐变背景
- 📱 响应式设计
- ⚡ 平滑动画

### 连接状态指示
- 🟢 已连接
- 🔴 连接断开
- ⚠️ 错误提示

### 交互功能
- ✨ 点击生成 AI 回答
- 🗑️ 清空对话记录
- 📜 自动滚动到底部

## 🔌 WebSocket 事件

### 监听事件
- `connect`: 连接成功
- `disconnect`: 连接断开
- `conversation_history`: 历史对话
- `new_conversation`: 新对话
- `conversation_updated`: 对话更新
- `error`: 错误消息

### 发送事件
- `request_answer`: 请求生成回答

## 🎯 开发指南

### 添加新组件
1. 在 `src/components/` 创建组件文件
2. 使用 TypeScript 定义 props 接口
3. 导入到需要的页面中

### 样式开发
- 使用 Tailwind CSS 类名
- 自定义样式写在 `globals.css`
- 响应式设计优先

### 状态管理
- 使用 React Hooks (useState, useEffect)
- WebSocket 连接状态管理
- 对话数据管理

## 🐛 故障排除

### 连接问题
1. 确认后端服务正在运行
2. 检查端口配置 (5001)
3. 查看浏览器控制台错误

### 样式问题
1. 确认 Tailwind CSS 正确配置
2. 检查 PostCSS 配置
3. 清除浏览器缓存

### 构建问题
1. 检查 TypeScript 类型错误
2. 确认所有依赖已安装
3. 查看构建日志

## 📚 相关文档

- [Next.js 文档](https://nextjs.org/docs)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)
- [Socket.IO 文档](https://socket.io/docs/v4/client-api/)
- [TypeScript 文档](https://www.typescriptlang.org/docs/)
