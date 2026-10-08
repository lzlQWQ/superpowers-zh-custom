# Superpowers 中文版 — Gemini CLI 安装指南

在 [Gemini CLI](https://github.com/google-gemini/gemini-cli) 中使用 superpowers-zh 的完整指南。

## 自动安装

```bash
cd /your/project
npx superpowers-zh
```

安装脚本会自动检测 `.gemini/` 目录并将 skills 复制到 `.gemini/skills/` 目录。

## 手动安装

```bash
git clone https://github.com/jnMetaCode/superpowers-zh.git
cp -r superpowers-zh/skills /your/project/.gemini/skills
```

或作为 Gemini 扩展安装（全局）：

```bash
mkdir -p ~/.gemini/extensions/superpowers-zh/skills
cp -r superpowers-zh/skills/* ~/.gemini/extensions/superpowers-zh/skills/
cp superpowers-zh/gemini-extension.json ~/.gemini/extensions/superpowers-zh/
```

## 通过 GEMINI.md 引用

在项目根目录的 `GEMINI.md` 中引用 skills：

```markdown
# 工作方法论

请参考 .gemini/skills/ 目录中的 SKILL.md 文件。
需要正式设计时由用户原生命令调用 brainstorming；普通需求不自动启动。
编写代码时遵守分级验证策略，仅选择 red-green 时采用 TDD。
```

## Skill 加载优先级

| 位置 | 优先级 | 说明 |
|------|--------|------|
| `.gemini/skills/` | 最高 | 项目级，仅当前项目 |
| `~/.gemini/extensions/*/skills/` | 中 | 扩展级，所有项目共享 |

## 故障排查

### Skills 未生效

1. 确认 `.gemini/skills/` 目录存在且包含 skill 文件夹
2. 每个 skill 需要包含有效 YAML frontmatter 的 `SKILL.md` 文件
3. 重启 Gemini CLI

### 扩展模式未加载

1. 检查 `gemini-extension.json` 是否正确放在扩展目录中
2. 确认扩展目录结构：`~/.gemini/extensions/superpowers-zh/`

## 获取帮助

- 提交 Issue：https://github.com/jnMetaCode/superpowers-zh/issues
- 项目主页：https://github.com/jnMetaCode/superpowers-zh
- Gemini CLI 文档：https://github.com/google-gemini/gemini-cli

## 本地定制版调用与验证

brainstorming、writing-plans、executing-plans、subagent-driven-development 仅通过用户原生命令启动，阶段批准不自动衔接。Claude Code 插件使用 /superpowers-zh:技能名，目录安装使用 /技能名；Codex 使用 $技能名。其他平台使用其原生入口；没有已验证原生限制的平台采用描述与引导约束，不承诺硬性阻止。

low：自查后一次编译、语法或结构检查；medium：相关功能集中验证，失败后最多两轮定向修复；high：关键行为红绿、独立审查和集中完整验证。验证预算与证据跨角色共享，TDD 不再无条件适用。以 skills/using-superpowers/references/verification-policy.md 为准，历史示例中的自动规划和强制测试不适用于本定制版。

升级：复制安装和 npx 安装需要重新安装以更新技能及托管引导；目录链接安装更新源文件；插件安装更新插件包。更新后开启新会话，Codex、Claude Code 需重新发现技能时重启。只更新托管片段，保留用户自定义内容。
