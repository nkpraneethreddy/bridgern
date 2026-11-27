import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../../src/components/ui/Card';
import { ThemedText } from '../../src/components/ui/ThemedText';
import { useTheme } from '../../src/theme/ThemeProvider';
import { spacing } from '../../src/theme/typography';

export default function TermsOfServiceScreen() {
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
          <ThemedText variant="h1">Terms of Service</ThemedText>
          <ThemedText variant="caption" muted>
            Effective Date: November 27, 2026 | Version 1.0
          </ThemedText>
        </View>

        <Card style={styles.section}>
          <ThemedText variant="h3">1. Acceptance of Terms</ThemedText>
          <ThemedText variant="body" muted>
            By creating a BridgeRN account or accessing the application, you ("Candidate") agree
            to be bound by these Terms of Service and our Privacy Policy. If you do not agree,
            do not use the application. BridgeRN is operated by BridgeRN LLC ("Company", "we",
            "us", "our"). These Terms are governed by the laws of the State of Delaware, USA.
          </ThemedText>
        </Card>

        <Card style={styles.section}>
          <ThemedText variant="h3">2. Medical-Education Disclaimer</ThemedText>
          <ThemedText
            variant="body"
            muted
            style={[styles.disclaimer, { borderLeftColor: colors.warning }]}
          >
            BridgeRN content — including all clinical scenarios, pharmacology items, care
            priority questions, and explanatory rationales — is designed solely for NCLEX-RN
            exam preparation and continuing licensure education purposes.
          </ThemedText>
          <View style={styles.bulletList}>
            <ThemedText variant="body">
              • This application does NOT provide clinical advice, medical diagnosis, nursing
              assessment, or any form of patient care recommendation.
            </ThemedText>
            <ThemedText variant="body">
              • Readiness estimates, Wilson-interval confidence bands, and adaptive theta scores
              are statistical predictors with inherent uncertainty and DO NOT GUARANTEE exam
              passage, licensure, or employment outcomes.
            </ThemedText>
            <ThemedText variant="body">
              • Never use BridgeRN content to make real-world clinical decisions. Always
              defer to your supervising clinician, hospital policy, and applicable law.
            </ThemedText>
          </View>
        </Card>

        <Card style={styles.section}>
          <ThemedText variant="h3">3. NCLEX & NCSBN Compliance</ThemedText>
          <ThemedText variant="body" muted>
            BridgeRN is an independent test preparation company. We are NOT affiliated with,
            endorsed by, or sponsored by the National Council of State Boards of Nursing (NCSBN).
            "NCLEX-RN®" is a registered trademark of NCSBN. All practice questions in this
            application are original content authored by licensed nursing educators and are NOT
            reproductions or paraphrases of actual past or current NCLEX exam items. We comply
            fully with NCSBN's candidate testing policies.
          </ThemedText>
        </Card>

        <Card style={styles.section}>
          <ThemedText variant="h3">4. License & Acceptable Use</ThemedText>
          <ThemedText variant="body" muted>
            Subject to these Terms, we grant you a limited, non-exclusive, non-transferable,
            revocable license to access BridgeRN on your personal devices for personal exam
            preparation purposes only.
          </ThemedText>
          <ThemedText variant="body" muted>
            You may NOT:
          </ThemedText>
          <View style={styles.bulletList}>
            <ThemedText variant="body">
              • Copy, reproduce, distribute, publish, or sell any question content, rationale,
              adaptive algorithm output, or score report from this application.
            </ThemedText>
            <ThemedText variant="body">
              • Use automated tools, bots, scrapers, or scripts to harvest question content.
            </ThemedText>
            <ThemedText variant="body">
              • Share your account credentials or allow another person to use your account.
            </ThemedText>
            <ThemedText variant="body">
              • Attempt to reverse-engineer, decompile, or extract the adaptive CAT algorithm
              or question database.
            </ThemedText>
            <ThemedText variant="body">
              • Use BridgeRN to assist another candidate during an active NCLEX examination
              (a violation of NCSBN testing rules).
            </ThemedText>
          </View>
        </Card>

        <Card style={styles.section}>
          <ThemedText variant="h3">5. Subscriptions & Refund Policy</ThemedText>
          <ThemedText variant="body" muted>
            BridgeRN is offered on a subscription basis. Pricing, billing intervals, and
            features are displayed in the app at the time of purchase. Subscriptions
            automatically renew unless cancelled at least 24 hours before the renewal date.
          </ThemedText>
          <ThemedText variant="body" muted>
            Refunds are subject to the platform's refund policy (Apple App Store / Google Play).
            For billing disputes or refund requests outside the platform window, contact us
            at billing@bridgern.app within 14 days of the charge. Accounts found to have
            violated these Terms are not eligible for refunds.
          </ThemedText>
        </Card>

        <Card style={styles.section}>
          <ThemedText variant="h3">6. Intellectual Property</ThemedText>
          <ThemedText variant="body" muted>
            All question content, scoring logic, adaptive algorithms, clinical rationales, UI
            designs, branding, and audiovisual elements of BridgeRN are owned exclusively by
            BridgeRN LLC and protected under US and international copyright law. Any
            unauthorized reproduction may result in civil and criminal liability.
          </ThemedText>
        </Card>

        <Card style={styles.section}>
          <ThemedText variant="h3">7. Limitation of Liability</ThemedText>
          <ThemedText variant="body" muted>
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, BRIDGERN LLC AND ITS OFFICERS,
            DIRECTORS, EMPLOYEES, AND LICENSORS SHALL NOT BE LIABLE FOR ANY INDIRECT,
            INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF EXAM
            FEES, LOST INCOME, OR PROFESSIONAL OPPORTUNITY, ARISING FROM YOUR USE OF OR
            INABILITY TO USE THIS APPLICATION, EVEN IF BRIDGERN HAS BEEN ADVISED OF THE
            POSSIBILITY OF SUCH DAMAGES.
          </ThemedText>
          <ThemedText variant="body" muted>
            In no event will our aggregate liability exceed the amount you paid to us in the
            six months preceding the claim.
          </ThemedText>
        </Card>

        <Card style={styles.section}>
          <ThemedText variant="h3">8. Eligibility & Account Security</ThemedText>
          <ThemedText variant="body" muted>
            You must be at least 18 years of age to create a BridgeRN account. You are
            responsible for maintaining the confidentiality of your credentials and for all
            activity under your account. Notify us immediately at support@bridgern.app if you
            suspect unauthorized access.
          </ThemedText>
        </Card>

        <Card style={styles.section}>
          <ThemedText variant="h3">9. Modifications to Terms</ThemedText>
          <ThemedText variant="body" muted>
            We reserve the right to update these Terms at any time. We will provide in-app
            notice for material changes at least 7 days before they take effect. Continued
            use after the effective date constitutes acceptance of the revised Terms.
          </ThemedText>
        </Card>

        <Card style={styles.section}>
          <ThemedText variant="h3">10. Contact & Governing Law</ThemedText>
          <ThemedText variant="body" muted>
            These Terms are governed by the laws of the State of Delaware, USA, without
            regard to conflict of law principles. For any legal notices or disputes, contact:
          </ThemedText>
          <ThemedText variant="label" tone="primary">
            legal@bridgern.app
          </ThemedText>
          <ThemedText variant="caption" muted>
            Note: This document does not constitute legal advice. BridgeRN recommends that
            you consult a qualified attorney before relying on these terms for legal purposes.
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
  disclaimer: {
    borderLeftWidth: 3,
    paddingLeft: spacing.sm,
    marginVertical: spacing.xs,
  },
  bulletList: {
    gap: spacing.xs,
    paddingLeft: spacing.xs,
  },
});
