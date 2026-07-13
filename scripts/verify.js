#!/usr/bin/env node
// CodePulse pre-flight verification script

const { execSync } = require('child_process');
const path = require('path');

const root = path.resolve(__dirname, '..');
const tests = [
  { name: 'MCP tools list', cmd: 'node scripts/list-tools.js' },
];

let failed = 0;

console.log('CodePulse Verification\n');

for (const test of tests) {
  try {
    const output = execSync(test.cmd, { cwd: root, encoding: 'utf8', stdio: 'pipe' });
    const success = output.includes('query_context');
    console.log(`✓ ${test.name}: OK`);
    if (!success) {
      console.log(output);
    }
  } catch (err) {
    failed++;
    console.error(`✗ ${test.name}: FAILED`);
    console.error(err.stderr || err.message);
  }
}

console.log('\n---');
if (failed === 0) {
  console.log('All CodePulse checks passed. Remember to run `npm run gen:context` in your target repo before asking questions.');
  process.exit(0);
} else {
  console.log(`${failed} check(s) failed. Fix the issues above before testing in Slack.`);
  process.exit(1);
}
