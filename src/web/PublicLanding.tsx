import { Link, useRouter } from 'expo-router';
import { Image, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { WebButton } from './WebButton';
import { WebCard } from './WebCard';
import { WebLogo } from './WebLogo';
import { WebSection } from './WebSection';
import { WEB_TOKENS } from './tokens';

const FEATURES = [
  {
    title: 'Food',
    description: 'See the patterns in what you eat, without turning meals into a math exam.',
    image: require('../../assets/images/feature-food.svg'),
    tone: WEB_TOKENS.colors.secondary,
  },
  {
    title: 'Fasting',
    description: 'Build a rhythm that fits your day with calm, flexible fasting plans.',
    image: require('../../assets/images/feature-fasting.svg'),
    tone: '#FFF3E2',
  },
  {
    title: 'Workouts',
    description: 'Log the work that matters and make progress visible over time.',
    image: require('../../assets/images/feature-workout.svg'),
    tone: '#E9F0FF',
  },
  {
    title: 'Community',
    description: 'Learn with people who care about thoughtful, sustainable progress.',
    image: require('../../assets/images/feature-community.svg'),
    tone: '#F4EAFE',
  },
] as const;

export function PublicLanding() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      style={styles.page}
    >
      <View style={styles.navbar}>
        <View style={styles.container}>
          <View style={styles.navbarContent}>
            <WebLogo compact />
            <View style={styles.navLinks}>
              {isDesktop ? (
                <>
                  <Link
                    accessibilityLabel="Jump to what's inside"
                    accessibilityRole="link"
                    href="/#features"
                    style={styles.navLink}
                  >
                    What's inside
                  </Link>
                  <Link
                    accessibilityLabel="Jump to privacy information"
                    accessibilityRole="link"
                    href="/#privacy"
                    style={styles.navLink}
                  >
                    Privacy first
                  </Link>
                </>
              ) : null}
              <Link href="/auth/login" style={styles.navLinkStrong}>Sign in</Link>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.container}>
        <View style={[styles.hero, isDesktop ? styles.heroDesktop : styles.heroMobile]}>
          <View style={styles.heroCopy}>
            <View style={styles.eyebrow}>
              <View style={styles.eyebrowDot} />
              <Text style={styles.eyebrowText}>A clearer way to feel well</Text>
            </View>
            <Text accessibilityRole="header" style={styles.heroTitle}>
              Your health, shaped by science.
            </Text>
            <Text style={styles.heroDescription}>
              Aurashape brings food, movement, rest, and real people into one gentle daily practice.
              Free to start, private by design.
            </Text>
            <View style={styles.heroActions}>
              <WebButton label="Start free" onPress={() => router.push('/auth/signup')} />
              <WebButton label="Sign in" onPress={() => router.push('/auth/login')} variant="ghost" />
            </View>
            <Text style={styles.heroNote}>No credit card. No ads. Just useful momentum.</Text>
          </View>

          <View accessible accessibilityLabel="Aurashape health overview illustration" style={styles.heroArtFrame}>
            <Image source={require('../../assets/images/hero-health.svg')} style={styles.heroArt} />
            <View style={styles.artBadgeTop}>
              <Text style={styles.artBadgeLabel}>TODAY'S RHYTHM</Text>
              <Text style={styles.artBadgeValue}>On track</Text>
            </View>
            <View style={styles.artBadgeBottom}>
              <Text style={styles.artBadgeValue}>7 day</Text>
              <Text style={styles.artBadgeLabel}>steady streak</Text>
            </View>
          </View>
        </View>

        <View style={styles.proofRow}>
          <Text style={styles.proofItem}>FOOD + FASTING</Text>
          <Text style={styles.proofDivider}>/</Text>
          <Text style={styles.proofItem}>MOVEMENT</Text>
          <Text style={styles.proofDivider}>/</Text>
          <Text style={styles.proofItem}>COMMUNITY</Text>
        </View>
      </View>

      <View nativeID="features">
        <WebSection
          description="Small, science-informed tools that make the next good choice easier."
          title="Everything that shapes a healthier day."
          style={styles.section}
        >
          <View style={[styles.featureGrid, isDesktop ? styles.featureGridDesktop : styles.featureGridMobile]}>
            {FEATURES.map((feature) => (
              <WebCard key={feature.title} style={[styles.featureCard, isDesktop ? styles.featureCardDesktop : undefined]}>
                <View style={[styles.featureArtFrame, { backgroundColor: feature.tone }]}>
                  <Image accessibilityLabel={`${feature.title} illustration`} source={feature.image} style={styles.featureArt} />
                </View>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>{feature.description}</Text>
              </WebCard>
            ))}
          </View>
        </WebSection>
      </View>

      <View nativeID="privacy" style={styles.privacyWrap}>
        <View style={styles.container}>
          <View style={[styles.privacyCard, isDesktop ? styles.privacyCardDesktop : undefined]}>
            <View style={styles.privacyCopy}>
              <Text style={styles.privacyKicker}>YOUR DATA, YOUR CHOICE</Text>
              <Text accessibilityRole="header" style={styles.privacyTitle}>Privacy is part of the product.</Text>
              <Text style={styles.privacyDescription}>
                Your health story should not be a trade for targeted ads. Aurashape is built with clear consent,
                encrypted storage, and no sale of personal data.
              </Text>
            </View>
            <View style={styles.privacyPoints}>
              {['Clear consent before signup', 'No ads in your health journey', 'Delete your data whenever you choose'].map((point) => (
                <View key={point} style={styles.privacyPoint}>
                  <View style={styles.checkmark}><Text style={styles.checkmarkText}>✓</Text></View>
                  <Text style={styles.privacyPointText}>{point}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </View>

      <View style={styles.container}>
        <View style={styles.finalCta}>
          <Text accessibilityRole="header" style={styles.finalTitle}>Make your next choice a little clearer.</Text>
          <Text style={styles.finalDescription}>Start with one day. Let the shape of it teach you something.</Text>
          <WebButton label="Start free" onPress={() => router.push('/auth/signup')} />
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.container}>
          <View style={[styles.footerTop, isDesktop ? styles.footerTopDesktop : undefined]}>
            <View style={styles.footerBrand}>
              <WebLogo compact />
              <Text style={styles.footerTagline}>A calm, science-informed health companion.</Text>
            </View>
            <View style={styles.footerLinks}>
              <Link href="https://aurashape.app/privacy" style={styles.footerLink}>Privacy Policy</Link>
              <Link href="https://aurashape.app/terms" style={styles.footerLink}>Terms of Service</Link>
              <Link href="mailto:hello@aurashape.app" style={styles.footerLink}>Contact us</Link>
            </View>
          </View>
          <Text style={styles.copyright}>© 2026 Aurashape. Built for better everyday health.</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: WEB_TOKENS.colors.page,
    flex: 1,
  },
  scrollContent: {
    overflow: 'hidden',
  },
  container: {
    alignSelf: 'center',
    maxWidth: WEB_TOKENS.contentWidths.desktop,
    paddingHorizontal: WEB_TOKENS.spacing.lg,
    width: '100%',
  },
  navbar: {
    backgroundColor: 'rgba(247, 250, 248, 0.96)',
    borderBottomColor: WEB_TOKENS.colors.border,
    borderBottomWidth: 1,
    paddingVertical: WEB_TOKENS.spacing.md,
  },
  navbarContent: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  navLinks: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: WEB_TOKENS.spacing.lg,
  },
  navLink: {
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.textMuted,
    paddingVertical: WEB_TOKENS.spacing.sm,
  },
  navLinkStrong: {
    ...WEB_TOKENS.typography.label,
    color: WEB_TOKENS.colors.primaryStrong,
    paddingVertical: WEB_TOKENS.spacing.sm,
  },
  hero: {
    alignItems: 'center',
    paddingBottom: WEB_TOKENS.spacing.xxxl,
    paddingTop: WEB_TOKENS.spacing.xxxl,
  },
  heroDesktop: {
    flexDirection: 'row',
    gap: WEB_TOKENS.spacing.xxxl,
    justifyContent: 'space-between',
  },
  heroMobile: {
    flexDirection: 'column',
  },
  heroCopy: {
    flex: 1,
    maxWidth: 570,
    width: '100%',
  },
  eyebrow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: WEB_TOKENS.spacing.sm,
    marginBottom: WEB_TOKENS.spacing.lg,
  },
  eyebrowDot: {
    backgroundColor: WEB_TOKENS.colors.primary,
    borderRadius: WEB_TOKENS.radii.pill,
    height: 8,
    width: 8,
  },
  eyebrowText: {
    ...WEB_TOKENS.typography.label,
    color: WEB_TOKENS.colors.primaryStrong,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  heroTitle: {
    ...WEB_TOKENS.typography.display,
    color: WEB_TOKENS.colors.text,
    letterSpacing: -1.4,
    marginBottom: WEB_TOKENS.spacing.lg,
  },
  heroDescription: {
    ...WEB_TOKENS.typography.body,
    color: WEB_TOKENS.colors.textMuted,
    maxWidth: 500,
  },
  heroActions: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: WEB_TOKENS.spacing.sm,
    marginTop: WEB_TOKENS.spacing.xl,
  },
  heroNote: {
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.textMuted,
    marginTop: WEB_TOKENS.spacing.md,
  },
  heroArtFrame: {
    alignItems: 'center',
    backgroundColor: WEB_TOKENS.colors.secondary,
    borderRadius: 40,
    justifyContent: 'center',
    maxWidth: 500,
    minHeight: 430,
    overflow: 'hidden',
    position: 'relative',
    width: '100%',
  },
  heroArt: {
    height: 410,
    maxWidth: 480,
    width: '100%',
  },
  artBadgeTop: {
    backgroundColor: WEB_TOKENS.colors.surface,
    borderColor: WEB_TOKENS.colors.border,
    borderRadius: WEB_TOKENS.radii.md,
    borderWidth: 1,
    left: 20,
    padding: WEB_TOKENS.spacing.md,
    position: 'absolute',
    top: 24,
    ...WEB_TOKENS.shadows.card,
  },
  artBadgeBottom: {
    backgroundColor: WEB_TOKENS.colors.primaryStrong,
    borderRadius: WEB_TOKENS.radii.md,
    bottom: 24,
    padding: WEB_TOKENS.spacing.md,
    position: 'absolute',
    right: 20,
  },
  artBadgeLabel: {
    ...WEB_TOKENS.typography.label,
    color: WEB_TOKENS.colors.textMuted,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  artBadgeValue: {
    ...WEB_TOKENS.typography.subheading,
    color: WEB_TOKENS.colors.text,
    marginTop: 2,
  },
  proofRow: {
    alignItems: 'center',
    borderBottomColor: WEB_TOKENS.colors.border,
    borderBottomWidth: 1,
    borderTopColor: WEB_TOKENS.colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: WEB_TOKENS.spacing.md,
    justifyContent: 'center',
    paddingVertical: WEB_TOKENS.spacing.md,
  },
  proofItem: {
    ...WEB_TOKENS.typography.label,
    color: WEB_TOKENS.colors.textMuted,
    letterSpacing: 1.2,
  },
  proofDivider: {
    color: WEB_TOKENS.colors.primary,
    fontWeight: '700',
  },
  section: {
    paddingBottom: WEB_TOKENS.spacing.xxxl,
    paddingTop: WEB_TOKENS.spacing.xxxl,
  },
  featureGrid: {
    gap: WEB_TOKENS.spacing.md,
  },
  featureGridDesktop: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  featureGridMobile: {
    flexDirection: 'column',
  },
  featureCard: {
    flexGrow: 1,
  },
  featureCardDesktop: {
    width: '23%',
  },
  featureArtFrame: {
    alignItems: 'center',
    borderRadius: WEB_TOKENS.radii.md,
    height: 152,
    justifyContent: 'center',
    marginBottom: WEB_TOKENS.spacing.lg,
    overflow: 'hidden',
    width: '100%',
  },
  featureArt: {
    height: 145,
    width: '100%',
  },
  featureTitle: {
    ...WEB_TOKENS.typography.subheading,
    color: WEB_TOKENS.colors.text,
    marginBottom: WEB_TOKENS.spacing.sm,
  },
  featureDescription: {
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.textMuted,
  },
  privacyWrap: {
    backgroundColor: WEB_TOKENS.colors.primaryStrong,
    paddingVertical: WEB_TOKENS.spacing.xxxl,
  },
  privacyCard: {
    gap: WEB_TOKENS.spacing.xl,
  },
  privacyCardDesktop: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  privacyCopy: {
    flex: 1,
    maxWidth: 620,
  },
  privacyKicker: {
    ...WEB_TOKENS.typography.label,
    color: WEB_TOKENS.colors.focus,
    letterSpacing: 1.2,
    marginBottom: WEB_TOKENS.spacing.md,
  },
  privacyTitle: {
    ...WEB_TOKENS.typography.heading,
    color: WEB_TOKENS.colors.surface,
    marginBottom: WEB_TOKENS.spacing.md,
  },
  privacyDescription: {
    ...WEB_TOKENS.typography.body,
    color: '#D8EBDD',
  },
  privacyPoints: {
    gap: WEB_TOKENS.spacing.md,
  },
  privacyPoint: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: WEB_TOKENS.spacing.sm,
  },
  checkmark: {
    alignItems: 'center',
    backgroundColor: WEB_TOKENS.colors.focus,
    borderRadius: WEB_TOKENS.radii.pill,
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  checkmarkText: {
    color: WEB_TOKENS.colors.primaryStrong,
    fontSize: 15,
    fontWeight: '700',
  },
  privacyPointText: {
    ...WEB_TOKENS.typography.body,
    color: WEB_TOKENS.colors.surface,
  },
  finalCta: {
    alignItems: 'center',
    paddingBottom: 88,
    paddingTop: 88,
  },
  finalTitle: {
    ...WEB_TOKENS.typography.heading,
    color: WEB_TOKENS.colors.text,
    textAlign: 'center',
  },
  finalDescription: {
    ...WEB_TOKENS.typography.body,
    color: WEB_TOKENS.colors.textMuted,
    marginBottom: WEB_TOKENS.spacing.lg,
    marginTop: WEB_TOKENS.spacing.sm,
    textAlign: 'center',
  },
  footer: {
    backgroundColor: WEB_TOKENS.colors.surface,
    borderTopColor: WEB_TOKENS.colors.border,
    borderTopWidth: 1,
    paddingBottom: WEB_TOKENS.spacing.xl,
    paddingTop: WEB_TOKENS.spacing.xl,
  },
  footerTop: {
    gap: WEB_TOKENS.spacing.lg,
  },
  footerTopDesktop: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerBrand: {
    gap: WEB_TOKENS.spacing.sm,
  },
  footerTagline: {
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.textMuted,
  },
  footerLinks: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: WEB_TOKENS.spacing.lg,
  },
  footerLink: {
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.primaryStrong,
  },
  copyright: {
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.textMuted,
    marginTop: WEB_TOKENS.spacing.xl,
  },
});
