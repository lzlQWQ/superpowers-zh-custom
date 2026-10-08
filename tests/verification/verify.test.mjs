import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { initialize, runCheck, completeTask, status, amendPolicy, readPolicies } from '../../skills/using-superpowers/scripts/verify.mjs';

function fixture(t, level = 'medium', overrides = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'superpowers-verification-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  execFileSync('git', ['init', '-q', root]);
  fs.writeFileSync(path.join(root, '.gitignore'), '.superpowers/\n');
  fs.mkdirSync(path.join(root, 'src'));
  fs.writeFileSync(path.join(root, 'src/index.js'), 'export const value = 1;\n');
  fs.writeFileSync(path.join(root, 'package.json'), '{"type":"module"}\n');
  const policy = { version: 1, task: '1', level, reason: '测试范围明确', mode: level === 'low' ? 'compile' : 'batch', acceptance: ['返回正确结果'], review: 'self', scope: ['src'], checks: [{ id: 'compile', kind: 'compile', command: process.execPath, args: ['--check', 'src/index.js'], timeoutMs: 5000 }], ...overrides };
  const policyFile = path.join(root, 'policy.json');
  fs.writeFileSync(policyFile, JSON.stringify(policy));
  const workspace = path.join(root, '.superpowers', 'validation');
  initialize(policyFile, workspace, root);
  return { root, policy, policyFile, workspace };
}

test('低等级仅一次编译机会，换角色和初始化不能恢复额度', (t) => {
  const f = fixture(t, 'low');
  assert.equal(runCheck(f.workspace, '1', 'initial', 'verify', 'compile', 'implementer').result, 'passed');
  assert.equal(completeTask(f.workspace, '1').complete, true);
  initialize(f.policyFile, f.workspace, f.root);
  assert.throws(() => runCheck(f.workspace, '1', 'initial', 'verify', 'compile', 'reviewer'), /消耗/);
  assert.throws(() => runCheck(f.workspace, '1', 'again', 'verify', 'compile', 'main'), /耗尽/);
});

test('低等级语法失败阻止完成并消耗唯一机会', (t) => {
  const f = fixture(t, 'low');
  fs.writeFileSync(path.join(f.root, 'src/index.js'), 'export const = ;');
  assert.equal(runCheck(f.workspace, '1', 'first', 'verify', 'compile', 'main').result, 'failed');
  assert.throws(() => completeTask(f.workspace, '1'), /有效通过/);
  fs.writeFileSync(path.join(f.root, 'src/index.js'), 'export const x=1;');
  assert.throws(() => runCheck(f.workspace, '1', 'repair1', 'repair', 'compile', 'main'), /耗尽/);
});

test('中等级集中多项检查，修复最多两轮，跨代理共享', (t) => {
  const f = fixture(t, 'medium', { checks: [
    { id: 'compile', kind: 'compile', command: process.execPath, args: ['--check', 'src/index.js'], timeoutMs: 5000 },
    { id: 'unit', kind: 'unit', command: process.execPath, args: ['--input-type=module', '-e', "import {value} from './src/index.js';process.exit(value===3?0:1)"], timeoutMs: 5000 },
  ] });
  assert.equal(runCheck(f.workspace, '1', 'initial', 'verify', 'compile', 'main').result, 'passed');
  assert.equal(runCheck(f.workspace, '1', 'initial', 'verify', 'unit', 'implementer').result, 'failed');
  assert.throws(() => completeTask(f.workspace, '1'), /有效通过/);
  fs.writeFileSync(path.join(f.root, 'src/index.js'), 'export const value=2;');
  assert.equal(runCheck(f.workspace, '1', 'fix1', 'repair', 'unit', 'implementer').result, 'failed');
  fs.writeFileSync(path.join(f.root, 'src/index.js'), 'export const value=3;');
  assert.equal(runCheck(f.workspace, '1', 'fix2', 'repair', 'unit', 'reviewer').result, 'passed');
  assert.equal(runCheck(f.workspace, '1', 'fix2', 'repair', 'compile', 'main').result, 'passed');
  assert.equal(completeTask(f.workspace, '1').complete, true);
  assert.throws(() => runCheck(f.workspace, '1', 'fix3', 'repair', 'unit', 'main'), /耗尽/);
  assert.equal(status(f.workspace).tasks[0].runs.length, 5);
});

test('有效证据可以交接，源码和依赖修改使其过期', (t) => {
  const f = fixture(t);
  runCheck(f.workspace, '1', 'initial', 'verify', 'compile', 'implementer');
  completeTask(f.workspace, '1');
  assert.equal(status(f.workspace).tasks[0].complete, true);
  fs.writeFileSync(path.join(f.root, 'outside.txt'), '无关内容');
  assert.equal(status(f.workspace).tasks[0].complete, true);
  fs.writeFileSync(path.join(f.root, 'package.json'), '{"type":"module","version":"2"}');
  assert.equal(status(f.workspace).tasks[0].complete, false);
  assert.throws(() => completeTask(f.workspace, '1'), /有效通过/);
});

