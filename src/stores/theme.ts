import { create } from 'zustand';
import { COLORS as LIGHT_COLORS } from '@/src/constants/theme';

export type ThemeMode = 'system' | 'light' | 'dark';

export interface ThemeColors {
  bg: string;
  bgSecondary: string;
  bgCard: string;
  bgInput: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  borderLight: string;
  tabBar: string;
  tabBarBorder: string;
  headerBg: string;
  cardBg: string;
  primary: string;
  primaryDark: string;
  secondary: string;
  success: string;
  warning: string;
  error: string;
  protein: string;
  carbs: string;
  fat: string;
  fasting: string;
  eating: string;
}

export const LIGHT_THEME: ThemeColors = {
  bg: '#FFFFFF',
  bgSecondary: '#F9FAFB',
  bgCard: '#FFFFFF',
  bgInput: '#FFFFFF',
  text: '#1F2937',
  textSecondary: '#6B7280',
  textMuted: '#D1D5DB',
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  tabBar: '#FFFFFF',
  tabBarBorder: '#F3F4F6',
  headerBg: '#FFFFFF',
  cardBg: '#F9FAFB',
  primary: LIGHT_COLORS.primary,
  primaryDark: LIGHT_COLORS.primaryDark,
  secondary: LIGHT_COLORS.secondary,
  success: LIGHT_COLORS.success,
  warning: LIGHT_COLORS.warning,
  error: LIGHT_COLORS.error,
  protein: '#3B82F6',
  carbs: '#EAB308',
  fat: '#EC4899',
  fasting: '#A855F7',
  eating: '#4ADE80',
};

export const DARK_THEME: ThemeColors = {
  bg: '#0F172A',
  bgSecondary: '#1E293B',
  bgCard: '#1E293B',
  bgInput: '#334155',
  text: '#F1F5F9',
  textSecondary: '#94A3B8',
  textMuted: '#475569',
  border: '#334155',
  borderLight: '#1E293B',
  tabBar: '#1E293B',
  tabBarBorder: '#334155',
  headerBg: '#1E293B',
  cardBg: '#1E293B',
  primary: '#4ADE80',
  primaryDark: '#22C55E',
  secondary: '#60A5FA',
  success: '#22C55E',
  warning: '#FBBF24',
  error: '#F87171',
  protein: '#60A5FA',
  carbs: '#FACC15',
  fat: '#F472B6',
  fasting: '#C084FC',
  eating: '#4ADE80',
};

interface ThemeState {
  mode: ThemeMode;
  isDark: boolean;
  colors: ThemeColors;
  setMode: (mode: ThemeMode) => void;
  setSystemDark: (isDark: boolean) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  mode: 'system',
  isDark: false,
  colors: LIGHT_THEME,
  setMode: (mode) => set((s) => {
    const isDark = mode === 'dark' || (mode === 'system' && s.isDark);
    return { mode, colors: isDark ? DARK_THEME : LIGHT_THEME, isDark };
  }),
  setSystemDark: (isDark) => set((s) => {
    if (s.mode === 'system') {
      return { isDark, colors: isDark ? DARK_THEME : LIGHT_THEME };
    }
    return { isDark };
  }),
}));

export function useThemeColors(): ThemeColors {
  return useThemeStore((s) => s.colors);
}

export function useIsDark(): boolean {
  return useThemeStore((s) => s.isDark);
}
