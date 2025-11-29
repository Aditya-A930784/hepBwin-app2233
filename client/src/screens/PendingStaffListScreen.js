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

const ClockIcon = ({ size = 24, color = "#F59E0B" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M12 6V12L16 14" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const PendingStaffListScreen = ({ navigation }) => {
  const [staffList, setStaffList] = useState([]);
  const [filteredStaff, setFilteredStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Real-time listener for patients collection
    const q = query(collection(db, 'patients'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const patients = [];
      snapshot.forEach((doc) => {
        patients.push({ id: doc.id, ...doc.data() });
      });

      // Fetch second and third dose data
      const secondDoseSnapshot = await getDocs(collection(db, 'second_dose'));
      const thirdDoseSnapshot = await getDocs(collection(db, 'Thrid_dose'));
      
      const secondDoseMap = {};
      const thirdDoseMap = {};
      
      secondDoseSnapshot.forEach((doc) => {
        const data = doc.data();
        secondDoseMap[data.patientId || doc.id] = data;
      });
      
      thirdDoseSnapshot.forEach((doc) => {
        const data = doc.data();
        thirdDoseMap[data.patientId || doc.id] = data;
      });
      
      // Filter and enhance patients who haven't completed all 3 doses
      const pendingPatients = patients
        .filter(patient => !thirdDoseMap[patient.id])
        .map(patient => ({
          ...patient,
          secondDoseInfo: secondDoseMap[patient.id],
          thirdDoseInfo: thirdDoseMap[patient.id],
          secondDoseDate: secondDoseMap[patient.id]?.secondDoseDate,
          thirdDoseDate: thirdDoseMap[patient.id]?.thirdDoseDate,
        }));

      setStaffList(pendingPatients);
      setFilteredStaff(pendingPatients);
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

  const getVaccinationStatus = (staff) => {
    if (staff.secondDoseDate) {
      return { status: 'Awaiting Dose 3', color: '#F59E0B', bgColor: '#FEF3C7', doses: '2/3' };
    } else if (staff.firstDoseDate) {
      return { status: 'Awaiting Dose 2', color: '#F59E0B', bgColor: '#FEF3C7', doses: '1/3' };
    } else {
      return { status: 'Not Started', color: '#EF4444', bgColor: '#FEE2E2', doses: '0/3' };
    }
  };

  const renderStaffCard = ({ item }) => {
    const vaccinationInfo = getVaccinationStatus(item);

    return (
      <View style={styles.staffCard}>
        <View style={styles.staffCardHeader}>
          <View style={styles.staffIconContainer}>
            <ClockIcon size={24} color="#F59E0B" />
          </View>
          <View style={styles.staffInfo}>
            <Text style={styles.staffName}>{item.name}</Text>
            <Text style={styles.staffDepartment}>{item.department || 'N/A'}</Text>
            <Text style={styles.staffDesignation}>{item.designation || 'N/A'}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: vaccinationInfo.bgColor }]}>
            <Text style={[styles.statusText, { color: vaccinationInfo.color }]}>
              {vaccinationInfo.doses}
            </Text>
          </View>
        </View>

        <View style={styles.staffCardDivider} />

        <View style={styles.staffDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Phone:</Text>
            <Text style={styles.detailValue}>{item.phone || 'N/A'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Email:</Text>
            <Text style={styles.detailValue} numberOfLines={1}>{item.email || 'N/A'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Status:</Text>
            <View style={[styles.statusChip, { backgroundColor: vaccinationInfo.bgColor }]}>
              <Text style={[styles.statusChipText, { color: vaccinationInfo.color }]}>
                {vaccinationInfo.status}
              </Text>
            </View>
          </View>
          {item.firstDoseDate && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>First Dose:</Text>
              <Text style={styles.detailValue}>{new Date(item.firstDoseDate).toLocaleDateString()}</Text>
            </View>
          )}
          {item.secondDoseDate && (
            <>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Second Dose:</Text>
                <Text style={styles.detailValue}>{new Date(item.secondDoseDate).toLocaleDateString()}</Text>
              </View>
              {item.thirdDoseDate && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Next Dose Due:</Text>
                  <Text style={[styles.detailValue, styles.dueDate]}>
                    {new Date(item.thirdDoseDate).toLocaleDateString()}
                  </Text>
                </View>
              )}
            </>
          )}
          {!item.secondDoseDate && item.secondDoseDate && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Next Dose Due:</Text>
              <Text style={[styles.detailValue, styles.dueDate]}>
                {new Date(item.secondDoseDate).toLocaleDateString()}
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#F59E0B" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ChevronLeftIcon size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pending Staff</Text>
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
          Pending Staff: <Text style={styles.countNumber}>{filteredStaff.length}</Text>
        </Text>
        <Text style={styles.countSubtext}>Staff awaiting vaccination doses</Text>
      </View>

      {/* Staff List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#F59E0B" />
          <Text style={styles.loadingText}>Loading pending staff...</Text>
        </View>
      ) : filteredStaff.length === 0 ? (
        <View style={styles.emptyContainer}>
          <ClockIcon size={64} color="#D1D5DB" />
          <Text style={styles.emptyText}>
            {searchQuery ? 'No pending staff found matching your search' : 'No pending vaccinations'}
          </Text>
          <Text style={styles.emptySubtext}>
            All staff have completed their vaccination schedule
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
    backgroundColor: '#F59E0B',
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#F59E0B',
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
    color: '#F59E0B',
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
    borderLeftColor: '#F59E0B',
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
    backgroundColor: '#FEF3C7',
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
  },
  statusText: {
    fontSize: 13,
    fontWeight: 'bold',
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
    width: 110,
  },
  detailValue: {
    fontSize: 13,
    color: '#1F2937',
    flex: 1,
    textAlign: 'right',
  },
  dueDate: {
    color: '#F59E0B',
    fontWeight: '600',
  },
  statusChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default PendingStaffListScreen;
