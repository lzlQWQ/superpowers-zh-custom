@./skills/using-superpowers/SKILL.md
@./skills/using-superpowers/references/gemini-tools.md


# Superpowers-ZH 中文增强版

本项目已安装 superpowers-zh 技能框架（22 个 skills）。

## 核心规则

1. **收到任务时，先检查是否有匹配的 skill** — 哪怕只有 1% 的可能性也要检查
2. **设计先于编码** — 收到功能需求时，先用 brainstorming skill 做需求分析
3. **验证预算先于执行** — 先用 testing-policy 控制重型编译/测试次数，再决定 TDD、轻量核查或用户验收
4. **如实汇报验证范围** — 只有实际运行成功后才能声称测试/编译通过；未运行时给出用户验收路径

## 可用 Skills

Skills 位于 `.gemini/skills/` 目录，每个 skill 有独立的 `SKILL.md` 文件。

- **brainstorming**: 在任何创造性工作之前必须使用此技能——创建功能、构建组件、添加功能或修改行为。在实现之前先探索用户意图、需求和设计。
- **chinese-code-review**: 中文 review 沟通参考——话术模板、分级标注（必须修复/建议修改/仅供参考）、国内团队常见反模式应对。仅在用户显式 /chinese-code-review 时调用，不要根据上下文自动触发。
- **chinese-commit-conventions**: 中文 commit 与 changelog 配置参考——Conventional Commits 中文适配、commitlint/husky/commitizen 中文模板、conventional-changelog 中文配置。仅在用户显式 /chinese-commit-conventions 时调用，不要根据上下文自动触发。
- **chinese-documentation**: 中文文档排版参考——中英文空格、全半角标点、术语保留、链接格式、中文文案排版指北约定。仅在用户显式 /chinese-documentation 时调用，不要根据上下文自动触发。
- **chinese-git-workflow**: 国内 Git 平台配置参考——Gitee、Coding.net、极狐 GitLab、CNB 的 SSH/HTTPS/凭据/CI 接入差异与镜像同步配置。仅在用户显式 /chinese-git-workflow 时调用，不要根据上下文自动触发。
- **dispatching-parallel-agents**: 当面对 2 个以上可以独立进行、无共享状态或顺序依赖的任务时使用
- **dispatching-project-agents**: 仅当用户显式要求使用 dispatching-project-agents、轻量子代理执行任务、轻量工程子代理、按工程轻量分派子代理，或明确点名本技能时使用；不要因普通多工程计划自动触发，不要在用户要求原子代理执行、任务级子代理执行或 subagent-driven-development 时使用
- **executing-plans**: 当你有一份书面实现计划需要在当前会话或单独会话中执行时使用；按计划任务推进，并按 testing-policy 的验证预算合并或执行检查点
- **finishing-a-development-branch**: 当实现完成、验证预算已核对、需要决定如何集成工作时使用——通过提供合并、PR 或清理等结构化选项来引导开发工作的收尾
- **mcp-builder**: MCP 服务器构建方法论 — 系统化构建生产级 MCP 工具，让 AI 助手连接外部能力
- **receiving-code-review**: 收到代码审查反馈后、实施建议之前使用，尤其当反馈不明确或技术上有疑问时——需要技术严谨性和验证，而非敷衍附和或盲目执行
- **requesting-code-review**: 完成高风险任务、实现重要功能、到达计划检查点或合并前使用，用于验证工作成果是否符合要求
- **subagent-driven-development**: 当在当前会话中执行包含独立任务的实现计划时使用
- **systematic-debugging**: 遇到任何 bug、测试失败或异常行为时使用，在提出修复方案之前执行
- **test-driven-development**: 仅当 testing-policy 判定为“A. 强制 TDD”时使用——适用于安全、支付、权限、数据一致性、公共协议/API 或用户明确要求回归测试的高风险任务
- **testing-policy**: 在实现、修复、重构、编写计划、执行计划或声明完成前使用——先选择验证预算和测试/核查策略，控制重型编译与测试次数，优先保证开发进度并给出用户验收路径
- **using-git-worktrees**: 当需要开始与当前工作区隔离的功能开发或执行实现计划之前使用——创建具有智能目录选择和安全验证的隔离 git 工作树
- **using-superpowers**: 在开始任何对话时使用——确立如何查找和使用技能，要求在任何响应（包括澄清性问题）之前调用 Skill 工具
- **verification-before-completion**: 在汇报代码改动完成、已修复、测试通过或交付用户验收之前使用——根据 testing-policy 对齐验证预算、实际证据和可声明结论
- **workflow-runner**: 在 Claude Code / OpenClaw / Cursor 中直接运行 agency-orchestrator YAML 工作流——无需 API key，使用当前会话的 LLM 作为执行引擎。当用户提供 .yaml 工作流文件或要求多角色协作完成任务时触发。
- **writing-plans**: 当你有规格说明或需求用于多步骤任务时使用，在动手写代码之前；计划必须包含验证预算、测试策略、检查点和用户验收路径
- **writing-skills**: 当创建新技能、编辑现有技能或在部署前验证技能是否有效时使用

## 如何使用

当任务匹配某个 skill 时，读取对应的 `.gemini/skills/<skill-name>/SKILL.md` 并严格遵循其流程。
