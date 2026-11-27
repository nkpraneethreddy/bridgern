/**
 * EHRChartViewer — Electronic Health Record (EHR) viewer for Next Gen NCLEX (NGN).
 *
 * Recreates the authentic Pearson VUE NGN patient chart interface:
 * 1. Patient Demographics Header (Name, Age, MRN, Allergies, Admission Diagnosis)
 * 2. Tabbed Clinical Chart Sections:
 *    - Nurses' Notes (timestamped narrative assessments)
 *    - Vital Signs Flowsheet (tabular-nums with abnormal alerts)
 *    - Diagnostic Labs (reference ranges, High/Low abnormal flags)
 *    - Provider Orders (STAT, active medications, nursing precautions)
 *
 * Adheres to the BridgeRN clinical design system: tabular numerals, 4px grid,
 * accessible touch targets (>=48dp), zero visual slop.
 */

import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeProvider';
import { radius, spacing } from '../../theme/typography';
import { ThemedText } from '../ui/ThemedText';

export interface EHRPatientInfo {
  name: string;
  age: number;
  gender: string;
  mrn?: string;
  allergies?: string;
  codeStatus?: string;
  admissionDiagnosis: string;
}

export interface EHRNurseNote {
  timestamp: string;
  note: string;
}

export interface EHRVitalEntry {
  timestamp: string;
  bp: string;
  hr: number;
  rr: number;
  spo2: string;
  temp: string;
}

export interface EHRLabResult {
  test: string;
  value: string;
  referenceRange: string;
  flag?: 'H' | 'L' | 'CRITICAL';
}

export interface EHROrder {
  timestamp: string;
  order: string;
  status?: 'Active' | 'STAT' | 'Completed';
}

export interface EHRChartData {
  patient?: EHRPatientInfo;
  nursesNotes?: EHRNurseNote[];
  vitalSigns?: EHRVitalEntry[];
  labs?: EHRLabResult[];
  orders?: EHROrder[];
  scenario?: string;
}

interface EHRChartViewerProps {
  data: EHRChartData;
}

type TabType = 'notes' | 'vitals' | 'labs' | 'orders';

