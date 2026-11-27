/**
 * Subscription & Entitlement Service wrapping RevenueCat / react-native-purchases.
 *
 * Provides safe wrapper that gracefully operates in development or test
 * environments when native keys are not configured.
 */

import { Platform } from 'react-native';
import Purchases, { PurchasesPackage } from 'react-native-purchases';
import { supabase, supabaseConfigured } from '../lib/supabase';

// Entitlement identifier in RevenueCat dashboard
export const ENTITLEMENT_ID = 'bridgern_pro';

export type SubscriptionTier = 'free' | 'core' | 'plus';

export interface SubscriptionStatus {
  tier: SubscriptionTier;
  isActive: boolean;
  willRenew: boolean;
  expirationDate: string | null;
  entitlementId: string | null;
}

class SubscriptionService {
  private isConfigured = false;

  /**
   * Initialize RevenueCat SDK with API keys
   */
  async initialize(userId?: string): Promise<void> {
    if (this.isConfigured) return;

    const apiKey =
      Platform.OS === 'ios'
        ? process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY
        : process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY;

    if (!apiKey) {
      if (__DEV__) {
        console.log('[SubscriptionService] RevenueCat key not set; operating in mock mode');
      }
      return;
    }

    try {
      Purchases.configure({ apiKey, appUserID: userId });
      this.isConfigured = true;
    } catch (e) {
      if (__DEV__) console.warn('[SubscriptionService] Init failed', e);
    }
  }

  /**
   * Get available in-app subscription packages
   */
  async getPackages(): Promise<PurchasesPackage[]> {
    if (!this.isConfigured) return [];
    try {
      const offerings = await Purchases.getOfferings();
      return offerings.current?.availablePackages ?? [];
    } catch {
      return [];
    }
  }

  /**
   * Purchase a specific subscription package
   */
  async purchase(pkg: PurchasesPackage): Promise<SubscriptionStatus> {
    if (!this.isConfigured) {
      // Mock successful purchase in development
      return {
        tier: 'core',
        isActive: true,
        willRenew: true,
        expirationDate: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
        entitlementId: ENTITLEMENT_ID,
      };
    }

    const { customerInfo } = await Purchases.purchasePackage(pkg);
    return this.parseCustomerInfo(customerInfo);
  }

  /**
   * Restore previous purchases
   */
  async restorePurchases(): Promise<SubscriptionStatus> {
    if (!this.isConfigured) {
      return {
        tier: 'free',
        isActive: false,
        willRenew: false,
        expirationDate: null,
        entitlementId: null,
      };
    }

    const customerInfo = await Purchases.restorePurchases();
    return this.parseCustomerInfo(customerInfo);
  }

  /**
   * Check current entitlement status
   */
  async getStatus(): Promise<SubscriptionStatus> {
    if (!this.isConfigured) {
      return {
        tier: 'free',
        isActive: false,
        willRenew: false,
        expirationDate: null,
        entitlementId: null,
      };
    }

    try {
      const customerInfo = await Purchases.getCustomerInfo();
      return this.parseCustomerInfo(customerInfo);
    } catch {
      return {
        tier: 'free',
        isActive: false,
        willRenew: false,
        expirationDate: null,
        entitlementId: null,
      };
    }
  }

  /**
   * Sync active subscription state to Supabase subscriptions table
   */
  async syncToSupabase(userId: string, status: SubscriptionStatus): Promise<void> {
    if (!supabaseConfigured) return;
    try {
      await supabase.from('subscriptions').upsert({
        user_id: userId,
        tier: status.tier,
        status: status.isActive ? 'active' : 'expired',
        provider: 'revenuecat',
        rc_entitlement_id: status.entitlementId,
        current_period_end: status.expirationDate,
        updated_at: new Date().toISOString(),
      });
    } catch (e) {
      if (__DEV__) console.warn('Supabase subscription sync failed', e);
    }
  }

  private parseCustomerInfo(info: any): SubscriptionStatus {
    const entitlement = info.entitlements.active[ENTITLEMENT_ID];
    const isActive = !!entitlement;
    const tier: SubscriptionTier = isActive ? 'core' : 'free';

    return {
      tier,
      isActive,
      willRenew: entitlement?.willRenew ?? false,
      expirationDate: entitlement?.expirationDate ?? null,
      entitlementId: isActive ? ENTITLEMENT_ID : null,
    };
  }
}

export const subscriptionService = new SubscriptionService();
