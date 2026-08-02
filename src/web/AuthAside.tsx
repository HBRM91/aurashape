import { Image, Platform, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { WEB_TOKENS } from './tokens';

const authArtwork = Platform.select({
  web: require('../../assets/images/auth-health.png'),
  default: require('../../assets/images/auth-health.svg'),
});

export function AuthAside() {
  const { width } = useWindowDimensions();
  const isNarrowWeb = Platform.OS === 'web' && width > 0 && width < 768;

  return (
    <View testID="auth-aside" style={[styles.aside, isNarrowWeb ? styles.asideHidden : undefined]}>
      <View style={styles.gradient} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        style={styles.scroll}
      >
        <View style={styles.artFrame}>
          <Image
            accessibilityLabel="Aurashape health illustration"
            source={authArtwork}
            style={styles.art}
          />
        </View>
        <Text style={styles.brand}>Aurashape</Text>
        <Text style={styles.tagline}>Your health, shaped by science.</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Privacy-first / No ads / Free forever</Text>
        </View>
        <Text style={styles.copyright}>
          © {new Date().getFullYear()} Aurashape
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  aside: {
    alignItems: 'center',
    backgroundColor: WEB_TOKENS.colors.secondary,
    flex: 1,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  asideHidden: {
    display: 'none',
  },
  gradient: {
    backgroundColor: WEB_TOKENS.colors.primary,
    borderRadius: 400,
    height: 600,
    opacity: 0.06,
    position: 'absolute',
    right: -120,
    top: -60,
    width: 600,
  },
  scroll: {
    width: '100%',
  },
  scrollContent: {
    alignItems: 'center',
    gap: WEB_TOKENS.spacing.md,
    paddingHorizontal: WEB_TOKENS.spacing.xl,
    paddingVertical: WEB_TOKENS.spacing.xxxl,
  },
  artFrame: {
    alignItems: 'center',
    backgroundColor: WEB_TOKENS.colors.secondary,
    borderRadius: WEB_TOKENS.radii.lg,
    marginBottom: WEB_TOKENS.spacing.md,
    maxWidth: 420,
    overflow: 'hidden',
    width: '100%',
  },
  art: {
    height: 300,
    width: '100%',
  },
  brand: {
    ...WEB_TOKENS.typography.subheading,
    color: WEB_TOKENS.colors.text,
  },
  tagline: {
    ...WEB_TOKENS.typography.body,
    color: WEB_TOKENS.colors.textMuted,
    textAlign: 'center',
  },
  badge: {
    backgroundColor: WEB_TOKENS.colors.surface,
    borderColor: WEB_TOKENS.colors.border,
    borderRadius: WEB_TOKENS.radii.pill,
    borderWidth: 1,
    marginTop: WEB_TOKENS.spacing.lg,
    paddingHorizontal: WEB_TOKENS.spacing.md,
    paddingVertical: WEB_TOKENS.spacing.sm,
  },
  badgeText: {
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.textMuted,
  },
  copyright: {
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.textMuted,
    marginTop: WEB_TOKENS.spacing.lg,
  },
});
