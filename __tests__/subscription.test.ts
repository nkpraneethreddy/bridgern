import { useSubscriptionStore } from '../src/stores/subscriptionStore';

describe('subscriptionStore', () => {
  beforeEach(() => {
    useSubscriptionStore.setState({
      status: {
        tier: 'free',
        isActive: false,
        willRenew: false,
        expirationDate: null,
        entitlementId: null,
      },
      isLoading: false,
      isPaywallOpen: false,
    });
  });

  it('restricts session lengths > 25 items on the free tier', () => {
    const store = useSubscriptionStore.getState();

    expect(store.isEntitledToLength(10)).toBe(true);
    expect(store.isEntitledToLength(25)).toBe(true);
    expect(store.isEntitledToLength(75)).toBe(false);
    expect(store.isEntitledToLength(145)).toBe(false);
  });

  it('allows all session lengths when upgraded to core tier', () => {
    useSubscriptionStore.getState().upgradeMockTier('core');
    const store = useSubscriptionStore.getState();

    expect(store.status.tier).toBe('core');
    expect(store.status.isActive).toBe(true);
    expect(store.isEntitledToLength(75)).toBe(true);
    expect(store.isEntitledToLength(145)).toBe(true);
    expect(store.isEntitledToRetakeMode()).toBe(false);
  });

  it('unlocks retake mode when upgraded to plus tier', () => {
    useSubscriptionStore.getState().upgradeMockTier('plus');
    const store = useSubscriptionStore.getState();

    expect(store.status.tier).toBe('plus');
    expect(store.isEntitledToRetakeMode()).toBe(true);
  });

  it('opens and closes paywall modal state', () => {
    expect(useSubscriptionStore.getState().isPaywallOpen).toBe(false);
    useSubscriptionStore.getState().openPaywall();
    expect(useSubscriptionStore.getState().isPaywallOpen).toBe(true);
    useSubscriptionStore.getState().closePaywall();
    expect(useSubscriptionStore.getState().isPaywallOpen).toBe(false);
  });
});
