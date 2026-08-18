const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const dist = path.join(root, 'dist');

function assertExport() {
  if (!fs.existsSync(dist)) throw new Error('dist/ directory not found. Run npm run build:web first.');

  const routes = [
    { file: 'index.html', required: ['Your health, shaped by science.', 'Food', 'Fasting', 'Workouts', 'Community'] },
    { file: path.join('auth', 'login.html'), required: ['Welcome back', 'Email', 'Password', 'Log In'] },
    { file: path.join('auth', 'signup.html'), required: ['Start your journey', 'Email', 'Password', 'Sign Up'] },
    { file: path.join('auth', 'forgot-password.html'), required: ['Reset your password', 'Email', 'Send Reset Link'] },
    { file: path.join('onboarding', 'privacy-consent.html'), required: ['Your data stays on your device', 'Privacy Policy', 'Terms of Service', 'Continue'] },
    { file: 'summary.html', required: ['Daily Summary', 'Nothing logged for this day'] },
  ];

  const authenticatedRoutes = [
    { path: '/articles', file: 'articles.html', heading: 'Learn' },
    { path: '/diary', file: 'diary.html', heading: 'Diary' },
    { path: '/fasting', file: 'fasting.html', heading: 'Fasting' },
    { path: '/cycle', file: 'cycle.html', heading: 'Cycle Tracker' },
    { path: '/meditation', file: 'meditation.html', heading: 'Mindful' },
    { path: '/plan', file: 'plan.html', heading: 'Your Weekly Plan' },
    { path: '/profile', file: 'profile.html', heading: 'Profile' },
    { path: '/summary', file: 'summary.html', heading: 'Daily Summary' },
  ];

  for (const route of routes) {
    const filePath = path.join(dist, route.file);
    if (!fs.existsSync(filePath)) throw new Error(`Missing exported route: ${route.file}`);
    const html = fs.readFileSync(filePath, 'utf8');
    for (const required of route.required) {
      if (!html.includes(required)) throw new Error(`${route.file} is missing: ${required}`);
    }
  }

  for (const route of authenticatedRoutes) {
    const filePath = path.join(dist, route.file);
    if (!fs.existsSync(filePath)) throw new Error(`Missing exported route: ${route.path}`);

    const html = fs.readFileSync(filePath, 'utf8');
    const body = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1] ?? '';
    const visibleBody = body.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, '');

    for (const required of [route.heading, 'More navigation options']) {
      if (!visibleBody.includes(required)) {
        throw new Error(`${route.path} is missing visible shell content: ${required}`);
      }
    }
  }

  for (const legalFile of ['privacy.html', 'terms.html']) {
    if (!fs.existsSync(path.join(dist, legalFile))) throw new Error(`Missing legal route: ${legalFile}`);
  }

  const imageDir = path.join(dist, 'assets', 'assets', 'images');
  const images = fs.existsSync(imageDir) ? fs.readdirSync(imageDir) : [];
  for (const asset of ['hero-health', 'feature-food', 'feature-fasting', 'feature-workout', 'feature-community', 'auth-health']) {
    if (!images.some((file) => file.startsWith(`${asset}.`))) throw new Error(`Missing local asset: ${asset}`);
  }

  console.log(`PASS: ${routes.length + authenticatedRoutes.length + 2} routes and required assets verified in dist/.`);
}

if (require.main === module) assertExport();

module.exports = { assertExport };
