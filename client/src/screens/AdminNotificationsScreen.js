import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Svg, { Path, Circle } from 'react-native-svg';
import { db } from '../config/firebase';
import { collection, query, orderBy, limit, onSnapshot, where } from 'firebase/firestore';

// Back Arrow Icon
const ChevronLeftIcon = ({ size = 24, color = "#FFFFFF" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M15 18L9 12L15 6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

// Bell Icon
const BellIcon = ({ size = 24, color = "#3B82F6" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M13.73 21a2 2 0 0 1-3.46 0" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

// Login Icon
const LoginIcon = ({ size = 20, color = "#10B981" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M10 17l5-5-5-5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M15 12H3" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

// Syringe Icon
const SyringeIcon = ({ size = 20, color = "#3B82F6" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M14.5 3l2.5 2.5-1.4 1.4L17 8.3l1.4-1.4 1.4 1.4L18.4 10l1.4 1.4-1.4 1.4-1.4-1.4-8.5 8.5c-.4.4-1 .4-1.4 0l-5-5c-.4-.4-.4-1 0-1.4L11.6 5l-1.4-1.4L11.6 2 13 3.4 14.4 2l.1 1z" fill={color}/>
  </Svg>
);

export default function AdminNotificationsScreen({ navigation }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    todayLogins: 0,
    todayFirstDose: 0,
    todaySecondDose: 0,
    todayThirdDose: 0,
  });

  useEffect(() => {
    // Real-time listener for coordinator activities (last 12 hours only)
    const twelveHoursAgo = new Date();
    twelveHoursAgo.setHours(twelveHoursAgo.getHours() - 12);

    const q = query(
      collection(db, 'coordinator_activity'),
      orderBy('timestamp', 'desc'),
      limit(100)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const activitiesList = [];
      const today = new Date().toDateString();
      let loginCount = 0;
      let firstDoseCount = 0;
      let secondDoseCount = 0;
      let thirdDoseCount = 0;

      snapshot.forEach((doc) => {
        const data = doc.data();
        
        // Get activity timestamp
        let activityTime;
        if (data.timestamp && data.timestamp.toDate) {
          activityTime = data.timestamp.toDate();
        } else if (data.date) {
          activityTime = new Date(data.date);
        } else {
          activityTime = new Date();
        }

        // Only include activities from last 12 hours
        if (activityTime >= twelveHoursAgo) {
          const activityDate = activityTime.toDateString();
          
          activitiesList.push({
            id: doc.id,
            ...data,
            activityTime: activityTime,
          });

          // Count today's activities
          if (activityDate === today) {
            if (data.activityType === 'login') {
              loginCount++;
            } else if (data.activityType === 'dose_entry') {
              if (data.doseType === 'first_dose') firstDoseCount++;
              if (data.doseType === 'second_dose') secondDoseCount++;
              if (data.doseType === 'third_dose') thirdDoseCount++;
            }
          }
        }
      });

      setActivities(activitiesList);
      setStats({
        todayLogins: loginCount,
        todayFirstDose: firstDoseCount,
        todaySecondDose: secondDoseCount,
        todayThirdDose: thirdDoseCount,
      });
      setLoading(false);
      setRefreshing(false);
    }, (error) => {
      console.error('Error fetching activities:', error);
      setLoading(false);
      setRefreshing(false);
    });

    return () => unsubscribe();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
  };

  const formatTimestamp = (timestamp, dateString) => {
    if (timestamp && timestamp.toDate) {
      const date = timestamp.toDate();
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    if (dateString) {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    return 'Just now';
  };

  const getActivityIcon = (activity) => {
    if (activity.activityType === 'login') {
      return <LoginIcon size={24} color="#10B981" />;
    }
    return <SyringeIcon size={24} color="#3B82F6" />;
  };

  const getActivityTitle = (activity) => {
    if (activity.activityType === 'login') {
      return 'Coordinator Login';
    }
    if (activity.doseType === 'first_dose') return 'First Dose Recorded';
    if (activity.doseType === 'second_dose') return 'Second Dose Recorded';
    if (activity.doseType === 'third_dose') return 'Third Dose Recorded';
    return 'Activity';
  };

  const getActivityDescription = (activity) => {
    if (activity.activityType === 'login') {
      return `${activity.coordinatorName} logged into the system`;
    }
    return `${activity.coordinatorName} recorded ${activity.doseType?.replace('_', ' ')} for patient ${activity.patientId || activity.patientName || 'Unknown'}`;
  };

  const getActivityColor = (activity) => {
    if (activity.activityType === 'login') return '#D1FAE5';
    if (activity.doseType === 'first_dose') return '#DBEAFE';
    if (activity.doseType === 'second_dose') return '#E0E7FF';
    if (activity.doseType === 'third_dose') return '#FEF3C7';
    return '#F3F4F6';
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" backgroundColor="#3B82F6" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ChevronLeftIcon size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Coordinator Activity</Text>
        <View style={styles.headerRight}>
          <BellIcon size={24} color="#FFFFFF" />
          {activities.length > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{activities.length}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Statistics Cards */}
      <View style={styles.statsContainer}>
        <Text style={styles.statsTitle}>Today's Summary</Text>
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: '#D1FAE5' }]}>
            <Text style={styles.statValue}>{stats.todayLogins}</Text>
            <Text style={styles.statLabel}>Logins</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#DBEAFE' }]}>
            <Text style={styles.statValue}>{stats.todayFirstDose}</Text>
            <Text style={styles.statLabel}>Dose 1</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#E0E7FF' }]}>
            <Text style={styles.statValue}>{stats.todaySecondDose}</Text>
            <Text style={styles.statLabel}>Dose 2</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#FEF3C7' }]}>
            <Text style={styles.statValue}>{stats.todayThirdDose}</Text>
            <Text style={styles.statLabel}>Dose 3</Text>
          </View>
        </View>
      </View>

      {/* Activity List */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text style={styles.sectionTitle}>Recent Activity (Last 12 Hours)</Text>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text style={styles.loadingText}>Loading activities...</Text>
          </View>
        ) : activities.length > 0 ? (
          activities.map((activity) => (
            <View
              key={activity.id}
              style={[
                styles.activityCard,
                { backgroundColor: getActivityColor(activity) }
              ]}
            >
              <View style={styles.activityIcon}>
                {getActivityIcon(activity)}
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>
                  {getActivityTitle(activity)}
                </Text>
                <Text style={styles.activityDescription}>
                  {getActivityDescription(activity)}
                </Text>
                <Text style={styles.activityTime}>
                  {formatTimestamp(activity.timestamp, activity.date)}
                </Text>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <BellIcon size={64} color="#D1D5DB" />
            <Text style={styles.emptyText}>No Activity Yet</Text>
            <Text style={styles.emptySubtext}>
              Coordinator activities will appear here
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
    marginLeft: 12,
  },
  headerRight: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  statsContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 12,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  activityCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  activityIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  activityDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 6,
  },
  activityTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
  },
});
