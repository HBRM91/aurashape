import { getDataMode, isLocalOnly } from '../privacyMode';

describe('privacy mode', () => {
  it('defaults to local-only when no build mode is provided', () => {
    expect(getDataMode(undefined)).toBe('local');
  });

  it('accepts only an explicit cloud mode', () => {
    expect(getDataMode('cloud')).toBe('cloud');
    expect(getDataMode('local')).toBe('local');
    expect(getDataMode('unexpected')).toBe('local');
  });

  it('runs this build in local-only mode by default', () => {
    expect(isLocalOnly()).toBe(true);
  });
});
