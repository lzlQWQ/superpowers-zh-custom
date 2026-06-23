#!/usr/bin/env bash
# Test: testing-policy skill
# Verifies the policy budgets heavy validation and avoids unnecessary TDD.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "$SCRIPT_DIR/test-helpers.sh"

echo "=== Test: testing-policy skill ==="
echo ""

echo "Test 1: Undefined method is not a valid red test..."

output=$(run_claude "In testing-policy, if I need to add a new Java method a() and running mvn test now only fails because a() is undefined, is that a valid TDD red test? What should I do instead?" 30)

assert_contains "$output" "not.*valid\|invalid\|不算\|无效" "Rejects undefined-method red test"
assert_contains "$output" "undefined\|未定义\|compile\|编译" "Mentions compile/undefined failure"
assert_contains "$output" "B\|实现优先\|轻量\|用户验收\|断言" "Mentions fallback strategy or assertion-layer requirement"

echo ""

echo "Test 2: Small tasks can share checkpoints..."

output=$(run_claude "According to testing-policy and writing-plans, three low-risk DTO/config changes all covered by one Maven compile should be validated after each tiny task or at one shared checkpoint? Explain briefly." 30)

assert_contains "$output" "checkpoint\|检查点\|合并\|batch\|批量" "Uses checkpoint/batched validation"
assert_contains "$output" "Maven\|compile\|编译\|重型\|预算" "Mentions heavy validation budget"

echo ""

echo "Test 3: Implementers must report strategy..."

output=$(run_claude "In subagent-driven-development after the testing-policy change, what testing information must an implementer report before DONE?" 30)

assert_contains "$output" "策略\|strategy" "Reports testing strategy"
assert_contains "$output" "理由\|reason" "Reports strategy reason"
assert_contains "$output" "预算\|budget\|重型" "Reports validation budget"
assert_contains "$output" "检查点\|checkpoint" "Reports validation checkpoint"
assert_contains "$output" "命令\|command\|结果\|result" "Reports command or result"

echo ""

echo "Test 4: Ordinary slow Maven bug fix should not default to TDD..."

output=$(run_claude "A normal Java business bug has a clear root cause. The project is large, Maven compile/test is slow, and the user will manually verify. According to testing-policy, should the agent use A 强制 TDD before implementation, or another strategy? Include the strategy and validation budget." 45)

assert_contains "$output" "B\|D\|实现优先\|交付用户验证" "Chooses implementation-first or user-verification strategy"
assert_contains "$output" "0\|零\|不.*运行\|不.*重型\|预算" "Budgets no pre-implementation heavy validation"
assert_contains "$output" "用户验收\|manual\|手动" "Provides user verification path"

echo ""

echo "Test 5: Heavy validation timeout should not be retried automatically..."

output=$(run_claude "A planned Maven compile checkpoint times out after 120 seconds. According to testing-policy and executing-plans, should the agent increase timeout and rerun, or stop and report? Explain briefly." 45)

assert_contains "$output" "停止\|stop\|不.*重跑\|不得.*重跑\|不要.*重跑" "Stops instead of rerunning heavy validation"
assert_contains "$output" "汇报\|report\|用户验收\|验收路径" "Reports state or user verification path"

echo ""

echo "Test 6: High-risk payment/security changes still require strong validation..."

output=$(run_claude "A payment authorization bug can corrupt user balances. According to testing-policy, which strategy should be used and why?" 45)

assert_contains "$output" "A\|强制 TDD\|高风险\|即时" "Keeps strong validation for high-risk work"
assert_contains "$output" "支付\|权限\|数据一致性\|balance\|余额" "Mentions high-risk reason"

echo ""

echo "Test 7: Static regression checks..."

if rg -n "bug 修复.*通常.*A.*TDD|修复前.*必须.*自动化测试|测试策略先于.*实现" skills README.md docs bin tests --glob '!tests/claude-code/test-testing-policy.sh' >/tmp/testing-policy-static.txt; then
    echo "  [FAIL] Old validation wording remains"
    sed 's/^/    /' /tmp/testing-policy-static.txt
    rm -f /tmp/testing-policy-static.txt
    exit 1
else
    echo "  [PASS] Old validation wording removed"
    rm -f /tmp/testing-policy-static.txt
fi

echo ""
echo "=== All testing-policy tests passed ==="
