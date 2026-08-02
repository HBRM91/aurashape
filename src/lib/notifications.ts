import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { supabase } from './supabase';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const NOTIFICATION_CHANNELS = {
  fasting: { id: 'fasting', name: 'Fasting Reminders' },
  challenges: { id: 'challenges', name: 'Community Challenges' },
  community: { id: 'community', name: 'Community Activity' },
  weekly: { id: 'weekly', name: 'Weekly Science Tips' },
  cycle: { id: 'cycle', name: 'Cycle Reminders' },
  meditation: { id: 'meditation', name: 'Mindfulness Prompts' },
  meal: { id: 'meal', name: 'Meal Reminders' },
} as const;

export async function initPushNotifications(): Promise<string | null> {
  try {
    const { status: existing } = await Notifications.getPermissionsAsync();
    let finalStatus = existing;

    if (existing !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') return null;

    if (Platform.OS === 'android') {
      const channels = [
        { id: 'fasting', name: 'Fasting Reminders', importance: Notifications.AndroidImportance.HIGH },
        { id: 'challenges', name: 'Community Challenges', importance: Notifications.AndroidImportance.DEFAULT },
        { id: 'community', name: 'Community Activity', importance: Notifications.AndroidImportance.DEFAULT },
        { id: 'weekly', name: 'Weekly Science Tips', importance: Notifications.AndroidImportance.LOW },
        { id: 'cycle', name: 'Cycle Reminders', importance: Notifications.AndroidImportance.HIGH },
        { id: 'meditation', name: 'Mindfulness Prompts', importance: Notifications.AndroidImportance.DEFAULT },
        { id: 'meal', name: 'Meal Reminders', importance: Notifications.AndroidImportance.DEFAULT },
      ];
      for (const ch of channels) {
        await Notifications.setNotificationChannelAsync(ch.id, {
          name: ch.name,
          importance: ch.importance,
          sound: 'default',
        });
      }
    }

    const token = await Notifications.getExpoPushTokenAsync();
    return token.data;
  } catch {
    return null;
  }
}

export async function savePushToken(userId: string, token: string) {
  try {
    await supabase.from('profiles').update({ expo_push_token: token }).eq('id', userId);
  } catch {}
}

export async function scheduleFastingNotification(hours: number) {
  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Fast Complete!',
      body: `Your ${hours}-hour fast is finished. Eating window open!`,
      data: { screen: 'fasting' },
      ...(Platform.OS === 'android' ? { channelId: 'fasting' } : {}),
    },
    trigger: { type: 'timeInterval', seconds: hours * 3600 } as Notifications.NotificationTriggerInput,
  });
  return id;
}

export async function scheduleFastingWarning(hours: number) {
  const warningSeconds = Math.max(0, (hours - 1) * 3600);
  if (warningSeconds <= 0) return;
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '1 Hour Left',
      body: 'Your eating window closes in 1 hour.',
      data: { screen: 'fasting' },
      ...(Platform.OS === 'android' ? { channelId: 'fasting' } : {}),
    },
    trigger: { type: 'timeInterval', seconds: warningSeconds } as Notifications.NotificationTriggerInput,
  });
}

export async function cancelAllFastingNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function scheduleCycleReminder(nextPeriodDate: string) {
  const nextDate = new Date(nextPeriodDate);
  const now = new Date();
  const daysUntil = Math.ceil((nextDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (daysUntil <= 0) return;
  const secondsUntil = daysUntil * 86400;

  if (daysUntil <= 3) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Period Starting Soon',
        body: `Your period is expected in ${daysUntil} day(s). Stock up and take it easy!`,
        data: { screen: 'cycle' },
        ...(Platform.OS === 'android' ? { channelId: 'cycle' } : {}),
      },
      trigger: { type: 'timeInterval', seconds: Math.max(60, secondsUntil) } as Notifications.NotificationTriggerInput,
    });
  }

  const ovulationDay = daysUntil - 14;
  if (ovulationDay > 0 && ovulationDay <= 30) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Ovulation Window',
        body: 'Your fertile window is approaching. Check your cycle tracker.',
        data: { screen: 'cycle' },
        ...(Platform.OS === 'android' ? { channelId: 'cycle' } : {}),
      },
      trigger: { type: 'timeInterval', seconds: Math.max(60, ovulationDay * 86400) } as Notifications.NotificationTriggerInput,
    });
  }
}

export async function scheduleMeditationReminder(hour: number, minute: number) {
  const now = new Date();
  const trigger = new Date(now);
  trigger.setHours(hour, minute, 0, 0);

  if (trigger <= now) {
    trigger.setDate(trigger.getDate() + 1);
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Time to Breathe',
      body: 'Take 5 minutes for yourself. Your mindfulness session is waiting.',
      data: { screen: 'meditation' },
      ...(Platform.OS === 'android' ? { channelId: 'meditation' } : {}),
    },
    trigger: {
      type: 'daily',
      hour,
      minute,
    } as Notifications.NotificationTriggerInput,
  });
}

export async function scheduleMealReminder(mealType: string, hour: number, minute: number) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: `${mealType} Time`,
      body: `Remember to log your ${mealType.toLowerCase()}! Stay on track with your goals.`,
      data: { screen: 'diary' },
      ...(Platform.OS === 'android' ? { channelId: 'meal' } : {}),
    },
    trigger: {
      type: 'daily',
      hour,
      minute,
    } as Notifications.NotificationTriggerInput,
  });
}

export async function scheduleWeeklyTipDay(dayOfWeek: number) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Weekly Science Tip',
      body: 'New health insight just for you. Tap to learn something new!',
      data: { screen: 'articles' },
      ...(Platform.OS === 'android' ? { channelId: 'weekly' } : {}),
    },
    trigger: {
      type: 'weekly',
      weekday: dayOfWeek,
      hour: 9,
      minute: 0,
    } as Notifications.NotificationTriggerInput,
  });
}

export async function cancelNotificationsByChannel(channelId: string) {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  for (const n of scheduled) {
    if ((n.content.data as any)?.screen === channelId || n.content.data?.screen === channelId) {
      await Notifications.cancelScheduledNotificationAsync(n.identifier);
    }
  }
}
