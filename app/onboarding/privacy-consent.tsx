import { usePrivacyStore } from '@/src/stores/privacy';
import { useState } from 'react';
import { Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useThemeColors } from '@/src/stores/theme';

type ConsentKey = 'privacy' | 'terms' | 'newsletter' | 'analytics' | 'ai';

const POLICY_VERSION = '2026-08-09';
const CONSENTS: Array<{ key: ConsentKey; label: string; detail: string; required: boolean; link?: string }> = [
  { key: 'privacy', label: 'I accept the Privacy Policy', detail: 'Required to use Aurashape. It explains what we collect, why we collect it, and how you control it.', required: true, link: 'privacy' },
  { key: 'terms', label: 'I accept the Terms of Service', detail: 'Required to use the service. Aurashape provides general wellness information, not medical advice.', required: true, link: 'terms' },
  { key: 'newsletter', label: 'Send me optional health tips', detail: 'Optional emails with practical, science-informed wellness ideas. You can unsubscribe anytime.', required: false },
  { key: 'analytics', label: 'Help improve Aurashape with analytics', detail: 'Optional product analytics. We do not require analytics to provide the core local experience.', required: false },
  { key: 'ai', label: 'Allow optional AI coaching', detail: 'Optional AI coaching may process the information you submit. You can keep AI off and use local guidance.', required: false },
];

function legalUrl(path: string): string {
  return Platform.OS === 'web' ? `/${path}` : `https://aurashape.app/${path}`;
}

export default function PrivacyConsentScreen() {
  const colors = useThemeColors();
  const recordConsent = usePrivacyStore((state) => state.recordConsent);
  const [accepted, setAccepted] = useState<Record<ConsentKey, boolean>>({ privacy: false, terms: false, newsletter: false, analytics: false, ai: false });
  const requiredAccepted = accepted.privacy && accepted.terms;

  const toggle = (key: ConsentKey) => setAccepted((current) => ({ ...current, [key]: !current[key] }));

  const continueToOnboarding = () => {
    if (!requiredAccepted) return;
    recordConsent({
      termsAccepted: accepted.terms,
      newsletterOptIn: accepted.newsletter,
      analyticsOptIn: accepted.analytics,
      aiOptIn: accepted.ai,
    });
    router.replace('/onboarding');
  };

  return (
    <ScrollView contentContainerStyle={styles.content} style={{ backgroundColor: colors.bgSecondary }}>
      <View style={[styles.panel, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
        <Text style={[styles.eyebrow, { color: colors.primary }]}>AURASHAPE · PRIVACY FIRST</Text>
        <Text style={[styles.title, { color: colors.text }]}>Your Privacy Matters</Text>
        <Text style={[styles.intro, { color: colors.textSecondary }]}>Review the choices below before creating your personal wellness plan. Required choices are clearly marked; optional choices never block the local experience.</Text>

        <View style={[styles.notice, { backgroundColor: colors.bgInput, borderColor: colors.border }]}>
          <Text style={[styles.noticeTitle, { color: colors.text }]}>Policy version {POLICY_VERSION}</Text>
          <Text style={[styles.noticeBody, { color: colors.textSecondary }]}>You can change optional choices later in Profile. Consent is recorded with the acceptance time.</Text>
        </View>

        {CONSENTS.map((item) => (
          <View key={item.key} style={[styles.item, { borderColor: accepted[item.key] ? colors.primary : colors.border, backgroundColor: colors.bgCard }]}>
            <Pressable accessibilityRole="checkbox" accessibilityLabel={item.label} accessibilityState={{ checked: accepted[item.key] }} onPress={() => toggle(item.key)} style={styles.checkRow}>
              <View style={[styles.checkbox, { borderColor: accepted[item.key] ? colors.primary : colors.textMuted, backgroundColor: accepted[item.key] ? colors.primary : 'transparent' }]}>
                {accepted[item.key] ? <Text style={styles.checkmark}>✓</Text> : null}
              </View>
              <View style={styles.itemCopy}>
                <Text style={[styles.itemTitle, { color: colors.text }]}>{item.label}{item.required ? ' *' : ''}</Text>
                <Text style={[styles.itemDetail, { color: colors.textSecondary }]}>{item.detail}</Text>
              </View>
            </Pressable>
            {item.link ? <Pressable accessibilityRole="link" accessibilityLabel={`Read ${item.link}`} onPress={() => Linking.openURL(legalUrl(item.link!))}><Text style={[styles.link, { color: colors.primary }]}>Read {item.link} →</Text></Pressable> : null}
          </View>
        ))}

        <Pressable accessibilityRole="button" accessibilityState={{ disabled: !requiredAccepted }} onPress={continueToOnboarding} disabled={!requiredAccepted} style={[styles.continue, { backgroundColor: requiredAccepted ? colors.primary : colors.bgInput }]}>
          <Text style={[styles.continueText, { color: requiredAccepted ? '#FFFFFF' : colors.textMuted }]}>Continue</Text>
        </Pressable>
        {!requiredAccepted ? <Text style={[styles.error, { color: colors.textMuted }]}>Accept the Privacy Policy and Terms of Service to continue.</Text> : null}
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
  item: { borderRadius: 14, borderWidth: 1, marginTop: 12, padding: 15 },
  checkRow: { alignItems: 'flex-start', flexDirection: 'row', gap: 12 },
  checkbox: { alignItems: 'center', borderRadius: 6, borderWidth: 2, height: 24, justifyContent: 'center', marginTop: 1, width: 24 },
  checkmark: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  itemCopy: { flex: 1 },
  itemTitle: { fontSize: 15, fontWeight: '700', lineHeight: 21 },
  itemDetail: { fontSize: 13, lineHeight: 19, marginTop: 4 },
  link: { fontSize: 13, fontWeight: '700', marginLeft: 36, marginTop: 10 },
  continue: { alignItems: 'center', borderRadius: 14, minHeight: 52, justifyContent: 'center', marginTop: 22, paddingHorizontal: 18 },
  continueText: { fontSize: 16, fontWeight: '800' },
  error: { fontSize: 13, marginTop: 9, textAlign: 'center' },
});
