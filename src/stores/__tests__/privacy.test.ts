import { usePrivacyStore } from '@/src/stores/privacy';

beforeEach(() => {
  usePrivacyStore.setState({
    consentAccepted: false,
    termsAccepted: false,
    policyVersion: null,
    acceptedAt: null,
    newsletterOptIn: false,
    analyticsOptIn: false,
    aiOptIn: false,
  });
});

describe('privacy store', () => {
  it('defaults every optional choice to off', () => {
    const state = usePrivacyStore.getState();
    expect(state.newsletterOptIn).toBe(false);
    expect(state.analyticsOptIn).toBe(false);
    expect(state.aiOptIn).toBe(false);
  });

  it('recordConsent accepts terms without opting into anything optional', () => {
    usePrivacyStore.getState().recordConsent({
      termsAccepted: true,
      newsletterOptIn: false,
      analyticsOptIn: false,
      aiOptIn: false,
    });
    const state = usePrivacyStore.getState();
    expect(state.consentAccepted).toBe(true);
    expect(state.termsAccepted).toBe(true);
    expect(state.newsletterOptIn).toBe(false);
    expect(state.analyticsOptIn).toBe(false);
    expect(state.aiOptIn).toBe(false);
    expect(state.acceptedAt).not.toBeNull();
  });

  it('setOptIn lets a single optional choice be changed later, independent of the others', () => {
    usePrivacyStore.getState().recordConsent({
      termsAccepted: true,
      newsletterOptIn: false,
      analyticsOptIn: false,
      aiOptIn: false,
    });

    usePrivacyStore.getState().setOptIn('analyticsOptIn', true);

    const state = usePrivacyStore.getState();
    expect(state.analyticsOptIn).toBe(true);
    expect(state.newsletterOptIn).toBe(false);
    expect(state.aiOptIn).toBe(false);
    // Changing an optional preference must not touch required consent state.
    expect(state.termsAccepted).toBe(true);
    expect(state.consentAccepted).toBe(true);
  });

  it('setOptIn can turn a preference back off', () => {
    usePrivacyStore.getState().setOptIn('newsletterOptIn', true);
    expect(usePrivacyStore.getState().newsletterOptIn).toBe(true);
    usePrivacyStore.getState().setOptIn('newsletterOptIn', false);
    expect(usePrivacyStore.getState().newsletterOptIn).toBe(false);
  });
});
