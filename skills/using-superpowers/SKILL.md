---
name: using-superpowers
description: 会话开始时建立技能路由：正式规划与执行仅原生命令启动，开发验证按任务等级和共享预算进行
version: "1.0.0"
license: MIT
metadata:
  hermes:
    tags: [meta, getting-started]
---

# 使用 Superpowers

本节是 superpowers-zh 的增量内容：本定制版采用手动正式工作流和分级验证，覆盖上游的自动规划与强制 TDD 行为。

## 技能路由

先判断用户请求和技能的调用边界，再选择适用技能。brainstorming、writing-plans、executing-plans、subagent-driven-development 仅由用户原生命令启动。普通需求、计划存在、批准规格或计划、其他技能和父代理指令均不启动它们。禁止通过读取受限技能文件或复述其完整流程绕过原生限制。

Claude Code 使用 /技能名（插件安装时使用 /superpowers-zh:技能名）；Codex 使用 $技能名。其他平台使用其原生技能命令。完成一个阶段后交付本阶段产物并提示下一条命令，不主动衔接。

普通直接开发可以正常分析和实现，无需正式规划。遇到实际缺陷使用 systematic-debugging；实现前简短确定等级、验收和验证策略；只有策略选择 red-green 才加载 test-driven-development。

## 验证规则

开展开发、编写计划、分派任务、审查或交付时，读取 [分级验证策略](references/verification-policy.md)。它是所有角色共用的规则；低等级一次编译或语法检查，中等级集中验证后最多两轮定向修复，高等级对关键行为安排红绿和集中完整验证。

控制者维护预算和证据；实现者和审查者继承，换代理、换执行方式和压缩上下文不重置预算。子代理只完成已分派任务，不重新规划或创建审查席位。用户和项目必需要求优先，超预算冲突在运行前说明。

## 平台适配

按当前宿主选择 references 下的 claude-code-tools、codex-tools、pi-tools、antigravity-tools、copilot-tools、hermes-tools、qoder-tools、muse-tools 或 gemini-tools 文档。实际可用工具优先于旧表格；没有子代理工具不编造分派。

## 中文参考

四个 chinese-* 是参考资料，仅用户显式调用时加载。它们不新增测试或审查关卡，模板里的检查可以按有效任务策略注明不适用。

| 原生命令 | 参考技能 |
|---|---|
| /chinese-code-review | chinese-code-review |
| /chinese-documentation | chinese-documentation |
| /chinese-commit-conventions | chinese-commit-conventions |
| /chinese-git-workflow | chinese-git-workflow |

用户点名参考技能时，与适用开发流程叠加使用，不能替代实际需求核查。
