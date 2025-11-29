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
  Alert,
  Modal,
  ScrollView,
} from 'react-native';
import { Svg, Path, Circle } from 'react-native-svg';
import { collection, onSnapshot, query, orderBy, doc, deleteDoc, getDoc, getDocs } from 'firebase/firestore';
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

const DatabaseIcon = ({ size = 24, color = "#3B82F6" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 2C7.58172 2 4 3.79086 4 6V18C4 20.2091 7.58172 22 12 22C16.4183 22 20 20.2091 20 18V6C20 3.79086 16.4183 2 12 2Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M4 6C4 8.20914 7.58172 10 12 10C16.4183 10 20 8.20914 20 6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M4 12C4 14.2091 7.58172 16 12 16C16.4183 16 20 14.2091 20 12" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const EyeIcon = ({ size = 20, color = "#3B82F6" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const TrashIcon = ({ size = 20, color = "#EF4444" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M3 6H5H21" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const CloseIcon = ({ size = 24, color = "#6B7280" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M18 6L6 18" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M6 6L18 18" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const DataInformationScreen = ({ navigation }) => {
  const [allData, setAllData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [doseDetails, setDoseDetails] = useState({
    firstDose: null,
    secondDose: null,
    thirdDose: null,
  });

  useEffect(() => {
    // Real-time listener for patients collection
    const q = query(collection(db, 'patients'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      // Fetch dose data and combine with patients
      const fetchAndCombineData = async () => {
        try {
          const data = [];
          
          // Fetch all dose data first
          const secondDoseSnapshot = await getDocs(collection(db, 'second_dose'));
          const thirdDoseSnapshot = await getDocs(collection(db, 'Thrid_dose'));
          
          const secondDoseMap = {};
          const thirdDoseMap = {};
          
          secondDoseSnapshot.forEach((doc) => {
            const doseData = doc.data();
            secondDoseMap[doseData.patientId || doc.id] = doseData;
          });
          
          thirdDoseSnapshot.forEach((doc) => {
            const doseData = doc.data();
            thirdDoseMap[doseData.patientId || doc.id] = doseData;
          });
          
          // Combine patient data with dose information
          snapshot.forEach((doc) => {
            const patientData = doc.data();
            const patientId = doc.id;
            
            data.push({
              id: patientId,
              ...patientData,
              secondDoseInfo: secondDoseMap[patientId],
              thirdDoseInfo: thirdDoseMap[patientId],
            });
          });

          setAllData(data);
          setFilteredData(data);
          setLoading(false);
        } catch (error) {
          console.error('Error fetching dose data:', error);
          setLoading(false);
        }
      };
      
      fetchAndCombineData();
    }, (error) => {
      console.error('Error fetching data:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredData(allData);
    } else {
      const filtered = allData.filter(item => 
        item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.phone?.includes(searchQuery) ||
        item.id?.includes(searchQuery)
      );
      setFilteredData(filtered);
    }
  }, [searchQuery, allData]);

  const fetchDoseDetails = async (patientId) => {
    try {
      // Fetch second dose
      const secondDoseDoc = await getDoc(doc(db, 'second_dose', patientId));
      const secondDoseData = secondDoseDoc.exists() ? secondDoseDoc.data() : null;

      // Fetch third dose
      const thirdDoseDoc = await getDoc(doc(db, 'Thrid_dose', patientId));
      const thirdDoseData = thirdDoseDoc.exists() ? thirdDoseDoc.data() : null;

      return {
        secondDose: secondDoseData,
        thirdDose: thirdDoseData,
      };
    } catch (error) {
      console.error('Error fetching dose details:', error);
      return { secondDose: null, thirdDose: null };
    }
  };

  const handleViewDetails = async (record) => {
    setSelectedRecord(record);
    setLoading(true);
    const doses = await fetchDoseDetails(record.id);
    setDoseDetails({
      firstDose: record,
      secondDose: doses.secondDose,
      thirdDose: doses.thirdDose,
    });
    setLoading(false);
    setModalVisible(true);
  };

  const handleDeleteRecord = async (recordId, recordName) => {
    Alert.alert(
      'Delete Record',
      `Are you sure you want to delete ${recordName}'s record? This will delete all dose information and cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // Delete from patients collection
              await deleteDoc(doc(db, 'patients', recordId));
              
              // Try to delete from second_dose collection
              try {
                await deleteDoc(doc(db, 'second_dose', recordId));
              } catch (e) {
                console.log('No second dose record found');
              }
              
              // Try to delete from Thrid_dose collection
              try {
                await deleteDoc(doc(db, 'Thrid_dose', recordId));
              } catch (e) {
                console.log('No third dose record found');
              }

              Alert.alert('Success', 'Record deleted successfully');
            } catch (error) {
              console.error('Error deleting record:', error);
              Alert.alert('Error', 'Failed to delete record');
            }
          }
        }
      ]
    );
  };

  const getStatusInfo = (record) => {
    // Check for third dose completion
    if (record.thirdDoseInfo || record.thirdDoseDate) {
      return { status: 'Completed', color: '#10B981', bgColor: '#D1FAE5', doses: '3/3' };
    } 
    // Check for second dose completion
    else if (record.secondDoseInfo || record.secondDoseDate) {
      return { status: 'Pending', color: '#F59E0B', bgColor: '#FEF3C7', doses: '2/3' };
    } 
    // Check for first dose completion
    else if (record.firstDoseDate || record.doseZeroDate) {
      return { status: 'Pending', color: '#F59E0B', bgColor: '#FEF3C7', doses: '1/3' };
    } 
    // No doses recorded
    else {
      return { status: 'Not Started', color: '#EF4444', bgColor: '#FEE2E2', doses: '0/3' };
    }
  };

  const renderDataCard = ({ item }) => {
    const statusInfo = getStatusInfo(item);

    return (
      <View style={styles.dataCard}>
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <Text style={styles.cardName}>{item.name}</Text>
            <Text style={styles.cardId}>ID: {item.id}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusInfo.bgColor }]}>
            <Text style={[styles.statusText, { color: statusInfo.color }]}>
              {statusInfo.doses}
            </Text>
          </View>
        </View>

        <View style={styles.cardDivider} />

        <View style={styles.cardDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Department:</Text>
            <Text style={styles.detailValue}>{item.department || 'N/A'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Phone:</Text>
            <Text style={styles.detailValue}>{item.phone || item.phoneNumber || 'N/A'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Created:</Text>
            <Text style={styles.detailValue}>
              {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}
            </Text>
          </View>
        </View>

        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.viewButton}
            onPress={() => handleViewDetails(item)}
          >
            <EyeIcon size={18} color="#3B82F6" />
            <Text style={styles.viewButtonText}>View Details</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteRecord(item.id, item.name)}
          >
            <TrashIcon size={18} color="#EF4444" />
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#3B82F6" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ChevronLeftIcon size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Data Information</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <SearchIcon size={20} color="#6B7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, department, phone, ID..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Count */}
      <View style={styles.countContainer}>
        <DatabaseIcon size={20} color="#3B82F6" />
        <Text style={styles.countText}>
          Total Records: <Text style={styles.countNumber}>{filteredData.length}</Text>
        </Text>
      </View>

      {/* Data List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Loading data...</Text>
        </View>
      ) : filteredData.length === 0 ? (
        <View style={styles.emptyContainer}>
          <DatabaseIcon size={64} color="#D1D5DB" />
          <Text style={styles.emptyText}>
            {searchQuery ? 'No records found' : 'No data available'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredData}
          renderItem={renderDataCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Details Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Complete Record Details</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <CloseIcon size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {selectedRecord && (
                <>
                  {/* Patient Info */}
                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Patient Information</Text>
                    <View style={styles.modalInfoCard}>
                      <View style={styles.modalInfoRow}>
                        <Text style={styles.modalLabel}>Name:</Text>
                        <Text style={styles.modalValue}>{selectedRecord.name}</Text>
                      </View>
                      <View style={styles.modalInfoRow}>
                        <Text style={styles.modalLabel}>Age:</Text>
                        <Text style={styles.modalValue}>{selectedRecord.age || 'N/A'}</Text>
                      </View>
                      <View style={styles.modalInfoRow}>
                        <Text style={styles.modalLabel}>Gender:</Text>
                        <Text style={styles.modalValue}>{selectedRecord.gender || 'N/A'}</Text>
                      </View>
                      <View style={styles.modalInfoRow}>
                        <Text style={styles.modalLabel}>Department:</Text>
                        <Text style={styles.modalValue}>{selectedRecord.department || 'N/A'}</Text>
                      </View>
                      <View style={styles.modalInfoRow}>
                        <Text style={styles.modalLabel}>Designation:</Text>
                        <Text style={styles.modalValue}>{selectedRecord.designation || 'N/A'}</Text>
                      </View>
                      <View style={styles.modalInfoRow}>
                        <Text style={styles.modalLabel}>Phone:</Text>
                        <Text style={styles.modalValue}>{selectedRecord.phone || selectedRecord.phoneNumber || 'N/A'}</Text>
                      </View>
                      <View style={styles.modalInfoRow}>
                        <Text style={styles.modalLabel}>Email:</Text>
                        <Text style={styles.modalValue}>{selectedRecord.email || selectedRecord.emailId || 'N/A'}</Text>
                      </View>
                      <View style={styles.modalInfoRow}>
                        <Text style={styles.modalLabel}>Record ID:</Text>
                        <Text style={styles.modalValue}>{selectedRecord.id}</Text>
                      </View>
                    </View>
                  </View>

                  {/* First Dose */}
                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>First Dose Information</Text>
                    <View style={[styles.modalInfoCard, styles.doseCard]}>
                      {(selectedRecord.firstDoseDate || selectedRecord.doseZeroDate) ? (
                        <>
                          <View style={styles.modalInfoRow}>
                            <Text style={styles.modalLabel}>Date:</Text>
                            <Text style={styles.modalValue}>
                              {selectedRecord.firstDoseDate || selectedRecord.doseZeroDate}
                            </Text>
                          </View>
                          <View style={styles.modalInfoRow}>
                            <Text style={styles.modalLabel}>Vaccine Type:</Text>
                            <Text style={styles.modalValue}>{selectedRecord.firstDoseVaccineType || 'N/A'}</Text>
                          </View>
                          <View style={styles.modalInfoRow}>
                            <Text style={styles.modalLabel}>Batch Number:</Text>
                            <Text style={styles.modalValue}>{selectedRecord.firstDoseBatchNumber || 'N/A'}</Text>
                          </View>
                          <View style={styles.modalInfoRow}>
                            <Text style={styles.modalLabel}>Side Effects:</Text>
                            <Text style={styles.modalValue}>{selectedRecord.firstDoseSideEffects || selectedRecord.sideEffects || 'None'}</Text>
                          </View>
                          <View style={styles.modalInfoRow}>
                            <Text style={styles.modalLabel}>Status:</Text>
                            <Text style={[styles.modalValue, { color: '#10B981', fontWeight: 'bold' }]}>
                              {selectedRecord.firstDoseStatus || 'Completed'}
                            </Text>
                          </View>
                        </>
                      ) : (
                        <Text style={styles.noDataText}>No first dose recorded</Text>
                      )}
                    </View>
                  </View>

                  {/* Second Dose */}
                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Second Dose Information</Text>
                    <View style={[styles.modalInfoCard, styles.doseCard]}>
                      {doseDetails.secondDose ? (
                        <>
                          <View style={styles.modalInfoRow}>
                            <Text style={styles.modalLabel}>Date:</Text>
                            <Text style={styles.modalValue}>
                              {doseDetails.secondDose.secondDoseDate || 'N/A'}
                            </Text>
                          </View>
                          <View style={styles.modalInfoRow}>
                            <Text style={styles.modalLabel}>Side Effects:</Text>
                            <Text style={styles.modalValue}>{doseDetails.secondDose.sideEffects || 'None'}</Text>
                          </View>
                          <View style={styles.modalInfoRow}>
                            <Text style={styles.modalLabel}>Third Dose Scheduled:</Text>
                            <Text style={styles.modalValue}>{doseDetails.secondDose.thirdDoseDate || 'N/A'}</Text>
                          </View>
                          <View style={styles.modalInfoRow}>
                            <Text style={styles.modalLabel}>Status:</Text>
                            <Text style={[styles.modalValue, { color: '#10B981', fontWeight: 'bold' }]}>
                              Completed
                            </Text>
                          </View>
                        </>
                      ) : (
                        <Text style={styles.noDataText}>No second dose recorded</Text>
                      )}
                    </View>
                  </View>

                  {/* Third Dose */}
                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Third Dose Information</Text>
                    <View style={[styles.modalInfoCard, styles.doseCard]}>
                      {doseDetails.thirdDose ? (
                        <>
                          <View style={styles.modalInfoRow}>
                            <Text style={styles.modalLabel}>Date:</Text>
                            <Text style={styles.modalValue}>
                              {doseDetails.thirdDose.thirdDoseDate || 'N/A'}
                            </Text>
                          </View>
                          <View style={styles.modalInfoRow}>
                            <Text style={styles.modalLabel}>Batch Number:</Text>
                            <Text style={styles.modalValue}>{doseDetails.thirdDose.batchNumber || 'N/A'}</Text>
                          </View>
                          <View style={styles.modalInfoRow}>
                            <Text style={styles.modalLabel}>Side Effects:</Text>
                            <Text style={styles.modalValue}>{doseDetails.thirdDose.sideEffects || 'None'}</Text>
                          </View>
                          <View style={styles.modalInfoRow}>
                            <Text style={styles.modalLabel}>Certificate Number:</Text>
                            <Text style={styles.modalValue}>{doseDetails.thirdDose.certificateNumber || 'N/A'}</Text>
                          </View>
                          <View style={styles.modalInfoRow}>
                            <Text style={styles.modalLabel}>Certificate Issued:</Text>
                            <Text style={[styles.modalValue, { color: '#10B981', fontWeight: 'bold' }]}>
                              {doseDetails.thirdDose.certificateIssued ? 'Yes' : 'No'}
                            </Text>
                          </View>
                          <View style={styles.modalInfoRow}>
                            <Text style={styles.modalLabel}>Status:</Text>
                            <Text style={[styles.modalValue, { color: '#10B981', fontWeight: 'bold' }]}>
                              Completed
                            </Text>
                          </View>
                        </>
                      ) : (
                        <Text style={styles.noDataText}>No third dose recorded</Text>
                      )}
                    </View>
                  </View>
                </>
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalCloseButtonText}>Close</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalDeleteButton}
                onPress={() => {
                  setModalVisible(false);
                  handleDeleteRecord(selectedRecord.id, selectedRecord.name);
                }}
              >
                <TrashIcon size={18} color="#FFFFFF" />
                <Text style={styles.modalDeleteButtonText}>Delete Record</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    backgroundColor: '#3B82F6',
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#3B82F6',
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    gap: 8,
  },
  countText: {
    fontSize: 15,
    color: '#6B7280',
    fontWeight: '500',
  },
  countNumber: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: 'bold',
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
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 16,
  },
  listContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  dataCard: {
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
    borderColor: '#E5E7EB',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardHeaderLeft: {
    flex: 1,
  },
  cardName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  cardId: {
    fontSize: 11,
    color: '#9CA3AF',
    fontFamily: 'monospace',
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
  cardDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 12,
  },
  cardDetails: {
    gap: 8,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailLabel: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 13,
    color: '#1F2937',
    fontWeight: '400',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  viewButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  viewButtonText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '600',
  },
  deleteButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  deleteButtonText: {
    fontSize: 14,
    color: '#EF4444',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  modalBody: {
    maxHeight: '70%',
  },
  modalSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3B82F6',
    marginBottom: 12,
  },
  modalInfoCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    gap: 10,
  },
  doseCard: {
    backgroundColor: '#EFF6FF',
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  modalInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  modalLabel: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
    flex: 1,
  },
  modalValue: {
    fontSize: 13,
    color: '#1F2937',
    fontWeight: '400',
    flex: 1,
    textAlign: 'right',
  },
  noDataText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  modalCloseButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    fontSize: 15,
    color: '#6B7280',
    fontWeight: '600',
  },
  modalDeleteButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#EF4444',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  modalDeleteButtonText: {
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default DataInformationScreen;
