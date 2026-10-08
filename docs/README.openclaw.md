# Superpowers 中文版 — OpenClaw 安装指南

在 [OpenClaw](https://github.com/openclaw/openclaw) 中使用 superpowers-zh 的完整指南。

## 快速安装

```bash
cd /your/project
npx superpowers-zh
```

安装脚本会自动检测 `.openclaw/` 目录并将 skills 复制到 `skills/` 目录。

## 手动安装

```bash
git clone https://github.com/jnMetaCode/superpowers-zh.git
cp -r superpowers-zh/skills/* /your/project/skills/
```

或安装到全局（所有项目共享）：

```bash
cp -r superpowers-zh/skills/* ~/.openclaw/skills/
```

## 工作原理

OpenClaw 按以下优先级加载 skills：

| 位置 | 优先级 | 说明 |
|------|--------|------|
| `<workspace>/skills/` | 最高 | 工作区级，当前项目专用 |
| `~/.openclaw/skills/` | 中 | 用户级，所有项目共享 |
| 内置 skills | 最低 | OpenClaw 自带 |

每个 skill 是一个 `skills/{name}/SKILL.md` 文件，包含 YAML frontmatter 和指令内容。OpenClaw 会自动发现并加载。

### 推荐配置方式

在项目根目录的 `CLAUDE.md` 或 `AGENTS.md` 中引用：

```markdown
# CLAUDE.md

本项目使用 superpowers-zh skills 框架。
正式头脑风暴、写计划和执行计划仅通过用户原生命令启动。
Skills 位于 skills/ 目录下。
```

### 工具映射

OpenClaw 与 Claude Code 使用相同的工具名称，skills 无需额外适配：

| 工具 | OpenClaw | Claude Code |
|------|----------|-------------|
| 读文件 | `Read` | `Read` |
| 写文件 | `Write` | `Write` |
| 编辑 | `Edit` | `Edit` |
| 终端 | `Bash` | `Bash` |
| Skills | `Skill` | `Skill` |

## 使用

安装完成后重启 OpenClaw，所有 skills 会自动生效。AI 会按任务上下文自动调用对应 skill：

- 用户原生命令 → `brainstorming`（头脑风暴）；新功能需求不自动触发
- 写 commit message → `chinese-commit-conventions`（中文 commit 规范）
- 调试问题 → `systematic-debugging`
- 完成任务后 → `requesting-code-review`（请求代码审查）

遵守技能调用边界：正式规划与执行需要用户原生命令，其他技能可按情境选择。

## 全局 Skills

如果你想让所有项目都能使用 superpowers-zh：

```bash
mkdir -p ~/.openclaw/skills
cp -r superpowers-zh/skills/* ~/.openclaw/skills/
```

也可以通过 `~/.openclaw/openclaw.json` 配置额外 skills 目录：

```json
{
  "skills": {
    "load": {
      "extraDirs": ["/path/to/superpowers-zh/skills"]
    }
  }
}
```

## 更新

```bash
cd /your/project
npx superpowers-zh
```

## 获取帮助

- 提交 Issue：https://github.com/jnMetaCode/superpowers-zh/issues
- QQ 群：833585047

## 本地定制版调用与验证

brainstorming、writing-plans、executing-plans、subagent-driven-development 仅通过用户原生命令启动，阶段批准不自动衔接。Claude Code 插件使用 /superpowers-zh:技能名，目录安装使用 /技能名；Codex 使用 $技能名。其他平台使用其原生入口；没有已验证原生限制的平台采用描述与引导约束，不承诺硬性阻止。

low：自查后一次编译、语法或结构检查；medium：相关功能集中验证，失败后最多两轮定向修复；high：关键行为红绿、独立审查和集中完整验证。验证预算与证据跨角色共享，TDD 不再无条件适用。以 skills/using-superpowers/references/verification-policy.md 为准，历史示例中的自动规划和强制测试不适用于本定制版。

升级：复制安装和 npx 安装需要重新安装以更新技能及托管引导；目录链接安装更新源文件；插件安装更新插件包。更新后开启新会话，Codex、Claude Code 需重新发现技能时重启。只更新托管片段，保留用户自定义内容。
