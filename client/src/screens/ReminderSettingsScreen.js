import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Switch,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Svg, { Path, Circle } from 'react-native-svg';

// Bell Icon
const BellIcon = ({ active = false }) => (
  <Svg width={40} height={40} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"
      fill={active ? '#4CAF50' : '#9CA3AF'}
    />
  </Svg>
);

// Clock Icon
const ClockIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke="#005A9C" strokeWidth="2" />
    <Path d="M12 6v6l4 2" stroke="#005A9C" strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

export default function ReminderSettingsScreen({ navigation }) {
  const [reminders, setReminders] = useState({
    nextDose: true,
    beforeDose: true,
    titreTest: true,
    general: false,
  });

  const [reminderTimes, setReminderTimes] = useState({
    nextDose: '1 week before',
    beforeDose: '3 days before',
    titreTest: '1 month after completion',
  });

  const toggleReminder = (key) => {
    setReminders({ ...reminders, [key]: !reminders[key] });
  };

  const handleSaveSettings = () => {
    Alert.alert('Success', 'Reminder settings saved successfully!');
  };

  const handleTestNotification = () => {
    Alert.alert(
      '🔔 Test Notification',
      'This is how your reminder will look. You will receive notifications for upcoming doses and important dates.'
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <BellIcon active={Object.values(reminders).some(r => r)} />
          <Text style={styles.title}>Reminder Settings</Text>
          <Text style={styles.subtitle}>
            Manage your vaccination reminder preferences
          </Text>
        </View>

        {/* Main Reminders */}
        <Text style={styles.sectionTitle}>Vaccination Reminders</Text>

        <View style={styles.settingCard}>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>Next Dose Reminder</Text>
            <Text style={styles.settingDescription}>
              Get notified when it's time for your next dose
            </Text>
            <View style={styles.timeInfo}>
              <ClockIcon />
              <Text style={styles.timeText}>{reminderTimes.nextDose}</Text>
            </View>
          </View>
          <Switch
            value={reminders.nextDose}
            onValueChange={() => toggleReminder('nextDose')}
            trackColor={{ false: '#E0E6EB', true: '#4CAF50' }}
            thumbColor={reminders.nextDose ? '#FFFFFF' : '#f4f3f4'}
          />
        </View>

        <View style={styles.settingCard}>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>Before Dose Reminder</Text>
            <Text style={styles.settingDescription}>
              Get an early reminder before your scheduled dose
            </Text>
            <View style={styles.timeInfo}>
              <ClockIcon />
              <Text style={styles.timeText}>{reminderTimes.beforeDose}</Text>
            </View>
          </View>
          <Switch
            value={reminders.beforeDose}
            onValueChange={() => toggleReminder('beforeDose')}
            trackColor={{ false: '#E0E6EB', true: '#4CAF50' }}
            thumbColor={reminders.beforeDose ? '#FFFFFF' : '#f4f3f4'}
          />
        </View>

        <View style={styles.settingCard}>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>Anti-HBs Titre Test</Text>
            <Text style={styles.settingDescription}>
              Reminder to check immunity after vaccination completion
            </Text>
            <View style={styles.timeInfo}>
              <ClockIcon />
              <Text style={styles.timeText}>{reminderTimes.titreTest}</Text>
            </View>
          </View>
          <Switch
            value={reminders.titreTest}
            onValueChange={() => toggleReminder('titreTest')}
            trackColor={{ false: '#E0E6EB', true: '#4CAF50' }}
            thumbColor={reminders.titreTest ? '#FFFFFF' : '#f4f3f4'}
          />
        </View>

        {/* Additional Settings */}
        <Text style={styles.sectionTitle}>Additional Settings</Text>

        <View style={styles.settingCard}>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>General Health Tips</Text>
            <Text style={styles.settingDescription}>
              Receive periodic health tips and vaccination information
            </Text>
          </View>
          <Switch
            value={reminders.general}
            onValueChange={() => toggleReminder('general')}
            trackColor={{ false: '#E0E6EB', true: '#4CAF50' }}
            thumbColor={reminders.general ? '#FFFFFF' : '#f4f3f4'}
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.testButton}
            onPress={handleTestNotification}
          >
            <Text style={styles.testButtonText}>🔔 Test Notification</Text>
          </TouchableOpacity>
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Text style={styles.infoIcon}>💡</Text>
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>About Reminders</Text>
            <Text style={styles.infoText}>
              HepBwin sends you timely reminders to help you stay on track with your vaccination schedule. 
              All reminders are based on medical guidelines for optimal protection.
            </Text>
          </View>
        </View>

        {/* Notification Schedule */}
        <View style={styles.scheduleCard}>
          <Text style={styles.scheduleTitle}>📅 Upcoming Reminders</Text>
          <View style={styles.scheduleItem}>
            <View style={styles.scheduleDot} />
            <View style={styles.scheduleContent}>
              <Text style={styles.scheduleText}>Second Dose Due</Text>
              <Text style={styles.scheduleDate}>In 7 days (Nov 8, 2025)</Text>
            </View>
          </View>
          <View style={styles.scheduleItem}>
            <View style={[styles.scheduleDot, styles.scheduleDotInactive]} />
            <View style={styles.scheduleContent}>
              <Text style={[styles.scheduleText, styles.scheduleTextInactive]}>
                Third Dose Due
              </Text>
              <Text style={styles.scheduleDate}>In 6 months (May 1, 2026)</Text>
            </View>
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSaveSettings}
          activeOpacity={0.8}
        >
          <Text style={styles.saveButtonText}>Save Settings</Text>
        </TouchableOpacity>
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
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 10,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  backText: {
    fontSize: 16,
    color: '#005A9C',
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0f1923',
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f1923',
    marginBottom: 16,
    marginTop: 8,
  },
  settingCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingContent: {
    flex: 1,
    marginRight: 12,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f1923',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
    marginBottom: 8,
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timeText: {
    fontSize: 13,
    color: '#005A9C',
    fontWeight: '600',
  },
  actionsContainer: {
    marginTop: 20,
    marginBottom: 20,
  },
  testButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#005A9C',
  },
  testButtonText: {
    color: '#005A9C',
    fontSize: 16,
    fontWeight: '600',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#005A9C',
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
  scheduleCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scheduleTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f1923',
    marginBottom: 16,
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  scheduleDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
    marginRight: 12,
  },
  scheduleDotInactive: {
    backgroundColor: '#9CA3AF',
  },
  scheduleContent: {
    flex: 1,
  },
  scheduleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f1923',
    marginBottom: 2,
  },
  scheduleTextInactive: {
    color: '#9CA3AF',
  },
  scheduleDate: {
    fontSize: 14,
    color: '#666',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});
