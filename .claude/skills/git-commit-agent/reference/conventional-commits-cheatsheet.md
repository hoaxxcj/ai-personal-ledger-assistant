# Conventional Commits 速查卡

## 类型速查

```
feat     ✨  新功能
fix      🐛  Bug 修复
docs     📝  文档
style    💄  格式
refactor ♻️  重构
perf     ⚡  性能
test     ✅  测试
build    📦  构建
ci       👷  CI/CD
chore    🔧  杂项
revert   ⏪  回滚
```

## 提交信息模板

### 功能开发

```
feat(<scope>): <简要描述>

<详细说明实现了什么功能，为什么需要这个功能>

<如果有 UI 变更，描述页面/组件变化>

Closes #<issue-number>
```

### Bug 修复

```
fix(<scope>): <简要描述>

<问题描述：之前的行为是什么>
<修复方案：现在如何处理>
<根因分析：为什么会出现这个问题>

Fixes #<issue-number>
```

### 重构

```
refactor(<scope>): <简要描述>

<重构动机：为什么要重构>
<方案说明：采用了什么方式>
<影响范围：哪些模块受到影响>
```
