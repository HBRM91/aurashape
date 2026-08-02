import { useBodyStore } from '@/src/stores/body';

beforeEach(() => {
  useBodyStore.setState({
    weightEntries: [],
    measurements: [],
    photos: [],
  });
});

describe('Body Store - Measurements', () => {
  describe('addMeasurements', () => {
    it('should add body measurements', () => {
      useBodyStore.getState().addMeasurements({
        date: '2026-03-15',
        neckCm: 38,
        chestCm: 100,
        waistCm: 82,
        hipsCm: 95,
      });

      const measurements = useBodyStore.getState().measurements;
      expect(measurements).toHaveLength(1);
      expect(measurements[0].waistCm).toBe(82);
      expect(measurements[0].chestCm).toBe(100);
    });

    it('should support all measurement fields', () => {
      useBodyStore.getState().addMeasurements({
        date: '2026-03-15',
        neckCm: 37,
        shouldersCm: 110,
        chestCm: 102,
        waistCm: 80,
        hipsCm: 96,
        leftArmCm: 35,
        rightArmCm: 36,
        leftThighCm: 58,
        rightThighCm: 59,
        leftCalfCm: 37,
        rightCalfCm: 38,
      });

      const m = useBodyStore.getState().measurements[0];
      expect(m.leftArmCm).toBe(35);
      expect(m.rightThighCm).toBe(59);
      expect(m.shouldersCm).toBe(110);
      expect(m.rightCalfCm).toBe(38);
    });

    it('should assign unique IDs', () => {
      useBodyStore.getState().addMeasurements({ date: '2026-01-01', chestCm: 95 });
      useBodyStore.getState().addMeasurements({ date: '2026-02-01', chestCm: 92 });
      const ids = useBodyStore.getState().measurements.map((m) => m.id);
      expect(ids[0]).not.toBe(ids[1]);
    });

    it('should prepend to the measurements array (newest first)', () => {
      useBodyStore.getState().addMeasurements({ date: '2026-01-01', waistCm: 85 });
      useBodyStore.getState().addMeasurements({ date: '2026-02-01', waistCm: 82 });
      expect(useBodyStore.getState().measurements[0].date).toBe('2026-02-01');
    });
  });

  describe('removeMeasurements', () => {
    it('should remove a measurement entry by ID', () => {
      useBodyStore.getState().addMeasurements({ date: '2026-01-01', waistCm: 85 });
      useBodyStore.getState().addMeasurements({ date: '2026-02-01', waistCm: 82 });
      const id = useBodyStore.getState().measurements[0].id;
      useBodyStore.getState().removeMeasurements(id);
      expect(useBodyStore.getState().measurements).toHaveLength(1);
      expect(useBodyStore.getState().measurements[0].waistCm).toBe(85);
    });
  });
});
