import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Svg, { Path, Circle } from 'react-native-svg';

// Notification Icon
const NotificationIcon = ({ type = 'info' }) => {
  const colors = {
    success: '#4CAF50',
    warning: '#FFA000',
    info: '#005A9C',
    reminder: '#9C27B0',
  };

  return (
    <Svg width={40} height={40} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" fill={colors[type]} opacity="0.2" />
      <Path
        d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"
        fill={colors[type]}
      />
    </Svg>
  );
};

export default function NotificationHistoryScreen({ navigation }) {
  const notifications = [
    {
      id: '1',
      type: 'reminder',
      title: 'Second Dose Reminder',
      message: 'Your second dose is due in 7 days (Nov 8, 2025). Please schedule your appointment.',
      time: '2 hours ago',
      read: false,
    },
    {
      id: '2',
      type: 'success',
      title: 'First Dose Recorded',
      message: 'Your first vaccination dose has been successfully recorded.',
      time: '2 days ago',
      read: true,
    },
    {
      id: '3',
      type: 'info',
      title: 'Profile Completed',
      message: 'Thank you for completing your profile. You can now track your vaccination journey.',
      time: '3 days ago',
      read: true,
    },
    {
      id: '4',
      type: 'reminder',
      title: 'Welcome to HepBwin',
      message: 'Start your Hepatitis B vaccination tracking today. Add your first dose to get started!',
      time: '1 week ago',
      read: true,
    },
    {
      id: '5',
      type: 'warning',
      title: 'Important: Vaccination Schedule',
      message: 'Remember to maintain the recommended schedule: 2nd dose after 1 month, 3rd dose after 6 months.',
      time: '1 week ago',
      read: true,
    },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  const getTimeStyle = (read) => ({
    fontSize: 12,
    color: read ? '#9CA3AF' : '#005A9C',
    fontWeight: read ? '400' : '600',
  });

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
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Notifications</Text>
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount}</Text>
              </View>
            )}
          </View>
          <Text style={styles.subtitle}>
            Stay updated with your vaccination reminders
          </Text>
        </View>

        {/* Mark All as Read Button */}
        {unreadCount > 0 && (
          <TouchableOpacity style={styles.markAllButton}>
            <Text style={styles.markAllText}>Mark all as read</Text>
          </TouchableOpacity>
        )}

        {/* Notifications List */}
        <View style={styles.notificationsList}>
          {notifications.map((notification) => (
            <TouchableOpacity
              key={notification.id}
              style={[
                styles.notificationCard,
                !notification.read && styles.notificationCardUnread,
              ]}
              activeOpacity={0.7}
            >
              <View style={styles.notificationIconContainer}>
                <NotificationIcon type={notification.type} />
                {!notification.read && <View style={styles.unreadDot} />}
              </View>
              
              <View style={styles.notificationContent}>
                <Text style={[
                  styles.notificationTitle,
                  !notification.read && styles.notificationTitleUnread,
                ]}>
                  {notification.title}
                </Text>
                <Text style={styles.notificationMessage}>
                  {notification.message}
                </Text>
                <Text style={getTimeStyle(notification.read)}>
                  {notification.time}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Empty State (Hidden when there are notifications) */}
        {notifications.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🔔</Text>
            <Text style={styles.emptyTitle}>No Notifications Yet</Text>
            <Text style={styles.emptyText}>
              You'll see your vaccination reminders and updates here
            </Text>
          </View>
        )}

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Text style={styles.infoIcon}>💡</Text>
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Notification Tips</Text>
            <Text style={styles.infoText}>
              • Enable notifications to never miss a dose{'\n'}
              • Notifications are sent based on your vaccination schedule{'\n'}
              • You can customize reminder settings in the Settings page
            </Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('ReminderSettings')}
          >
            <Text style={styles.actionButtonText}>⚙️ Reminder Settings</Text>
          </TouchableOpacity>
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
    marginBottom: 20,
    marginTop: 10,
  },
  backButton: {
    marginBottom: 16,
  },
  backText: {
    fontSize: 16,
    color: '#005A9C',
    fontWeight: '600',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0f1923',
    marginRight: 12,
  },
  badge: {
    backgroundColor: '#D32F2F',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  markAllButton: {
    alignSelf: 'flex-end',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
  },
  markAllText: {
    fontSize: 14,
    color: '#005A9C',
    fontWeight: '600',
  },
  notificationsList: {
    marginBottom: 20,
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  notificationCardUnread: {
    borderLeftWidth: 4,
    borderLeftColor: '#005A9C',
    backgroundColor: '#F8FBFF',
  },
  notificationIconContainer: {
    marginRight: 16,
    position: 'relative',
  },
  unreadDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#D32F2F',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f1923',
    marginBottom: 6,
  },
  notificationTitleUnread: {
    color: '#005A9C',
    fontWeight: '700',
  },
  notificationMessage: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f1923',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
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
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#0f1923',
    lineHeight: 22,
  },
  quickActions: {
    marginTop: 10,
  },
  actionButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#005A9C',
  },
  actionButtonText: {
    color: '#005A9C',
    fontSize: 16,
    fontWeight: '600',
  },
});
