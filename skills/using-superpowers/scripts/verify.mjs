import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const phases = ['red', 'verify', 'repair', 'final'];
const caps = { low: { red: 0, verify: 1, repair: 0, final: 0 }, medium: { red: 0, verify: 1, repair: 2, final: 0 }, high: { red: 1, verify: 1, repair: 2, final: 1 } };
const assert = (value, message) => { if (!value) throw new Error(message); };
const hash = (value) => crypto.createHash('sha256').update(value).digest('hex');
const safeId = (value) => /^[\p{L}\p{N}_-]+$/u.test(value);
const inside = (root, target) => { const rel = path.relative(root, target); return rel === '' || (!rel.startsWith('..' + path.sep) && rel !== '..' && !path.isAbsolute(rel)); };
const dependencies = ['package.json', 'package-lock.json', 'pnpm-lock.yaml', 'yarn.lock', 'tsconfig.json', 'Cargo.toml', 'Cargo.lock', 'pyproject.toml', 'requirements.txt', 'go.mod', 'go.sum', 'CMakeLists.txt'];

export function validatePolicy(input) {
  const policy = structuredClone(input);
  assert(policy.version === 1 && typeof policy.task === 'string' && safeId(policy.task), '策略版本或任务标识无效');
  assert(policy.level in caps, '任务等级无效');
  assert(['compile', 'batch', 'red-green'].includes(policy.mode), '验证方式无效');
  assert(typeof policy.reason === 'string' && policy.reason.trim(), '必须填写等级依据');
  assert(['self', 'batch', 'independent'].includes(policy.review), '审查方式无效');
  assert(Array.isArray(policy.acceptance) && policy.acceptance.length && policy.acceptance.every((v) => typeof v === 'string' && v.trim()), '必须填写验收行为');
  validateScope(policy.scope);
  assert(Array.isArray(policy.checks) && policy.checks.length, '必须登记检查');
  const ids = new Set();
  for (const check of policy.checks) {
    assert(typeof check.id === 'string' && safeId(check.id) && !ids.has(check.id), '检查标识无效或重复');
    ids.add(check.id);
    assert(['compile', 'unit', 'integration', 'full', 'behavior'].includes(check.kind), '检查类型无效');
    assert(typeof check.command === 'string' && check.command.trim() && Array.isArray(check.args) && check.args.every((v) => typeof v === 'string'), '命令必须使用可执行文件与参数数组');
    assert(Number.isSafeInteger(check.timeoutMs) && check.timeoutMs > 0, '必须设置检查超时');
    if (check.scope) validateScope(check.scope);
    if (check.envNames) assert(Array.isArray(check.envNames) && check.envNames.every((v) => typeof v === 'string' && /^[A-Za-z_][A-Za-z0-9_]*$/.test(v)), '环境变量名无效');
    assert(check.kind !== 'full' || policy.level === 'high', '完整套件仅 high 可登记');
  }
  if (policy.level === 'low') assert(policy.mode === 'compile' && policy.checks.length === 1 && policy.checks[0].kind === 'compile', 'low 仅允许一次编译、语法或结构检查');
  const defaults = { ...caps[policy.level] };
  if (policy.mode === 'red-green') {
    assert(policy.level !== 'low' && policy.red, '此任务不允许红灯或缺少红灯策略');
    for (const key of ['behavior', 'expectedFailure', 'value', 'failurePattern']) assert(typeof policy.red[key] === 'string' && policy.red[key].trim(), '红灯缺少 ' + key);
    assert(ids.has(policy.red.check) && policy.checks.find((c) => c.id === policy.red.check).kind !== 'full', '红灯检查未登记');
    new RegExp(policy.red.failurePattern, 'm');
    defaults.red = 1;
  } else defaults.red = 0;
  policy.budget = { ...defaults, ...policy.budget };
  assert(Object.keys(policy.budget).every((key) => phases.includes(key)), '未知预算类型');
  for (const key of phases) {
    assert(Number.isSafeInteger(policy.budget[key]) && policy.budget[key] >= 0, '预算必须是非负整数');
    assert(policy.budget[key] <= defaults[key] || (typeof policy.authorization === 'string' && policy.authorization.trim()), '超过默认预算须记录用户授权');
  }
  return policy;
}

function validateScope(scope) {
  assert(Array.isArray(scope) && scope.length && scope.every((s) => typeof s === 'string' && s.length && !path.isAbsolute(s) && !s.split(/[\\/]/).includes('..') && !s.startsWith('-')), 'scope 必须是仓库内相对路径');
}

export function readPolicies(file) {
  const text = fs.readFileSync(file, 'utf8');
  const values = path.extname(file) === '.json' ? [JSON.parse(text)] : [...text.matchAll(/(?:```|~~~)verification-policy\s*\r?\n([\s\S]*?)\r?\n(?:```|~~~)/g)].map((m) => JSON.parse(m[1]));
  return values.flatMap((value) => Array.isArray(value) ? value : value.tasks ?? (value.task ? [value] : [])).map(validatePolicy);
}

