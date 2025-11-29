import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Svg, { Path, Circle } from 'react-native-svg';
import { db, auth } from '../config/firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';

// Back Arrow Icon
const BackArrowIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path
      d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"
      fill="#0f1923"
    />
  </Svg>
);

// Syringe Icon
const SyringeIcon = ({ color = '#4CAF50' }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path
      d="M14.5 3l2.5 2.5-1.4 1.4L17 8.3l1.4-1.4 1.4 1.4L18.4 10l1.4 1.4-1.4 1.4-1.4-1.4-8.5 8.5c-.4.4-1 .4-1.4 0l-5-5c-.4-.4-.4-1 0-1.4L11.6 5l-1.4-1.4L11.6 2 13 3.4 14.4 2l.1 1z"
      fill={color}
    />
  </Svg>
);

// Trophy Icon
const TrophyIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path
      d="M20 7h-5V4c0-1.1-.9-2-2-2H9c-1.1 0-2 .9-2 2v3H2v4c0 2.21 1.79 4 4 4h.69l1.66 5.69c.18.61.75 1.03 1.39 1.03h6.52c.64 0 1.21-.42 1.39-1.03L19.31 15H20c2.21 0 4-1.79 4-4V7h-4z"
      fill="#FFA000"
    />
  </Svg>
);

// Search Icon
const SearchIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path
      d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
      fill="#005A9C"
    />
  </Svg>
);

