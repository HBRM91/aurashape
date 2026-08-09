import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('priority web theme migration', () => {
  it.each(['WebFasting.tsx', 'WebProgress.tsx'])('uses the runtime web theme in %s', (file) => {
    const source = readFileSync(resolve(__dirname, '..', 'screens', file), 'utf8');

    expect(source).toContain('getWebTokens');
    expect(source).toContain('useIsDark');
  });
});
