import { useCycleStore, predictCycle } from '@/src/stores/cycle';
import type { CycleEntry } from '@/src/types';

beforeEach(() => {
  useCycleStore.setState({
    entries: [],
    currentCycleLength: 28,
    currentPeriodLength: 5,
  });
});

describe('predictCycle', () => {
  it('should predict next period correctly', () => {
    const prediction = predictCycle('2026-01-01', 28, 5);
    expect(prediction.nextPeriodStart).toBe('2026-01-29');
    expect(prediction.nextPeriodEnd).toBe('2026-02-03');
  });

  it('should predict ovulation around day 14 before next period', () => {
    const prediction = predictCycle('2026-01-01', 28, 5);
    expect(prediction.ovulationDate).toBe('2026-01-15');
  });

  it('should calculate fertile window', () => {
    const prediction = predictCycle('2026-01-01', 28, 5);
    expect(prediction.fertileWindow.start).toBe('2026-01-10');
    expect(prediction.fertileWindow.end).toBe('2026-01-16');
  });

  it('should handle custom cycle lengths', () => {
    const prediction = predictCycle('2026-01-01', 35, 4);
    expect(prediction.nextPeriodStart).toBe('2026-02-05');
    expect(prediction.nextPeriodEnd).toBe('2026-02-09');
  });

  it('should identify menstrual phase at start of cycle', () => {
    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);
    const prediction = predictCycle(todayStr, 28, 5);
    expect(prediction.currentPhase).toBe('menstrual');
  });
});

describe('Cycle Store', () => {
  describe('addEntry', () => {
    it('should add a new cycle entry', () => {
      useCycleStore.getState().addEntry({
        startDate: '2026-01-01',
        endDate: '2026-01-05',
        cycleLength: 28,
        periodLength: 5,
        symptoms: [{ type: 'cramps', intensity: 3 }],
        flowLevel: 'medium',
      });
      
      const entries = useCycleStore.getState().entries;
      expect(entries).toHaveLength(1);
      expect(entries[0].startDate).toBe('2026-01-01');
      expect(entries[0].periodLength).toBe(5);
    });

    it('should auto-assign an id', () => {
      useCycleStore.getState().addEntry({
        startDate: '2026-01-01',
        cycleLength: 28,
        periodLength: 5,
        flowLevel: 'light',
      });
      expect(useCycleStore.getState().entries[0].id).toBeDefined();
    });
  });

  describe('updateEntry', () => {
    it('should update an existing entry', () => {
      useCycleStore.getState().addEntry({
        startDate: '2026-01-01',
        cycleLength: 28,
        periodLength: 5,
        flowLevel: 'medium',
      });
      const id = useCycleStore.getState().entries[0].id;
      useCycleStore.getState().updateEntry(id, { flowLevel: 'heavy', notes: 'Bad cramps' });
      
      const updated = useCycleStore.getState().entries[0];
      expect(updated.flowLevel).toBe('heavy');
      expect(updated.notes).toBe('Bad cramps');
    });
  });

  describe('removeEntry', () => {
    it('should remove an entry', () => {
      useCycleStore.getState().addEntry({
        startDate: '2026-01-01',
        cycleLength: 28,
        periodLength: 5,
        flowLevel: 'medium',
      });
      const id = useCycleStore.getState().entries[0].id;
      useCycleStore.getState().removeEntry(id);
      expect(useCycleStore.getState().entries).toHaveLength(0);
    });
  });

  describe('setCycleLength', () => {
    it('should update cycle length', () => {
      useCycleStore.getState().setCycleLength(30);
      expect(useCycleStore.getState().currentCycleLength).toBe(30);
    });

    it('should clamp to minimum 20 days', () => {
      useCycleStore.getState().setCycleLength(15);
      expect(useCycleStore.getState().currentCycleLength).toBe(20);
    });

    it('should clamp to maximum 45 days', () => {
      useCycleStore.getState().setCycleLength(50);
      expect(useCycleStore.getState().currentCycleLength).toBe(45);
    });
  });

  describe('setPeriodLength', () => {
    it('should update period length', () => {
      useCycleStore.getState().setPeriodLength(7);
      expect(useCycleStore.getState().currentPeriodLength).toBe(7);
    });

    it('should clamp to minimum 1 day', () => {
      useCycleStore.getState().setPeriodLength(0);
      expect(useCycleStore.getState().currentPeriodLength).toBe(1);
    });

    it('should clamp to maximum 10 days', () => {
      useCycleStore.getState().setPeriodLength(15);
      expect(useCycleStore.getState().currentPeriodLength).toBe(10);
    });
  });

  describe('getPrediction', () => {
    it('should return null when no entries', () => {
      expect(useCycleStore.getState().getPrediction()).toBeNull();
    });

    it('should return prediction based on last entry', () => {
      useCycleStore.getState().addEntry({
        startDate: '2026-01-01',
        cycleLength: 28,
        periodLength: 5,
        flowLevel: 'medium',
      });
      const prediction = useCycleStore.getState().getPrediction();
      expect(prediction).not.toBeNull();
      expect(prediction!.nextPeriodStart).toBe('2026-01-29');
    });
  });

  describe('getLastEntry', () => {
    it('should return null when no entries', () => {
      expect(useCycleStore.getState().getLastEntry()).toBeNull();
    });

    it('should return most recent entry', () => {
      useCycleStore.getState().addEntry({
        startDate: '2026-01-01',
        cycleLength: 28,
        periodLength: 5,
        flowLevel: 'medium',
      });
      useCycleStore.getState().addEntry({
        startDate: '2026-02-01',
        cycleLength: 28,
        periodLength: 4,
        flowLevel: 'light',
      });
      const last = useCycleStore.getState().getLastEntry();
      expect(last!.startDate).toBe('2026-02-01');
    });
  });
});
