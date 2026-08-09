import AsyncStorage from '@react-native-async-storage/async-storage';

export const LOCAL_USER_STORAGE_KEYS = [
  'diary-storage',
  'body-storage',
  'workout-storage',
  'workout-plan-storage',
  'fasting-storage',
  'water-storage',
  'meditation-storage',
  'cycle-storage',
  'recipes-storage',
  'community-storage',
  'comments-storage',
  'achievements-storage',
  'notifications-storage',
  'coach-storage',
  'reading-storage',
  'plan-storage',
  'sync-storage',
  'onboarding-storage',
];

export async function clearLocalUserData(): Promise<void> {
  await AsyncStorage.multiRemove(LOCAL_USER_STORAGE_KEYS);
}
