# 第五组：AI 个人记账与消费分析助手

基于 Vue 3 + Vite + TypeScript 的智能记账应用，数据完全本地存储，AI 分析通过 DeepSeek API 实现。

## 技术栈

- **框架**: Vue 3 (Composition API + `<script setup>`)
- **构建工具**: Vite
- **语言**: TypeScript
- **路由**: Vue Router 4
- **状态管理**: Pinia
- **UI 组件库**: Element Plus
- **样式**: Tailwind CSS 4
- **图表**: ECharts + vue-echarts
- **HTTP**: Axios（预留）
- **日期处理**: Dayjs
- **工具库**: VueUse

## 项目结构

```
ai-personal-ledger-assistant/
├── src/
│   ├── components/          # 公共组件
│   │   ├── AiChatFloat.vue  # AI 浮动聊天
│   │   ├── ApiKeyConfig.vue # API Key 配置
│   │   └── layout/          # 布局组件
│   ├── composables/         # 组合式函数
│   ├── router/              # 路由配置
│   ├── services/            # AI 服务层
│   │   ├── ai.ts            # DeepSeek API 流式调用
│   │   └── prompts.ts       # Prompt 模板
│   ├── stores/              # Pinia 状态管理
│   ├── types/               # TypeScript 类型
│   ├── utils/               # 工具函数
│   │   ├── storage.ts       # localStorage 读写
│   │   └── summary.ts       # 账单摘要计算
│   ├── views/               # 页面视图
│   │   └── dashboard/       # 首页（记账+图表+AI分析+列表）
│   ├── App.vue
│   ├── main.ts
│   └── style.css
├── env.d.ts
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
└── vite.config.ts
```

## P0 核心功能（已完成）

| 功能 | 说明 |
|------|------|
| 收支记账 | 弹窗快速记账（金额、类型、分类、日期、备注），即时写入 localStorage |
| 账单列表 | 按月份筛选，支持编辑、删除，带确认提示 |
| 统计卡片 | 本月收入、支出、结余、日均支出 |
| 可视化图表 | 支出分类占比饼图（环形）、近7天支出趋势折线图，空状态引导 |
| AI 一键分析 | 基于当月账单摘要，流式调用 DeepSeek API，实时输出消费洞察与建议 |
| 对话式顾问 | 右下角浮动聊天，支持多轮对话、快捷问题、历史记录本地保存 |
| API Key 配置 | 本地保存密钥，首次未配置时引导 |

## 隐私设计

- 所有账单数据仅存于浏览器 localStorage，完整流水永不外传
- AI 分析仅上传匿名统计摘要（总收入/支出/分类占比/日均等）
- API Key 仅保存在本地，不上传任何服务器

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 代码格式化
npm run format
```

## 使用说明

1. 打开应用后直接进入主界面，无需登录
2. 首次使用请点击右上角「API 配置」填入 DeepSeek API Key
3. 点击「记一笔」添加收支记录
4. 查看统计图表和账单明细
5. 点击「分析本月账单」获取 AI 消费洞察
6. 右下角悬浮按钮打开 AI 财务顾问进行多轮对话
