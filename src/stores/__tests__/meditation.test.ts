import { useMeditationStore } from '@/src/stores/meditation';
import type { MeditationSession } from '@/src/types';

beforeEach(() => {
  useMeditationStore.setState({
    sessions: [],
    totalMinutes: 0,
    streak: 0,
    lastSessionDate: null,
  });
});

describe('Meditation Store', () => {
  describe('initial state', () => {
    it('should have empty sessions', () => {
      expect(useMeditationStore.getState().sessions).toHaveLength(0);
    });

    it('should have 5 breathing patterns', () => {
      expect(useMeditationStore.getState().breathingPatterns).toHaveLength(5);
    });

    it('should have Box Breathing as first pattern', () => {
      expect(useMeditationStore.getState().breathingPatterns[0].name).toBe('Box Breathing');
      expect(useMeditationStore.getState().breathingPatterns[0].inhaleSeconds).toBe(4);
      expect(useMeditationStore.getState().breathingPatterns[0].holdInSeconds).toBe(4);
      expect(useMeditationStore.getState().breathingPatterns[0].exhaleSeconds).toBe(4);
      expect(useMeditationStore.getState().breathingPatterns[0].holdOutSeconds).toBe(4);
    });
  });

  describe('addSession', () => {
    it('should add a meditation session', () => {
      useMeditationStore.getState().addSession({
        type: 'breathing',
        durationMinutes: 10,
        completedAt: new Date().toISOString(),
        completed: true,
      });
      
      const sessions = useMeditationStore.getState().sessions;
      expect(sessions).toHaveLength(1);
      expect(sessions[0].type).toBe('breathing');
      expect(sessions[0].durationMinutes).toBe(10);
      expect(sessions[0].completed).toBe(true);
    });

    it('should increment total minutes', () => {
      useMeditationStore.getState().addSession({
        type: 'body_scan',
        durationMinutes: 15,
        completedAt: new Date().toISOString(),
        completed: true,
      });
      useMeditationStore.getState().addSession({
        type: 'sleep',
        durationMinutes: 5,
        completedAt: new Date().toISOString(),
        completed: true,
      });
      expect(useMeditationStore.getState().totalMinutes).toBe(20);
    });

    it('should track streak for consecutive days', () => {
      const yesterday = new Date(Date.now() - 86400000).toISOString();

      useMeditationStore.setState({ lastSessionDate: yesterday.slice(0, 10), streak: 3 });
      
      useMeditationStore.getState().addSession({
        type: 'focus',
        durationMinutes: 5,
        completedAt: new Date().toISOString(),
        completed: true,
      });

      expect(useMeditationStore.getState().streak).toBe(4);
    });

    it('should reset streak if day skipped', () => {
      const twoDaysAgo = new Date(Date.now() - 2 * 86400000).toISOString();

      useMeditationStore.setState({ lastSessionDate: twoDaysAgo.slice(0, 10), streak: 5 });

      useMeditationStore.getState().addSession({
        type: 'morning',
        durationMinutes: 10,
        completedAt: new Date().toISOString(),
        completed: true,
      });

      expect(useMeditationStore.getState().streak).toBe(1);
    });

    it('should not double-count streak for same day', () => {
      const today = new Date().toISOString().slice(0, 10);

      useMeditationStore.setState({ lastSessionDate: today, streak: 3 });

      useMeditationStore.getState().addSession({
        type: 'breathing',
        durationMinutes: 5,
        completedAt: new Date().toISOString(),
        completed: true,
      });

      expect(useMeditationStore.getState().streak).toBe(3);
    });
  });

  describe('getTotalSessions', () => {
    it('should return total session count', () => {
      useMeditationStore.getState().addSession({
        type: 'breathing',
        durationMinutes: 5,
        completedAt: new Date().toISOString(),
        completed: true,
      });
      useMeditationStore.getState().addSession({
        type: 'sleep',
        durationMinutes: 10,
        completedAt: new Date().toISOString(),
        completed: true,
      });
      expect(useMeditationStore.getState().getTotalSessions()).toBe(2);
    });
  });

  describe('getWeeklyMinutes', () => {
    it('should return minutes from last 7 days', () => {
      useMeditationStore.getState().addSession({
        type: 'focus',
        durationMinutes: 10,
        completedAt: new Date().toISOString(),
        completed: true,
      });
      useMeditationStore.getState().addSession({
        type: 'breathing',
        durationMinutes: 5,
        completedAt: new Date().toISOString(),
        completed: true,
      });
      expect(useMeditationStore.getState().getWeeklyMinutes()).toBe(15);
    });

    it('should exclude incomplete sessions', () => {
      useMeditationStore.getState().addSession({
        type: 'focus',
        durationMinutes: 10,
        completedAt: new Date().toISOString(),
        completed: true,
      });
      useMeditationStore.getState().addSession({
        type: 'breathing',
        durationMinutes: 5,
        completedAt: new Date().toISOString(),
        completed: false,
      });
      expect(useMeditationStore.getState().getWeeklyMinutes()).toBe(10);
    });
  });

  describe('getStreak', () => {
    it('should return current streak', () => {
      useMeditationStore.setState({ streak: 7 });
      expect(useMeditationStore.getState().getStreak()).toBe(7);
    });
  });

  describe('breathing patterns', () => {
    it('should include 4-7-8 breathing', () => {
      const pattern = useMeditationStore.getState().breathingPatterns.find((p) => p.name === '4-7-8 Breathing');
      expect(pattern).toBeDefined();
      expect(pattern!.inhaleSeconds).toBe(4);
      expect(pattern!.holdInSeconds).toBe(7);
      expect(pattern!.exhaleSeconds).toBe(8);
    });

    it('should include all default patterns', () => {
      const patterns = useMeditationStore.getState().breathingPatterns;
      const names = patterns.map((p) => p.name);
      expect(names).toContain('Box Breathing');
      expect(names).toContain('4-7-8 Breathing');
      expect(names).toContain('Deep Belly');
      expect(names).toContain('Energizing');
      expect(names).toContain('Coherent Breathing');
    });
  });
});
