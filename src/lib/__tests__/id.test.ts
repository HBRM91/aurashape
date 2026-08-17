import { generateId, isLegacyId } from '../id';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

describe('generateId', () => {
  it('produces a well-formed UUID string', () => {
    expect(generateId()).toMatch(UUID_PATTERN);
  });

  it('sets the version nibble to 7', () => {
    const id = generateId();
    expect(id.charAt(14)).toBe('7');
  });

  it('sets the variant bits to RFC 9562 "10"', () => {
    const id = generateId();
    const variantNibble = parseInt(id.charAt(19), 16);
    // top two bits must be 10, i.e. the nibble is one of 8,9,a,b
    expect(variantNibble & 0xc).toBe(0x8);
  });

  it('generates unique IDs across many calls', () => {
    const ids = new Set(Array.from({ length: 5000 }, () => generateId()));
    expect(ids.size).toBe(5000);
  });

  it('is time-ordered: an ID generated later sorts after one generated earlier', () => {
    const realNow = Date.now;
    try {
      Date.now = () => 1_700_000_000_000;
      const earlier = generateId();
      Date.now = () => 1_700_000_000_001;
      const later = generateId();
      expect(earlier < later).toBe(true);
    } finally {
      Date.now = realNow;
    }
  });

  it('does not collide with a legacy Date.now()-counter ID', () => {
    const legacy = String(Date.now());
    expect(generateId()).not.toBe(legacy);
  });
});

describe('isLegacyId', () => {
  it('flags plain decimal-counter IDs as legacy', () => {
    expect(isLegacyId('1737483920123')).toBe(true);
    expect(isLegacyId(String(Date.now() + 1))).toBe(true);
  });

  it('does not flag a real UUID as legacy', () => {
    expect(isLegacyId(generateId())).toBe(false);
    expect(isLegacyId('01890a5d-ac96-774b-bcce-b302099a8057')).toBe(false);
  });

  it('flags empty or malformed strings as legacy', () => {
    expect(isLegacyId('')).toBe(true);
    expect(isLegacyId('not-a-uuid')).toBe(true);
  });
});