test('导入错误不算红灯，不允许未经有效红灯进入绿灯', (t) => {
  const f = fixture(t, 'high', { mode: 'red-green', checks: [{ id: 'behavior', kind: 'behavior', command: process.execPath, args: ['--input-type=module', '-e', "import './missing.js'"], timeoutMs: 5000 }], red: { behavior: '拒绝越权请求', expectedFailure: '当前错误允许请求', value: '证明权限缺陷存在', check: 'behavior', failurePattern: '.*' } });
  assert.equal(runCheck(f.workspace, '1', 'red1', 'red', 'behavior', 'main').result, 'failed');
  assert.throws(() => runCheck(f.workspace, '1', 'green1', 'verify', 'behavior', 'main'), /有效行为红灯/);
  assert.throws(() => runCheck(f.workspace, '1', 'red2', 'red', 'behavior', 'main'), /耗尽/);
});

test('真实行为断言红灯、绿灯可验证，高等级完整验证全计划一次', (t) => {
  const f = fixture(t, 'high', { mode: 'red-green', checks: [
    { id: 'behavior', kind: 'behavior', command: process.execPath, args: ['--input-type=module', '-e', "import assert from 'node:assert/strict';import {value} from './src/index.js';assert.equal(value,2)"], timeoutMs: 5000 },
    { id: 'full', kind: 'full', command: process.execPath, args: ['--check', 'src/index.js'], timeoutMs: 5000 },
  ], red: { behavior: '返回 2', expectedFailure: '当前返回 1', value: '核实可观察差距', check: 'behavior', failurePattern: 'AssertionError' } });
  assert.equal(runCheck(f.workspace, '1', 'red1', 'red', 'behavior', 'main').result, 'expected-red');
  fs.writeFileSync(path.join(f.root, 'src/index.js'), 'export const value=2;');
  assert.equal(runCheck(f.workspace, '1', 'green1', 'verify', 'behavior', 'main').result, 'passed');
  assert.throws(() => completeTask(f.workspace, '1'), /full/);
  assert.equal(runCheck(f.workspace, '1', 'final', 'final', 'full', 'main').result, 'passed');
  assert.equal(completeTask(f.workspace, '1').complete, true);
  assert.throws(() => runCheck(f.workspace, '1', 'final2', 'final', 'full', 'main'), /耗尽|完整验证/);
});

test('超时和启动失败消耗预算，不冒充通过', (t) => {
  const f = fixture(t, 'low', { checks: [{ id: 'compile', kind: 'compile', command: 'superpowers-missing-command-123', args: [], timeoutMs: 5000 }] });
  assert.equal(runCheck(f.workspace, '1', 'first', 'verify', 'compile', 'main').result, 'failed');
  assert.throws(() => completeTask(f.workspace, '1'), /有效通过/);
  const g = fixture(t, 'low', { checks: [{ id: 'compile', kind: 'compile', command: process.execPath, args: ['-e', 'setTimeout(()=>{},5000)'], timeoutMs: 30 }] });
  assert.equal(runCheck(g.workspace, '1', 'first', 'verify', 'compile', 'main').result, 'failed');
});

test('检查期间修改源码产生过期结果', (t) => {
  const f = fixture(t, 'low', { checks: [{ id: 'compile', kind: 'compile', command: process.execPath, args: ['-e', "require('fs').appendFileSync('src/index.js','// modified')"], timeoutMs: 5000 }] });
  assert.equal(runCheck(f.workspace, '1', 'first', 'verify', 'compile', 'main').result, 'stale');
  assert.throws(() => completeTask(f.workspace, '1'), /有效通过/);
});

test('策略调整要求授权并保存历史，新增额度不删除已消耗记录', (t) => {
  const f = fixture(t, 'low');
  runCheck(f.workspace, '1', 'first', 'verify', 'compile', 'main');
  fs.writeFileSync(f.policyFile, JSON.stringify({ ...f.policy, budget: { verify: 2 } }));
  assert.throws(() => amendPolicy(f.workspace, '1', f.policyFile, ''), /授权/);
  amendPolicy(f.workspace, '1', f.policyFile, '用户明确允许追加一次编译检查');
  runCheck(f.workspace, '1', 'second', 'verify', 'compile', 'main');
  const state = status(f.workspace);
  assert.equal(state.tasks[0].runs.length, 2);
  assert.equal(state.tasks[0].amendments.length, 1);
  assert.throws(() => runCheck(f.workspace, '1', 'third', 'verify', 'compile', 'main'), /耗尽/);
});

test('工作区锁阻止重复分配，旧计划明确缺少策略', (t) => {
  const f = fixture(t);
  fs.writeFileSync(path.join(f.workspace, 'verification.lock'), '');
  assert.throws(() => runCheck(f.workspace, '1', 'first', 'verify', 'compile', 'main'), /正在更新/);
  fs.unlinkSync(path.join(f.workspace, 'verification.lock'));
  const plan = path.join(f.root, 'plan.md');
  fs.writeFileSync(plan, '# 旧计划\n## 任务 1\n实现功能');
  assert.throws(() => initialize(plan, path.join(f.root, '.superpowers', 'legacy'), f.root), /缺少完整任务/);
  fs.writeFileSync(plan, '~~~verification-policy\n{"version":1,"defaults":{"level":"medium"}}\n~~~\n### 任务 1\n```verification-policy\n' + JSON.stringify(f.policy) + '\n```\n');
  assert.equal(readPolicies(plan).length, 1);
});
