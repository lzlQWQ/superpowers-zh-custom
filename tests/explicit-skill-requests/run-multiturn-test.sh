#!/usr/bin/env bash
# Test explicit skill requests in multi-turn conversations
# Usage: ./run-multiturn-test.sh
#
# This test builds actual conversation history to reproduce the failure mode
# where Claude skips skill invocation after extended conversation

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLUGIN_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"

TIMESTAMP=$(date +%s)
OUTPUT_DIR="/tmp/superpowers-tests/${TIMESTAMP}/explicit-skill-requests/multiturn"
mkdir -p "$OUTPUT_DIR"

# Create project directory (conversation is cwd-based)
PROJECT_DIR="$OUTPUT_DIR/project"
PLAN_DIR="$PROJECT_DIR/docs/superpowers/2026-07-09-auth-system/plans"
mkdir -p "$PLAN_DIR"

echo "=== Multi-Turn Explicit Skill Request Test ==="
echo "Output dir: $OUTPUT_DIR"
echo "Project dir: $PROJECT_DIR"
echo "Plugin dir: $PLUGIN_DIR"
echo ""

cd "$PROJECT_DIR"

# Create dummy vertical slice plan files
cat > "$PLAN_DIR/01-register-user.md" << 'EOF'
# Register User

**所属任务：** 2026-07-09-auth-system
**计划文件：** plans/01-register-user.md
**Blocked by：** None

**目标：** Add user registration with email and password.
**端到端范围：** User model, register route, tests.
**技术栈：** Test fixture

**验收标准：**
- [ ] User can register

**测试策略：** C 轻量核查
**策略理由：** Fixture only.
**验证预算：** No heavy verification.
**验证检查点：** 完成前统一执行
**用户验收路径：** Fixture path only.
EOF

cat > "$PLAN_DIR/02-login-user.md" << 'EOF'
# Login User

**所属任务：** 2026-07-09-auth-system
**计划文件：** plans/02-login-user.md
**Blocked by：** plans/01-register-user.md

**目标：** Add login and JWT middleware.
**端到端范围：** Login route, JWT middleware, tests.
**技术栈：** Test fixture

**验收标准：**
- [ ] User can log in
- [ ] Protected routes require JWT

**测试策略：** C 轻量核查
**策略理由：** Fixture only.
**验证预算：** No heavy verification.
**验证检查点：** 完成前统一执行
**用户验收路径：** Fixture path only.
EOF

# Turn 1: Start a planning conversation
echo ">>> Turn 1: Starting planning conversation..."
TURN1_LOG="$OUTPUT_DIR/turn1.json"
claude -p "I need to implement an authentication system. Let's plan this out. The requirements are: user registration with email/password, JWT tokens, and protected routes." \
    --plugin-dir "$PLUGIN_DIR" \
    --dangerously-skip-permissions \
    --max-turns 2 \
    --output-format stream-json \
    > "$TURN1_LOG" 2>&1 || true

echo "Turn 1 complete."
echo ""

# Turn 2: Continue with more planning detail
echo ">>> Turn 2: Continuing planning..."
TURN2_LOG="$OUTPUT_DIR/turn2.json"
claude -p "Good analysis. I've already written the plans to docs/superpowers/2026-07-09-auth-system/plans/. Now I'm ready to implement. What are my options for execution?" \
    --continue \
    --plugin-dir "$PLUGIN_DIR" \
    --dangerously-skip-permissions \
    --max-turns 2 \
    --output-format stream-json \
    > "$TURN2_LOG" 2>&1 || true

echo "Turn 2 complete."
echo ""

# Turn 3: The critical test - ask for subagent-driven-development
echo ">>> Turn 3: Requesting subagent-driven-development..."
TURN3_LOG="$OUTPUT_DIR/turn3.json"
claude -p "subagent-driven-development, please" \
    --continue \
    --plugin-dir "$PLUGIN_DIR" \
    --dangerously-skip-permissions \
    --max-turns 2 \
    --output-format stream-json \
    > "$TURN3_LOG" 2>&1 || true

echo "Turn 3 complete."
echo ""

echo "=== Results ==="

# Check if skill was triggered in Turn 3
SKILL_PATTERN='"skill":"([^"]*:)?subagent-driven-development"'
if grep -q '"name":"Skill"' "$TURN3_LOG" && grep -qE "$SKILL_PATTERN" "$TURN3_LOG"; then
    echo "PASS: Skill 'subagent-driven-development' was triggered in Turn 3"
    TRIGGERED=true
else
    echo "FAIL: Skill 'subagent-driven-development' was NOT triggered in Turn 3"
    TRIGGERED=false
fi

# Show what skills were triggered
echo ""
echo "Skills triggered in Turn 3:"
grep -o '"skill":"[^"]*"' "$TURN3_LOG" 2>/dev/null | sort -u || echo "  (none)"

# Check for premature action in Turn 3
echo ""
echo "Checking for premature action in Turn 3..."
FIRST_SKILL_LINE=$(grep -n '"name":"Skill"' "$TURN3_LOG" | head -1 | cut -d: -f1)
if [ -n "$FIRST_SKILL_LINE" ]; then
    PREMATURE_TOOLS=$(head -n "$FIRST_SKILL_LINE" "$TURN3_LOG" | \
        grep '"type":"tool_use"' | \
        grep -v '"name":"Skill"' | \
        grep -v '"name":"TodoWrite"' || true)
    if [ -n "$PREMATURE_TOOLS" ]; then
        echo "WARNING: Tools invoked BEFORE Skill tool in Turn 3:"
        echo "$PREMATURE_TOOLS" | head -5
    else
        echo "OK: No premature tool invocations detected"
    fi
else
    echo "WARNING: No Skill invocation found in Turn 3"
    # Show what WAS invoked
    echo ""
    echo "Tools invoked in Turn 3:"
    grep '"type":"tool_use"' "$TURN3_LOG" | grep -o '"name":"[^"]*"' | head -10 || echo "  (none)"
fi

# Show Turn 3 assistant response
echo ""
echo "Turn 3 first assistant response (truncated):"
grep '"type":"assistant"' "$TURN3_LOG" | head -1 | jq -r '.message.content[0].text // .message.content' 2>/dev/null | head -c 500 || echo "  (could not extract)"

echo ""
echo "Logs:"
echo "  Turn 1: $TURN1_LOG"
echo "  Turn 2: $TURN2_LOG"
echo "  Turn 3: $TURN3_LOG"
echo "Timestamp: $TIMESTAMP"

if [ "$TRIGGERED" = "true" ]; then
    exit 0
else
    exit 1
fi
