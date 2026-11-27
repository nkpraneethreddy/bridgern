import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../../src/components/ui/Card';
import { ThemedText } from '../../src/components/ui/ThemedText';
import { useTheme } from '../../src/theme/ThemeProvider';
import { spacing } from '../../src/theme/typography';

export default function PrivacyPolicyScreen() {
  const { colors } = useTheme();

  return (
    <SafeAreaView
      edges={['bottom']}
      style={[styles.safe, { backgroundColor: colors.background }]}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <ThemedText variant="caption" muted style={styles.monoHeading}>
            LEGAL NOTICE & COMPLIANCE
          </ThemedText>
          <ThemedText variant="h1">Privacy Policy</ThemedText>
          <ThemedText variant="caption" muted>
            Effective Date: November 27, 2026 | Version 1.0
          </ThemedText>
        </View>

        <Card style={styles.section}>
          <ThemedText variant="h3">1. Overview</ThemedText>
          <ThemedText variant="body" muted>
            BridgeRN ("we", "our", or "us") provides an adaptive NCLEX-RN exam preparation
            application designed for internationally educated nurses (IENs). This Privacy
            Policy explains what data we collect, why we collect it, how it is secured, and
            your absolute rights over your personal information under applicable privacy laws,
            including the EU/UK General Data Protection Regulation (GDPR) and the California
            Consumer Privacy Act (CCPA / CPRA).
          </ThemedText>
        </Card>

        <Card style={styles.section}>
          <ThemedText variant="h3">2. Information We Collect</ThemedText>
          <ThemedText variant="body" muted>
            We collect only the minimum data strictly necessary to deliver personalized,
            adaptive clinical exam preparation:
          </ThemedText>
          <View style={styles.bulletList}>
            <ThemedText variant="body">
              • <ThemedText variant="label">Account Credentials:</ThemedText> Email address and
              full name provided at registration or received through Google OAuth.
            </ThemedText>
            <ThemedText variant="body">
              • <ThemedText variant="label">IEN Profile Context:</ThemedText> Country of initial
              nursing education, current country of residence, target US State Board of Nursing,
              anticipated exam date, and weekly study hour goals.
            </ThemedText>
            <ThemedText variant="body">
              • <ThemedText variant="label">Exam & Telemetry Data:</ThemedText> Question answer
              records, timestamps, item response selections, latency per question, and computed
              ability estimates (theta values) used solely for the Computerized Adaptive Testing
              (CAT) engine.
            </ThemedText>
          </View>
          <ThemedText variant="body" muted>
            We do NOT collect protected health information (PHI), clinical patient data, or
            financial payment credentials (payment processing is handled directly by App Store /
            Google Play).
          </ThemedText>
        </Card>

        <Card style={styles.section}>
          <ThemedText variant="h3">3. How Your Data Is Used</ThemedText>
          <View style={styles.bulletList}>
            <ThemedText variant="body">
              • Generating adaptive question sessions tailored to your individual clinical knowledge level.
            </ThemedText>
            <ThemedText variant="body">
              • Calculating clinical readiness trajectories and candidate performance reports (CPR).
            </ThemedText>
            <ThemedText variant="body">
              • Synchronizing study progress across your authenticated devices.
            </ThemedText>
            <ThemedText variant="body">
              • Service communication, security verification, and account recovery.
            </ThemedText>
          </View>
          <ThemedText variant="body" muted>
            We do NOT sell, lease, or monetize personal data to third parties, data brokers,
            or advertisers.
          </ThemedText>
        </Card>

        <Card style={styles.section}>
          <ThemedText variant="h3">4. Security & Data Storage</ThemedText>
          <ThemedText variant="body" muted>
            All network communication uses TLS 1.3 encryption in transit. User profile records
            and test performance data are stored in a dedicated Supabase PostgreSQL infrastructure
            governed by Row Level Security (RLS) policies. Each user can only query and mutate
            their own authenticated records.
          </ThemedText>
        </Card>

        <Card style={styles.section}>
          <ThemedText variant="h3">5. Third-Party Service Providers</ThemedText>
          <ThemedText variant="body" muted>
            We partner with trusted infrastructure sub-processors under strict data protection
            terms:
          </ThemedText>
          <View style={styles.bulletList}>
            <ThemedText variant="body">
              • <ThemedText variant="label">Supabase Inc.:</ThemedText> Cloud database, user
              authentication, and row-level access control.
            </ThemedText>
            <ThemedText variant="body">
              • <ThemedText variant="label">Google Identity Services:</ThemedText> Single sign-on
              authentication (optional).
            </ThemedText>
          </View>
        </Card>

        <Card style={styles.section}>
          <ThemedText variant="h3">6. User Rights & Data Deletion (GDPR / CCPA)</ThemedText>
          <ThemedText variant="body" muted>
            You hold complete control over your data:
          </ThemedText>
          <View style={styles.bulletList}>
            <ThemedText variant="body">
              • <ThemedText variant="label">Right to Access & Rectify:</ThemedText> You may review
              and update your profile details at any time in the Profile tab.
            </ThemedText>
            <ThemedText variant="body">
              • <ThemedText variant="label">Right to Erasure (Delete Account):</ThemedText> We provide
              a self-service "Delete Account & Data" action in the Profile screen. Activating this
              permanently purges your authentication record, user profile, and test history from
              our database via cascade deletion.
            </ThemedText>
            <ThemedText variant="body">
              • <ThemedText variant="label">Non-Discrimination:</ThemedText> We will never deny services
              or charge different rates for exercising privacy rights.
            </ThemedText>
          </View>
        </Card>

        <Card style={styles.section}>
          <ThemedText variant="h3">7. Age Requirements & Children's Privacy (COPPA)</ThemedText>
          <ThemedText variant="body" muted>
            BridgeRN is designed exclusively for graduate nurses and healthcare professionals
            preparing for professional licensure. We do not knowingly market to or collect
            personal information from individuals under the age of 18 (and under no circumstance
            under 13). Accounts registered by underage individuals will be terminated immediately.
          </ThemedText>
        </Card>

        <Card style={styles.section}>
          <ThemedText variant="h3">8. Changes & Contact</ThemedText>
          <ThemedText variant="body" muted>
            We may update this Privacy Policy periodically. Continued use after changes
            constitutes acceptance. For questions, data requests, or privacy concerns, please
            contact us at:
          </ThemedText>
          <ThemedText variant="label" tone="primary">
            privacy@bridgern.app
          </ThemedText>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: {
    padding: spacing.md,
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  header: {
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  monoHeading: {
    fontVariant: ['tabular-nums'],
    letterSpacing: 0.5,
  },
  section: {
    gap: spacing.sm,
  },
  bulletList: {
    gap: spacing.xs,
    paddingLeft: spacing.xs,
  },
});
