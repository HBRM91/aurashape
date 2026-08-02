import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface PrivacyState {
  consentAccepted: boolean;
  setConsentAccepted: (value: boolean) => void;
}

export const usePrivacyStore = create<PrivacyState>()(
  persist(
    (set) => ({
      consentAccepted: false,
      setConsentAccepted: (value) => set({ consentAccepted: value }),
    }),
    {
      name: 'privacy-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
