import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('Learn and Profile theme migration', () => {
  it.each([
    ['WebLearn.tsx', 'screens'],
    ['WebProfile.tsx', 'screens'],
    ['HomeDashboard.tsx', '.'],
  ])('uses runtime theme colors in %s', (file, directory) => {
    const source = readFileSync(resolve(__dirname, '..', directory, file), 'utf8');
    expect(source).toContain('getWebTokens');
    expect(source).toContain('useIsDark');
  });
});
