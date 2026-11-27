/**
 * Zustand store for candidate subscription state and entitlement gates.
 */

import { create } from 'zustand';
import { subscriptionService, SubscriptionStatus, SubscriptionTier } from '../services/subscription';

interface SubscriptionState {
  status: SubscriptionStatus;
  isLoading: boolean;
  isPaywallOpen: boolean;

  // Actions
  initialize: (userId?: string) => Promise<void>;
  openPaywall: () => void;
  closePaywall: () => void;
  upgradeMockTier: (tier: SubscriptionTier) => void;
  restore: () => Promise<void>;
  isEntitledToLength: (questionCount: number) => boolean;
  isEntitledToRetakeMode: () => boolean;
}

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  status: {
    tier: 'free',
    isActive: false,
    willRenew: false,
    expirationDate: null,
    entitlementId: null,
  },
  isLoading: false,
  isPaywallOpen: false,

  initialize: async (userId) => {
    set({ isLoading: true });
    try {
      await subscriptionService.initialize(userId);
      const status = await subscriptionService.getStatus();
      set({ status });
    } finally {
      set({ isLoading: false });
    }
  },

  openPaywall: () => set({ isPaywallOpen: true }),
  closePaywall: () => set({ isPaywallOpen: false }),

  upgradeMockTier: (tier: SubscriptionTier) => {
    const isActive = tier !== 'free';
    set({
      status: {
        tier,
        isActive,
        willRenew: isActive,
        expirationDate: isActive ? new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString() : null,
        entitlementId: isActive ? 'bridgern_pro' : null,
      },
      isPaywallOpen: false,
    });
  },

  restore: async () => {
    set({ isLoading: true });
    try {
      const status = await subscriptionService.restorePurchases();
      set({ status });
    } finally {
      set({ isLoading: false });
    }
  },

  isEntitledToLength: (questionCount: number) => {
    const { status } = get();
    if (status.isActive) return true;
    // Free tier can do 10-item and 25-item sessions
    return questionCount <= 25;
  },

  isEntitledToRetakeMode: () => {
    const { status } = get();
    return status.tier === 'plus';
  },
}));
