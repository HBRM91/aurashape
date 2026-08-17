const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');

// Files whose entire job is to contain the marker/pattern literals below as
// comparison data — excluding them from being scanned by their own patterns,
// the same way a linter excludes its own rule-definition files.
const SELF_EXCLUDED_FILES = new Set([
  'scripts/assert-local-privacy.js',
  'scripts/assert-secret-hygiene.js',
]);

const JWT_RE = /eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g;

// A Supabase anon key is a JWT and is *meant* to be public — it ships in
// every client bundle by design and is safe only because RLS, not secrecy,
// protects the data. Any other role (service_role, or anything unrecognized)
// bypasses RLS and must never be committed.
function isDangerousJwt(token) {
  const payloadSegment = token.split('.')[1];
  if (!payloadSegment) return true; // malformed — fail closed, don't wave it through
  try {
    const payload = JSON.parse(Buffer.from(payloadSegment, 'base64').toString('utf8'));
    return payload.role !== 'anon';
  } catch {
    return true; // couldn't verify what it is — fail closed
  }
}

// Recognizable shapes of real credential *values* — not env var names, which
// are expected to appear all over the source (process.env.OPENAI_API_KEY is
// fine; the literal key string is not). Patterns are intentionally specific
// to avoid flagging hashes, UUIDs, or other harmless-but-long strings.
const SECRET_PATTERNS = [
  {
    name: 'non-anon JWT (service-role key or unrecognized role)',
    test: (line) => {
      const matches = line.match(JWT_RE) || [];
      return matches.some(isDangerousJwt);
    },
  },
  { name: 'OpenAI API key', test: (line) => /\bsk-[A-Za-z0-9_-]{20,}\b/.test(line) },
  { name: 'Resend API key', test: (line) => /\bre_[A-Za-z0-9_-]{16,}\b/.test(line) },
  { name: 'AWS access key ID', test: (line) => /\bAKIA[0-9A-Z]{16}\b/.test(line) },
  { name: 'PEM private key block', test: (line) => /-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----/.test(line) },
  // Project-specific literal also checked against the built bundle in
  // assert-local-privacy.js — keeping the same marker here catches it
  // earlier, at the source stage, before a build ever happens.
  { name: 'known project secret marker', test: (line) => /Aur4sh4p3_DB/.test(line) },
];

// Extensions worth scanning as text/source. Everything else (images, fonts,
// lockfiles, binaries) is skipped — not because they can't contain a leaked
// secret, but because the signal-to-noise ratio there is bad enough to make
// this check unreliable if run against literally every tracked file.
const SCANNED_EXTENSIONS = new Set([
  '.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs',
  '.json', '.yml', '.yaml', '.env.example',
  '.md', '.sql', '.html', '.css',
]);

function listTrackedFiles() {
  const output = execFileSync('git', ['ls-files'], { cwd: root, encoding: 'utf8' });
  return output.split('\n').filter(Boolean);
}

function shouldScan(relativePath) {
  if (SELF_EXCLUDED_FILES.has(relativePath)) return false;
  const ext = path.extname(relativePath);
  return SCANNED_EXTENSIONS.has(ext) || relativePath.endsWith('.env.example');
}

let files;
try {
  files = listTrackedFiles();
} catch (err) {
  // Fail closed: if we can't even enumerate tracked files, don't silently
  // pass — an environment where `git ls-files` fails is not one we can
  // vouch for.
  console.error('assert:secrets could not list tracked files:', err.message);
  process.exit(1);
}

const findings = [];

for (const relativePath of files) {
  if (!shouldScan(relativePath)) continue;
  const absolutePath = path.join(root, relativePath);
  if (!fs.existsSync(absolutePath)) continue; // deleted-but-staged edge case

  let content;
  try {
    content = fs.readFileSync(absolutePath, 'utf8');
  } catch {
    continue; // not text (binary heuristic failure) — skip rather than crash
  }

  const lines = content.split('\n');
  lines.forEach((line, index) => {
    for (const { name, test } of SECRET_PATTERNS) {
      if (test(line)) {
        // Report location only — never the matched value itself, so this
        // check can't become the thing that leaks the secret into CI logs.
        findings.push(`${relativePath}:${index + 1} — possible ${name}`);
      }
    }
  });
}

if (findings.length > 0) {
  console.error('FAIL: possible committed credential(s) found:');
  for (const finding of findings) console.error(`  ${finding}`);
  process.exit(1);
}

console.log(`PASS: scanned ${files.filter(shouldScan).length} tracked files, no committed credential values found.`);
