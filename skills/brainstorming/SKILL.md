---
name: brainstorming
description: 仅在用户通过原生命令调用时进行需求分析与设计；普通功能需求不自动触发，也不自动转入写计划或实现
version: "1.0.0"
license: MIT
metadata:
  hermes:
    tags: [design, planning]
disable-model-invocation: true
---

# 头脑风暴：需求与设计

本节是 superpowers-zh 的增量内容：仅原生命令启动，本技能不自动转入计划或实现。

## 范围

产出能被用户审阅、纠正的需求理解和设计。先读取 [分级验证策略](../using-superpowers/references/verification-policy.md)。设计复杂度和验证等级分别判断，不能以设计简短推断风险低。

## 分析流程

1. 只读探索现有流程、约束和相关接口，明确目标、受众与成功标准；已知信息不重复询问。
2. 复述需求和关键假设，补充确实影响方案的问题。
3. 选择产物：探路给出可行性建议；有界修改给简短设计；新项目、子系统或架构关系变化给书面规格。
4. 比较必要的方案，说明取舍、范围和外部影响。
5. 按任务风险分析 low/medium/high，提出验收行为、编译或测试范围、是否需要有意义的红灯和成本预算。探路若需要实验，也预先登记次数；不借探路无限测试。
6. 展示设计供用户审阅，修正矛盾和遗漏。书面规格默认保存到 docs/superpowers/specs/YYYY-MM-DD-<topic>-design.md，用户指定位置优先；不自动提交。

## 完成与交接

核对需求覆盖、假设、接口关系、验证选择及风险，交付设计或建议。用户批准设计仍只是本阶段审阅，不能启动 writing-plans 或实现。提示用户下一阶段的原生命令，然后结束。

## 视觉伴侣

只有视觉问题需要时才提供选择，用户同意后按 [视觉伴侣](visual-companion.md) 使用 scripts/start-server.sh。没有视觉需求不启动服务器；调用不会授权开发下一阶段。
