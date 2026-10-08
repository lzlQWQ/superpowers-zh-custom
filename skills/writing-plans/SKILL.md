---
name: writing-plans
description: 仅在用户通过原生命令调用时编写实现计划，确定任务等级、验收行为、验证批次和预算；不自动执行计划
version: "1.0.0"
license: MIT
metadata:
  hermes:
    tags: [planning, documentation]
disable-model-invocation: true
---

# 编写实现计划

本节是 superpowers-zh 的增量内容：仅原生命令启动，按任务等级规划验证，不固定红绿步骤。

## 输入与任务划分

读取需求、已有规格和项目约束，不要求先调用 brainstorming 或创建工作树。先读 [分级验证策略](../using-superpowers/references/verification-policy.md)，按风险、未知项和复杂度确定等级。同一计划允许混合等级。

以有意义的交付物划分任务，将相关功能、脚手架和配置放入同一批次。代码变化小但涉及权限、数据或公共接口时仍按高风险处理。写清文件、接口、精确文案与验收行为；只写实现者不能自行决定的内容，不抄写完整实现。

## 计划格式

默认保存到 docs/superpowers/plans/YYYY-MM-DD-<feature-name>.md，用户位置优先。头部包含目标、需求或规格来源、架构、技术栈、全局约束、验证默认策略及审查重点。头部说明执行只能由用户调用 executing-plans 或 subagent-driven-development，不写必需自动调用指令。

全局策略示例（JSON 代码块）：

~~~verification-policy
{"version":1,"defaults":{"level":"medium","mode":"batch","review":"batch"}}
~~~

每个任务标题使用“### 任务 N：名称”，任务内写完整有效策略；字段与命令格式见共用策略，不能只依赖头部隐式继承。

~~~verification-policy
{"version":1,"task":"1","level":"low","reason":"局部文案修改，影响小且易撤销","mode":"compile","acceptance":["文案与需求一致"],"review":"self","scope":["src/page.js"],"checks":[{"id":"syntax","kind":"compile","command":"node","args":["--check","src/page.js"],"timeoutMs":60000}]}
~~~

## 三种步骤结构

- low：集中实现 → 检查差异及验收行为 → 一次最小编译、语法或结构检查 → 登记证据。失败后不自动重跑。
- medium：实现整个相关功能批次，保留独立测试断言 → 集中编译与相关单元测试 → 按实际失败集中修复，最多两轮定向验证 → 集中审查。
- red-green：先写明业务行为、预期失败和价值 → 一轮行为红灯 → 实现关键行为 → 集中绿灯 → 预算内定向修复。缺失函数、模块导入失败不能作为红灯。

high 另外安排关键任务独立审查与全计划一次完整验证；配套低风险任务不继承重度流程。为检查明确可执行文件、参数数组、覆盖范围、时机和超时；不把内部重试藏进命令。

## 自检与交接

核对需求覆盖、接口一致性、任务粒度、等级依据、有效红灯、检查命令、预算和审查重点。项目必需检查或基线检查计入预算，有冲突先解决。不要为凑覆盖率或固定“五类风险”制造无关测试。

交付计划链接和两种执行方式的原生命令，说明本计划适用哪种方式。仅完成计划；用户批准计划、选择方式或输入普通执行要求都不自动调用执行技能。
