---
name: git-commit-agent-vue
description: 前端 Vue 3 + TypeScript 项目的 Git 提交 Agent 技术栈扩展。提供 Vue 3 + Vite + TS 项目的智能暂存模式、ESLint/TypeScript 工具链、Scope 常用值和提交前检查命令。必须与 /git-commit-agent 配合使用。
user-invocable: false
---

前端 Vue 3 + TypeScript 项目的 Git 自动化提交技术栈扩展。执行提交前，先调用 `/git-commit-agent` 加载通用规范，再应用本扩展中的技术栈特定规则。

## 技术栈感知

```
框架: Vue 3 + Vite
语言: TypeScript (ES2022+)
包管理: npm (package-lock.json 建议提交)
Lint: ESLint + typescript-eslint + vue-eslint-parser
样式: Tailwind CSS / CSS
构建: vite
类型检查: vue-tsc
```

## 智能暂存 Glob 模式

### 策略示例

```bash
git status
git diff

# 按业务页面/视图模块添加
git add src/views/dashboard/**/*.vue
git add src/views/dashboard/**/*.ts

# 按通用组件添加
git add src/components/**/*.vue
git add src/components/**/*.ts

# 状态管理
git add src/stores/**/*.ts

# 工具函数 / 服务层
git add src/utils/**/*.ts
git add src/services/**/*.ts

# 组合式函数
git add src/composables/**/*.ts

# 类型定义
git add src/types/**/*.ts

# 排除本地配置
git reset src/utils/storage.ts   # 如含本地调试数据
git reset .env.local
git reset *.log
```

### 推荐 Glob 模式

```bash
# 业务视图（推荐 - 按页面模块）
git add src/views/<模块名>/**/*.vue
git add src/views/<模块名>/**/*.ts

# 通用组件
git add src/components/**/*.vue
git add src/components/**/*.ts

# 状态管理 (Pinia)
git add src/stores/**/*.ts

# 路由
git add src/router/**/*.ts

# API / 服务层
git add src/services/**/*.ts

# 工具函数
git add src/utils/**/*.ts

# 组合式函数
git add src/composables/**/*.ts

# 类型定义
git add src/types/**/*.ts

# 样式
git add src/**/*.css

# 多模块同时修改时，分别添加
git add src/views/dashboard/**/*.vue
git add src/views/ledger/**/*.vue
git add src/services/**/*.ts
```

### 必须排除的文件

```bash
# 本地配置文件（含个人路径/密钥）
git reset .env.local
git reset src/config/local.ts

# 日志文件
git reset *.log
git reset logs/

# 临时文件
git reset *.tmp
git reset .temp/

# 构建产物（应在 .gitignore 中，但需二次确认）
git reset dist/
git reset node_modules/

# 类型检查缓存
git reset *.tsbuildinfo
```

## Scope 常用值

```
# 业务模块 / 页面
views, dashboard, ledger, ai, transactions, analysis, budget

# 技术层面
components, stores, router, utils, composables, services, types, styles, config

# 示例
feat(dashboard): 新增月度收支统计卡片
fix(ledger): 修复记账表单金额校验逻辑
refactor(stores): 重构 ledger store 为组合式 API 风格
chore(config): 更新 vite.config.ts 别名配置
```

## 自动化工具链

### 工具组合

```
┌──────────────────────────────────────────────┐
│               自动化质量防线                   │
├──────────────┬───────────────────────────────┤
│  工具         │  职责                         │
├──────────────┼───────────────────────────────┤
│  ESLint       │  代码质量检查 (TS + Vue)       │
│  typescript-eslint │ TypeScript 规则扩展       │
│  vue-eslint-parser │ Vue SFC 解析              │
│  Prettier     │  代码格式化                    │
│  Husky        │  Git Hooks 管理                │
│  lint-staged  │  只检查暂存文件                │
│  commitlint   │  提交信息格式校验              │
│  vue-tsc      │  Vue + TypeScript 类型检查     │
└──────────────┴───────────────────────────────┘
```

### 安装配置

```bash
npm install --save-dev husky lint-staged @commitlint/cli @commitlint/config-conventional prettier eslint-config-prettier

npx husky init
# package.json 添加 "prepare": "husky"
```

### lint-staged 配置（package.json）

```json
{
  "lint-staged": {
    "*.{ts,vue}": [
      "eslint --fix --max-warnings=0",
      "prettier --write"
    ],
    "*.{css,json,md}": [
      "prettier --write"
    ]
  }
}
```

### Husky Hooks

```bash
# .husky/pre-commit
npx lint-staged

# .husky/commit-msg
npx --no -- commitlint --edit "$1"

# .husky/pre-push（可选）
npm run type-check
npm run lint
```

### commitlint 配置

```javascript
// commitlint.config.js
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', [
      'feat', 'fix', 'docs', 'style', 'refactor',
      'perf', 'test', 'build', 'ci', 'chore', 'revert'
    ]],
    'subject-max-length': [2, 'always', 72],
    'body-max-line-length': [2, 'always', 100]
  }
};
```

### 类型检查脚本（package.json）

```json
{
  "scripts": {
    "type-check": "vue-tsc --noEmit",
    "lint": "eslint . --ext .vue,.ts --fix",
    "format": "prettier --write src/"
  }
}
```

## 提交前检查命令

```bash
# 仅检查暂存文件（推荐）
npx lint-staged

# 全量 Lint
npm run lint

# 类型检查
npm run type-check

# 单文件检查
npx eslint src/views/dashboard/index.vue --fix
npx eslint src/stores/ledger.ts --fix
```

## Claude Code Hooks 配置

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "FILE=$(cat | jq -r '.tool_input.file_path // empty'); [ -n \"$FILE\" ] && [[ \"$FILE\" == *\.(ts|vue)$ ]] && npx eslint \"$FILE\" --quiet --fix 2>/dev/null; exit 0"
          }
        ]
      }
    ]
  }
}
```

| Hook 类型 | 触发时机 | 作用 |
|-----------|---------|------|
| `PostToolUse` (Write/Edit) | Agent 编辑文件后 | 自动对 `.ts` / `.vue` 文件执行 ESLint 检查和修复 |

> 通用 `PreToolUse` 危险操作拦截已定义在 `/git-commit-agent` 中，无需重复配置。

## 提交前检查清单（Vue 3 + TS 补充项）

在 `/git-commit-agent` 通用检查清单基础上，额外检查：

- [ ] ESLint 通过（`npm run lint`）
- [ ] TypeScript 类型检查通过（`npm run type-check`）
- [ ] Prettier 格式化通过
- [ ] 无 `console.log` / `debugger` 残留
- [ ] 无注释掉的代码块
- [ ] Vue 组件 `name` 属性已定义（如需）
- [ ] 无硬编码的 API 密钥或敏感信息
- [ ] `package.json` 变更已审查（无引入不安全依赖）
- [ ] 类型定义文件（`src/types/`）与实现同步更新
- [ ] Pinia Store 中无遗留的调试状态或模拟数据
