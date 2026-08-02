import type { TextStyle, ViewStyle } from 'react-native';

export const WEB_TOKENS = {
  colors: {
    primary: '#2F8F62',
    primaryStrong: '#216A49',
    secondary: '#E4F3EA',
    page: '#F7FAF8',
    surface: '#FFFFFF',
    surfaceMuted: '#F1F7F3',
    text: '#12231B',
    textMuted: '#65756C',
    border: '#DCE8E0',
    focus: '#82C8A2',
    error: '#B42318',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    xxxl: 64,
  },
  radii: {
    sm: 8,
    md: 16,
    lg: 24,
    pill: 999,
  },
  typography: {
    display: {
      fontSize: 48,
      lineHeight: 56,
      fontWeight: '700',
    } satisfies TextStyle,
    heading: {
      fontSize: 32,
      lineHeight: 40,
      fontWeight: '700',
    } satisfies TextStyle,
    subheading: {
      fontSize: 22,
      lineHeight: 30,
      fontWeight: '600',
    } satisfies TextStyle,
    body: {
      fontSize: 16,
      lineHeight: 24,
      fontWeight: '400',
    } satisfies TextStyle,
    caption: {
      fontSize: 14,
      lineHeight: 20,
      fontWeight: '400',
    } satisfies TextStyle,
    label: {
      fontSize: 13,
      lineHeight: 18,
      fontWeight: '600',
    } satisfies TextStyle,
  },
  shadows: {
    card: {
      shadowColor: '#12231B',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.08,
      shadowRadius: 24,
      elevation: 3,
    } satisfies ViewStyle,
    button: {
      shadowColor: '#216A49',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.16,
      shadowRadius: 10,
      elevation: 2,
    } satisfies ViewStyle,
  },
  contentWidths: {
    mobile: 640,
    tablet: 960,
    desktop: 1200,
  },
} as const;

export type WebButtonVariant = 'primary' | 'secondary' | 'ghost';