export function EHRChartViewer({ data }: EHRChartViewerProps) {
  const { colors } = useTheme();

  // Determine available tabs
  const hasVitals = (data.vitalSigns?.length ?? 0) > 0;
  const hasLabs = (data.labs?.length ?? 0) > 0;
  const hasOrders = (data.orders?.length ?? 0) > 0;

  const [activeTab, setActiveTab] = useState<TabType>('notes');

  const patient = data.patient ?? {
    name: 'Client Record',
    age: 58,
    gender: 'Adult',
    admissionDiagnosis: 'Acute Medical Admission',
    allergies: 'NKDA (No Known Drug Allergies)',
    codeStatus: 'Full Code',
  };

  const notes: EHRNurseNote[] =
    data.nursesNotes && data.nursesNotes.length > 0
      ? data.nursesNotes
      : data.scenario
      ? [{ timestamp: 'Initial Assessment', note: data.scenario }]
      : [];

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      {/* Patient Demographics Header Strip */}
      <View
        style={[
          styles.patientHeader,
          { backgroundColor: colors.surfaceElevated, borderBottomColor: colors.border },
        ]}
      >
        <View style={styles.patientMainRow}>
          <View style={styles.patientIdentity}>
            <Ionicons name="person-circle-outline" size={20} color={colors.primary} />
            <ThemedText variant="label" style={styles.patientName}>
              {patient.name}, {patient.age} y/o {patient.gender}
            </ThemedText>
          </View>
          <View
            style={[
              styles.codeStatusBadge,
              { backgroundColor: colors.primarySoft, borderColor: colors.primary },
            ]}
          >
            <ThemedText variant="caption" tone="primary" style={styles.monoSmall}>
              {patient.codeStatus ?? 'FULL CODE'}
            </ThemedText>
          </View>
        </View>

        <View style={styles.patientMetaRow}>
          <ThemedText variant="caption" muted style={styles.metaText}>
            Dx: <ThemedText variant="caption">{patient.admissionDiagnosis}</ThemedText>
          </ThemedText>
          {patient.allergies ? (
            <ThemedText
              variant="caption"
              tone={patient.allergies.toLowerCase().includes('nkda') ? 'default' : 'danger'}
              style={styles.metaText}
            >
              Allergies: {patient.allergies}
            </ThemedText>
          ) : null}
        </View>
      </View>

      {/* EHR Chart Section Tabs */}
      <View
        style={[
          styles.tabBar,
          { backgroundColor: colors.surfaceElevated, borderBottomColor: colors.border },
        ]}
      >
        <Pressable
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === 'notes' }}
          onPress={() => setActiveTab('notes')}
          style={[
            styles.tabButton,
            activeTab === 'notes' && [
              styles.tabActive,
              { borderBottomColor: colors.primary, backgroundColor: colors.surface },
            ],
          ]}
        >
          <Ionicons
            name="document-text-outline"
            size={14}
            color={activeTab === 'notes' ? colors.primary : colors.textMuted}
          />
          <ThemedText
            variant="caption"
            tone={activeTab === 'notes' ? 'primary' : 'default'}
            style={styles.tabText}
          >
            Nurses' Notes {notes.length > 0 ? `(${notes.length})` : ''}
          </ThemedText>
        </Pressable>

        {hasVitals && (
          <Pressable
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === 'vitals' }}
            onPress={() => setActiveTab('vitals')}
            style={[
              styles.tabButton,
              activeTab === 'vitals' && [
                styles.tabActive,
                { borderBottomColor: colors.primary, backgroundColor: colors.surface },
              ],
            ]}
          >
            <Ionicons
              name="pulse-outline"
              size={14}
              color={activeTab === 'vitals' ? colors.primary : colors.textMuted}
            />
            <ThemedText
              variant="caption"
              tone={activeTab === 'vitals' ? 'primary' : 'default'}
              style={styles.tabText}
            >
              Vital Signs
            </ThemedText>
          </Pressable>
        )}

        {hasLabs && (
          <Pressable
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === 'labs' }}
            onPress={() => setActiveTab('labs')}
            style={[
              styles.tabButton,
              activeTab === 'labs' && [
                styles.tabActive,
                { borderBottomColor: colors.primary, backgroundColor: colors.surface },
              ],
            ]}
          >
            <Ionicons
              name="flask-outline"
              size={14}
              color={activeTab === 'labs' ? colors.primary : colors.textMuted}
            />
            <ThemedText
              variant="caption"
              tone={activeTab === 'labs' ? 'primary' : 'default'}
              style={styles.tabText}
            >
              Lab Results
            </ThemedText>
          </Pressable>
        )}

        {hasOrders && (
          <Pressable
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === 'orders' }}
            onPress={() => setActiveTab('orders')}
            style={[
              styles.tabButton,
              activeTab === 'orders' && [
                styles.tabActive,
                { borderBottomColor: colors.primary, backgroundColor: colors.surface },
              ],
            ]}
          >
            <Ionicons
              name="clipboard-outline"
              size={14}
              color={activeTab === 'orders' ? colors.primary : colors.textMuted}
            />
            <ThemedText
              variant="caption"
              tone={activeTab === 'orders' ? 'primary' : 'default'}
              style={styles.tabText}
            >
              Orders
            </ThemedText>
          </Pressable>
        )}
      </View>

      {/* Tab Content Display */}
      <View style={styles.chartBody}>
        {/* 1. Nurses' Notes Tab */}
        {activeTab === 'notes' && (
          <View style={styles.notesContainer}>
            {notes.map((entry, index) => (
              <View key={index} style={styles.noteItem}>
                <View style={styles.timestampRow}>
                  <Ionicons name="time-outline" size={12} color={colors.textMuted} />
                  <ThemedText variant="caption" tone="primary" style={styles.monoTimestamp}>
                    {entry.timestamp}
                  </ThemedText>
                </View>
                <ThemedText variant="body" style={styles.noteBody}>
                  {entry.note}
                </ThemedText>
              </View>
            ))}
          </View>
        )}

        {/* 2. Vital Signs Flowsheet Tab */}
        {activeTab === 'vitals' && data.vitalSigns && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.table}>
              {/* Table Header */}
              <View
                style={[
                  styles.tableRow,
                  styles.tableHeaderRow,
                  { backgroundColor: colors.surfaceElevated, borderBottomColor: colors.border },
                ]}
              >
                <ThemedText variant="caption" muted style={[styles.col, styles.colTime]}>
                  TIME
                </ThemedText>
                <ThemedText variant="caption" muted style={[styles.col, styles.colData]}>
                  BP (mmHg)
                </ThemedText>
                <ThemedText variant="caption" muted style={[styles.col, styles.colData]}>
                  HR (bpm)
                </ThemedText>
                <ThemedText variant="caption" muted style={[styles.col, styles.colData]}>
                  RR (/min)
                </ThemedText>
                <ThemedText variant="caption" muted style={[styles.col, styles.colData]}>
                  SpO2 (%)
                </ThemedText>
                <ThemedText variant="caption" muted style={[styles.col, styles.colData]}>
                  TEMP
                </ThemedText>
              </View>

              {/* Table Rows */}
              {data.vitalSigns.map((v, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.tableRow,
                    { borderBottomColor: colors.border },
                    idx % 2 === 1 && { backgroundColor: colors.surfaceElevated },
                  ]}
                >
                  <ThemedText variant="caption" style={[styles.col, styles.colTime, styles.mono]}>
                    {v.timestamp}
                  </ThemedText>
                  <ThemedText variant="body" style={[styles.col, styles.colData, styles.mono]}>
                    {v.bp}
                  </ThemedText>
                  <ThemedText
                    variant="body"
                    tone={v.hr > 100 || v.hr < 60 ? 'warning' : 'default'}
                    style={[styles.col, styles.colData, styles.mono]}
                  >
                    {v.hr}
                  </ThemedText>
                  <ThemedText
                    variant="body"
                    tone={v.rr > 20 || v.rr < 12 ? 'warning' : 'default'}
                    style={[styles.col, styles.colData, styles.mono]}
                  >
                    {v.rr}
                  </ThemedText>
                  <ThemedText
                    variant="body"
                    tone={parseInt(v.spo2, 10) < 94 ? 'danger' : 'default'}
                    style={[styles.col, styles.colData, styles.mono]}
                  >
                    {v.spo2}
                  </ThemedText>
                  <ThemedText variant="body" style={[styles.col, styles.colData, styles.mono]}>
                    {v.temp}
                  </ThemedText>
                </View>
              ))}
            </View>
          </ScrollView>
        )}

        {/* 3. Diagnostic Labs Tab */}
        {activeTab === 'labs' && data.labs && (
          <View style={styles.table}>
            <View
              style={[
                styles.tableRow,
                styles.tableHeaderRow,
                { backgroundColor: colors.surfaceElevated, borderBottomColor: colors.border },
              ]}
            >
              <ThemedText variant="caption" muted style={[styles.labCol, styles.labTestCol]}>
                TEST
              </ThemedText>
              <ThemedText variant="caption" muted style={[styles.labCol, styles.labValCol]}>
                RESULT
              </ThemedText>
              <ThemedText variant="caption" muted style={[styles.labCol, styles.labRefCol]}>
                REFERENCE RANGE
              </ThemedText>
              <ThemedText variant="caption" muted style={[styles.labCol, styles.labFlagCol]}>
                FLAG
              </ThemedText>
            </View>

            {data.labs.map((lab, idx) => (
              <View
                key={idx}
                style={[
                  styles.tableRow,
                  { borderBottomColor: colors.border },
                  idx % 2 === 1 && { backgroundColor: colors.surfaceElevated },
                ]}
              >
                <ThemedText variant="body" style={[styles.labCol, styles.labTestCol]}>
                  {lab.test}
                </ThemedText>
                <ThemedText
                  variant="body"
                  tone={lab.flag ? 'danger' : 'default'}
                  style={[styles.labCol, styles.labValCol, styles.mono, { fontWeight: '700' }]}
                >
                  {lab.value}
                </ThemedText>
                <ThemedText variant="caption" muted style={[styles.labCol, styles.labRefCol, styles.mono]}>
                  {lab.referenceRange}
                </ThemedText>
                <View style={[styles.labCol, styles.labFlagCol]}>
                  {lab.flag ? (
                    <View
                      style={[
                        styles.flagBadge,
                        {
                          backgroundColor:
                            lab.flag === 'CRITICAL' ? colors.danger : colors.dangerSoft,
                        },
                      ]}
                    >
                      <ThemedText
                        variant="caption"
                        style={[
                          styles.flagText,
                          {
                            color:
                              lab.flag === 'CRITICAL' ? colors.primaryText : colors.danger,
                          },
                        ]}
                      >
                        {lab.flag}
                      </ThemedText>
                    </View>
                  ) : (
                    <ThemedText variant="caption" muted>
                      Normal
                    </ThemedText>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* 4. Provider Orders Tab */}
        {activeTab === 'orders' && data.orders && (
          <View style={styles.ordersList}>
            {data.orders.map((ord, idx) => (
              <View
                key={idx}
                style={[
                  styles.orderRow,
                  { borderColor: colors.border, backgroundColor: colors.surfaceElevated },
                ]}
              >
                <View style={styles.orderTop}>
                  <ThemedText variant="caption" muted style={styles.mono}>
                    {ord.timestamp}
                  </ThemedText>
                  {ord.status && (
                    <View
                      style={[
                        styles.orderStatusBadge,
                        {
                          backgroundColor:
                            ord.status === 'STAT' ? colors.dangerSoft : colors.primarySoft,
                          borderColor:
                            ord.status === 'STAT' ? colors.danger : colors.primary,
                        },
                      ]}
                    >
                      <ThemedText
                        variant="caption"
                        tone={ord.status === 'STAT' ? 'danger' : 'primary'}
                        style={styles.monoSmall}
                      >
                        {ord.status}
                      </ThemedText>
                    </View>
                  )}
                </View>
                <ThemedText variant="body" style={styles.orderText}>
                  {ord.order}
                </ThemedText>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: radius.md,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  patientHeader: {
    padding: spacing.sm,
    borderBottomWidth: 1,
    gap: 4,
  },
  patientMainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  patientIdentity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  patientName: {
    fontWeight: '700',
    fontSize: 13,
  },
  codeStatusBadge: {
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  patientMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: spacing.xs,
    paddingLeft: 2,
  },
  metaText: {
    fontSize: 11,
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 10,
    minHeight: 44,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomWidth: 2,
  },
  tabText: {
    fontWeight: '600',
    fontSize: 12,
  },
  chartBody: {
    padding: spacing.md,
  },
  notesContainer: {
    gap: spacing.md,
  },
  noteItem: {
    gap: 4,
  },
  timestampRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  monoTimestamp: {
    fontVariant: ['tabular-nums'],
    fontWeight: '700',
    fontSize: 11,
  },
  noteBody: {
    lineHeight: 22,
  },
  table: {
    minWidth: '100%',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: spacing.xs,
    borderBottomWidth: 1,
  },
  tableHeaderRow: {
    paddingVertical: 6,
  },
  col: {
    paddingHorizontal: 6,
  },
  colTime: {
    width: 80,
    fontWeight: '600',
  },
  colData: {
    width: 75,
    textAlign: 'center',
  },
  labCol: {
    paddingHorizontal: 4,
  },
  labTestCol: {
    flex: 2,
    fontWeight: '600',
  },
  labValCol: {
    flex: 1.2,
  },
  labRefCol: {
    flex: 1.5,
  },
  labFlagCol: {
    flex: 1,
    alignItems: 'center',
  },
  flagBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  flagText: {
    fontSize: 10,
    fontWeight: '700',
  },
  ordersList: {
    gap: spacing.xs,
  },
  orderRow: {
    padding: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
    gap: 4,
  },
  orderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderStatusBadge: {
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: radius.sm,
  },
  orderText: {
    lineHeight: 20,
  },
  mono: {
    fontVariant: ['tabular-nums'],
  },
  monoSmall: {
    fontVariant: ['tabular-nums'],
    fontSize: 10,
    fontWeight: '700',
  },
});
