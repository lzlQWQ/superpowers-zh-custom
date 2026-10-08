@./skills/using-superpowers/SKILL.md
@./skills/using-superpowers/references/gemini-tools.md


# Superpowers-ZH 中文增强版

本项目已安装 superpowers-zh 技能框架（21 个 skills）。

## 核心规则

1. 正式规划和执行仅原生命令启动，不由任务匹配或阶段批准自动触发。
2. 开发前读取 skills/using-superpowers/references/verification-policy.md 并确定等级。
3. low 一次编译或语法检查；medium 集中验证加最多两轮修复；high 关键行为红绿和集中完整验证。
4. 所有角色共享预算并复用有效证据，未通过或额度耗尽不能报告完成。

## 可用 Skills

Skills 位于 `.gemini/skills/` 目录，每个 skill 有独立的 `SKILL.md` 文件。

- **brainstorming**: 仅在用户通过原生命令调用时进行需求分析与设计；普通功能需求不自动触发，也不自动转入写计划或实现
- **chinese-code-review**: 中文 review 沟通参考——话术模板、分级标注（必须修复/建议修改/仅供参考）、国内团队常见反模式应对。仅在用户显式 /chinese-code-review 时调用，不要根据上下文自动触发。
- **chinese-commit-conventions**: 中文 commit 与 changelog 配置参考——Conventional Commits 中文适配、commitlint/husky/commitizen 中文模板、conventional-changelog 中文配置。仅在用户显式 /chinese-commit-conventions 时调用，不要根据上下文自动触发。
- **chinese-documentation**: 中文文档排版参考——中英文空格、全半角标点、术语保留、链接格式、中文文案排版指北约定。仅在用户显式 /chinese-documentation 时调用，不要根据上下文自动触发。
- **chinese-git-workflow**: 国内 Git 平台配置参考——Gitee、Coding.net、极狐 GitLab、CNB 的 SSH/HTTPS/凭据/CI 接入差异与镜像同步配置。仅在用户显式 /chinese-git-workflow 时调用，不要根据上下文自动触发。
- **diagnosing-superpowers**: 当一次 superpowers 会话出了问题、你的人类伙伴想知道原因时使用——重复劳动、无视计划、磕磕绊绊、结果质量差、某个技能没触发、"太慢了"、"为什么这么贵"、"它到底在干什么"——或者想给 superpowers 维护者整理一份 bug 报告；适用于当前会话，或按 id / 路径指定的过往会话，任何工具均可
- **dispatching-parallel-agents**: 当面对 2 个以上可以独立进行、无共享状态或顺序依赖的任务时使用
- **executing-plans**: 仅在用户通过原生命令调用时由主智能体亲自执行已有计划，遵守任务验证策略并复用证据
- **finishing-a-development-branch**: 当实现完成、所有测试通过、需要决定如何集成工作时使用——通过提供合并、PR 或清理等结构化选项来引导开发工作的收尾
- **mcp-builder**: MCP 服务器构建方法论 — 系统化构建生产级 MCP 工具，让 AI 助手连接外部能力
- **receiving-code-review**: 收到代码审查反馈后、实施建议之前使用，尤其当反馈不明确或技术上有疑问时——需要技术严谨性和验证，而非敷衍附和或盲目执行
- **requesting-code-review**: 完成任务、实现重要功能或合并前使用，用于验证工作成果是否符合要求
- **subagent-driven-development**: 仅在用户通过原生命令调用时分派实现子智能体执行已有计划，验证和审查力度由任务策略决定
- **systematic-debugging**: 遇到任何 bug、测试失败或异常行为时使用，在提出修复方案之前执行
- **test-driven-development**: 当任务策略明确选择行为红灯到绿灯时使用，适用于关键规则和真实缺陷复现；不对所有功能无条件要求 TDD
- **using-git-worktrees**: 当需要开始与当前工作区隔离的功能开发或执行实现计划之前使用——创建具有智能目录选择和安全验证的隔离 git 工作树
- **using-superpowers**: 在开始任何对话时使用——确立如何查找和使用技能，要求在任何响应（包括澄清性问题）之前调用 Skill 工具
- **verification-before-completion**: 在完成声明、提交或交付前核对任务策略与有效证据，按等级验证并复用未失效结果，不默认重新运行测试
- **workflow-runner**: 在 Claude Code / OpenClaw / Cursor 中直接运行 agency-orchestrator YAML 工作流——无需 API key，使用当前会话的 LLM 作为执行引擎。当用户提供 .yaml 工作流文件或要求多角色协作完成任务时触发。
- **writing-plans**: 仅在用户通过原生命令调用时编写实现计划，确定任务等级、验收行为、验证批次和预算；不自动执行计划
- **writing-skills**: 当创建新技能、编辑现有技能或在部署前验证技能是否有效时使用

## 如何使用

当任务匹配某个 skill 时，读取对应的 `.gemini/skills/<skill-name>/SKILL.md` 并严格遵循其流程。
