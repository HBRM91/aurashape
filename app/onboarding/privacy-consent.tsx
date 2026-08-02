import { COLORS } from '@/src/constants/theme';
import { usePrivacyStore } from '@/src/stores/privacy';
import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Linking } from 'react-native';

type ConsentItem = { key: string; label: string; detail: string; link?: { text: string; url: string } };

const CONSENTS: ConsentItem[] = [
  {
    key: 'privacy',
    label: 'I have read and accept the Privacy Policy',
    detail: 'We never sell your data. Your health information stays private, encrypted, and under your control.',
    link: { text: 'Read Privacy Policy', url: 'https://aurashape.app/privacy' },
  },
  {
    key: 'tos',
    label: 'I agree to the Terms of Service',
    detail: 'Use Aurashape responsibly. This app provides general health guidance, not medical advice.',
    link: { text: 'Read Terms of Service', url: 'https://aurashape.app/terms' },
  },
  {
    key: 'newsletter',
    label: 'Optional: Keep me updated with health tips',
    detail: 'Monthly newsletter with science-based health insights. Unsubscribe anytime.',
  },
];

export default function PrivacyConsentScreen() {
  const setConsentAccepted = usePrivacyStore((s) => s.setConsentAccepted);
  const [accepted, setAccepted] = useState<Record<string, boolean>>({});

  const toggleConsent = (key: string) => {
    setAccepted((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const requiredAccepted = accepted.privacy && accepted.tos;

  const handleContinue = () => {
    if (!requiredAccepted) return;
    setConsentAccepted(true);
  };

  return (
    <ScrollView className="flex-1 bg-white" contentContainerStyle={{ flexGrow: 1 }}>
      <View className="flex-1 px-6 pt-24">
        <Text className="mb-2 text-3xl font-bold" style={{ color: COLORS.primaryDark }}>
          Your Privacy Matters
        </Text>
        <Text className="mb-8 text-gray-500">
          Aurashape is built privacy-first from day one. Please review and accept the following:
        </Text>

        {CONSENTS.map((item) => {
          const checked = accepted[item.key] || false;
          const required = item.key !== 'newsletter';

          return (
            <TouchableOpacity
              key={item.key}
              className="mb-4 rounded-xl border p-4"
              style={{ borderColor: checked ? COLORS.primary : '#E5E7EB' }}
              onPress={() => toggleConsent(item.key)}
            >
              <View className="flex-row items-start gap-3">
                <View
                  className="mt-0.5 h-5 w-5 items-center justify-center rounded border"
                  style={{
                    borderColor: checked ? COLORS.primary : '#9CA3AF',
                    backgroundColor: checked ? COLORS.primary : 'transparent',
                  }}
                >
                  {checked && <Text className="text-xs font-bold text-white">✓</Text>}
                </View>
                <View className="flex-1">
                  <View className="flex-row items-center gap-1">
                    <Text className="text-base font-medium">{item.label}</Text>
                    {required && <Text className="text-xs text-red-400">*</Text>}
                  </View>
                  <Text className="mt-1 text-sm text-gray-400">{item.detail}</Text>
                  {item.link && (
                    <TouchableOpacity
                      onPress={() => Linking.openURL(item.link!.url)}
                      className="mt-2"
                    >
                      <Text className="text-xs font-semibold" style={{ color: COLORS.secondary }}>
                        {item.link.text} →
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          );
        })}

        <View className="mt-auto pb-16">
          <TouchableOpacity
            className="rounded-xl py-4"
            style={{
              backgroundColor: requiredAccepted ? COLORS.primary : '#D1D5DB',
            }}
            onPress={handleContinue}
            disabled={!requiredAccepted}
          >
            <Text className="text-center text-lg font-semibold text-white">
              Continue
            </Text>
          </TouchableOpacity>
          {!requiredAccepted && (
            <Text className="mt-2 text-center text-sm text-gray-400">
              Please accept the Privacy Policy and Terms of Service to continue
            </Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
}
