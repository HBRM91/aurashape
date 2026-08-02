import { useAuthStore } from '@/src/stores/auth';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Text, View } from 'react-native';

export default function AuthCallbackScreen() {
  const initialized = useAuthStore((state) => state.initialized);
  const user = useAuthStore((state) => state.user);
  const router = useRouter();

  useEffect(() => {
    if (initialized && !user) {
      router.replace('/auth/login');
    }
  }, [initialized, router, user]);

  return (
    <View className="flex-1 items-center justify-center bg-white px-6">
      <Text className="text-center text-base text-gray-500">Completing sign-in...</Text>
    </View>
  );
}
