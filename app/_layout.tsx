import { useAuthStore } from '@/src/stores/auth';
import { usePrivacyStore } from '@/src/stores/privacy';
import { useOnboardingStore } from '@/src/stores/onboarding';
import { useThemeColors } from '@/src/stores/theme';
import { supabase } from '@/src/lib/supabase';
import { getAuthDestination } from '@/src/lib/authRouting';
import { initSentry } from '@/src/lib/sentry';
import { initAnalytics, identifyUser } from '@/src/lib/analytics';
import { initPushNotifications, savePushToken } from '@/src/lib/notifications';
import { Stack, usePathname, useRouter, type Href } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

export default function RootLayout() {
  const { initialized, user, authError } = useAuthStore();
  const consentAccepted = usePrivacyStore((s) => s.consentAccepted);
  const onboardingCompleted = useOnboardingStore((s) => s.completed);
  const [dbOnboarded, setDbOnboarded] = useState<boolean | null>(null);
  const colors = useThemeColors();
  const pathname = usePathname();
  const router = useRouter();

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
    if (!initialized || !user) {
      setDbOnboarded(null);
      return;
    }
    let active = true;

    const loadProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('goal')
          .eq('id', user.id)
          .single();

        if (active) setDbOnboarded(!error && !!data?.goal);
      } catch {
        if (active) setDbOnboarded(false);
      }
    };

    void loadProfile();
    return () => {
      active = false;
    };
  }, [initialized, user]);

  useEffect(() => {
    if (!initialized) return;

    const destination = getAuthDestination({
      pathname,
      initialized,
      userId: user?.id ?? null,
      consentAccepted,
      onboardingCompleted,
      profileOnboarded: dbOnboarded,
    });

    if (destination.href && destination.href !== pathname) {
      router.replace(destination.href as Href);
      return;
    }

    if (user && pathname.startsWith('/auth/')) {
      const authenticatedDestination = getAuthDestination({
        pathname: '/(tabs)',
        initialized,
        userId: user.id,
        consentAccepted,
        onboardingCompleted,
        profileOnboarded: dbOnboarded,
      });
      router.replace((authenticatedDestination.href || '/(tabs)') as Href);
    }
  }, [consentAccepted, dbOnboarded, initialized, onboardingCompleted, pathname, router, user]);

  return (
    <View className="flex-1" style={{ backgroundColor: colors.bg }}>
      <Stack screenOptions={{ headerShown: false }} />
      {authError ? (
        <View className="absolute bottom-4 left-4 right-4 rounded-lg bg-red-50 p-3">
          <Text className="text-center text-red-700">
            We couldn&apos;t check your session: {authError}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
