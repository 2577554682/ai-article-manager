# 📝 Article Manager

![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?logo=fastapi)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss)

一个基于 **FastAPI + React** 的全栈文章管理系统，支持用户认证、文章 CRUD、AI 智能助手和公开文章搜索。

---

## ✨ 功能概览

| 功能 | 说明 |
|---|---|
| 🔐 **用户认证** | 注册、登录、JWT Token 鉴权 |
| 📄 **文章管理** | 创建、编辑、删除、查看，支持公开/私密 |
| 🌐 **公开文章** | 浏览所有公开文章，支持搜索和分页 |
| 🤖 **AI 助手** | 自然语言管理文章，支持流式对话 |
| 📊 **仪表盘** | 文章统计、快捷操作 |

---

## 🏗 项目结构

```
fastapi_study/
├── backend/                          # FastAPI 后端
│   ├── main.py                       # 应用入口 + API 路由
│   ├── config.py                     # 环境变量配置
│   ├── database.py                   # 数据库连接
│   ├── models.py                     # SQLAlchemy 数据模型
│   ├── schemas.py                    # Pydantic 请求/响应模型
│   ├── auth.py                       # JWT 认证 + 密码加密
│   ├── agent.py                      # AI Agent 构建
│   ├── tools.py                      # AI 工具函数
│   ├── llm.py                        # LLM 模型配置
│   └── .env                          # 环境变量
│
├── article-manager-frontend/         # React 前端
│   └── src/
│       ├── pages/                    # 页面组件
│       ├── components/               # 通用组件
│       │   ├── ui/                   # UI 组件（按钮、弹窗等）
│       │   ├── layout/               # 布局组件（侧边栏、导航）
│       │   └── chat/                 # 聊天组件
│       ├── services/api.ts           # API 封装（Axios）
│       ├── store/authStore.ts        # 状态管理（Zustand）
│       ├── hooks/                    # 自定义 Hooks
│       └── types/index.ts            # TypeScript 类型定义
│
└── requirements.txt                  # Python 依赖
```

---

## 🚀 快速开始

### 环境要求

- Python 3.12+
- Node.js 18+
- Ollama（本地 AI 模型，可选）

### 1. 后端启动

```bash
# 安装依赖
pip install -r requirements.txt

# 配置环境变量
cd backend
cp .env .env.local  # 修改 SECRET_KEY 等配置

# 启动服务
python main.py
```

后端默认运行在 **http://localhost:8000**，自动重载。

### 2. 前端启动

```bash
cd article-manager-frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

前端默认运行在 **http://localhost:5173**。

### 3. AI 助手（可选）

如需使用 AI 聊天功能，需要启动本地模型服务：

```bash
# 启动 Ollama（如果使用本地模型）
ollama serve

# 拉取模型
ollama pull qwen2.5:7b
```

在 `.env` 中配置模型：

```env
MODEL=qwen2.5:7b
BASE_URL=http://localhost:11434/v1
API_KEY=ollama
```

也可以使用云端 API（如 DeepSeek）：

```env
MODEL=deepseek-v4-flash
BASE_URL=https://api.deepseek.com
API_KEY=sk-your-api-key
```

### 一键启动

桌面快捷方式：

- **启动项目.bat** — 同时启动前后端
- **关闭项目.bat** — 停止前后端

---

## 🔧 环境变量说明

| 变量 | 说明 | 默认值 |
|---|---|---|
| `DATABASE_URL` | 数据库连接地址 | `sqlite+aiosqlite:///./langchain.db` |
| `SECRET_KEY` | JWT 加密密钥 | `your-secret-key-change-this-in-production` |
| `ALGORITHM` | JWT 加密算法 | `HS256` |
| `MODEL` | AI 模型名称 | `deepseek-v4-flash` |
| `BASE_URL` | AI API 地址 | `https://api.deepseek.com` |
| `API_KEY` | AI API 密钥 | — |

---

## 🧩 API 文档

启动后端后访问 **http://localhost:8000/docs** 查看 Swagger 交互式文档。

### 核心端点

| 方法 | 路径 | 说明 | 认证 |
|---|---|---|---|
| POST | `/users` | 注册 | ❌ |
| POST | `/auth/login` | 登录 | ❌ |
| POST | `/posts` | 创建文章 | ✅ |
| GET | `/posts` | 获取我的文章 | ✅ |
| GET | `/posts/public` | 公开文章列表 | ❌ |
| GET | `/posts/search` | 搜索公开文章 | ❌ |
| GET | `/posts/count` | 文章统计 | ✅ |
| GET/PUT/DELETE | `/posts/{id}` | 文章详情/修改/删除 | ✅ |
| POST | `/chat` | AI 对话 | ✅ |
| POST | `/chat/stream` | AI 流式对话 (SSE) | ✅ |
| GET | `/chat/history` | 聊天记录 | ✅ |

---

## 🖥 页面一览

| 页面 | 路由 | 说明 |
|---|---|---|
| 登录 | `/login` | JWT 认证登录 |
| 注册 | `/register` | 新用户注册 |
| 仪表盘 | `/dashboard` | 文章统计 + 快捷入口 |
| 我的文章 | `/my-posts` | 文章列表 CRUD |
| 文章详情 | `/my-posts/:id` | 查看完整内容 |
| 写文章 | `/create-post` | 创建新文章 |
| 编辑文章 | `/edit-post/:id` | 编辑已有文章 |
| 公开文章 | `/public-posts` | 浏览 + 搜索 + 分页 |
| AI 助手 | `/ai-chat` | 自然语言管理文章 |

---

## 🛠 技术栈

### 后端
- **FastAPI** — Web 框架
- **SQLAlchemy** (async) — ORM
- **SQLite + aiosqlite** — 数据库
- **LangChain** — AI Agent 框架
- **python-jose** — JWT 认证
- **passlib** — 密码加密

### 前端
- **React 19** — UI 框架
- **TypeScript 6** — 类型安全
- **Vite 8** — 构建工具
- **Tailwind CSS 4** — 样式
- **React Router 7** — 路由
- **TanStack Query 5** — 服务端状态
- **Zustand** — 客户端状态
- **Axios** — HTTP 客户端
- **Lucide React** — 图标
- **react-markdown + remark-gfm** — Markdown 渲染
- **react-hot-toast** — 消息提示
