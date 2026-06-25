---
name: test-driven-development
description: 仅当 testing-policy 判定为“A. 强制 TDD”时使用——适用于安全、支付、权限、数据一致性、公共协议/API 或用户明确要求回归测试的高风险任务
version: "1.0.0"
license: MIT
metadata:
  hermes:
    tags: [testing, development]
---

# 测试驱动开发（TDD）

先用 `testing-policy` 选择验证预算和策略。只有策略 A（强制 TDD）才执行本技能。

## 适用边界

**必须使用 TDD：**
- 安全、权限、支付、数据完整性
- 对外 API、公共方法或协议的行为变更
- 用户明确要求回归测试或 TDD
- `testing-policy` 明确判定需要即时红绿循环的高风险场景

**不要强行使用 TDD：**
- 普通业务 bug 修复
- 新增方法签名、空实现、DTO、类型适配
- 简单透传、配置、样式、文案、文档
- 生成代码或机械性迁移
- 红灯需要 Maven/Gradle 编译、复杂 mock/stub、外部环境或长时间运行
- 红灯只能得到编译失败，无法进入断言层

这些场景按 `testing-policy` 使用 B/C/D：先实现、轻量核查，或交付用户验收。

## 准入门槛

```
有效红灯 = 低成本执行到断言，并因预期行为缺失而失败。
```

同时满足以下条件才允许继续：

- 测试运行成本低，不属于重型验证。
- setup 简单，不需要大量 mock/stub。
- 失败能提供新增事实。
- 不会在业务实现前消耗主要开发时间。

以下失败不算 TDD 红灯：

- 方法、类、字段、模块尚未定义
- import 或类型声明缺失
- Maven/TypeScript/编译器在测试断言前失败
- 测试框架或环境配置错误

遇到无效红灯或高成本红灯时，停止 TDD，按 `testing-policy` 降级为 B 或 C。

## 红-绿-重构

### 1. 红：写失败的行为测试

写一个最小测试，只表达一个期望行为。

```typescript
test('retries failed operations 3 times', async () => {
  let attempts = 0;
  const operation = () => {
    attempts++;
    if (attempts < 3) throw new Error('fail');
    return 'success';
  };

  const result = await retryOperation(operation);

  expect(result).toBe('success');
  expect(attempts).toBe(3);
});
```

要求：
- 名称描述业务行为
- 只测一件事
- 优先使用真实代码，mock 只用于不可控边界

### 2. 验证红灯

运行最小、低成本目标测试命令。

```bash
npm test path/to/test.test.ts
```

确认：
- 测试执行到断言
- 失败原因是预期行为缺失
- 不是编译、导入、测试脚手架或环境错误

如果失败原因无效，先补最小结构或修测试环境，再重新验证红灯。

如果命令超时、超过 5 分钟、需要重型编译，或失败来自复杂测试基线，不要继续调测试；降级并报告。

### 3. 绿：写最少实现

只写让测试通过的代码。不要顺手加未要求的功能、重构或“以后可能用到”的选项。

### 4. 验证绿灯

重新运行同一个目标测试。通过后，根据 `testing-policy` 的验证预算决定是否还需要检查点。

### 5. 重构

只有在绿灯后重构。重构后重新运行足以覆盖该行为的验证命令。

## Bug 修复模式

1. 先重现原始 bug。
2. 确认 `testing-policy` 仍判定为 A。
3. 写能失败的回归测试，且失败原因必须是原始症状。
3. 实现最小修复。
4. 跑回归测试通过。
5. 按验证预算决定是否还跑相关验证。

没有策略 A 时，不要声称完成了 TDD；可以按 B/C/D 完成代码改动并提供用户验收路径。

## 完成前报告

汇报时包含：
- **测试策略：** A
- **验证预算：** 已用几次重型验证，是否还有预算
- **红灯证据：** 命令和预期失败原因
- **绿灯证据：** 命令和通过结果
- **后续验证：** 检查点或用户验收路径

如果没有有效红灯，不要声称完成了 TDD；说明采用了 `testing-policy` 的其他策略。

