jest.mock('@/src/lib/notifications', () => ({
  scheduleMeditationReminder: jest.fn(),
  scheduleMealReminder: jest.fn(),
  scheduleWeeklyTipDay: jest.fn(),
  scheduleCycleReminder: jest.fn(),
  cancelAllFastingNotifications: jest.fn(),
}));

jest.mock('react-native', () => ({
  Platform: { OS: 'ios', select: jest.fn((obj: any) => obj.ios) },
}));

import { useNotificationStore } from '@/src/stores/notifications';

beforeEach(() => {
  jest.clearAllMocks();
  useNotificationStore.setState({
    fastingReminders: true,
    cycleReminders: true,
    meditationReminder: false,
    meditationTime: '08:00',
    mealReminders: false,
    breakfastTime: '08:00',
    lunchTime: '12:00',
    dinnerTime: '19:00',
    weeklyTips: true,
  });
});

describe('Notification Store', () => {
  describe('initial state', () => {
    it('should have default preferences', () => {
      expect(useNotificationStore.getState().fastingReminders).toBe(true);
      expect(useNotificationStore.getState().cycleReminders).toBe(true);
      expect(useNotificationStore.getState().meditationReminder).toBe(false);
      expect(useNotificationStore.getState().mealReminders).toBe(false);
      expect(useNotificationStore.getState().weeklyTips).toBe(true);
    });

    it('should have default times', () => {
      expect(useNotificationStore.getState().meditationTime).toBe('08:00');
      expect(useNotificationStore.getState().breakfastTime).toBe('08:00');
      expect(useNotificationStore.getState().lunchTime).toBe('12:00');
      expect(useNotificationStore.getState().dinnerTime).toBe('19:00');
    });
  });

  describe('setPref', () => {
    it('should update a preference', () => {
      useNotificationStore.getState().setPref('meditationReminder', true);
      expect(useNotificationStore.getState().meditationReminder).toBe(true);
    });

    it('should update a time', () => {
      useNotificationStore.getState().setPref('meditationTime', '09:30');
      expect(useNotificationStore.getState().meditationTime).toBe('09:30');
    });

    it('should update meal reminders', () => {
      useNotificationStore.getState().setPref('mealReminders', true);
      useNotificationStore.getState().setPref('breakfastTime', '07:30');
      expect(useNotificationStore.getState().mealReminders).toBe(true);
      expect(useNotificationStore.getState().breakfastTime).toBe('07:30');
    });
  });

  describe('applySchedule', () => {
    it('should schedule meditation reminder when enabled', async () => {
      const notif = require('@/src/lib/notifications');
      useNotificationStore.getState().setPref('meditationReminder', true);
      await useNotificationStore.getState().applySchedule();
      expect(notif.scheduleMeditationReminder).toHaveBeenCalledWith(8, 0);
    });

    it('should schedule meal reminders when enabled', async () => {
      const notif = require('@/src/lib/notifications');
      useNotificationStore.getState().setPref('mealReminders', true);
      await useNotificationStore.getState().applySchedule();
      expect(notif.scheduleMealReminder).toHaveBeenCalledTimes(3);
    });

    it('should not schedule reminders when disabled', async () => {
      const notif = require('@/src/lib/notifications');
      useNotificationStore.setState({ meditationReminder: false, mealReminders: false, weeklyTips: false });
      await useNotificationStore.getState().applySchedule();
      expect(notif.scheduleMeditationReminder).not.toHaveBeenCalled();
      expect(notif.scheduleMealReminder).not.toHaveBeenCalled();
    });
  });
});
