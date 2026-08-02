import { useThemeStore, LIGHT_THEME, DARK_THEME } from '@/src/stores/theme';

beforeEach(() => {
  useThemeStore.setState({ mode: 'system', isDark: false, colors: LIGHT_THEME });
});

describe('Theme Store', () => {
  describe('initial state', () => {
    it('should have system mode by default', () => {
      expect(useThemeStore.getState().mode).toBe('system');
    });

    it('should have light theme by default', () => {
      expect(useThemeStore.getState().colors).toEqual(LIGHT_THEME);
      expect(useThemeStore.getState().isDark).toBe(false);
    });
  });

  describe('setMode', () => {
    it('should switch to dark mode', () => {
      useThemeStore.getState().setMode('dark');
      expect(useThemeStore.getState().mode).toBe('dark');
      expect(useThemeStore.getState().isDark).toBe(true);
    });

    it('should apply dark theme colors when switching to dark', () => {
      useThemeStore.getState().setMode('dark');
      const colors = useThemeStore.getState().colors;
      expect(colors.bg).toBe(DARK_THEME.bg);
      expect(colors.text).toBe(DARK_THEME.text);
    });

    it('should switch to light mode', () => {
      useThemeStore.getState().setMode('dark');
      useThemeStore.getState().setMode('light');
      expect(useThemeStore.getState().mode).toBe('light');
      expect(useThemeStore.getState().isDark).toBe(false);
      expect(useThemeStore.getState().colors.bg).toBe(LIGHT_THEME.bg);
    });

    it('should respect system dark preference in system mode', () => {
      useThemeStore.getState().setMode('system');
      useThemeStore.getState().setSystemDark(true);
      expect(useThemeStore.getState().isDark).toBe(true);
      expect(useThemeStore.getState().colors.bg).toBe(DARK_THEME.bg);
    });
  });

  describe('setSystemDark', () => {
    it('should update colors in system mode', () => {
      useThemeStore.setState({ mode: 'system' });
      useThemeStore.getState().setSystemDark(true);
      expect(useThemeStore.getState().colors).toEqual(DARK_THEME);
    });

    it('should not change mode when updating system dark', () => {
      useThemeStore.setState({ mode: 'system' });
      useThemeStore.getState().setSystemDark(true);
      expect(useThemeStore.getState().mode).toBe('system');
    });

    it('should not update colors in manual dark mode', () => {
      useThemeStore.setState({ mode: 'dark', isDark: true, colors: DARK_THEME });
      useThemeStore.getState().setSystemDark(false);
      expect(useThemeStore.getState().colors.bg).toBe(DARK_THEME.bg);
    });
  });

  describe('LIGHT_THEME', () => {
    it('should have all required color keys', () => {
      expect(LIGHT_THEME.bg).toBe('#FFFFFF');
      expect(LIGHT_THEME.text).toBe('#1F2937');
      expect(LIGHT_THEME.primary).toBe('#4ADE80');
      expect(LIGHT_THEME.border).toBe('#E5E7EB');
    });
  });

  describe('DARK_THEME', () => {
    it('should have dark background', () => {
      expect(DARK_THEME.bg).toBe('#0F172A');
      expect(DARK_THEME.text).toBe('#F1F5F9');
    });
  });
});
