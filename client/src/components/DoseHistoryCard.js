import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { getDoseHistorySummary } from '../services/vaccinationFlow';

const StatusDot = ({ color }) => (
  <View style={[styles.statusDot, { backgroundColor: color }]} />
);

const doseMeta = {
  completed: { label: 'Completed', color: '#10B981', backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' },
  missing: { label: 'Missing', color: '#EF4444', backgroundColor: '#FEF2F2', borderColor: '#FECACA' },
  locked: { label: 'Locked', color: '#6B7280', backgroundColor: '#F3F4F6', borderColor: '#D1D5DB' },
};

const DoseRow = ({ label, value, tone }) => {
  const meta = doseMeta[tone];

  return (
    <View style={[styles.doseRow, { backgroundColor: meta.backgroundColor, borderColor: meta.borderColor }]}>
      <View style={styles.doseRowHeader}>
        <StatusDot color={meta.color} />
        <Text style={styles.doseRowLabel}>{label}</Text>
        <View style={[styles.badge, { backgroundColor: meta.color }]}>
          <Text style={styles.badgeText}>{meta.label}</Text>
        </View>
      </View>
      <Text style={styles.doseRowValue}>{value}</Text>
    </View>
  );
};

export default function DoseHistoryCard({ history, currentDose = 2, title }) {
  const summary = getDoseHistorySummary(history);
  const dose1Tone = summary.dose1Date === 'Not Taken' ? 'missing' : 'completed';
  const dose2Tone = summary.dose2Date === 'Not Taken' ? (currentDose > 2 ? 'missing' : 'locked') : 'completed';
  const dose3Tone = summary.dose3Date === 'Not Taken' ? (currentDose > 3 ? 'missing' : 'locked') : 'completed';

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{title || 'Dose History'}</Text>
          <Text style={styles.subtitle}>Previous dose details for this patient</Text>
        </View>
        <View style={styles.iconWrap}>
          <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
            <Circle cx="12" cy="12" r="10" fill="#EFF6FF" />
            <Path d="M8 12h8M8 8h8M8 16h5" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" />
          </Svg>
        </View>
      </View>

      <View style={styles.identityBlock}>
        <View style={styles.identityRow}>
          <Text style={styles.identityLabel}>Name</Text>
          <Text style={styles.identityValue}>{summary.name}</Text>
        </View>
        <View style={styles.identityRow}>
          <Text style={styles.identityLabel}>ID / Roll No</Text>
          <Text style={styles.identityValue}>{summary.rollNo}</Text>
        </View>
      </View>

      <DoseRow label="Dose 1 Date" value={summary.dose1Date} tone={dose1Tone} />
      <DoseRow label="Dose 2 Date" value={summary.dose2Date} tone={dose2Tone} />
      <DoseRow label="Dose 3 Date" value={summary.dose3Date} tone={dose3Tone} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  subtitle: {
    marginTop: 2,
    fontSize: 12,
    color: '#64748B',
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  identityBlock: {
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  identityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  identityLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  identityValue: {
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '700',
    flexShrink: 1,
    textAlign: 'right',
  },
  doseRow: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    marginTop: 10,
  },
  doseRowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  doseRowLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
  },
  doseRowValue: {
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '600',
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
});