# AI-Agentic-Chess: DeepSeek Tic-Tac-Toe (P1 Milestone)

## 项目简介
本项目是一个基于 Next.js 和 TypeScript 构建的 AI 驱动三子棋系统，集成了 Minimax 算法逻辑与 DeepSeek 大语言模型，实现了具备多轮对话记忆的动态嘲讽系统。
## 快速启动
- 克隆项目：git clone https://github.com/tb050304/tic-tac-toe-ai
## 配置环境变量
在根目录创建 `.env.local` 文件，并填入以下内容：

```env
DEEPSEEK_API_KEY=your_api_key_here
PROXY_URL=your_proxy_ip
```
## 安装与运行
```
npm install
npm run dev
```
## 核心特性
- **无敌对弈逻辑**：集成 Minimax 算法，确保 AI 在逻辑层面达到最优决策。
- **DeepSeek 动态嘲讽**：对接 DeepSeek-V3 API，AI 根据实时棋局状态生成个性化评论。
- **异步多轮对话**：实现完整的聊天上下文管理，支持 AI 与玩家之间的连续互动。
- **现代工程化架构**：
    - **组件化设计**：UI 拆分为 Board 和 ChatBox，通过状态提升实现逻辑解耦。
    - **类型安全**：全量使用 TypeScript 定义接口，确保代码健壮性。
- **开发者工具链**：集成 Cline + Gemini 3.1 Pro 辅助重构，并遵循规范的 Git Flow 流程。

## 技术栈
- **前端框架**: Next.js 14+ (App Router), React, Tailwind CSS
- **开发语言**: TypeScript
- **AI 集成**: DeepSeek API / Gemini API
- **网络处理**: Axios, Https-proxy-agent (支持本地代理配置)

## 项目结构
```text
├── app/
│   ├── api/taunt/     # 后端 API：处理 AI 逻辑与 API 对接
│   ├── layout.tsx     # 全局布局
│   └── page.tsx       # 页面入口 (状态管理核心)
├── components/
│   ├── Board.tsx      # 棋盘组件 (UI 渲染与事件分发)
│   ├── ChatBox.tsx    # 聊天组件 (消息列表与自动滚动)
├── .env.local         # 环境变量 (API Keys 与代理配置)
├── package.json       # 项目依赖与脚本
└── README.md          # 项目文档
