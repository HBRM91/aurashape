import { usePrivacyStore } from '@/src/stores/privacy';
import { Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useThemeColors } from '@/src/stores/theme';
import { seedDemoData } from '@/src/lib/demoData';
import { isLocalOnly } from '@/src/lib/privacyMode';

const POLICY_VERSION = '2026-08-09';

function legalUrl(path: string): string {
  return Platform.OS === 'web' ? `/${path}` : `https://aurashape.app/${path}`;
}

// A single "by continuing you agree" statement plus one button is the
// industry-standard pattern (MyFitnessPal, Yazio, and most consumer apps use
// exactly this) and is legally sufficient for Terms/Privacy consent — a
// checkbox wall doesn't add legal protection here, only friction. The three
// genuinely optional choices (newsletter, analytics, AI coaching) default to
// off, which is the more privacy-respecting outcome anyway, and move to
// Profile > Privacy & Notifications where they can actually be changed later
// — unlike before, when the "change it later" promise had no toggle to back
// it up.
export default function PrivacyConsentScreen() {
  const colors = useThemeColors();
  const recordConsent = usePrivacyStore((state) => state.recordConsent);

  const continueToOnboarding = () => {
    recordConsent({
      termsAccepted: true,
      newsletterOptIn: false,
      analyticsOptIn: false,
      aiOptIn: false,
    });
    router.replace('/onboarding');
  };

  const tryDemo = () => {
    seedDemoData();
    router.replace(isLocalOnly() ? '/diary' : '/(tabs)');
  };

  return (
    <ScrollView contentContainerStyle={styles.content} style={{ backgroundColor: colors.bgSecondary }}>
      <View style={[styles.panel, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
        <Text style={[styles.eyebrow, { color: colors.primary }]}>AURASHAPE · PRIVACY FIRST</Text>
        <Text style={[styles.title, { color: colors.text }]}>Your data stays on your device</Text>
        <Text style={[styles.intro, { color: colors.textSecondary }]}>Aurashape tracks your nutrition, fasting, and workouts locally by default — nothing leaves your device unless you turn on cloud sync yourself.</Text>

        <View style={[styles.notice, { backgroundColor: colors.bgInput, borderColor: colors.border }]}>
          <Text style={[styles.noticeTitle, { color: colors.text }]}>Policy version {POLICY_VERSION}</Text>
          <Text style={[styles.noticeBody, { color: colors.textSecondary }]}>Health tips, analytics, and AI coaching are optional and start switched off. Turn them on anytime in Profile → Privacy & Notifications.</Text>
        </View>

        <Pressable accessibilityRole="button" onPress={continueToOnboarding} style={[styles.continue, { backgroundColor: colors.primary }]}>
          <Text style={styles.continueText}>Continue</Text>
        </Pressable>
        <Text style={[styles.consentLine, { color: colors.textMuted }]}>
          By continuing, you agree to the{' '}
          <Text accessibilityRole="link" onPress={() => Linking.openURL(legalUrl('privacy'))} style={[styles.link, { color: colors.primary }]}>Privacy Policy</Text>
          {' '}and{' '}
          <Text accessibilityRole="link" onPress={() => Linking.openURL(legalUrl('terms'))} style={[styles.link, { color: colors.primary }]}>Terms of Service</Text>.
        </Text>

        <Pressable accessibilityRole="button" onPress={tryDemo} style={styles.demoLink}>
          <Text style={[styles.demoLinkText, { color: colors.textMuted }]}>Just exploring? <Text style={{ color: colors.primary, fontWeight: '700' }}>Try a pre-filled demo →</Text></Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  panel: { alignSelf: 'center', borderRadius: 24, borderWidth: 1, maxWidth: 720, padding: 28, width: '100%' },
  eyebrow: { fontSize: 12, fontWeight: '800', letterSpacing: 1.5, marginBottom: 10 },
  title: { fontSize: 32, fontWeight: '800', lineHeight: 38 },
  intro: { fontSize: 15, lineHeight: 23, marginTop: 10 },
  notice: { borderRadius: 14, borderWidth: 1, marginTop: 22, padding: 14 },
  noticeTitle: { fontSize: 14, fontWeight: '700' },
  noticeBody: { fontSize: 13, lineHeight: 19, marginTop: 4 },
  link: { fontWeight: '700' },
  continue: { alignItems: 'center', borderRadius: 14, minHeight: 52, justifyContent: 'center', marginTop: 28, paddingHorizontal: 18 },
  continueText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  consentLine: { fontSize: 13, lineHeight: 19, marginTop: 14, textAlign: 'center' },
  demoLink: { alignItems: 'center', marginTop: 18 },
  demoLinkText: { fontSize: 13 },
});
