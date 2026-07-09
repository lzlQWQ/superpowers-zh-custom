#!/usr/bin/env bash
# Helper functions for Claude Code skill tests

# Run Claude Code with a prompt and capture output
# Usage: run_claude "prompt text" [timeout_seconds] [allowed_tools]
run_claude() {
    local prompt="$1"
    local timeout="${2:-60}"
    local allowed_tools="${3:-}"
    local output_file=$(mktemp)

    # Build command
    local cmd="claude -p \"$prompt\""
    if [ -n "$allowed_tools" ]; then
        cmd="$cmd --allowed-tools=$allowed_tools"
    fi

    # Run Claude in headless mode with timeout
    if timeout "$timeout" bash -c "$cmd" > "$output_file" 2>&1; then
        cat "$output_file"
        rm -f "$output_file"
        return 0
    else
        local exit_code=$?
        cat "$output_file" >&2
        rm -f "$output_file"
        return $exit_code
    fi
}

# Check if output contains a pattern
# Usage: assert_contains "output" "pattern" "test name"
assert_contains() {
    local output="$1"
    local pattern="$2"
    local test_name="${3:-test}"

    if echo "$output" | grep -q "$pattern"; then
        echo "  [PASS] $test_name"
        return 0
    else
        echo "  [FAIL] $test_name"
        echo "  Expected to find: $pattern"
        echo "  In output:"
        echo "$output" | sed 's/^/    /'
        return 1
    fi
}

# Check if output does NOT contain a pattern
# Usage: assert_not_contains "output" "pattern" "test name"
assert_not_contains() {
    local output="$1"
    local pattern="$2"
    local test_name="${3:-test}"

    if echo "$output" | grep -q "$pattern"; then
        echo "  [FAIL] $test_name"
        echo "  Did not expect to find: $pattern"
        echo "  In output:"
        echo "$output" | sed 's/^/    /'
        return 1
    else
        echo "  [PASS] $test_name"
        return 0
    fi
}

# Check if output matches a count
# Usage: assert_count "output" "pattern" expected_count "test name"
assert_count() {
    local output="$1"
    local pattern="$2"
    local expected="$3"
    local test_name="${4:-test}"

    local actual=$(echo "$output" | grep -c "$pattern" || echo "0")

    if [ "$actual" -eq "$expected" ]; then
        echo "  [PASS] $test_name (found $actual instances)"
        return 0
    else
        echo "  [FAIL] $test_name"
        echo "  Expected $expected instances of: $pattern"
        echo "  Found $actual instances"
        echo "  In output:"
        echo "$output" | sed 's/^/    /'
        return 1
    fi
}

# Check if pattern A appears before pattern B
# Usage: assert_order "output" "pattern_a" "pattern_b" "test name"
assert_order() {
    local output="$1"
    local pattern_a="$2"
    local pattern_b="$3"
    local test_name="${4:-test}"

    # Get line numbers where patterns appear
    local line_a=$(echo "$output" | grep -n "$pattern_a" | head -1 | cut -d: -f1)
    local line_b=$(echo "$output" | grep -n "$pattern_b" | head -1 | cut -d: -f1)

    if [ -z "$line_a" ]; then
        echo "  [FAIL] $test_name: pattern A not found: $pattern_a"
        return 1
    fi

    if [ -z "$line_b" ]; then
        echo "  [FAIL] $test_name: pattern B not found: $pattern_b"
        return 1
    fi

    if [ "$line_a" -lt "$line_b" ]; then
        echo "  [PASS] $test_name (A at line $line_a, B at line $line_b)"
        return 0
    else
        echo "  [FAIL] $test_name"
        echo "  Expected '$pattern_a' before '$pattern_b'"
        echo "  But found A at line $line_a, B at line $line_b"
        return 1
    fi
}

# Create a temporary test project directory
# Usage: test_project=$(create_test_project)
create_test_project() {
    local test_dir=$(mktemp -d)
    echo "$test_dir"
}

# Cleanup test project
# Usage: cleanup_test_project "$test_dir"
cleanup_test_project() {
    local test_dir="$1"
    if [ -d "$test_dir" ]; then
        rm -rf "$test_dir"
    fi
}

# Create simple vertical slice plan files for testing
# Usage: create_test_plan "$project_dir" "$plan_name"
create_test_plan() {
    local project_dir="$1"
    local plan_name="${2:-test-plan}"
    local plan_dir="$project_dir/docs/superpowers/2026-07-09-$plan_name/plans"

    mkdir -p "$plan_dir"

    cat > "$plan_dir/01-create-hello-function.md" <<'EOF'
# Create Hello Function

**所属任务：** 2026-07-09-test-plan
**计划文件：** plans/01-create-hello-function.md
**Blocked by：** None

**目标：** Create a simple hello function that returns "Hello, World!".
**端到端范围：** Source function and test coverage.
**技术栈：** JavaScript

**验收标准：**
- [ ] `hello()` returns `"Hello, World!"`

**测试策略：** B 实现优先目标验证
**策略理由：** Simple isolated function behavior.
**验证预算：** Allow `npm test` once.
**验证检查点：** 立即执行
**用户验收路径：** Run `npm test`.

## 实施步骤

**文件：**
- 创建/修改：`src/hello.js`
- 测试：`test/hello.test.js`

- [ ] Implement:
```javascript
export function hello() {
  return "Hello, World!";
}
```

运行：`npm test`
预期：hello test passes.
EOF

    cat > "$plan_dir/02-create-goodbye-function.md" <<'EOF'
# Create Goodbye Function

**所属任务：** 2026-07-09-test-plan
**计划文件：** plans/02-create-goodbye-function.md
**Blocked by：** plans/01-create-hello-function.md

**目标：** Create a goodbye function that takes a name and returns a goodbye message.
**端到端范围：** Source function and test coverage.
**技术栈：** JavaScript

**验收标准：**
- [ ] Custom name returns the expected goodbye message
- [ ] Empty string and null behavior are tested

**测试策略：** B 实现优先目标验证
**策略理由：** Simple isolated function behavior.
**验证预算：** Allow `npm test` once.
**验证检查点：** 立即执行
**用户验收路径：** Run `npm test`.

## 实施步骤

**文件：**
- 创建/修改：`src/goodbye.js`
- 测试：`test/goodbye.test.js`

- [ ] Implement:
```javascript
export function goodbye(name) {
  return `Goodbye, ${name}!`;
}
```

运行：`npm test`
预期：goodbye tests pass.
EOF

    echo "$plan_dir"
}

# Export functions for use in tests
export -f run_claude
export -f assert_contains
export -f assert_not_contains
export -f assert_count
export -f assert_order
export -f create_test_project
export -f cleanup_test_project
export -f create_test_plan
