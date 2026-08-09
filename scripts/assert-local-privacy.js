const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const dist = path.join(root, 'dist');
const bundleFiles = fs.existsSync(path.join(dist, '_expo', 'static', 'js', 'web'))
  ? fs.readdirSync(path.join(dist, '_expo', 'static', 'js', 'web')).filter((file) => file.endsWith('.js'))
  : [];
const bundle = bundleFiles.map((file) => fs.readFileSync(path.join(dist, '_expo', 'static', 'js', 'web', file), 'utf8')).join('\n');

if (process.env.EXPO_PUBLIC_DATA_MODE === 'cloud') {
  throw new Error('Local privacy assertion cannot run against a cloud-mode build.');
}

for (const secretMarker of ['SUPABASE_SERVICE_ROLE_KEY', 'OPENAI_API_KEY', 'RESEND_API_KEY', 'Aur4sh4p3_DB']) {
  if (bundle.includes(secretMarker)) throw new Error(`Private secret marker found in web bundle: ${secretMarker}`);
}

for (const requiredFile of ['privacy.html', 'terms.html', '_headers']) {
  if (!fs.existsSync(path.join(dist, requiredFile))) throw new Error(`Local privacy artifact missing: ${requiredFile}`);
}

console.log('PASS: local-only build contains no private secret markers and required privacy artifacts.');
