const { execSync } = require('child_process');
const path = require('path');

const projectRoot = process.env.SIGMAP_PROJECT_ROOT || path.resolve(__dirname, '..');

console.log(`[GenContext] Generating SigMap context in ${projectRoot}`);

try {
  execSync('sigmap', {
    cwd: projectRoot,
    stdio: 'inherit',
    env: { ...process.env },
  });
  console.log('[GenContext] Done');
} catch (err) {
  console.error('[GenContext] Failed:', err.message);
  process.exit(1);
}
