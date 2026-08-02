import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { track } from '@/src/lib/analytics';

interface WaterState {
  waterMl: Record<string, number>;
  fruitCount: Record<string, number>;
  vegCount: Record<string, number>;
  addWater: (date: string, ml: number) => void;
  setWater: (date: string, ml: number) => void;
  addFruit: (date: string) => void;
  addVeg: (date: string) => void;
  resetDate: (date: string) => void;
}

export const useWaterStore = create<WaterState>()(
  persist(
    (set) => ({
      waterMl: {},
      fruitCount: {},
      vegCount: {},

      addWater: (date, ml) => {
        track('water_added', { ml });
        set((s) => ({ waterMl: { ...s.waterMl, [date]: (s.waterMl[date] || 0) + ml } }));
      },

      setWater: (date, ml) =>
        set((s) => ({ waterMl: { ...s.waterMl, [date]: ml } })),

      addFruit: (date) =>
        set((s) => ({ fruitCount: { ...s.fruitCount, [date]: (s.fruitCount[date] || 0) + 1 } })),

      addVeg: (date) =>
        set((s) => ({ vegCount: { ...s.vegCount, [date]: (s.vegCount[date] || 0) + 1 } })),

      resetDate: (date) =>
        set((s) => ({
          waterMl: { ...s.waterMl, [date]: 0 },
          fruitCount: { ...s.fruitCount, [date]: 0 },
          vegCount: { ...s.vegCount, [date]: 0 },
        })),
    }),
    {
      name: 'water-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
