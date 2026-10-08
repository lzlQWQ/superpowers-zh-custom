# 华为云码道 CodeArts 使用指南

[华为云码道 CodeArts（CodeArts Doer / Snap）](https://codearts.huaweicloud.com/)是华为云出品的 AI 编程助手，支持 CLI、客户端以及 IntelliJ IDEA / VS Code 插件形态。skills 存放在项目的 `.codeartsdoer/skills/` 目录下。

## 一键安装（推荐）

在你的项目根目录运行：

```bash
npx superpowers-zh
```

自动检测到 `.codeartsdoer/` 时会安装到 CodeArts。检测不到时显式指定：

```bash
npx superpowers-zh --tool codearts
```

安装内容：

- `.codeartsdoer/skills/` — 21 个 skill（每个含 `SKILL.md` 及其 `scripts/` 等附属文件）

## Skill 加载优先级

| 位置 | 说明 |
|------|------|
| `.codeartsdoer/skills/` | 项目级，仅当前项目 |

## ⚠️ 关于自动触发

本适配为 **skills-only**：把 skills 放到 `.codeartsdoer/skills/`，依赖 CodeArts 自身的 skill 发现机制加载。

- 如果 CodeArts 会自动扫描并按需触发 `.codeartsdoer/skills/` 下的 skill，则装完重启即可生效。
- 如果发现**不会自动触发**，可以在对话里**手动点名** skill（例如「用 brainstorming skill 做需求分析」），skill 内容依然可用。

> CodeArts 的 bootstrap / 指令文件约定（类似 `CLAUDE.md` 的自动引导文件）我们尚未验证。如果你是 CodeArts 用户、了解它读取哪个指令文件来自动加载规则，欢迎在 [issue #20](https://github.com/jnMetaCode/superpowers-zh/issues/20) 反馈，我们会补上自动触发的 bootstrap 生成。

## 卸载

```bash
npx superpowers-zh --uninstall
```

移除 `.codeartsdoer/skills/` 下由 superpowers-zh 安装的 skill 目录。

## 反馈

- 提交 Issue：https://github.com/jnMetaCode/superpowers-zh/issues
- 项目主页：https://github.com/jnMetaCode/superpowers-zh

## 本地定制版调用与验证

brainstorming、writing-plans、executing-plans、subagent-driven-development 仅通过用户原生命令启动，阶段批准不自动衔接。Claude Code 插件使用 /superpowers-zh:技能名，目录安装使用 /技能名；Codex 使用 $技能名。其他平台使用其原生入口；没有已验证原生限制的平台采用描述与引导约束，不承诺硬性阻止。

low：自查后一次编译、语法或结构检查；medium：相关功能集中验证，失败后最多两轮定向修复；high：关键行为红绿、独立审查和集中完整验证。验证预算与证据跨角色共享，TDD 不再无条件适用。以 skills/using-superpowers/references/verification-policy.md 为准，历史示例中的自动规划和强制测试不适用于本定制版。

升级：复制安装和 npx 安装需要重新安装以更新技能及托管引导；目录链接安装更新源文件；插件安装更新插件包。更新后开启新会话，Codex、Claude Code 需重新发现技能时重启。只更新托管片段，保留用户自定义内容。