function fingerprint(root, policy, check) {
  const scope = [...new Set([...(check.scope ?? policy.scope), ...dependencies])];
  const files = execFileSync('git', ['-C', root, 'ls-files', '-z', '--cached', '--others', '--exclude-standard', '--', ...scope], { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 }).split('\0').filter(Boolean).sort();
  for (const entry of scope) {
    const full = path.resolve(root, entry);
    if (fs.existsSync(full) && fs.lstatSync(full).isFile()) files.push(entry);
  }
  const digest = crypto.createHash('sha256');
  digest.update(JSON.stringify({ scope, check, env: (check.envNames ?? []).map((name) => [name, hash(process.env[name] ?? '')]) }));
  for (const file of [...new Set(files)]) {
    const full = path.resolve(root, file);
    assert(inside(root, full), '检查文件不在仓库内');
    digest.update(file + '\0');
    if (!fs.existsSync(full)) digest.update('已删除');
    else if (fs.lstatSync(full).isSymbolicLink()) {
      const real = fs.realpathSync(full);
      assert(inside(root, real), '验证范围不能包含仓库外符号链接');
      digest.update(fs.readlinkSync(full));
      if (fs.statSync(real).isFile()) digest.update(fs.readFileSync(real));
    } else if (fs.statSync(full).isFile()) digest.update(fs.readFileSync(full));
  }
  return digest.digest('hex');
}

function statePath(workspace) { return path.join(workspace, 'verification.json'); }
function locked(workspace, fn) {
  fs.mkdirSync(workspace, { recursive: true });
  const lock = path.join(workspace, 'verification.lock');
  let fd;
  try { fd = fs.openSync(lock, 'wx'); } catch (error) { if (error.code === 'EEXIST') throw new Error('验证账本正在更新；不要重复分配编号'); throw error; }
  try { return fn(); } finally { fs.closeSync(fd); fs.unlinkSync(lock); }
}
function readState(workspace) { return JSON.parse(fs.readFileSync(statePath(workspace), 'utf8')); }
function saveState(workspace, state) {
  const target = statePath(workspace);
  const temporary = target + '.' + process.pid + '.tmp';
  fs.writeFileSync(temporary, JSON.stringify(state, null, 2) + '\n');
  fs.renameSync(temporary, target);
}

