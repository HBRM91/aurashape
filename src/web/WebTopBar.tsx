import { Platform, Pressable, StyleSheet, Text, View, useWindowDimensions, type ViewStyle } from 'react-native';
import { useRouter } from 'expo-router';
import { getWebTokens, WEB_TOKENS } from './tokens';
import { useAuthStore } from '@/src/stores/auth';
import { useIsDark } from '@/src/stores/theme';

export interface WebTopBarProps {
  title?: string;
}

export function WebTopBar({ title }: WebTopBarProps) {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const user = useAuthStore((s) => s.user);
  const tokens = getWebTokens(useIsDark());
  const router = useRouter();

  if (Platform.OS !== 'web') {
    return null;
  }

  const displayName = user?.user_metadata?.full_name
    || user?.user_metadata?.name
    || user?.email?.split('@')[0]
    || 'User';

  const initial = displayName.charAt(0).toUpperCase();

  return (
    <View style={[styles.topBar, isDesktop ? styles.topBarDesktop : styles.topBarMobile, { backgroundColor: tokens.colors.surface, borderBottomColor: tokens.colors.border }]}>
      <Text style={[styles.title, { color: tokens.colors.text }]}>{title ?? ''}</Text>

      <Pressable
        accessibilityLabel="Open profile"
        accessibilityRole="button"
        onPress={() => router.push('/(tabs)/profile')}
        style={styles.userArea}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        {isDesktop ? <Text style={[styles.userName, { color: tokens.colors.text }]}>{displayName}</Text> : null}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    alignItems: 'center',
    backgroundColor: WEB_TOKENS.colors.surface,
    borderBottomColor: WEB_TOKENS.colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: WEB_TOKENS.spacing.lg,
    // web-only CSS value; react-native-web supports it, RN's ViewStyle doesn't model it.
    position: 'sticky' as unknown as ViewStyle['position'],
    top: 0,
    zIndex: 10,
  },
  topBarDesktop: {
    height: 56,
  },
  topBarMobile: {
    height: 48,
  },
  title: {
    ...WEB_TOKENS.typography.subheading,
    color: WEB_TOKENS.colors.text,
    fontSize: 18,
    lineHeight: 24,
  },
  userArea: {
    alignItems: 'center',
    borderRadius: WEB_TOKENS.radii.sm,
    flexDirection: 'row',
    gap: WEB_TOKENS.spacing.sm,
    paddingHorizontal: WEB_TOKENS.spacing.sm,
    paddingVertical: WEB_TOKENS.spacing.xs,
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: WEB_TOKENS.colors.secondary,
    borderRadius: WEB_TOKENS.radii.pill,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  avatarText: {
    color: WEB_TOKENS.colors.primaryStrong,
    fontSize: 14,
    fontWeight: '700',
  },
  userName: {
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.text,
    fontWeight: '500',
  },
});
