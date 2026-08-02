import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { track } from '@/src/lib/analytics';

interface WeightEntry {
  id: string;
  date: string;
  weightKg: number;
  bodyFatPct?: number;
}

interface BodyMeasurements {
  id: string;
  date: string;
  neckCm?: number;
  shouldersCm?: number;
  chestCm?: number;
  waistCm?: number;
  hipsCm?: number;
  leftArmCm?: number;
  rightArmCm?: number;
  leftThighCm?: number;
  rightThighCm?: number;
  leftCalfCm?: number;
  rightCalfCm?: number;
}

export interface ProgressPhoto {
  id: string;
  uri: string;
  date: string;
  type: 'front' | 'side' | 'back';
  weightKg?: number;
}

interface BodyState {
  weightEntries: WeightEntry[];
  measurements: BodyMeasurements[];
  photos: ProgressPhoto[];
  addWeight: (entry: Omit<WeightEntry, 'id'>) => void;
  removeWeight: (id: string) => void;
  addMeasurements: (entry: Omit<BodyMeasurements, 'id'>) => void;
  removeMeasurements: (id: string) => void;
  addPhoto: (photo: Omit<ProgressPhoto, 'id'>) => void;
  removePhoto: (id: string) => void;
  getPhotosByDate: (date: string) => ProgressPhoto[];
}

let idCounter = Date.now();

export const useBodyStore = create<BodyState>()(
  persist(
    (set, get) => ({
      weightEntries: [],
      measurements: [],
      photos: [],

      addWeight: (entry) =>
        set((s) => {
          track('weight_logged', { weightKg: entry.weightKg });
          return { weightEntries: [{ ...entry, id: String(idCounter++) }, ...s.weightEntries] };
        }),

      removeWeight: (id) =>
        set((s) => ({
          weightEntries: s.weightEntries.filter((e) => e.id !== id),
        })),

      addMeasurements: (entry) =>
        set((s) => ({
          measurements: [{ ...entry, id: String(idCounter++) }, ...s.measurements],
        })),

      removeMeasurements: (id) =>
        set((s) => ({
          measurements: s.measurements.filter((e) => e.id !== id),
        })),

      addPhoto: (photo) =>
        set((s) => ({
          photos: [{ ...photo, id: String(idCounter++) }, ...s.photos],
        })),

      removePhoto: (id) =>
        set((s) => ({
          photos: s.photos.filter((p) => p.id !== id),
        })),

      getPhotosByDate: (date) => get().photos.filter((p) => p.date === date),
    }),
    {
      name: 'body-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
