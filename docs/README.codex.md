# Superpowers 中文版 — Codex CLI 安装指南

## ⚠️ v1.7.10 及更早的项目级安装装错了地方

官方文档（developers.openai.com/codex/skills，现 308 跳 learn.chatgpt.com/docs/build-skills）给出的扫描目录**完整清单**是：

```
$CWD/.agents/skills
$CWD/../.agents/skills
$REPO_ROOT/.agents/skills
$HOME/.agents/skills
/etc/codex/skills
```

**没有 `.codex/skills`。** 而 v1.7.10 及更早的 `npx superpowers-zh --tool codex` 正是装到 `.codex/skills` —— Codex 不扫那里，等于装了完全不生效。全局（`~/.agents/skills`）一直是对的，只有项目级错。

v1.7.11 起项目级改装 `.agents/skills`，重装时会自动清掉旧位置里我们装的那些（你自己放在 `.codex/skills` 下的东西不动）：

```bash
cd /your/project
npx superpowers-zh --tool codex
```

> 顺带说明：`.agents/skills` 与 Antigravity 共用，这是 Agent Skills 开放约定，不是冲突。装过其中一个，另一个也能读到。

在 Codex 中使用 superpowers-zh 的完整指南。

## 快速安装

告诉 Codex：

```
Fetch and follow instructions from https://raw.githubusercontent.com/jnMetaCode/superpowers-zh/refs/heads/main/.codex/INSTALL.md
```

## Codex 原生插件安装

Codex CLI 自带插件管理，可以直接把本仓库注册为 marketplace 安装，不需要 Node.js / npm（已在 codex-cli 0.147.0、0.154.0 上实测）：

```bash
codex plugin marketplace add https://github.com/jnMetaCode/superpowers-zh.git
codex plugin add superpowers-zh@superpowers-zh
codex plugin list   # 应显示 superpowers-zh@superpowers-zh  installed, enabled
```

安装后 21 个 skills 全部可被发现；插件清单声明了空 `hooks`，不会注册仅适用于 Claude Code 的 SessionStart hook。

**更新：**

```bash
codex plugin marketplace upgrade superpowers-zh
codex plugin add superpowers-zh@superpowers-zh
```

**卸载：**

```bash
codex plugin remove superpowers-zh@superpowers-zh
codex plugin marketplace remove superpowers-zh   # 可选：连同 marketplace 一起移除
```

## 手动安装

### 前置条件

- OpenAI Codex CLI
- Git

### 步骤

1. 克隆仓库：
   ```bash
   git clone https://github.com/jnMetaCode/superpowers-zh.git ~/.codex/superpowers-zh
   ```

2. 创建 skills 符号链接：
   ```bash
   mkdir -p ~/.agents/skills
   ln -s ~/.codex/superpowers-zh/skills ~/.agents/skills/superpowers
   ```

3. 重启 Codex。

4. **子代理 skills（可选）：** `dispatching-parallel-agents` 和 `subagent-driven-development` 需要 Codex 的多代理功能。在 Codex 配置中添加：
   ```toml
   [features]
   multi_agent = true
   ```

### Windows

使用 junction 代替符号链接（无需开发者模式）：

```powershell
New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\.agents\skills"
cmd /c mklink /J "$env:USERPROFILE\.agents\skills\superpowers" "$env:USERPROFILE\.codex\superpowers-zh\skills"
```

## 工作原理

Codex 原生支持 skill 发现——启动时扫描 `~/.agents/skills/` 目录，解析 SKILL.md 的 frontmatter，按需加载 skills。通过一个符号链接即可注册所有 skills：

```
~/.agents/skills/superpowers/ → ~/.codex/superpowers-zh/skills/
```

技能由原生机制发现。四个正式工作流技能提供 agents/openai.yaml，以禁用隐式调用；using-superpowers 提供分级路由。

## 使用

Skills 自动发现。四个正式工作流技能仅通过 $技能名启动；其他技能按调用边界匹配任务。using-superpowers 不会替用户启动手动阶段。

## 更新

```bash
cd ~/.codex/superpowers-zh && git pull
```

Skills 通过符号链接即时更新。

## 卸载

```bash
rm ~/.agents/skills/superpowers
```

**Windows (PowerShell):**
```powershell
Remove-Item "$env:USERPROFILE\.agents\skills\superpowers"
```

可选：删除克隆的仓库 `rm -rf ~/.codex/superpowers-zh`

## 获取帮助

- 提交 Issue：https://github.com/jnMetaCode/superpowers-zh/issues
- 项目主页：https://github.com/jnMetaCode/superpowers-zh

## 本地定制版调用与验证

brainstorming、writing-plans、executing-plans、subagent-driven-development 仅通过用户原生命令启动，阶段批准不自动衔接。Claude Code 插件使用 /superpowers-zh:技能名，目录安装使用 /技能名；Codex 使用 $技能名。其他平台使用其原生入口；没有已验证原生限制的平台采用描述与引导约束，不承诺硬性阻止。

low：自查后一次编译、语法或结构检查；medium：相关功能集中验证，失败后最多两轮定向修复；high：关键行为红绿、独立审查和集中完整验证。验证预算与证据跨角色共享，TDD 不再无条件适用。以 skills/using-superpowers/references/verification-policy.md 为准，历史示例中的自动规划和强制测试不适用于本定制版。

升级：复制安装和 npx 安装需要重新安装以更新技能及托管引导；目录链接安装更新源文件；插件安装更新插件包。更新后开启新会话，Codex、Claude Code 需重新发现技能时重启。只更新托管片段，保留用户自定义内容。
