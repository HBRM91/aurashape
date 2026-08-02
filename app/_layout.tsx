import { useAuthStore } from '@/src/stores/auth';
import { usePrivacyStore } from '@/src/stores/privacy';
import { useOnboardingStore } from '@/src/stores/onboarding';
import { useThemeColors } from '@/src/stores/theme';
import { supabase } from '@/src/lib/supabase';
import { initSentry } from '@/src/lib/sentry';
import { initAnalytics, identifyUser } from '@/src/lib/analytics';
import { initPushNotifications, savePushToken } from '@/src/lib/notifications';
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

export default function RootLayout() {
  const { initialized, loading, user } = useAuthStore();
  const consentAccepted = usePrivacyStore((s) => s.consentAccepted);
  const onboardingCompleted = useOnboardingStore((s) => s.completed);
  const [dbOnboarded, setDbOnboarded] = useState<boolean | null>(null);
  const colors = useThemeColors();

  useEffect(() => {
    useAuthStore.getState().initialize();
    initSentry();
    initAnalytics();
  }, []);

  useEffect(() => {
    if (!user) return;
    identifyUser(user.id, user.email || '');
    initPushNotifications().then((token) => {
      if (token) savePushToken(user.id, token);
    }).catch(() => {});
  }, [user]);

  useEffect(() => {
    if (!user) {
      setDbOnboarded(null);
      return;
    }
    supabase
      .from('profiles')
      .select('goal')
      .eq('id', user.id)
      .single()
      .then(
        ({ data }) => {
          setDbOnboarded(!!data?.goal);
        },
        () => {
          setDbOnboarded(false);
        }
      );
  }, [user]);

  if (!initialized || loading || (user && dbOnboarded === null)) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: colors.bg }}>
        <ActivityIndicator size="large" color="#4ADE80" />
      </View>
    );
  }

  if (!user) {
    return (
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="auth/login" />
        <Stack.Screen name="auth/signup" />
        <Stack.Screen name="auth/forgot-password" />
      </Stack>
    );
  }

  if (!consentAccepted) {
    return (
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="onboarding/privacy-consent" />
      </Stack>
    );
  }

  const isOnboarded = onboardingCompleted || dbOnboarded;

  if (!isOnboarded) {
    return (
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="onboarding/index" />
      </Stack>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
