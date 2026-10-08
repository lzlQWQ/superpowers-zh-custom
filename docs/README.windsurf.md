# Superpowers 中文版 — Windsurf 安装指南

在 [Windsurf](https://windsurf.com) 中使用 superpowers-zh 的完整指南。

## 自动安装

```bash
cd /your/project
npx superpowers-zh
```

安装脚本会自动检测 `.windsurf/` 目录并将 skills 复制到 `.windsurf/skills/` 目录。

## 手动安装

```bash
git clone https://github.com/jnMetaCode/superpowers-zh.git
cp -r superpowers-zh/skills /your/project/.windsurf/skills
```

或全局安装（注意路径 —— **不是** `~/.windsurf/skills`）：

```bash
npx superpowers-zh --global --tool windsurf
# 等价于手动：cp -r superpowers-zh/skills/* ~/.codeium/windsurf/skills/
```

> 📌 **v1.7.10 及更早的 `--global` 装到了 `~/.windsurf/skills`，Windsurf 不读那里，等于装了不生效。** 这是我们的实现错误，v1.7.11 起修正为官方路径 `~/.codeium/windsurf/skills/`。之前全局装过的请重装，并可手动删掉遗留的 `~/.windsurf/skills`。

## 工作原理

[Windsurf 官方文档](https://docs.windsurf.com/windsurf/cascade/skills)明确了两个路径，**它们不同构**：

| 范围 | 路径 |
|---|---|
| 项目级 | `.windsurf/skills/<skill-name>/` |
| 用户级（全局） | `~/.codeium/windsurf/skills/<skill-name>/` |

用户级在 `~/.codeium/` 下而不是 `~/.windsurf/` 下 —— 这点反直觉，是我们之前搞错的地方。

自动发现，无需配置。Cascade 采用渐进式披露：默认只把 skill 的 name 和 description 交给模型，决定调用时才加载 SKILL.md 全文，所以装 20 个不会造成常驻开销。

### 跨工具发现

官方还写明 Windsurf 会扫 `.agents/skills/` 与 `~/.agents/skills/`；若开启了读取 Claude Code 配置，`.claude/skills/` 与 `~/.claude/skills/` 也会被扫描。

也就是说：**如果你已经为 Antigravity（`.agents/skills`）或 Claude Code 装过，Windsurf 其实已经能读到**，不必重复装 —— 否则会加载两份。

## Skill 加载优先级

| 位置 | 优先级 | 说明 |
|------|--------|------|
| `.windsurf/skills/` | 最高 | 项目级，仅当前项目 |
| `~/.windsurf/skills/` | 中 | 用户级，所有项目共享 |

## 使用

安装完成后重启 Windsurf，skills 会自动生效。

也可以在 `.windsurfrules` 文件中引用 skills 目录：

```
请参考 .windsurf/skills/ 目录中的 SKILL.md 文件作为工作方法论。
```

## 故障排查

### Skills 未生效

1. 确认 `.windsurf/skills/` 目录存在且包含 skill 文件夹
2. 每个 skill 需要包含有效 YAML frontmatter 的 `SKILL.md` 文件
3. 重启 Windsurf

## 获取帮助

- 提交 Issue：https://github.com/jnMetaCode/superpowers-zh/issues
- 项目主页：https://github.com/jnMetaCode/superpowers-zh
- Windsurf 文档：https://docs.windsurf.com/windsurf/cascade/memories

## 本地定制版调用与验证

brainstorming、writing-plans、executing-plans、subagent-driven-development 仅通过用户原生命令启动，阶段批准不自动衔接。Claude Code 插件使用 /superpowers-zh:技能名，目录安装使用 /技能名；Codex 使用 $技能名。其他平台使用其原生入口；没有已验证原生限制的平台采用描述与引导约束，不承诺硬性阻止。

low：自查后一次编译、语法或结构检查；medium：相关功能集中验证，失败后最多两轮定向修复；high：关键行为红绿、独立审查和集中完整验证。验证预算与证据跨角色共享，TDD 不再无条件适用。以 skills/using-superpowers/references/verification-policy.md 为准，历史示例中的自动规划和强制测试不适用于本定制版。

升级：复制安装和 npx 安装需要重新安装以更新技能及托管引导；目录链接安装更新源文件；插件安装更新插件包。更新后开启新会话，Codex、Claude Code 需重新发现技能时重启。只更新托管片段，保留用户自定义内容。
