const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { assertExport } = require('./assert-web-export');

const root = path.resolve(__dirname, '..');
const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const command = process.platform === 'win32' ? (process.env.ComSpec || 'cmd.exe') : npx;
const args = process.platform === 'win32'
  ? ['/d', '/s', '/c', `${npx} expo export --platform web --clear`]
  : ['expo', 'export', '--platform', 'web', '--clear'];
const result = spawnSync(command, args, {
  cwd: root,
  env: process.env,
  stdio: 'inherit',
});

if (result.status !== 0) process.exit(result.status || 1);

for (const legalFile of ['privacy.html', 'terms.html']) {
  fs.copyFileSync(path.join(root, 'web', legalFile), path.join(root, 'dist', legalFile));
}

fs.writeFileSync(path.join(root, 'dist', '_headers'), `/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  X-Frame-Options: DENY
  Permissions-Policy: camera=(), microphone=(), geolocation=()
`);

assertExport();
