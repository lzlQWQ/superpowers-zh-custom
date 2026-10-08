import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import plugin from '../../.opencode/plugins/superpowers.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const manual = ['brainstorming', 'writing-plans', 'executing-plans', 'subagent-driven-development'];

test('OpenCode 注册手动技能时禁用 autoinvoke，保留情境技能', async () => {
  const registered = [];
  await plugin.setup({ skill: { transform: async (fn) => fn({ add: (value) => registered.push(value) }) }, session: { hook: async () => {} } });
  assert.equal(registered.length, 21);
  for (const name of manual) assert.equal(registered.find((s) => s.name === name).autoinvoke, false);
  assert.equal(registered.find((s) => s.name === 'systematic-debugging').autoinvoke, undefined);
});

test('Claude 和 Codex 安装、升级携带平台限制及策略，保留用户指令', (t) => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'superpowers-install-policy-'));
  t.after(() => fs.rmSync(temp, { recursive: true, force: true }));
  const installer = path.join(root, 'bin/superpowers-zh.js');
  execFileSync(process.execPath, [installer, '--tool', 'claude'], { cwd: temp });
  const guide = path.join(temp, 'CLAUDE.md');
  fs.appendFileSync(guide, '\n用户自定义：保留这句话\n');
  execFileSync(process.execPath, [installer, '--tool', 'claude', '--force'], { cwd: temp });
  assert.ok(fs.readFileSync(guide, 'utf8').includes('用户自定义：保留这句话'));
  assert.equal(fs.readFileSync(guide, 'utf8').split('<!-- superpowers-zh:begin').length, 2);
  execFileSync(process.execPath, [installer, '--tool', 'codex'], { cwd: temp });
  for (const dir of ['.claude/skills', '.agents/skills']) {
    for (const name of manual) {
      assert.match(fs.readFileSync(path.join(temp, dir, name, 'SKILL.md'), 'utf8'), /^disable-model-invocation: true$/m);
      assert.match(fs.readFileSync(path.join(temp, dir, name, 'agents/openai.yaml'), 'utf8'), /allow_implicit_invocation: false/);
    }
    assert.ok(fs.existsSync(path.join(temp, dir, 'using-superpowers/references/verification-policy.md')));
    assert.ok(fs.existsSync(path.join(temp, dir, 'using-superpowers/scripts/verify.mjs')));
  }
});

test('项目平台引导由共用规则生成，不恢复自动规划和强制 TDD', (t) => {
  for (const tool of ['trae', 'kiro', 'qwen', 'gemini', 'cline', 'kilocode', 'qoder']) {
    const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'superpowers-bootstrap-' + tool + '-'));
    t.after(() => fs.rmSync(temp, { recursive: true, force: true }));
    const output = execFileSync(process.execPath, [path.join(root, 'bin/superpowers-zh.js'), '--tool', tool], { cwd: temp, encoding: 'utf8' });
    assert.match(output, /21/);
    const contents = [];
    function visit(dir) { for (const entry of fs.readdirSync(dir, { withFileTypes: true })) { const full = path.join(dir, entry.name); if (entry.isDirectory() && entry.name !== 'skills') visit(full); else if (entry.isFile() && /\.(md|mdc)$/.test(entry.name)) contents.push(fs.readFileSync(full, 'utf8')); } }
    visit(temp);
    assert.ok(contents.some((text) => text.includes('集中验证并共享预算')), tool);
    assert.ok(!contents.some((text) => text.includes('收到功能需求时，先用 brainstorming') || text.includes('写代码前先写测试（TDD）')), tool);
  }
});
