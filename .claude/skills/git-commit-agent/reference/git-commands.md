# 常用 Git 命令速查

## 日常操作

```bash
# 查看状态
git status

# 查看暂存区差异
git diff --cached

# 查看最近提交
git log --oneline -10

# 暂存指定文件
git add src/path/to/file.js

# 暂存所有已追踪文件的修改
git add -u

# 提交
git commit -m "feat(module): description"

# 追加到上次提交
git commit --amend --no-edit

# 推送
git push -u origin feature/xxx

# 拉取并 rebase
git pull --rebase origin dev
```

## 分支操作

```bash
# 创建并切换
git checkout -b feature/xxx

# 切换分支
git checkout dev

# 删除本地分支
git branch -d feature/xxx

# 删除远程分支
git push origin --delete feature/xxx

# 查看所有分支
git branch -a
```

## 合并与变基

```bash
# 合并
git merge feature/xxx

# Squash 合并
git merge --squash feature/xxx

# 变基
git rebase dev

# 交互式变基（修改最近 3 次提交）
git rebase -i HEAD~3

# 强制推送（仅限自己的特性分支！）
git push --force-with-lease
```
