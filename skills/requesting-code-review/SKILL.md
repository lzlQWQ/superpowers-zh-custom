---
name: requesting-code-review
description: 完成任务、实现重要功能或合并前使用，用于验证工作成果是否符合要求
version: "1.0.0"
license: MIT
metadata:
  hermes:
    tags: [code-review]
---

# 请求代码审查

本节是 superpowers-zh 的增量内容。先读 [分级验证策略](../using-superpowers/references/verification-policy.md)。

low 默认实现者自查；medium 按相关任务批次集中审查；high 关键任务独立审查并最终整分支审查。用户明确要求额外审查时保留其要求，但测试额度仍共享。不能因为“每个任务完成”自动新增审查席位。

控制者提供需求、有效验证策略、BASE/HEAD、完整差异、报告和共享验证账本。BASE 是任务或批次起点，不用 HEAD~1 截断多提交范围。通过 [审查模板](code-reviewer.md) 分派；无子代理工具则自审并说明限制。

审查者先核对代码和实际证据，不重复运行。具体疑问交给控制者分配检查；普通代理建议不能授权预算扩张或启动手动阶段。严重缺陷须解决，相关发现集中修复，剩余额度不足时报告未完成，不无限审查。
