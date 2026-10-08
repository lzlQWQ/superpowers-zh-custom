---
name: subagent-driven-development
description: 仅在用户通过原生命令调用时分派实现子智能体执行已有计划，验证和审查力度由任务策略决定
version: "1.0.0"
license: MIT
metadata:
  hermes:
    tags: [agents, development]
disable-model-invocation: true
---

# 子智能体驱动执行计划

本节是 superpowers-zh 的增量内容：仅原生命令启动，主智能体协调，验证和审查由任务策略决定。

## 准备与状态

读取计划、规格和 [分级验证策略](../using-superpowers/references/verification-policy.md)。用 bash scripts/sdd-workspace PLAN_FILE 获取计划工作区，恢复简报、报告和预算。不自动加载 brainstorming、writing-plans 或 executing-plans；没有子代理工具时提示用户调用 executing-plans。

旧计划缺少策略时由当前控制者补全并记录，不启动其他阶段。控制者用共用 verify.mjs 初始化或恢复预算，分配轮次；无辅助环境则人工记账。

## 分派实现者

每个任务用 bash scripts/task-brief PLAN_FILE N 生成带全局约束和验证策略的完整简报。记录 BASE；通过 [实现者模板](implementer-prompt.md) 提供简报、报告路径、工作区账本和分配的检查编号。默认不并行分派会改动同一工作区的实现者。

子代理不继承整个对话，不自行创建工作树、不重新规划、不派审查者。显式指定模型和推理强度，优先遵守用户或项目配置；没有指定时默认 gpt-6-astra、low，并核对实际平台允许列表。

## 处理报告与审查

DONE：核查差异、验收和已有有效证据；DONE_WITH_CONCERNS：处理具体正确性风险；NEEDS_CONTEXT：补足信息；BLOCKED：定位根因或计划问题，不在条件未改变时反复分派。

low 自查加一次编译检查，不为每个小任务创建审查席位；medium 将相关任务汇成批次集中审查；high 关键任务使用 [任务审查者模板](task-reviewer-prompt.md)，最后一次整分支审查。控制者在分派前固定批次与审查策略，不能为了避开发现临时降级。

用 bash scripts/review-package PLAN_FILE BASE HEAD 生成完整差异，不能用 HEAD~1 截断多提交任务。审查者获得简报、实现报告、差异和验证账本，不重跑已有检查，不派第二审查者。

## 修复与完成

相关发现合并交给原实现者修复，优先唤回。只有具体新风险才补充检查，并从同一任务额度扣除；medium 和 high 最多两轮定向修复验证，不能按发现、代理或复审重新获得额度。使用 [定向复审模板](re-review-prompt.md) 检查修复范围，不重新宽范围审查。

每个任务验收和有效证据齐备、没有未解决严重缺陷时登记完成。预算耗尽则报告未完成、已知原因及剩余风险，不将真实严重缺陷裁定为可忽略来完成。

最终发现集中修复，全计划一次完整验证按 high 策略安排，finishing-a-development-branch 复用证据。保留预算和日志，完成报告列明范围、证据、裁决和未验证项。切换到主智能体执行须用户调用对应原生命令，历史不重置。
