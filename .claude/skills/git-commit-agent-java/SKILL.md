---
name: git-commit-agent-java
description: 后端 Java / Spring Boot 项目的 Git 提交 Agent 技术栈扩展。提供 Java 项目的智能暂存模式、Checkstyle/SpotBugs 工具链、Scope 常用值和提交前检查命令。必须与 /git-commit-agent 配合使用。
user-invocable: false
---

后端 Java / Spring Boot 项目的 Git 自动化提交技术栈扩展。执行提交前，先调用 `/git-commit-agent` 加载通用规范，再应用本扩展中的技术栈特定规则。

## 技术栈感知

```
框架: Spring Boot 3.x / Spring MVC
语言: Java 17+
包管理: Maven (pom.xml) 或 Gradle (build.gradle)
Lint: Checkstyle + SpotBugs（可选）
格式化: google-java-format / EditorConfig
构建: mvn / ./gradlew
测试: JUnit 5 + Mockito
```

## 智能暂存 Glob 模式

### 策略示例

```bash
git status
git diff

git add src/main/java/com/xxx/<模块>/**/*.java     # 按模块批量添加
git add src/main/resources/mapper/<模块>*.xml       # 对应 Mapper XML
git add src/test/java/com/xxx/<模块>/**/*.java      # 对应测试文件

git reset src/main/resources/application-local.yml  # 排除本地配置
git reset *.log                                      # 排除日志
```

### 推荐 Glob 模式

```bash
# 按 Spring 分层添加（最常用）
git add src/main/java/**/controller/<模块>*
git add src/main/java/**/service/<模块>*
git add src/main/java/**/repository/<模块>*
git add src/main/java/**/entity/<模块>*
git add src/main/java/**/dto/<模块>*

# MyBatis Mapper XML
git add src/main/resources/mapper/<模块>*.xml

# Spring 配置（变更时单独提交）
git add src/main/resources/application*.yml

# 测试
git add src/test/java/**/<模块>*Test.java
git add src/test/java/**/<模块>*Spec.java

# 多模块同时修改时，按包路径分别添加
git add src/main/java/**/user/**/*.java
git add src/main/java/**/order/**/*.java
```

### 必须排除的文件

```bash
# 本地配置（含数据库地址/密钥）
git reset src/main/resources/application-local.yml
git reset src/main/resources/application-dev.yml   # 如含本地凭证

# 构建产物
git reset target/
git reset build/

# IDE 配置
git reset .idea/
git reset *.iml
```

## Scope 常用值

```
# Spring 分层（最常用）
controller, service, repository, entity, dto, config

# 基础设施
mapper, vo, converter, exception, security, scheduler

# 技术层面
api, infra, utils, test, db, cache

# 示例
feat(controller): 新增用户信息查询接口
fix(service): 修复订单金额计算精度丢失问题
refactor(repository): 优化批量查询 SQL 性能
chore(config): 更新 Spring Security 过滤器链配置
```

## 自动化工具链

### 工具组合

```
┌────────────────────────────────────────────────────┐
│                  自动化质量防线                      │
├──────────────────┬─────────────────────────────────┤
│  工具             │  职责                           │
├──────────────────┼─────────────────────────────────┤
│  Checkstyle       │  Java 代码风格检查               │
│  SpotBugs         │  静态缺陷分析（可选）            │
│  google-java-format│ 代码格式化                     │
│  Maven/Gradle     │  提交前 verify / check          │
│  commitlint       │  提交信息格式校验                │
└──────────────────┴─────────────────────────────────┘
```

### Maven Checkstyle 插件配置（pom.xml）

```xml
<plugin>
  <groupId>org.apache.maven.plugins</groupId>
  <artifactId>maven-checkstyle-plugin</artifactId>
  <version>3.3.1</version>
  <configuration>
    <configLocation>checkstyle.xml</configLocation>
    <failsOnError>true</failsOnError>
    <includeTestSourceDirectory>true</includeTestSourceDirectory>
  </configuration>
  <executions>
    <execution>
      <id>validate</id>
      <phase>validate</phase>
      <goals><goal>check</goal></goals>
    </execution>
  </executions>
</plugin>
```

### 提交前检查命令

```bash
# Maven 项目
mvn checkstyle:check -q     # 代码风格检查
mvn test -q                 # 单元测试
mvn verify -q               # 完整验证（含集成测试）

# Gradle 项目
./gradlew checkstyleMain -q # 代码风格检查
./gradlew test -q           # 单元测试
./gradlew check -q          # 完整检查
```

### Git pre-commit Hook

创建 `.git/hooks/pre-commit`（Maven 项目）：

```bash
#!/bin/sh
echo "Running Checkstyle..."
mvn checkstyle:check -q
if [ $? -ne 0 ]; then
  echo "Checkstyle failed. Please fix the issues before committing."
  exit 1
fi
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
            "command": "FILE=$(cat | jq -r '.tool_input.file_path // empty'); [ -n \"$FILE\" ] && [[ \"$FILE\" == *.java ]] && mvn checkstyle:check -q 2>/dev/null; exit 0"
          }
        ]
      }
    ]
  }
}
```

| Hook 类型 | 触发时机 | 作用 |
|-----------|---------|------|
| `PostToolUse` (Write/Edit) | Agent 编辑文件后 | 自动对 `.java` 文件触发 Checkstyle 检查 |

> 通用 `PreToolUse` 危险操作拦截已定义在 `/git-commit-agent` 中，无需重复配置。

## 提交前检查清单（Java 补充项）

在 `/git-commit-agent` 通用检查清单基础上，额外检查：

- [ ] Checkstyle 通过（`mvn checkstyle:check`）
- [ ] 单元测试通过（`mvn test`）
- [ ] 无未使用的 import
- [ ] 无 `System.out.println` / `e.printStackTrace`（应使用日志框架）
- [ ] DTO / Entity 无敏感字段直接暴露（密码、Token 等）
- [ ] 新增接口有对应的 `@RequestMapping` 和入参校验注解（`@Valid`）
- [ ] 数据库相关：无裸 SQL 硬编码（应使用 MyBatis XML 或 JPA）
- [ ] `pom.xml` / `build.gradle` 变更已审查（无引入不安全依赖）
