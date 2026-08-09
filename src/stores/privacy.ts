import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface PrivacyState {
  consentAccepted: boolean;
  termsAccepted: boolean;
  policyVersion: string | null;
  acceptedAt: string | null;
  newsletterOptIn: boolean;
  analyticsOptIn: boolean;
  aiOptIn: boolean;
  setConsentAccepted: (value: boolean) => void;
  recordConsent: (consent: { termsAccepted: boolean; newsletterOptIn: boolean; analyticsOptIn: boolean; aiOptIn: boolean }) => void;
}

export const usePrivacyStore = create<PrivacyState>()(
  persist(
    (set) => ({
      consentAccepted: false,
      termsAccepted: false,
      policyVersion: null,
      acceptedAt: null,
      newsletterOptIn: false,
      analyticsOptIn: false,
      aiOptIn: false,
      setConsentAccepted: (value) => set({ consentAccepted: value }),
      recordConsent: (consent) => set({
        ...consent,
        consentAccepted: true,
        policyVersion: '2026-08-09',
        acceptedAt: new Date().toISOString(),
      }),
    }),
    {
      name: 'privacy-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
