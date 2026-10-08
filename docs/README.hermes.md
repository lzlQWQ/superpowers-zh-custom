# Superpowers 中文版 — Hermes Agent 安装指南

在 [Hermes Agent](https://github.com/NousResearch/hermes-agent) 中使用 superpowers-zh 的完整指南。

## ⚠️ 先看这一条：必须装到全局，否则不生效

[Hermes 官方文档](https://hermes-agent.nousresearch.com/docs/user-guide/features/skills)明确：Hermes **只自动加载 `~/.hermes/skills/`**（原文称其为 "the primary directory and source of truth"），**项目级目录不会被自动发现**。

所以推荐的装法是全局：

```bash
npx superpowers-zh --global --tool hermes
```

装到 `~/.hermes/skills/`，装完即生效，用 `skills_list` 就能看到 21 个 skill。

> 📌 v1.7.8 及更早版本只支持项目级安装（装到 `<项目>/.hermes/skills/`）—— 那个目录 Hermes 根本不读，等于装了不生效。这是我们的实现错误，v1.7.9 起修正。见 [#45](https://github.com/jnMetaCode/superpowers-zh/issues/45)。

## 如果你确实要项目级安装

项目级的好处是 skills 可以随仓库一起分发。但**必须显式登记**，否则 Hermes 看不见。

```bash
cd /your/project
npx superpowers-zh --tool hermes
```

安装器会打印出你需要粘贴的配置片段，形如：

```yaml
skills:
  external_dirs:
    - /your/project/.hermes/skills
```

把它加进 `~/.hermes/config.yaml`。路径支持 `~` 展开和 `${VAR}` 环境变量替换；**配置里不存在的路径会被静默跳过**，所以写错了不会报错，只会"没生效"。

**我们不替你改 `config.yaml`** —— 那是你的配置文件。

项目级安装还会生成 `AGENTS.md` 引导文件（含核心规则和 skills 列表），让 Hermes 在合适时机主动检查 skill。全局安装**不写**这个文件 —— Hermes 的用户级指令文件约定没有公开文档，我们不猜路径、也不往你的主目录里写东西。

## 同名冲突

如果同一个 skill 名在 `~/.hermes/skills/` 和某个 `external_dirs` 目录里都存在，**本地（`~/.hermes/skills/`）的版本优先**。

## 其他 config.yaml 用法

如果希望全局使用 superpowers-zh skills，可以在 `~/.hermes/config.yaml` 中配置：

```yaml
skills:
  external_dirs:
    - /path/to/superpowers-zh/skills
```

## 工具映射

Skills 中引用的 Claude Code 工具名称对应 Hermes Agent 的等价工具：

| Claude Code | Hermes Agent |
|-------------|-------------|
| `Read` | `read_file` |
| `Write` | `write_file` |
| `Edit` | `patch` |
| `Bash` | `terminal` |
| `Grep` / `Glob` | `search_files` |
| `Skill` | `skill_view` |
| `Task`（子智能体） | `delegate_task` |
| `WebSearch` | `web_search` |
| `WebFetch` | `web_extract` |
| `TodoWrite` | `todo` |

完整映射参见 `skills/using-superpowers/references/hermes-tools.md`。

## 使用技能

Hermes Agent 支持三级渐进式加载：

```
# 浏览所有可用技能
skills_list

# 加载某个技能的完整内容
skill_view("brainstorming")

# 查看技能的引用文件
skill_view("using-superpowers", "references/hermes-tools.md")
```

## 故障排查

### Skills 未发现

1. 确认 `.hermes/skills/` 目录存在且包含 skill 文件夹
2. 每个 skill 目录下需要有 `SKILL.md` 文件
3. 使用 `skills_list` 查看已发现的技能

### AGENTS.md 未加载

1. 确认文件在项目根目录（与 `.hermes/` 同级）
2. 文件名必须是 `AGENTS.md`（项目工作流指令的官方位置）

> ⚠️ **v1.7.12 及更早版本写的是 `HERMES.md`** —— 而 [Hermes 官方文档](https://hermes-agent.nousresearch.com/docs/guides/use-soul-with-hermes)里 `HERMES.md` 出现 **0 次**：「project workflow instructions … Those belong in `AGENTS.md`」。旧版本写的那个文件很可能从未被加载。升级后重装即可；旧的 `HERMES.md` 可以手动删除（`--uninstall` 也会清掉我们写进去的那一段）。

## 获取帮助

- 提交 Issue：https://github.com/jnMetaCode/superpowers-zh/issues
- 项目主页：https://github.com/jnMetaCode/superpowers-zh
- Hermes Agent 文档：https://hermes-agent.nousresearch.com/docs/

## 本地定制版调用与验证

brainstorming、writing-plans、executing-plans、subagent-driven-development 仅通过用户原生命令启动，阶段批准不自动衔接。Claude Code 插件使用 /superpowers-zh:技能名，目录安装使用 /技能名；Codex 使用 $技能名。其他平台使用其原生入口；没有已验证原生限制的平台采用描述与引导约束，不承诺硬性阻止。

low：自查后一次编译、语法或结构检查；medium：相关功能集中验证，失败后最多两轮定向修复；high：关键行为红绿、独立审查和集中完整验证。验证预算与证据跨角色共享，TDD 不再无条件适用。以 skills/using-superpowers/references/verification-policy.md 为准，历史示例中的自动规划和强制测试不适用于本定制版。

升级：复制安装和 npx 安装需要重新安装以更新技能及托管引导；目录链接安装更新源文件；插件安装更新插件包。更新后开启新会话，Codex、Claude Code 需重新发现技能时重启。只更新托管片段，保留用户自定义内容。
