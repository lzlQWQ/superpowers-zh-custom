---
name: executing-plans
description: 仅在用户通过原生命令调用时由主智能体亲自执行已有计划，遵守任务验证策略并复用证据
version: "1.0.0"
license: MIT
metadata:
  hermes:
    tags: [execution, planning]
disable-model-invocation: true
---

# 主智能体执行计划

本节是 superpowers-zh 的增量内容：仅原生命令启动，主智能体实现，验证服从任务策略。

## 准备

1. 读取计划、规格及 [分级验证策略](../using-superpowers/references/verification-policy.md)。检查现有工作区，不自动为所有任务创建工作树或运行基线套件。
2. 用 bash ../subagent-driven-development/scripts/sdd-workspace PLAN_FILE 获得计划工作区，读取账本和已有证据。
3. 旧计划没有策略时，在本次执行中按共用规则补全任务策略并记录；不调用写计划技能、不机械保留旧红绿步骤。
4. 有 Node.js 时用 verify.mjs init 初始化预算；已有账本不能重置。没有辅助环境则同格式人工记账，不安装运行时。

## 执行每个任务

用 bash scripts/task-start PLAN_FILE N 取得带全局规则的简报与 BASE。按验收行为集中实现相关功能，不每写一个函数就跑测试。low 自查后仅一次编译或语法检查；medium 首轮集中检查，失败后最多两轮定向修复；high 对关键行为按策略红绿。只有任务 mode=red-green 才使用 test-driven-development。

在控制者分配的编号下运行已登记检查。报告真实失败并找根因，不盲目重跑。需求或计划冲突作出有依据的裁决并记入账本；增加验证预算须用户明确授权。提交与推送遵守用户及项目授权，不把计划里的提交步骤当成发布许可。

任务满足验收、没有真实严重缺陷且证据有效时，使用 task-done 的 --evidence 模式登记完成，不重新跑测试。无 Node 环境使用 --manual-evidence，保留人工验收和运行记录；旧式 -- 测试命令模式只用于已有旧计划，执行者不得用它绕过分级预算。

## 审查与收尾

low 默认自查；medium 按批次集中审查；high 关键任务独立审查、最后一次整分支审查。有子代理工具时按计划分配审查席位，没有则自审并披露限制。审查者读取简报、报告、差异和同一份验证账本，不自行重跑。

最终审查发现集中修复，最多两轮定向验证且计入对应任务剩余额度；不逐条红绿或逐条全套件。预算耗尽、验证失败或严重缺陷未解决时不得完成。

finishing-a-development-branch 复用有效证据；合并改变相关代码时重新评估失效项和预算。输出完成范围、证据、裁决与未验证项，默认保留验证目录和日志。

## 切换执行方式

与 subagent-driven-development 共用工作区、简报和预算；同一任务不能重复执行。用户需调用目标执行命令，目标从未完成任务接续，不重置历史。没有子代理工具时不伪造分派。
