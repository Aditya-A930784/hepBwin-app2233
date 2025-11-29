import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Svg, { Path, Circle } from 'react-native-svg';

// Dashboard Icon Components
const VaccineIcon = () => (
  <Svg width={40} height={40} viewBox="0 0 24 24" fill="none">
    <Path
      d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"
      fill="#005A9C"
    />
  </Svg>
);

const CalendarIcon = () => (
  <Svg width={40} height={40} viewBox="0 0 24 24" fill="none">
    <Path
      d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10z"
      fill="#4CAF50"
    />
  </Svg>
);

const CertificateIcon = () => (
  <Svg width={40} height={40} viewBox="0 0 24 24" fill="none">
    <Path
      d="M14 9V5h-4v4H7l5 6 5-6h-3zm-9 7h14v-2H5v2z"
      fill="#FFA000"
    />
  </Svg>
);

const RecordsIcon = () => (
  <Svg width={40} height={40} viewBox="0 0 24 24" fill="none">
    <Path
      d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm4 12H8v-1c0-1.33 2.67-2 4-2s4 .67 4 2v1z"
      fill="#00BCD4"
    />
  </Svg>
);

export default function HomeScreen({ navigation, route }) {
  const profileData = route?.params || {};

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome Back!</Text>
            <Text style={styles.userName}>
              {profileData.step1Data?.fullName || 'User'}
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={() => navigation.navigate('ProfileManagement1', profileData)}
          >
            <Text style={styles.profileInitial}>
              {(profileData.step1Data?.fullName || 'U')[0].toUpperCase()}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Vaccination Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Text style={styles.statusTitle}>Vaccination Status</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusBadgeText}>
                {profileData.step4Data?.vaccinationStatus || 'Not Set'}
              </Text>
            </View>
          </View>
          <Text style={styles.statusDescription}>
            Keep track of your Hepatitis B vaccination journey
          </Text>
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionGrid}>
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => navigation.navigate('FirstDoseEntry')}
          >
            <VaccineIcon />
            <Text style={styles.actionTitle}>Record Dose</Text>
            <Text style={styles.actionSubtitle}>Log new vaccine dose</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => navigation.navigate('ReminderSettings')}
          >
            <CalendarIcon />
            <Text style={styles.actionTitle}>Reminders</Text>
            <Text style={styles.actionSubtitle}>Set up alerts</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => navigation.navigate('ViewCertificates', profileData)}
          >
            <CertificateIcon />
            <Text style={styles.actionTitle}>Certificates</Text>
            <Text style={styles.actionSubtitle}>View & download</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => navigation.navigate('MyRecords', profileData)}
          >
            <RecordsIcon />
            <Text style={styles.actionTitle}>My Records</Text>
            <Text style={styles.actionSubtitle}>View dose info</Text>
          </TouchableOpacity>
        </View>

        {/* Upcoming Section */}
        <Text style={styles.sectionTitle}>Upcoming Reminders</Text>
        <TouchableOpacity 
          style={styles.reminderCard}
          onPress={() => navigation.navigate('NotificationHistory')}
        >
          <View style={styles.reminderIcon}>
            <Text style={styles.reminderIconText}>📅</Text>
          </View>
          <View style={styles.reminderContent}>
            <Text style={styles.reminderTitle}>View All Notifications</Text>
            <Text style={styles.reminderDescription}>
              Check your vaccination reminders and updates
            </Text>
          </View>
        </TouchableOpacity>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoIcon}>💡</Text>
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Did you know?</Text>
            <Text style={styles.infoText}>
              The Hepatitis B vaccine is highly effective and provides long-term protection against the virus.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E6F0F7',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 10,
  },
  greeting: {
    fontSize: 16,
    color: '#666',
  },
  userName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0f1923',
    marginTop: 4,
  },
  profileButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#005A9C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInitial: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statusCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    marginBottom: 30,
    borderLeftWidth: 4,
    borderLeftColor: '#005A9C',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f1923',
  },
  statusBadge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#005A9C',
    textTransform: 'capitalize',
  },
  statusDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f1923',
    marginBottom: 16,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 30,
  },
  actionCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f1923',
    marginTop: 12,
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  reminderCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reminderIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFF9E6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  reminderIconText: {
    fontSize: 24,
  },
  reminderContent: {
    flex: 1,
  },
  reminderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f1923',
    marginBottom: 4,
  },
  reminderDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#E8F5E9',
    padding: 16,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  infoIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f1923',
    marginBottom: 6,
  },
  infoText: {
    fontSize: 14,
    color: '#0f1923',
    lineHeight: 20,
  },
});
