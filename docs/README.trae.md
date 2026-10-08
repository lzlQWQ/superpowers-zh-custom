# Superpowers 中文版 — Trae 安装指南

在 [Trae](https://www.trae.ai)（字节跳动 AI IDE）中使用 superpowers-zh 的完整指南。

## 快速安装

```bash
cd /your/project
npx superpowers-zh
```

安装脚本会自动检测 `.trae/` 目录，将各 skill 完整复制到 `.trae/skills/`（含 `SKILL.md` 及其 `scripts/` 等附属文件），并在 `.trae/rules/superpowers-zh.md` 生成一份 bootstrap 规则用于自动触发。

## 手动安装

```bash
git clone https://github.com/jnMetaCode/superpowers-zh.git
mkdir -p /your/project/.trae/skills
cp -r superpowers-zh/skills/* /your/project/.trae/skills/
```

> 手动复制只会放好 skill 文件，不会生成 `.trae/rules/` 下的 bootstrap 自动触发规则。建议优先用上面的 `npx superpowers-zh`，否则需要在对话里手动点名 skill 才会激活。

## 工作原理

Trae 使用 `.rules` 机制管理 AI 行为：

- **目录**：`.trae/rules/`
- **格式**：Markdown + metadata（description、globs、alwaysApply、priority）
- **规则类型**：
  - **项目规则**（Project Rules）— 仅作用于当前项目
  - **个人规则**（Personal Rules）— 用户级别，可被项目规则覆盖
- **优先级**：1-4，数值越高优先级越高

### Skills 适配

安装器把各 skill 放在 `.trae/skills/<skill-name>/`，并在 `.trae/rules/superpowers-zh.md` 写入一份 bootstrap 规则。Trae 初始化时加载 `.trae/rules/` 下的规则，bootstrap 规则会引导 AI 在任务匹配时读取对应的 `.trae/skills/<skill-name>/SKILL.md` 并遵循其流程。

### 推荐配置

安装完成后，在 Trae 的 Builder Mode 或 Chat 中提到 skill 名称即可激活：

```
使用头脑风暴 skill 来分析这个需求
```

## 中文支持

Trae 原生支持中文，与 superpowers-zh 完美配合：
- 所有 skills 均为中文
- 中文代码审查、中文 Git 工作流等国内特色 skills 开箱即用
- 支持 MCP 协议扩展

## 更新

```bash
cd /your/project
npx superpowers-zh
```

## 卸载 / 误装清理

如果不小心在主目录（`~`）误跑了 `npx superpowers-zh`，会把 skills 和 `.trae/rules/superpowers-zh.md` 写到你的 home。v1.2.1 起会主动拒绝，但老版本可能已经污染过。清理：

```bash
cd ~                                    # 或具体的项目目录
npx superpowers-zh@latest --uninstall
```

会删除 `.trae/skills/` 下装过的 skill、`.trae/rules/superpowers-zh.md`，并清理 `CLAUDE.md` 等文件里的 superpowers-zh 段（保留你自己写的内容）。

## 获取帮助

- 提交 Issue：https://github.com/jnMetaCode/superpowers-zh/issues
- Trae 文档：https://docs.trae.ai/ide/rules

## 本地定制版调用与验证

brainstorming、writing-plans、executing-plans、subagent-driven-development 仅通过用户原生命令启动，阶段批准不自动衔接。Claude Code 插件使用 /superpowers-zh:技能名，目录安装使用 /技能名；Codex 使用 $技能名。其他平台使用其原生入口；没有已验证原生限制的平台采用描述与引导约束，不承诺硬性阻止。

low：自查后一次编译、语法或结构检查；medium：相关功能集中验证，失败后最多两轮定向修复；high：关键行为红绿、独立审查和集中完整验证。验证预算与证据跨角色共享，TDD 不再无条件适用。以 skills/using-superpowers/references/verification-policy.md 为准，历史示例中的自动规划和强制测试不适用于本定制版。

升级：复制安装和 npx 安装需要重新安装以更新技能及托管引导；目录链接安装更新源文件；插件安装更新插件包。更新后开启新会话，Codex、Claude Code 需重新发现技能时重启。只更新托管片段，保留用户自定义内容。
