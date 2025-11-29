import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { Svg, Path, Circle } from 'react-native-svg';
import { collection, onSnapshot, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

// Custom Icons
const ChevronLeftIcon = ({ size = 24, color = "#FFFFFF" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M15 18L9 12L15 6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const SearchIcon = ({ size = 20, color = "#6B7280" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="11" cy="11" r="8" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M21 21L16.65 16.65" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const CheckCircleIcon = ({ size = 24, color = "#10B981" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.7088 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18455 2.99721 7.13631 4.39828 5.49706C5.79935 3.85781 7.69279 2.71537 9.79619 2.24013C11.8996 1.7649 14.1003 1.98232 16.07 2.85999"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path d="M22 4L12 14.01L9 11.01" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const AwardIcon = ({ size = 24, color = "#10B981" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="8" r="7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M8.21 13.89L7 23L12 20L17 23L15.79 13.88" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const CompletedStaffListScreen = ({ navigation }) => {
  const [staffList, setStaffList] = useState([]);
  const [filteredStaff, setFilteredStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Real-time listener for patients collection
    const q = query(collection(db, 'patients'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const allPatients = [];
      snapshot.forEach((doc) => {
        allPatients.push({ id: doc.id, ...doc.data() });
      });

      // Fetch third dose data to check completion
      const thirdDoseQuery = query(collection(db, 'Thrid_dose'));
      const thirdDoseSnapshot = await getDocs(thirdDoseQuery);
      
      const thirdDoseMap = {};
      thirdDoseSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.patientId) {
          thirdDoseMap[data.patientId] = {
            thirdDoseDate: data.thirdDoseDate,
            antiHBsDate: data.antiHBsDate,
          };
        }
      });

      // Filter only completed patients (those with third dose)
      const completedPatients = allPatients.filter(patient => thirdDoseMap[patient.id]);
      
      // Add third dose info to each patient
      const patientsWithDoseInfo = completedPatients.map(patient => ({
        ...patient,
        thirdDoseDate: thirdDoseMap[patient.id]?.thirdDoseDate,
        antiHBsDate: thirdDoseMap[patient.id]?.antiHBsDate,
      }));

      setStaffList(patientsWithDoseInfo);
      setFilteredStaff(patientsWithDoseInfo);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching staff:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredStaff(staffList);
    } else {
      const filtered = staffList.filter(staff => 
        staff.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        staff.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        staff.designation?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        staff.phone?.includes(searchQuery)
      );
      setFilteredStaff(filtered);
    }
  }, [searchQuery, staffList]);

  const renderStaffCard = ({ item }) => {
    return (
      <View style={styles.staffCard}>
        <View style={styles.staffCardHeader}>
          <View style={styles.staffIconContainer}>
            <CheckCircleIcon size={24} color="#10B981" />
          </View>
          <View style={styles.staffInfo}>
            <Text style={styles.staffName}>{item.name}</Text>
            <Text style={styles.staffDepartment}>{item.department || 'N/A'}</Text>
            <Text style={styles.staffDesignation}>{item.designation || 'N/A'}</Text>
          </View>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>3/3</Text>
          </View>
        </View>

        <View style={styles.staffCardDivider} />

        <View style={styles.staffDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Phone:</Text>
            <Text style={styles.detailValue}>{item.phoneNumber || 'N/A'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Email:</Text>
            <Text style={styles.detailValue} numberOfLines={1}>{item.emailId || 'N/A'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Status:</Text>
            <View style={styles.statusChip}>
              <AwardIcon size={14} color="#10B981" />
              <Text style={styles.statusChipText}>Completed</Text>
            </View>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>First Dose:</Text>
            <Text style={styles.detailValue}>{item.doseZeroDate || 'N/A'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Third Dose:</Text>
            <Text style={styles.detailValue}>{item.thirdDoseDate || 'N/A'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Anti-HBs Test:</Text>
            <Text style={styles.detailValue}>{item.antiHBsDate || 'N/A'}</Text>
          </View>
          {item.certificateNumber && (
            <View style={styles.certificateContainer}>
              <Text style={styles.certificateLabel}>Certificate:</Text>
              <Text style={styles.certificateNumber}>#{item.certificateNumber}</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#10B981" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ChevronLeftIcon size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Completed Vaccinations</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <SearchIcon size={20} color="#6B7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, department, phone..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Staff Count */}
      <View style={styles.countContainer}>
        <Text style={styles.countText}>
          Completed: <Text style={styles.countNumber}>{filteredStaff.length}</Text>
        </Text>
        <Text style={styles.countSubtext}>Staff who received all 3 doses</Text>
      </View>

      {/* Staff List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10B981" />
          <Text style={styles.loadingText}>Loading completed staff...</Text>
        </View>
      ) : filteredStaff.length === 0 ? (
        <View style={styles.emptyContainer}>
          <CheckCircleIcon size={64} color="#D1D5DB" />
          <Text style={styles.emptyText}>
            {searchQuery ? 'No completed staff found matching your search' : 'No completed vaccinations yet'}
          </Text>
          <Text style={styles.emptySubtext}>
            Staff who complete all 3 doses will appear here
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredStaff}
          renderItem={renderStaffCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingTop: 40,
  },
  header: {
    backgroundColor: '#10B981',
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
    color: '#1F2937',
  },
  countContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  countText: {
    fontSize: 15,
    color: '#6B7280',
    fontWeight: '500',
  },
  countNumber: {
    fontSize: 16,
    color: '#10B981',
    fontWeight: 'bold',
  },
  countSubtext: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 16,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 8,
  },
  listContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  staffCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  staffCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  staffIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#D1FAE5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  staffInfo: {
    flex: 1,
  },
  staffName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 2,
  },
  staffDepartment: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 2,
  },
  staffDesignation: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#D1FAE5',
  },
  statusText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#10B981',
  },
  staffCardDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 12,
  },
  staffDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
    width: 100,
  },
  detailValue: {
    fontSize: 13,
    color: '#1F2937',
    flex: 1,
    textAlign: 'right',
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#D1FAE5',
    gap: 4,
  },
  statusChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
  },
  certificateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  certificateLabel: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  certificateNumber: {
    fontSize: 13,
    color: '#10B981',
    fontWeight: '700',
  },
});

export default CompletedStaffListScreen;
