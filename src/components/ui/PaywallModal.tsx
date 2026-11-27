import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Card } from './Card';
import { ThemedText } from './ThemedText';
import { useSubscriptionStore } from '../../stores/subscriptionStore';
import { useTheme } from '../../theme/ThemeProvider';
import { radius, spacing } from '../../theme/typography';

const TIERS = [
  {
    id: 'core',
    title: 'BridgeRN Core',
    price: '$29 / month',
    description: 'Complete NCLEX-RN test bank and clinical rationales.',
    features: [
      'Full 2,000+ item question bank',
      'All 7 Next Gen NCLEX (NGN) item types',
      'Unlimited 75-item & 145-item CAT blocks',
      'Offline shift practice mode',
    ],
  },
  {
    id: 'plus',
    title: 'BridgeRN Plus',
    price: '$49 / month',
    badge: 'RECOMMENDED FOR IENS',
    description: 'Full licensure runway pacing and Retake Mode support.',
    features: [
      'Everything in Core',
      'Retake Mode: Diagnostic intake of past Pearson CPRs',
      'Personalized IEN runway trajectory calculator',
      'Priority nurse educator review',
    ],
  },
];

export function PaywallModal() {
  const { colors } = useTheme();
  const router = useRouter();
  const { isPaywallOpen, closePaywall, upgradeMockTier, restore } = useSubscriptionStore();

  if (!isPaywallOpen) return null;

  return (
    <Modal visible={isPaywallOpen} animationType="slide" presentationStyle="pageSheet">
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Top Dismiss Button */}
        <View style={styles.topBar}>
          <ThemedText variant="caption" muted style={styles.monoHeading}>
            LICENSURE ACCESS PASS
          </ThemedText>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close paywall modal"
            onPress={closePaywall}
            style={styles.closeTouch}
          >
            <Ionicons name="close" size={24} color={colors.text} />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <ThemedText variant="h1">Pass NCLEX-RN on Your Next Attempt</ThemedText>
            <ThemedText variant="body" muted>
              Unlock the full computerized adaptive testing engine, complete 2,000+ question
              bank, and targeted weakness analytics.
            </ThemedText>
          </View>

          {/* Subscription Tier Cards */}
          <View style={styles.tierList}>
            {TIERS.map((tier) => (
              <Card key={tier.id} style={styles.tierCard}>
                {tier.badge && (
                  <View style={[styles.badge, { backgroundColor: colors.primarySoft }]}>
                    <ThemedText variant="caption" tone="primary" style={styles.miniMono}>
                      {tier.badge}
                    </ThemedText>
                  </View>
                )}
                <View style={styles.tierHeader}>
                  <ThemedText variant="h3">{tier.title}</ThemedText>
                  <ThemedText variant="h2" style={styles.monoPrice}>
                    {tier.price}
                  </ThemedText>
                </View>
                <ThemedText variant="caption" muted>
                  {tier.description}
                </ThemedText>

                <View style={styles.features}>
                  {tier.features.map((feat) => (
                    <View key={feat} style={styles.featureRow}>
                      <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                      <ThemedText variant="body" style={styles.featText}>
                        {feat}
                      </ThemedText>
                    </View>
                  ))}
                </View>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Subscribe to ${tier.title}`}
                  onPress={() => upgradeMockTier(tier.id as any)}
                  style={[styles.subscribeBtn, { backgroundColor: colors.primary }]}
                >
                  <ThemedText variant="label" style={{ color: colors.primaryText }}>
                    Start {tier.title} →
                  </ThemedText>
                </Pressable>
              </Card>
            ))}
          </View>

          {/* Restore Purchases & Legal Links */}
          <View style={styles.footer}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Restore purchases"
              onPress={restore}
              style={styles.restoreBtn}
            >
              <ThemedText variant="caption" tone="primary">
                Restore Purchases
              </ThemedText>
            </Pressable>

            <View style={styles.legalRow}>
              <Pressable
                accessibilityRole="link"
                accessibilityLabel="Open Terms"
                onPress={() => {
                  closePaywall();
                  router.push('/(legal)/terms');
                }}
              >
                <ThemedText variant="caption" muted>
                  Terms of Service
                </ThemedText>
              </Pressable>
              <ThemedText variant="caption" muted>
                {' · '}
              </ThemedText>
              <Pressable
                accessibilityRole="link"
                accessibilityLabel="Open Privacy Policy"
                onPress={() => {
                  closePaywall();
                  router.push('/(legal)/privacy');
                }}
              >
                <ThemedText variant="caption" muted>
                  Privacy Policy
                </ThemedText>
              </Pressable>
            </View>

            <ThemedText variant="caption" muted style={styles.footnote}>
              Subscription auto-renews monthly until cancelled in device settings.
            </ThemedText>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  monoHeading: {
    fontVariant: ['tabular-nums'],
    letterSpacing: 0.5,
  },
  closeTouch: {
    padding: spacing.xs,
  },
  content: {
    padding: spacing.md,
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  header: {
    gap: spacing.xs,
  },
  tierList: {
    gap: spacing.md,
  },
  tierCard: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: 4,
  },
  miniMono: {
    fontVariant: ['tabular-nums'],
    fontSize: 10,
    fontWeight: '700',
  },
  tierHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  monoPrice: {
    fontVariant: ['tabular-nums'],
    fontWeight: '700',
  },
  features: {
    gap: spacing.xs,
    paddingVertical: spacing.xs,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  featText: {
    fontSize: 13,
    flex: 1,
  },
  subscribeBtn: {
    height: 48,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xs,
  },
  footer: {
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
  },
  restoreBtn: {
    minHeight: 40,
    justifyContent: 'center',
  },
  legalRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footnote: {
    textAlign: 'center',
    fontSize: 11,
    marginTop: 4,
  },
});
