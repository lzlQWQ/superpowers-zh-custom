# Superpowers 中文版 — Codex CLI 安装指南

在 Codex 中使用 superpowers-zh 的完整指南。

## 快速安装

告诉 Codex：

```
Fetch and follow instructions from https://raw.githubusercontent.com/jnMetaCode/superpowers-zh/refs/heads/main/.codex/INSTALL.md
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

4. **子代理 skills（可选）：** `dispatching-parallel-agents`、`dispatching-project-agents` 和 `subagent-driven-development` 需要 Codex 的多代理功能。在 Codex 配置中添加：
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

`using-superpowers` skill 会自动被发现并强制执行 skill 使用纪律——无需额外配置。

## 使用

Skills 自动发现。Codex 在以下情况激活 skills：
- 你提到 skill 名称（如 "use brainstorming"）
- 任务匹配 skill 的描述
- `using-superpowers` skill 指示 Codex 使用某个 skill

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