export default function MyRecordsScreen({ navigation, route }) {
  const [loading, setLoading] = useState(true);
  const [allPatients, setAllPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [filterType, setFilterType] = useState('all'); // 'all', 'completed', 'pending'
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchAllPatientRecords();
  }, []);

  const fetchAllPatientRecords = async () => {
    try {
      setLoading(true);
      const currentUser = auth.currentUser;

      if (!currentUser) {
        console.log('No authenticated user');
        setLoading(false);
        return;
      }

      console.log('Fetching patient records for:', currentUser.email);

      // Check if current user is admin
      const isAdmin = currentUser.email === 'admin@gmail.com';

      // Get patients based on user role
      const patientsRef = collection(db, 'patients');
      let patientsSnapshot;
      
      if (isAdmin) {
        // Admin sees all patients
        console.log('Admin user - fetching all patient records');
        patientsSnapshot = await getDocs(patientsRef);
      } else {
        // Regular coordinator sees only their patients
        console.log('Coordinator user - fetching only their records');
        const q = query(patientsRef, where('coordinatorEmail', '==', currentUser.email));
        patientsSnapshot = await getDocs(q);
      }
      
      console.log('Total patients found:', patientsSnapshot.size);

      // Get all second dose records
      const secondDoseRef = collection(db, 'second_dose');
      const secondDoseSnapshot = await getDocs(secondDoseRef);
      const secondDoseMap = {};
      secondDoseSnapshot.forEach((doc) => {
        const data = doc.data();
        secondDoseMap[data.patientId] = data;
      });

      // Get all third dose records
      const thirdDoseRef = collection(db, 'Thrid_dose');
      const thirdDoseSnapshot = await getDocs(thirdDoseRef);
      const thirdDoseMap = {};
      thirdDoseSnapshot.forEach((doc) => {
        const data = doc.data();
        thirdDoseMap[data.patientId] = data;
      });

      // Build patient records array
      const patientsData = [];
      patientsSnapshot.forEach((doc) => {
        const patientData = doc.data();
        const pid = doc.id;

        const patientRecord = {
          id: pid,
          name: patientData.name,
          age: patientData.age,
          gender: patientData.gender,
          department: patientData.department,
          designation: patientData.designation,
          phoneNumber: patientData.phoneNumber,
          emailId: patientData.emailId,
          firstDose: null,
          secondDose: null,
          thirdDose: null,
        };

        // First dose
        if (patientData.firstDoseDate || patientData.doseZeroDate) {
          patientRecord.firstDose = {
            date: patientData.firstDoseDate || patientData.doseZeroDate,
            sideEffects: patientData.sideEffects || 'None reported',
            nextDose: patientData.estimatedSecondDoseDate || 'N/A',
          };
        }

        // Second dose
        if (secondDoseMap[pid]) {
          patientRecord.secondDose = {
            date: secondDoseMap[pid].secondDoseDate,
            sideEffects: secondDoseMap[pid].sideEffects || 'None reported',
            nextDose: secondDoseMap[pid].thirdDoseDate || 'N/A',
          };
        } else if (patientData.secondDoseDate) {
          patientRecord.secondDose = {
            date: patientData.secondDoseDate,
            sideEffects: 'From patient record',
            nextDose: 'N/A',
          };
        }

        // Third dose
        if (thirdDoseMap[pid]) {
          patientRecord.thirdDose = {
            date: thirdDoseMap[pid].thirdDoseDate,
            sideEffects: thirdDoseMap[pid].sideEffects || 'None reported',
            antiHBsDate: thirdDoseMap[pid].antiHBsDate || 'N/A',
          };
        } else if (patientData.thirdDoseDate) {
          patientRecord.thirdDose = {
            date: patientData.thirdDoseDate,
            sideEffects: 'From patient record',
            antiHBsDate: 'N/A',
          };
        }

        patientsData.push(patientRecord);
      });

      console.log('Processed patients:', patientsData.length);
      setAllPatients(patientsData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching patient records:', error);
      console.error('Error details:', error.message);
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <BackArrowIcon />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>All Vaccination Records</Text>
        <TouchableOpacity 
          style={styles.searchButton}
          onPress={() => setSearchVisible(!searchVisible)}
        >
          <SearchIcon />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      {searchVisible && (
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, department, or email..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity 
              style={styles.clearButton}
              onPress={() => setSearchQuery('')}
            >
              <Text style={styles.clearButtonText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#005A9C" />
            <Text style={styles.loadingText}>Loading all records...</Text>
          </View>
        ) : (
          <>
            {allPatients.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>📋</Text>
                <Text style={styles.emptyTitle}>No Records Found</Text>
                <Text style={styles.emptyText}>
                  No vaccination records have been entered yet.
                </Text>
              </View>
            ) : (
              <>
                {/* Summary Card */}
                <View style={styles.summaryCard}>
                  <Text style={styles.summaryTitle}>📊 Summary</Text>
                  
                  {/* Summary Stats */}
                  <View style={styles.summaryStats}>
                    <TouchableOpacity 
                      style={[styles.statItem, filterType === 'all' && styles.statItemActive]}
                      onPress={() => setFilterType('all')}
                    >
                      <Text style={styles.statValue}>{allPatients.length}</Text>
                      <Text style={styles.statLabel}>Total Patients</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.statItem, filterType === 'completed' && styles.statItemActive]}
                      onPress={() => setFilterType('completed')}
                    >
                      <Text style={[styles.statValue, { color: '#4CAF50' }]}>
                        {allPatients.filter(p => p.thirdDose).length}
                      </Text>
                      <Text style={styles.statLabel}>Completed</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.statItem, filterType === 'pending' && styles.statItemActive]}
                      onPress={() => setFilterType('pending')}
                    >
                      <Text style={[styles.statValue, { color: '#FF9800' }]}>
                        {allPatients.filter(p => !p.thirdDose).length}
                      </Text>
                      <Text style={styles.statLabel}>Pending</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Patient Cards */}
                {allPatients.filter(patient => {
                  // Filter by completion status
                  if (filterType === 'completed' && !patient.thirdDose) return false;
                  if (filterType === 'pending' && patient.thirdDose) return false;
                  
                  // Filter by search query
                  if (searchQuery.trim()) {
                    const query = searchQuery.toLowerCase();
                    return (
                      patient.name.toLowerCase().includes(query) ||
                      patient.department.toLowerCase().includes(query) ||
                      patient.emailId.toLowerCase().includes(query) ||
                      patient.designation.toLowerCase().includes(query) ||
                      patient.phoneNumber.includes(query)
                    );
                  }
                  
                  return true;
                }).map((patient, index) => (
                  <TouchableOpacity 
                    key={patient.id} 
                    style={styles.patientCard}
                    onPress={() => {
                      setSelectedPatient(patient);
                      setModalVisible(true);
                    }}
                  >
                    {/* Patient Header */}
                    <View style={styles.patientHeader}>
                      <View style={styles.patientInfo}>
                        <Text style={styles.patientName}>{patient.name}</Text>
                        <Text style={styles.patientDetails}>
                          {patient.age} years • {patient.gender}
                        </Text>
                        <Text style={styles.patientDetails}>
                          {patient.department} • {patient.designation}
                        </Text>
                      </View>
                      <View style={styles.doseBadge}>
                        <Text style={styles.doseBadgeText}>
                          {(patient.firstDose ? 1 : 0) + (patient.secondDose ? 1 : 0) + (patient.thirdDose ? 1 : 0)}/3
                        </Text>
                      </View>
                    </View>

                    {/* Dose Status */}
                    <View style={styles.doseStatus}>
                      <View style={styles.doseStatusItem}>
                        <View style={[styles.doseIndicator, patient.firstDose && styles.doseIndicatorActive]} />
                        <Text style={styles.doseStatusText}>
                          Dose 1: {patient.firstDose ? patient.firstDose.date : 'Pending'}
                        </Text>
                      </View>
                      <View style={styles.doseStatusItem}>
                        <View style={[styles.doseIndicator, patient.secondDose && styles.doseIndicatorActive]} />
                        <Text style={styles.doseStatusText}>
                          Dose 2: {patient.secondDose ? patient.secondDose.date : 'Pending'}
                        </Text>
                      </View>
                      <View style={styles.doseStatusItem}>
                        <View style={[styles.doseIndicator, patient.thirdDose && styles.doseIndicatorActive]} />
                        <Text style={styles.doseStatusText}>
                          Dose 3: {patient.thirdDose ? patient.thirdDose.date : 'Pending'}
                        </Text>
                      </View>
                    </View>

                    {/* Completion Badge */}
                    {patient.thirdDose && (
                      <View style={styles.completeBadge}>
                        <Text style={styles.completeBadgeText}>✓ Vaccination Complete</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </>
            )}
          </>
        )}
      </ScrollView>

      {/* Detail Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <ScrollView style={styles.modalContent}>
              {selectedPatient && (
                <>
                  {/* Modal Header */}
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Patient Details</Text>
                    <TouchableOpacity 
                      style={styles.closeButton}
                      onPress={() => setModalVisible(false)}
                    >
                      <Text style={styles.closeButtonText}>✕</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Patient Information */}
                  <View style={styles.modalSection}>
                    <Text style={styles.sectionTitle}>Personal Information</Text>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Name:</Text>
                      <Text style={styles.infoValue}>{selectedPatient.name}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Age:</Text>
                      <Text style={styles.infoValue}>{selectedPatient.age} years</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Gender:</Text>
                      <Text style={styles.infoValue}>{selectedPatient.gender}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Department:</Text>
                      <Text style={styles.infoValue}>{selectedPatient.department}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Designation:</Text>
                      <Text style={styles.infoValue}>{selectedPatient.designation}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Phone:</Text>
                      <Text style={styles.infoValue}>{selectedPatient.phoneNumber}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Email:</Text>
                      <Text style={styles.infoValue}>{selectedPatient.emailId}</Text>
                    </View>
                  </View>

                  {/* First Dose */}
                  <View style={styles.modalSection}>
                    <View style={styles.doseHeader}>
                      <Text style={styles.sectionTitle}>First Dose</Text>
                      {selectedPatient.firstDose && (
                        <View style={styles.doseStatusBadge}>
                          <Text style={styles.doseStatusBadgeText}>✓ Completed</Text>
                        </View>
                      )}
                    </View>
                    {selectedPatient.firstDose ? (
                      <>
                        <View style={styles.infoRow}>
                          <Text style={styles.infoLabel}>Date:</Text>
                          <Text style={styles.infoValue}>{selectedPatient.firstDose.date}</Text>
                        </View>
                        {selectedPatient.firstDose.sideEffects && (
                          <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Side Effects:</Text>
                            <Text style={styles.infoValue}>{selectedPatient.firstDose.sideEffects}</Text>
                          </View>
                        )}
                        {selectedPatient.firstDose.nextDoseSchedule && (
                          <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Next Dose Schedule:</Text>
                            <Text style={styles.infoValue}>{selectedPatient.firstDose.nextDoseSchedule}</Text>
                          </View>
                        )}
                      </>
                    ) : (
                      <Text style={styles.pendingText}>Not administered yet</Text>
                    )}
                  </View>

                  {/* Second Dose */}
                  <View style={styles.modalSection}>
                    <View style={styles.doseHeader}>
                      <Text style={styles.sectionTitle}>Second Dose</Text>
                      {selectedPatient.secondDose && (
                        <View style={styles.doseStatusBadge}>
                          <Text style={styles.doseStatusBadgeText}>✓ Completed</Text>
                        </View>
                      )}
                    </View>
                    {selectedPatient.secondDose ? (
                      <>
                        <View style={styles.infoRow}>
                          <Text style={styles.infoLabel}>Date:</Text>
                          <Text style={styles.infoValue}>{selectedPatient.secondDose.date}</Text>
                        </View>
                        {selectedPatient.secondDose.sideEffects && (
                          <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Side Effects:</Text>
                            <Text style={styles.infoValue}>{selectedPatient.secondDose.sideEffects}</Text>
                          </View>
                        )}
                        {selectedPatient.secondDose.nextDoseSchedule && (
                          <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Next Dose Schedule:</Text>
                            <Text style={styles.infoValue}>{selectedPatient.secondDose.nextDoseSchedule}</Text>
                          </View>
                        )}
                      </>
                    ) : (
                      <Text style={styles.pendingText}>Not administered yet</Text>
                    )}
                  </View>

                  {/* Third Dose */}
                  <View style={styles.modalSection}>
                    <View style={styles.doseHeader}>
                      <Text style={styles.sectionTitle}>Third Dose</Text>
                      {selectedPatient.thirdDose && (
                        <View style={styles.doseStatusBadge}>
                          <Text style={styles.doseStatusBadgeText}>✓ Completed</Text>
                        </View>
                      )}
                    </View>
                    {selectedPatient.thirdDose ? (
                      <>
                        <View style={styles.infoRow}>
                          <Text style={styles.infoLabel}>Date:</Text>
                          <Text style={styles.infoValue}>{selectedPatient.thirdDose.date}</Text>
                        </View>
                        {selectedPatient.thirdDose.sideEffects && (
                          <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Side Effects:</Text>
                            <Text style={styles.infoValue}>{selectedPatient.thirdDose.sideEffects}</Text>
                          </View>
                        )}
                        {selectedPatient.thirdDose.antiHBsTestDate && (
                          <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Anti-HBs Test Date:</Text>
                            <Text style={styles.infoValue}>{selectedPatient.thirdDose.antiHBsTestDate}</Text>
                          </View>
                        )}
                        {selectedPatient.thirdDose.certificateGenerated && (
                          <View style={styles.certificateInfo}>
                            <Text style={styles.certificateText}>
                              ✓ Certificate Generated
                            </Text>
                          </View>
                        )}
                      </>
                    ) : (
                      <Text style={styles.pendingText}>Not administered yet</Text>
                    )}
                  </View>

                  {/* Vaccination Status Summary */}
                  <View style={[styles.modalSection, styles.summarySection]}>
                    <Text style={styles.sectionTitle}>Vaccination Status</Text>
                    <View style={styles.statusSummary}>
                      <Text style={styles.statusText}>
                        {selectedPatient.thirdDose 
                          ? '✓ Vaccination series completed' 
                          : `${(selectedPatient.firstDose ? 1 : 0) + (selectedPatient.secondDose ? 1 : 0)}/3 doses completed`}
                      </Text>
                    </View>
                  </View>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f1923',
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F8FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    height: 40,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 16,
    fontSize: 14,
    color: '#0f1923',
  },
  clearButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  clearButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f1923',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  summaryCard: {
    backgroundColor: '#E3F2FD',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#005A9C',
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f1923',
    marginBottom: 12,
  },
  summaryText: {
    fontSize: 16,
    color: '#0f1923',
    marginBottom: 6,
    fontWeight: '500',
  },
  patientCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  patientHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f1923',
    marginBottom: 6,
  },
  patientDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  doseBadge: {
    backgroundColor: '#005A9C',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  doseBadgeText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  doseStatus: {
    gap: 8,
    marginBottom: 12,
  },
  doseStatusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  doseIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#E0E0E0',
  },
  doseIndicatorActive: {
    backgroundColor: '#4CAF50',
  },
  doseStatusText: {
    fontSize: 14,
    color: '#0f1923',
  },
  completeBadge: {
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  completeBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E7D32',
  },
  progressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f1923',
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  doseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  doseCardDisabled: {
    opacity: 0.6,
  },
  doseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  doseHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  doseTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f1923',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusBadgeDisabled: {
    backgroundColor: '#F5F5F5',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  disabledText: {
    color: '#9E9E9E',
  },
  doseContent: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 6,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f1923',
    flex: 1,
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 8,
  },
  pendingText: {
    fontSize: 14,
    color: '#9E9E9E',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 12,
  },
  successBox: {
    backgroundColor: '#E8F5E9',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginTop: 8,
  },
  successIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2E7D32',
    marginBottom: 8,
  },
  successText: {
    fontSize: 14,
    color: '#388E3C',
    textAlign: 'center',
    lineHeight: 20,
  },
  // Summary Stats Styles
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 8,
  },
  statItem: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  statItemActive: {
    borderColor: '#005A9C',
    backgroundColor: '#F0F8FF',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#005A9C',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalContent: {
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f1923',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#666',
    fontWeight: '700',
  },
  modalSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f1923',
    marginBottom: 12,
  },
  doseStatusBadge: {
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  doseStatusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2E7D32',
  },
  certificateInfo: {
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    alignItems: 'center',
  },
  certificateText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#005A9C',
  },
  summarySection: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
  },
  statusSummary: {
    alignItems: 'center',
  },
});
