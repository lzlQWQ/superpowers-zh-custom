#!/usr/bin/env bash
# Test: testing-policy skill
# Verifies the policy discourages meaningless red tests and supports checkpoint validation.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "$SCRIPT_DIR/test-helpers.sh"

echo "=== Test: testing-policy skill ==="
echo ""

echo "Test 1: Undefined method is not a valid red test..."

output=$(run_claude "In testing-policy, if I need to add a new Java method a() and running mvn test now only fails because a() is undefined, is that a valid TDD red test? What should I do instead?" 30)

assert_contains "$output" "not.*valid\|invalid\|不算\|无效" "Rejects undefined-method red test"
assert_contains "$output" "undefined\|未定义\|compile\|编译" "Mentions compile/undefined failure"
assert_contains "$output" "minimal\|最小.*结构\|stub\|骨架\|断言" "Mentions minimal structure or assertion-layer test"

echo ""

echo "Test 2: Small tasks can share checkpoints..."

output=$(run_claude "According to testing-policy and writing-plans, three low-risk DTO/config changes all covered by the same typecheck should be tested after each tiny task or at one validation checkpoint? Explain briefly." 30)

assert_contains "$output" "checkpoint\|检查点\|合并\|batch\|批量" "Uses checkpoint/batched validation"
assert_contains "$output" "typecheck\|类型检查\|轻量" "Mentions lightweight/typecheck validation"

echo ""

echo "Test 3: Implementers must report strategy..."

output=$(run_claude "In subagent-driven-development after the testing-policy change, what testing information must an implementer report before DONE?" 30)

assert_contains "$output" "策略\|strategy" "Reports testing strategy"
assert_contains "$output" "理由\|reason" "Reports strategy reason"
assert_contains "$output" "检查点\|checkpoint" "Reports validation checkpoint"
assert_contains "$output" "命令\|command\|结果\|result" "Reports command or result"

echo ""
echo "=== All testing-policy tests passed ==="
