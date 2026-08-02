import { Redirect } from 'expo-router';
import { Platform } from 'react-native';

import { PublicLanding } from '@/src/web/PublicLanding';

export default function Index() {
  if (Platform.OS === 'web') {
    return <PublicLanding />;
  }

  return <Redirect href="/auth/login" />;
}
