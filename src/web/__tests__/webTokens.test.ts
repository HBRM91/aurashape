import { getWebTokens, WEB_TOKENS } from '../tokens';

describe('WEB_TOKENS', () => {
  it('defines the web brand colors', () => {
    expect(WEB_TOKENS.colors.primary).toBe('#2F8F62');
    expect(WEB_TOKENS.colors.surface).toBe('#FFFFFF');
    expect(WEB_TOKENS.colors.text).toBe('#12231B');
    expect(WEB_TOKENS.colors.border).toBe('#DCE8E0');
  });

  it('defines a consistent spacing scale', () => {
    expect(WEB_TOKENS.spacing.xs).toBe(4);
    expect(WEB_TOKENS.spacing.sm).toBe(8);
    expect(WEB_TOKENS.spacing.md).toBe(16);
    expect(WEB_TOKENS.spacing.lg).toBe(24);
    expect(WEB_TOKENS.spacing.xl).toBe(32);
  });

  it('defines radii, typography, shadows, and responsive content widths', () => {
    expect(WEB_TOKENS.radii.md).toBe(16);
    expect(WEB_TOKENS.typography.body.fontSize).toBe(16);
    expect(WEB_TOKENS.shadows.card.shadowOpacity).toBeGreaterThan(0);
    expect(WEB_TOKENS.contentWidths.desktop).toBe(1200);
  });

  it('provides equivalent light and dark semantic palettes', () => {
    const light = getWebTokens(false);
    const dark = getWebTokens(true);

    expect(Object.keys(dark.colors).sort()).toEqual(Object.keys(light.colors).sort());
    expect(dark.colors.page).not.toBe(light.colors.page);
    expect(dark.colors.surface).not.toBe(light.colors.surface);
    expect(dark.colors.text).not.toBe(light.colors.text);
    expect(dark.colors.border).not.toBe(light.colors.border);
  });
});
