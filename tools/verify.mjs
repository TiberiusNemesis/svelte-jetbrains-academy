// Checks every task in the course:
//   1. the files its task-info.yaml lists exist,
//   2. its Vite boilerplate matches every other task's,
//   3. its tests pass on the solution (the files as committed),
//   4. its tests fail on the starter (placeholders swapped in).
//
// Usage: npm run verify

import { spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative } from 'node:path';
import { parse } from 'yaml';

const root = join(import.meta.dirname, '..');
const starterRoot = join(root, '.verify');
const boilerplate = ['index.html', 'package.json', 'src/main.js', 'vite.config.js'];

const readYaml = (path) => parse(readFileSync(join(root, path), 'utf8'));
const problems = [];

// Walk course -> sections -> lessons -> tasks.
const tasks = [];
const walk = (dir, infoFile) => {
  const info = readYaml(join(dir, infoFile));
  for (const name of info.content ?? []) {
    const child = join(dir, name);
    if (existsSync(join(root, child, 'task-info.yaml'))) tasks.push(child);
    else if (existsSync(join(root, child, 'lesson-info.yaml'))) walk(child, 'lesson-info.yaml');
    else if (existsSync(join(root, child, 'section-info.yaml'))) walk(child, 'section-info.yaml');
    else problems.push(`${child}: listed in ${join(dir, infoFile)} but has no *-info.yaml`);
  }
};
walk('', 'course-info.yaml');

// Static checks, and starter copies for every graded task.
rmSync(starterRoot, { recursive: true, force: true });
const graded = [];
const reference = {};
for (const task of tasks) {
  const info = readYaml(join(task, 'task-info.yaml'));
  if (!existsSync(join(root, task, 'task.md'))) problems.push(`${task}: missing task.md`);
  for (const file of info.files ?? []) {
    if (!existsSync(join(root, task, file.name))) problems.push(`${task}: missing ${file.name}`);
  }
  if (info.type !== 'edu') continue;

  for (const file of boilerplate) {
    const contents = readFileSync(join(root, task, file), 'utf8');
    reference[file] ??= { task, contents };
    if (contents !== reference[file].contents) {
      problems.push(`${task}: ${file} differs from ${reference[file].task}`);
    }
  }

  const starter = join(starterRoot, task);
  cpSync(join(root, task), starter, { recursive: true });
  for (const file of info.files ?? []) {
    const placeholders = [...(file.placeholders ?? [])].sort((a, b) => b.offset - a.offset);
    if (placeholders.length === 0) continue;
    let text = readFileSync(join(starter, file.name), 'utf8');
    for (const { offset, length, placeholder_text: replacement } of placeholders) {
      if (offset + length > text.length) problems.push(`${task}: placeholder past the end of ${file.name}`);
      text = text.slice(0, offset) + replacement + text.slice(offset + length);
    }
    writeFileSync(join(starter, file.name), text);
  }
  graded.push(task);
}

// One Jest run for all solutions, one for all starters.
const runJest = (roots) => {
  const out = join(mkdtempSync(join(tmpdir(), 'verify-')), 'results.json');
  spawnSync(
    process.execPath,
    ['--experimental-vm-modules', 'node_modules/jest/bin/jest.js', '--json', `--outputFile=${out}`, '--roots', ...roots],
    { cwd: root, stdio: 'ignore' },
  );
  const results = new Map();
  for (const suite of JSON.parse(readFileSync(out, 'utf8')).testResults) {
    results.set(relative(root, suite.name), suite.status);
  }
  return results;
};

if (graded.length > 0) {
  const solutions = runJest(graded.map((task) => join(root, task)));
  const starters = runJest([starterRoot]);
  for (const task of graded) {
    const test = join(task, 'test', 'test.js');
    if (solutions.get(test) !== 'passed') problems.push(`${task}: tests fail on the solution`);
    if (starters.get(join('.verify', test)) !== 'failed') problems.push(`${task}: tests pass on the starter`);
  }
}
rmSync(starterRoot, { recursive: true, force: true });

console.log(`${tasks.length} tasks, ${graded.length} graded.`);
if (problems.length > 0) {
  console.error(problems.map((problem) => `✗ ${problem}`).join('\n'));
  process.exit(1);
}
console.log('✓ All checks passed.');
