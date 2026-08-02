import { useFastingStore } from '@/src/stores/fasting';

beforeEach(() => {
  useFastingStore.setState({
    currentPlan: '16:8',
    customHours: 16,
    activeSession: null,
    history: [],
  });
});

describe('Fasting Store', () => {
  describe('initial state', () => {
    it('should have default plan 16:8', () => {
      expect(useFastingStore.getState().currentPlan).toBe('16:8');
    });

    it('should have no active session', () => {
      expect(useFastingStore.getState().activeSession).toBeNull();
    });

    it('should have empty history', () => {
      expect(useFastingStore.getState().history).toHaveLength(0);
    });
  });

  describe('setPlan', () => {
    it('should update the current plan', () => {
      useFastingStore.getState().setPlan('18:6');
      expect(useFastingStore.getState().currentPlan).toBe('18:6');
    });

    it('should set custom hours for custom plan', () => {
      useFastingStore.getState().setPlan('custom', 20);
      expect(useFastingStore.getState().currentPlan).toBe('custom');
      expect(useFastingStore.getState().customHours).toBe(20);
    });

    it('should support 14:10 plan', () => {
      useFastingStore.getState().setPlan('14:10');
      expect(useFastingStore.getState().currentPlan).toBe('14:10');
    });

    it('should support 20:4 plan', () => {
      useFastingStore.getState().setPlan('20:4');
      expect(useFastingStore.getState().currentPlan).toBe('20:4');
    });
  });

  describe('startFast / endFast', () => {
    it('should start a fasting session with correct target hours', () => {
      useFastingStore.getState().startFast();
      const session = useFastingStore.getState().activeSession;
      expect(session).not.toBeNull();
      expect(session!.targetHours).toBe(16);
      expect(session!.completed).toBe(false);
      expect(session!.endTime).toBeNull();
    });

    it('should use custom hours when plan is custom', () => {
      useFastingStore.getState().setPlan('custom', 20);
      useFastingStore.getState().startFast();
      const session = useFastingStore.getState().activeSession;
      expect(session!.targetHours).toBe(20);
    });

    it('should end a fast and move to history', () => {
      useFastingStore.getState().startFast();
      useFastingStore.getState().endFast();
      expect(useFastingStore.getState().activeSession).toBeNull();
      expect(useFastingStore.getState().history).toHaveLength(1);
      expect(useFastingStore.getState().history[0].completed).toBe(true);
    });

    it('should not throw when ending without active session', () => {
      expect(() => useFastingStore.getState().endFast()).not.toThrow();
    });

    it('should cap history at 90 entries', () => {
      for (let i = 0; i < 100; i++) {
        useFastingStore.getState().startFast();
        useFastingStore.getState().endFast();
      }
      expect(useFastingStore.getState().history.length).toBeLessThanOrEqual(90);
    });
  });

  describe('elapsed and remaining', () => {
    it('should return 0 elapsed when no active session', () => {
      expect(useFastingStore.getState().getElapsedSeconds()).toBe(0);
    });

    it('should return 0 remaining when no active session', () => {
      expect(useFastingStore.getState().getRemainingSeconds()).toBe(0);
    });

    it('should return positive elapsed time after starting', () => {
      const now = Date.now();
      jest.spyOn(Date, 'now').mockReturnValue(now);
      jest.spyOn(Date.prototype, 'toISOString').mockReturnValue(new Date(now).toISOString());

      useFastingStore.getState().startFast();

      const oneHourMs = 3600 * 1000;
      jest.spyOn(Date, 'now').mockReturnValue(now + oneHourMs);

      const elapsed = useFastingStore.getState().getElapsedSeconds();
      expect(elapsed).toBeGreaterThan(0);

      jest.restoreAllMocks();
    });
  });

  describe('getProgress', () => {
    it('should return 0 when no active session', () => {
      expect(useFastingStore.getState().getProgress()).toBe(0);
    });

    it('should return progress between 0 and 1', () => {
      const now = Date.now();
      jest.spyOn(Date, 'now').mockReturnValue(now);
      jest.spyOn(Date.prototype, 'toISOString').mockReturnValue(new Date(now).toISOString());

      useFastingStore.getState().startFast();

      const eightHoursMs = 8 * 3600 * 1000;
      jest.spyOn(Date, 'now').mockReturnValue(now + eightHoursMs);

      const progress = useFastingStore.getState().getProgress();
      expect(progress).toBeGreaterThan(0);
      expect(progress).toBeLessThanOrEqual(1);

      jest.restoreAllMocks();
    });

    it('should cap at 1.0', () => {
      const now = Date.now();
      jest.spyOn(Date, 'now').mockReturnValue(now);
      jest.spyOn(Date.prototype, 'toISOString').mockReturnValue(new Date(now).toISOString());

      useFastingStore.getState().startFast();

      const twentyHoursMs = 20 * 3600 * 1000;
      jest.spyOn(Date, 'now').mockReturnValue(now + twentyHoursMs);

      const progress = useFastingStore.getState().getProgress();
      expect(progress).toBe(1);

      jest.restoreAllMocks();
    });
  });
});
