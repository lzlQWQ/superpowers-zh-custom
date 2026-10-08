# Superpowers 中文版 — Antigravity 安装指南

在 [Google Antigravity](https://antigravity.google)（Google AI IDE）中使用 superpowers-zh 的完整指南。

## 快速安装

```bash
cd /your/project
npx superpowers-zh
```

安装脚本会自动检测 `.agents/` 目录并将 skills 复制到该目录。

## 手动安装

```bash
git clone https://github.com/jnMetaCode/superpowers-zh.git
mkdir -p /your/project/.agents/skills
cp -r superpowers-zh/skills/* /your/project/.agents/skills/
```

## 工作原理

Antigravity 支持多种规则文件格式：

| 文件 | 优先级 | 说明 |
|------|--------|------|
| `GEMINI.md` | 最高 | Antigravity 专属规则 |
| `AGENTS.md` | 中 | 通用规则（Antigravity、Cursor、Claude Code 共享） |
| `.agents/rules.md` | 中 | 项目级规则目录 |
| `CLAUDE.md` | 低 | 也会被自动读取 |

### 推荐配置方式

**方式一**：在项目根目录创建 `GEMINI.md`：

```markdown
# GEMINI.md

使用 .agents/ 目录下的 superpowers skills 来指导工作流程。
正式头脑风暴、写计划和执行计划仅通过用户原生命令启动。

Skills 列表参见 .agents/ 目录。
```

**方式二**：在 `AGENTS.md` 中引用（多工具共享）：

```markdown
# AGENTS.md

本项目使用 superpowers-zh skills 框架。
Skills 位于 .agents/（Antigravity）或 .claude/skills/（Claude Code）目录下。
```

### 工具映射

Antigravity 使用 Gemini 模型，工具名称与 Claude Code 不同：

| Claude Code | Antigravity (Gemini) |
|-------------|---------------------|
| `Read` | `read_file` |
| `Write` | `write_file` |
| `Edit` | `replace` |
| `Bash` | `run_shell_command` |
| `Skill` | `activate_skill` |

Skills 中的 Claude Code 工具名称会被 Antigravity 自动适配。

## 使用

Antigravity 支持 Agent Manager 并行执行多个 agent：
- 与 superpowers-zh 的「派遣并行 Agent」skill 理念一致
- 可以同时调度多个 skill 处理不同任务

## 全局规则

个人级别的全局规则放在：
```
~/.gemini/GEMINI.md
~/.gemini/AGENTS.md
```

## 更新

```bash
cd /your/project
npx superpowers-zh
```

## 获取帮助

- 提交 Issue：https://github.com/jnMetaCode/superpowers-zh/issues
- Antigravity 文档：https://antigravity.google/docs/rules-workflows

## 本地定制版调用与验证

brainstorming、writing-plans、executing-plans、subagent-driven-development 仅通过用户原生命令启动，阶段批准不自动衔接。Claude Code 插件使用 /superpowers-zh:技能名，目录安装使用 /技能名；Codex 使用 $技能名。其他平台使用其原生入口；没有已验证原生限制的平台采用描述与引导约束，不承诺硬性阻止。

low：自查后一次编译、语法或结构检查；medium：相关功能集中验证，失败后最多两轮定向修复；high：关键行为红绿、独立审查和集中完整验证。验证预算与证据跨角色共享，TDD 不再无条件适用。以 skills/using-superpowers/references/verification-policy.md 为准，历史示例中的自动规划和强制测试不适用于本定制版。

升级：复制安装和 npx 安装需要重新安装以更新技能及托管引导；目录链接安装更新源文件；插件安装更新插件包。更新后开启新会话，Codex、Claude Code 需重新发现技能时重启。只更新托管片段，保留用户自定义内容。