export function initialize(file, workspace, cwd = process.cwd()) {
  const policies = readPolicies(file);
  assert(policies.length && new Set(policies.map((p) => p.task)).size === policies.length, '缺少完整任务策略或任务重复');
  const root = execFileSync('git', ['-C', cwd, 'rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim();
  return locked(workspace, () => {
    if (fs.existsSync(statePath(workspace))) {
      const state = readState(workspace);
      assert(path.resolve(state.root) === path.resolve(root) && JSON.stringify(state.tasks.map((t) => t.policy)) === JSON.stringify(policies), '已有策略不同；必须 amend，不能重置预算');
      return state;
    }
    const state = { version: 1, root, finalRound: null, tasks: policies.map((policy) => ({ policy, runs: [], complete: false, amendments: [] })) };
    saveState(workspace, state);
    return state;
  });
}

export function runCheck(workspace, taskId, round, phase, checkId, role) {
  assert(safeId(round) && phases.includes(phase) && ['main', 'implementer', 'reviewer'].includes(role), '轮次、阶段或执行角色无效');
  const reserved = locked(workspace, () => {
    const state = readState(workspace);
    const task = state.tasks.find((t) => t.policy.task === taskId);
    assert(task, '任务不存在');
    const check = task.policy.checks.find((c) => c.id === checkId);
    assert(check, '检查未登记');
    assert(phase !== 'red' || (task.policy.mode === 'red-green' && task.policy.red.check === checkId), '不是已登记的红灯检查');
    assert((phase === 'final') === (check.kind === 'full'), '完整套件只在 final 阶段运行');
    const sameRound = task.runs.filter((r) => r.round === round);
    assert(sameRound.every((r) => r.phase === phase), '同一编号不能跨阶段使用');
    assert(!sameRound.some((r) => r.check === checkId), '同轮检查已经消耗机会');
    const used = new Set(task.runs.filter((r) => r.phase === phase).map((r) => r.round));
    assert(used.has(round) || used.size < task.policy.budget[phase], '验证预算耗尽');
    if (phase === 'repair') assert(task.runs.some((r) => r.phase === 'verify'), '先进行首轮验证');
    if (phase === 'verify' && task.policy.mode === 'red-green') assert(task.runs.some((r) => r.phase === 'red' && r.result === 'expected-red'), '必须先取得有效行为红灯');
    if (phase === 'final') {
      assert(task.policy.level === 'high', 'final 仅 high 可用');
      assert(state.finalRound === null || state.finalRound === round, '全计划完整验证已消耗机会');
      state.finalRound = round;
    }
    const evidence = { id: crypto.randomUUID(), check: checkId, round, phase, role, started: new Date().toISOString(), fingerprint: fingerprint(state.root, task.policy, check), result: 'running', command: check.command, args: check.args };
    task.runs.push(evidence);
    task.complete = false;
    saveState(workspace, state);
    return { root: state.root, policy: task.policy, check, evidence };
  });
  const logs = path.join(workspace, 'verification-logs');
  fs.mkdirSync(logs, { recursive: true });
  const log = path.join(logs, reserved.evidence.id + '.log');
  const fd = fs.openSync(log, 'w');
  let child;
  try { child = spawnSync(reserved.check.command, reserved.check.args, { cwd: reserved.root, stdio: ['ignore', fd, fd], timeout: reserved.check.timeoutMs, windowsHide: true, shell: false }); }
  catch (error) { child = { status: null, error }; }
  finally { fs.closeSync(fd); }
  const output = fs.readFileSync(log, 'utf8');
  let after;
  try { after = fingerprint(reserved.root, reserved.policy, reserved.check); } catch { after = null; }
  let result = child.status === 0 && !child.error ? 'passed' : 'failed';
  if (reserved.evidence.phase === 'red') {
    const infrastructure = /SyntaxError|ReferenceError|ModuleNotFoundError|ImportError|ERR_MODULE_NOT_FOUND|Cannot find module|is not defined|command not found|not recognized|ENOENT/i;
    result = child.status !== null && child.status !== 0 && !child.error && !infrastructure.test(output) && new RegExp(reserved.policy.red.failurePattern, 'm').test(output) ? 'expected-red' : 'failed';
  }
  if (after !== reserved.evidence.fingerprint) result = 'stale';
  locked(workspace, () => {
    const state = readState(workspace);
    const task = state.tasks.find((t) => t.policy.task === taskId);
    const run = task.runs.find((r) => r.id === reserved.evidence.id);
    Object.assign(run, { result, exitCode: child.status, error: child.error?.code ?? null, finished: new Date().toISOString(), log });
    saveState(workspace, state);
  });
  return { result, exitCode: child.status, log };
}

export function completeTask(workspace, taskId) {
  return locked(workspace, () => {
    const state = readState(workspace);
    const task = state.tasks.find((t) => t.policy.task === taskId);
    assert(task, '任务不存在');
    assert(!task.runs.some((r) => r.result === 'running'), '存在未结束的检查');
    for (const check of task.policy.checks) {
      const run = task.runs.filter((r) => r.check === check.id && r.phase !== 'red').at(-1);
      assert(run?.result === 'passed' && run.fingerprint === fingerprint(state.root, task.policy, check), '缺少有效通过证据：' + check.id);
    }
    if (task.policy.mode === 'red-green') assert(task.runs.some((r) => r.result === 'expected-red'), '缺少行为红灯证据');
    task.complete = true;
    task.completed = new Date().toISOString();
    saveState(workspace, state);
    return { task: taskId, complete: true, evidence: task.runs.filter((r) => r.result === 'passed').map((r) => r.id) };
  });
}

export function amendPolicy(workspace, taskId, file, authorization) {
  assert(typeof authorization === 'string' && authorization.trim(), '必须记录用户明确授权原文');
  const input = JSON.parse(fs.readFileSync(file, 'utf8'));
  const policy = validatePolicy({ ...input, authorization });
  assert(policy.task === taskId, '不能更换任务标识重置预算');
  return locked(workspace, () => {
    const state = readState(workspace);
    const task = state.tasks.find((t) => t.policy.task === taskId);
    assert(task && !task.runs.some((r) => r.result === 'running'), '任务不存在或仍有检查在运行');
    task.amendments.push({ at: new Date().toISOString(), authorization, previous: task.policy });
    task.policy = policy;
    task.complete = false;
    saveState(workspace, state);
    return policy;
  });
}

export function status(workspace) {
  const state = readState(workspace);
  return { ...state, tasks: state.tasks.map((task) => ({ ...task, complete: task.complete && task.policy.checks.every((check) => { const run = task.runs.filter((r) => r.check === check.id && r.phase !== 'red').at(-1); return run?.result === 'passed' && run.fingerprint === fingerprint(state.root, task.policy, check); }) })) };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const [action, ...args] = process.argv.slice(2);
    let result;
    if (action === 'init' && args.length === 2) result = initialize(path.resolve(args[0]), path.resolve(args[1]));
    else if (action === 'run' && args.length === 6) result = runCheck(path.resolve(args[0]), ...args.slice(1));
    else if (action === 'status' && args.length === 1) result = status(path.resolve(args[0]));
    else if (action === 'complete' && args.length === 2) result = completeTask(path.resolve(args[0]), args[1]);
    else if (action === 'amend' && args.length === 4) result = amendPolicy(path.resolve(args[0]), args[1], path.resolve(args[2]), args[3]);
    else throw new Error('用法：verify.mjs init 文件 工作区 | run 工作区 任务 轮次 red/verify/repair/final 检查 main/implementer/reviewer | status 工作区 | complete 工作区 任务 | amend 工作区 任务 文件 用户授权');
    console.log(JSON.stringify(result, null, 2));
    if (result.result && !['passed', 'expected-red'].includes(result.result)) process.exitCode = 1;
  } catch (error) { console.error(error.message); process.exitCode = 2; }
}
