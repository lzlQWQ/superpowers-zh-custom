# Superpowers 中文版 — DeerFlow 安装指南

在 [DeerFlow](https://github.com/bytedance/deer-flow)（字节跳动开源 SuperAgent）中使用 superpowers-zh 的完整指南。

## 快速安装

在你的 **DeerFlow 仓库根目录**下运行：

```bash
cd /your/deer-flow
npx superpowers-zh --tool deerflow
```

skills 会装到 `skills/custom/`。

> 📌 v1.7.10 及更早版本的自动检测标记写的是 `deer_flow/` —— **DeerFlow 2.0 的顶层目录里根本没有它**（实际是 `backend/` `frontend/` `skills/` `docker/` 等）。也就是说真实的 DeerFlow 检出从来没被自动检测到过，必须手动 `--tool deerflow`。v1.7.11 起改认 `skills/public/`（skills 机制本身、随仓库版本控制），`deer_flow/` 保留作 1.x 兼容。

## 工作原理

[DeerFlow 官方文档](https://bytedance-deer-flow.mintlify.app/concepts/skills)明确了两个**固定**目录：

| 目录 | 用途 | 是否进 git |
|---|---|---|
| `skills/public/` | DeerFlow 自带的 skill，社区维护 | 是 |
| `skills/custom/` | 用户自建或安装的 skill | 否，默认被 gitignore |

加载方式是**自动扫描这两个目录**，找每个子目录里的 `SKILL.md`：

```python
for base_dir in ["skills/public", "skills/custom"]:
    for skill_dir in os.listdir(base_dir):
        ...
```

**无需任何配置**，也没有可改路径的配置项 —— 这两个目录名是写死的。所以我们装到 `skills/custom/`，装完即被发现。

### 容器挂载

DeerFlow 的 skill 在沙箱容器里执行，两个目录会挂到容器内的 `/mnt/skills/`：

```
/mnt/skills/
├── public/
└── custom/
```

所以 skill 内部若要引用自己的附属脚本，路径要写容器内的形式，例如 `python /mnt/skills/custom/my-skill/scripts/process.py`。

> superpowers-zh 的 21 个 skill 以 Markdown 指令为主，`brainstorming` 带的 `scripts/` 是给宿主机 harness 用的可视化伴侣服务，在 DeerFlow 的容器沙箱里不适用 —— 这部分能力在 DeerFlow 上不可用，其余 skill 的方法论正常生效。

## 手动安装

```bash
cd /your/deer-flow
mkdir -p skills/custom
cp -r /path/to/superpowers-zh/skills/* skills/custom/
```

装到别处的 DeerFlow 检出时，用绝对路径即可：

```bash
cp -r /path/to/superpowers-zh/skills/* /path/to/deer-flow/skills/custom/
```

> 📌 v1.7.10 及更早的本文档给了一段 `export DEERFLOW_SKILLS_DIR=...` 的写法，容易被读成「DeerFlow 认这个环境变量」。**官方文档里没有这个环境变量**，目录是写死的。已删除。

## 使用

装好后在 DeerFlow 对话中直接描述任务，或点名 skill：

- 「使用头脑风暴来分析这个需求」
- 「用测试驱动开发来实现这个功能」
- 「按系统化调试流程排查这个 bug」

DeerFlow 按 skill frontmatter 里的 `description` 匹配并加载，所以 `description` 写得越具体，被正确选中的概率越高 —— 这也是官方文档强调的一点。

## 卸载

```bash
cd /your/deer-flow
npx superpowers-zh --uninstall
```

只删除我们装进 `skills/custom/` 的那些 skill 目录，`skills/public/` 和你自己的 custom skill 不动。

## 获取帮助

- 提交 Issue：https://github.com/jnMetaCode/superpowers-zh/issues
- DeerFlow 仓库：https://github.com/bytedance/deer-flow
- DeerFlow Skills 文档：https://bytedance-deer-flow.mintlify.app/concepts/skills

## 本地定制版调用与验证

brainstorming、writing-plans、executing-plans、subagent-driven-development 仅通过用户原生命令启动，阶段批准不自动衔接。Claude Code 插件使用 /superpowers-zh:技能名，目录安装使用 /技能名；Codex 使用 $技能名。其他平台使用其原生入口；没有已验证原生限制的平台采用描述与引导约束，不承诺硬性阻止。

low：自查后一次编译、语法或结构检查；medium：相关功能集中验证，失败后最多两轮定向修复；high：关键行为红绿、独立审查和集中完整验证。验证预算与证据跨角色共享，TDD 不再无条件适用。以 skills/using-superpowers/references/verification-policy.md 为准，历史示例中的自动规划和强制测试不适用于本定制版。

升级：复制安装和 npx 安装需要重新安装以更新技能及托管引导；目录链接安装更新源文件；插件安装更新插件包。更新后开启新会话，Codex、Claude Code 需重新发现技能时重启。只更新托管片段，保留用户自定义内容。
