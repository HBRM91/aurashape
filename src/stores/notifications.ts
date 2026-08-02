import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as notif from '@/src/lib/notifications';

export interface NotificationPrefs {
  fastingReminders: boolean;
  cycleReminders: boolean;
  meditationReminder: boolean;
  meditationTime: string;
  mealReminders: boolean;
  breakfastTime: string;
  lunchTime: string;
  dinnerTime: string;
  weeklyTips: boolean;
}

interface NotificationState extends NotificationPrefs {
  setPref: <K extends keyof NotificationPrefs>(key: K, value: NotificationPrefs[K]) => void;
  applySchedule: () => Promise<void>;
  cancelAll: () => Promise<void>;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      fastingReminders: true,
      cycleReminders: true,
      meditationReminder: false,
      meditationTime: '08:00',
      mealReminders: false,
      breakfastTime: '08:00',
      lunchTime: '12:00',
      dinnerTime: '19:00',
      weeklyTips: true,

      setPref: (key, value) => set({ [key]: value }),

      applySchedule: async () => {
        const s = get();
        await notif.cancelAllFastingNotifications();

        if (s.meditationReminder) {
          const [h, m] = s.meditationTime.split(':').map(Number);
          await notif.scheduleMeditationReminder(h, m);
        }

        if (s.mealReminders) {
          const [bh, bm] = s.breakfastTime.split(':').map(Number);
          const [lh, lm] = s.lunchTime.split(':').map(Number);
          const [dh, dm] = s.dinnerTime.split(':').map(Number);
          await notif.scheduleMealReminder('Breakfast', bh, bm);
          await notif.scheduleMealReminder('Lunch', lh, lm);
          await notif.scheduleMealReminder('Dinner', dh, dm);
        }

        if (s.weeklyTips) {
          await notif.scheduleWeeklyTipDay(3);
        }
      },

      cancelAll: async () => {
        await notif.cancelAllFastingNotifications();
      },
    }),
    {
      name: 'notifications-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
