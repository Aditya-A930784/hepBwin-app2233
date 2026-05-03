import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Modal,
  Animated,
  FlatList,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Svg, { Path, Circle } from 'react-native-svg';
import { db, auth } from '../config/firebase';
import { doc, setDoc, serverTimestamp, getDoc, addDoc, collection, query, where, getDocs } from 'firebase/firestore';
import DoseHistoryCard from '../components/DoseHistoryCard';
import { fetchEligiblePatientsForDose, getPatientDoseHistory, saveSecondDoseRecord } from '../services/vaccinationFlow';

// Syringe Icon
const SyringeIcon = ({ filled = false }) => (
  <Svg width={40} height={40} viewBox="0 0 24 24" fill="none">
    <Path
      d="M14.5 3l2.5 2.5-1.4 1.4L17 8.3l1.4-1.4 1.4 1.4L18.4 10l1.4 1.4-1.4 1.4-1.4-1.4-8.5 8.5c-.4.4-1 .4-1.4 0l-5-5c-.4-.4-.4-1 0-1.4L11.6 5l-1.4-1.4L11.6 2 13 3.4 14.4 2l.1 1z"
      fill={filled ? '#4CAF50' : '#9CA3AF'}
    />
  </Svg>
);

// Timeline Component
const Timeline = ({ currentStep, onStepPress }) => {
  const steps = [
    { id: 1, label: 'Dose 1', active: currentStep >= 1, completed: currentStep > 1 },
    { id: 2, label: 'Dose 2', active: currentStep >= 2, completed: currentStep > 2 },
    { id: 3, label: 'Dose 3', active: currentStep >= 3, completed: currentStep > 3 },
  ];

  return (
    <View style={styles.timelineContainer}>
      {steps.map((step, index) => (
        <React.Fragment key={step.id}>
          <TouchableOpacity 
            style={styles.timelineStep}
            onPress={() => onStepPress(step.id)}
            activeOpacity={0.7}
          >
            <View style={[
              styles.timelineCircle,
              step.active && styles.timelineCircleActive,
              step.completed && styles.timelineCircleCompleted,
            ]}>
              {step.completed ? (
                <Svg width={20} height={20} viewBox="0 0 24 24">
                  <Path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="#FFFFFF" />
                </Svg>
              ) : (
                <Text style={[
                  styles.timelineNumber,
                  step.active && styles.timelineNumberActive,
                ]}>
                  {step.id}
                </Text>
              )}
            </View>
            <Text style={[
              styles.timelineLabel,
              step.active && styles.timelineLabelActive,
            ]}>
              {step.label}
            </Text>
          </TouchableOpacity>
          {index < steps.length - 1 && (
            <View style={[
              styles.timelineLine,
              currentStep > index + 1 && styles.timelineLineCompleted,
            ]} />
          )}
        </React.Fragment>
      ))}
    </View>
  );
};

export default function SecondDoseEntryScreen({ navigation, route }) {
  // Get today's date in DD/MM/YYYY format
  const getTodayDate = () => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Calculate date after 5 months for third dose
  const getDateAfterFiveMonths = (dateString) => {
    if (!dateString) return '';
    
    try {
      const [day, month, year] = dateString.split('/');
      const date = new Date(year, month - 1, day);
      
      // Add 5 months
      date.setMonth(date.getMonth() + 5);
      
      const newDay = String(date.getDate()).padStart(2, '0');
      const newMonth = String(date.getMonth() + 1).padStart(2, '0');
      const newYear = date.getFullYear();
      
      return `${newDay}/${newMonth}/${newYear}`;
    } catch (error) {
      return '';
    }
  };

  const [patientId, setPatientId] = useState('');
  const [secondDoseDate, setSecondDoseDate] = useState(getTodayDate());
  const [thirdDoseDate, setThirdDoseDate] = useState(getDateAfterFiveMonths(getTodayDate()));
  const [sideEffects, setSideEffects] = useState('');
  const [errors, setErrors] = useState({});

  // Autocomplete states
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [eligiblePatients, setEligiblePatients] = useState([]);
  const [doseHistory, setDoseHistory] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Success animation state
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const handleDoseSwitch = (doseNumber) => {
    if (doseNumber === 1) {
      navigation.navigate('FirstDoseEntry');
    } else if (doseNumber === 3) {
      if (!doseHistory?.dose2Date) {
        Alert.alert('Previous dose not completed', 'Dose 2 required');
        return;
      }
      navigation.navigate('ThirdDoseEntry');
    }
    // If doseNumber === 2, stay on current screen (SecondDoseEntry)
  };

  useEffect(() => {
    const loadEligiblePatients = async () => {
      try {
        const patients = await fetchEligiblePatientsForDose(2);
        setEligiblePatients(patients);
      } catch (error) {
        console.error('Error loading eligible patients for dose 2:', error);
      }
    };

    loadEligiblePatients();
  }, []);

  useEffect(() => {
    const loadDoseHistory = async () => {
      if (!selectedPatient?.id) {
        setDoseHistory(null);
        return;
      }

      setHistoryLoading(true);
      try {
        const history = await getPatientDoseHistory(selectedPatient.id);
        setDoseHistory(history);
      } catch (error) {
        console.error('Error loading dose history:', error);
        setDoseHistory(null);
      } finally {
        setHistoryLoading(false);
      }
    };

    loadDoseHistory();
  }, [selectedPatient]);

  // Success animation effect
  useEffect(() => {
    if (showSuccessAnimation) {
      // Animate in
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto dismiss after 5 seconds
      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start(() => {
          setShowSuccessAnimation(false);
          navigation.goBack();
        });
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [showSuccessAnimation]);

  // Search patients from database
  const searchPatients = async (searchText) => {
    if (!searchText || searchText.trim().length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    try {
      console.log('Searching for:', searchText);
      const results = eligiblePatients.filter((patient) => {
        const patientName = (patient.name || '').toLowerCase();
        const department = (patient.department || '').toLowerCase();
        const designation = (patient.designation || '').toLowerCase();
        const id = (patient.id || '').toLowerCase();
        const needle = searchText.toLowerCase();

        return (
          patientName.includes(needle) ||
          department.includes(needle) ||
          designation.includes(needle) ||
          id.includes(needle)
        );
      });

      console.log('Search results found:', results.length);
      
      setSearchResults(results);
      setShowDropdown(results.length > 0);
    } catch (error) {
      console.error('Error searching patients:', error);
    }
  };

  // Handle patient selection from dropdown
  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);
    setPatientId(patient.id);
    setShowDropdown(false);
    setSearchResults([]);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!patientId.trim()) {
      newErrors.patientId = 'Patient ID is required';
    }

    if (!secondDoseDate.trim()) {
      newErrors.secondDoseDate = 'Second dose date is required';
    } else {
      const datePattern = /^(\d{2})\/(\d{2})\/(\d{4})$/;
      if (!datePattern.test(secondDoseDate.trim())) {
        newErrors.secondDoseDate = 'Date must be in DD/MM/YYYY format';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      Alert.alert('Error', 'Please fill all required fields correctly');
      return;
    }

    if (!doseHistory?.dose1Date) {
      Alert.alert('Previous dose not completed', 'Dose 1 required');
      return;
    }

    const dose2Data = {
      patientId,
      secondDoseDate,
      thirdDoseDate,
      sideEffects,
      createdAt: serverTimestamp(),
      recordedAt: new Date().toISOString(),
    };

    try {
      setIsSaving(true);

      // Save to Firestore using patient ID as the document key
      await saveSecondDoseRecord(dose2Data);

      console.log('Second dose saved successfully for patient:', patientId);

      // Log coordinator activity for second dose entry
      try {
        const userId = auth.currentUser?.uid;
        console.log('Second dose - Current user ID:', userId);
        
        if (userId) {
          const coordinatorDocRef = doc(db, 'coordinator_login_info', userId);
          const coordinatorDoc = await getDoc(coordinatorDocRef);
          
          let userData = null;
          let userType = 'user';
          
          console.log('Second dose - Coordinator doc exists:', coordinatorDoc.exists());
          
          if (coordinatorDoc.exists()) {
            userData = coordinatorDoc.data();
            userType = 'coordinator';
            console.log('Second dose - Recording as coordinator');
          } else {
            const userDocRef = doc(db, 'users', userId);
            const userDoc = await getDoc(userDocRef);
            
            if (userDoc.exists()) {
              userData = userDoc.data();
              console.log('Second dose - Recording as regular user');
            } else {
              userData = {
                name: auth.currentUser?.email?.split('@')[0] || 'Unknown',
                email: auth.currentUser?.email || 'unknown@email.com',
              };
              console.log('Second dose - Using fallback data');
            }
          }
          
          if (userData) {
            const activityData = {
              coordinatorId: userId,
              coordinatorName: userData.name || userData.fullName || userData.username || 'Unknown',
              coordinatorEmail: userData.email,
              activityType: 'dose_entry',
              doseType: 'second_dose',
              patientId: patientId,
              userType: userType,
              timestamp: serverTimestamp(),
              date: new Date().toISOString(),
            };
            
            console.log('Second dose - Activity data:', activityData);
            
            const docRef = await addDoc(collection(db, 'coordinator_activity'), activityData);
            
            console.log('Second dose entry activity logged with ID:', docRef.id);
          }
        } else {
          console.log('Second dose - No authenticated user');
        }
      } catch (logError) {
        console.error('Error logging dose entry activity:', logError);
        console.error('Error details:', logError.message, logError.code);
      }

      // Show success animation
      setShowSuccessAnimation(true);
    } catch (error) {
      console.error('Error saving dose:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      Alert.alert('Error', `Failed to save dose: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar style="dark" />
      
      {/* Success Animation Modal */}
      <Modal
        visible={showSuccessAnimation}
        transparent={true}
        animationType="none"
      >
        <View style={styles.successModalOverlay}>
          <Animated.View 
            style={[
              styles.successModalContent,
              {
                opacity: opacityAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            {/* Checkmark Circle */}
            <View style={styles.checkmarkCircle}>
              <Svg width={80} height={80} viewBox="0 0 24 24">
                <Circle cx="12" cy="12" r="10" fill="#4CAF50" />
                <Path
                  d="M9 12l2 2 4-4"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </Svg>
            </View>
            
            {/* Success Message */}
            <Text style={styles.successTitle}>Success!</Text>
            <Text style={styles.successMessage}>
              Your Second Dose is Completed!
            </Text>
            <Text style={styles.successSubtext}>
              Remember to get your third dose after 5 months
            </Text>
          </Animated.View>
        </View>
      </Modal>
      
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Timeline */}
        <Timeline currentStep={2} onStepPress={handleDoseSwitch} />

        {/* Header */}
        <View style={styles.header}>
          <SyringeIcon filled={true} />
          <Text style={styles.title}>Second Dose Entry</Text>
          <Text style={styles.subtitle}>
            Record your second Hepatitis B vaccination dose
          </Text>
        </View>

        {historyLoading ? (
          <View style={styles.historyLoadingCard}>
            <Text style={styles.historyLoadingText}>Loading dose history...</Text>
          </View>
        ) : doseHistory ? (
          <DoseHistoryCard history={doseHistory} currentDose={2} title="Dose 2 History" />
        ) : (
          <View style={styles.historyHintCard}>
            <Text style={styles.historyHintTitle}>Select an eligible patient</Text>
            <Text style={styles.historyHintText}>
              Dose 2 is available only for patients who already completed Dose 1.
            </Text>
          </View>
        )}

        {/* Info Alert */}
        <View style={styles.alertBox}>
          <Text style={styles.alertIcon}>⏰</Text>
          <View style={styles.alertContent}>
            <Text style={styles.alertTitle}>Timing Reminder</Text>
            <Text style={styles.alertText}>
              Second dose should be taken 1 month (30 days) after the first dose
            </Text>
          </View>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Patient ID / Find with Autocomplete */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              Find <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, errors.patientId && styles.inputError]}
              placeholder="Search patient by name"
              placeholderTextColor="#9CA3AF"
              value={selectedPatient ? selectedPatient.name : patientId}
              onChangeText={(text) => {
                setPatientId(text);
                setSelectedPatient(null);
                searchPatients(text);
                if (errors.patientId) {
                  setErrors({ ...errors, patientId: null });
                }
              }}
              autoCapitalize="words"
            />
            {errors.patientId && (
              <Text style={styles.errorText}>{errors.patientId}</Text>
            )}
            {/* Show search status */}
            {patientId.length >= 2 && !showDropdown && !selectedPatient && (
              <Text style={styles.searchingText}>Searching...</Text>
            )}
            {/* Show selected patient info */}
            {selectedPatient && (
              <View style={styles.selectedPatientCard}>
                <Text style={styles.selectedPatientName}>{selectedPatient.name}</Text>
                <Text style={styles.selectedPatientDetails}>
                  {selectedPatient.department} • {selectedPatient.designation}
                </Text>
                <Text style={styles.selectedPatientId}>ID: {selectedPatient.id}</Text>
              </View>
            )}
          </View>
            
          {/* Autocomplete Dropdown */}
          {showDropdown && searchResults.length > 0 && (
            <View style={styles.dropdownContainer}>
              <Text style={styles.dropdownHeader}>Select Patient ({searchResults.length} found)</Text>
              <ScrollView 
                nestedScrollEnabled
                keyboardShouldPersistTaps="handled"
                style={styles.dropdownScroll}
              >
                {searchResults.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.dropdownItem}
                    onPress={() => handlePatientSelect(item)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.dropdownItemName}>{item.name}</Text>
                    <Text style={styles.dropdownItemDetails}>
                      {item.department || 'N/A'} • {item.designation || 'N/A'}
                    </Text>
                    <Text style={styles.dropdownItemId}>ID: {item.id}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Date of Administration of Second Dose */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              Date of Administration of second dose <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, errors.secondDoseDate && styles.inputError]}
              placeholder="DD/MM/YYYY"
              placeholderTextColor="#9CA3AF"
              value={secondDoseDate}
              onChangeText={(text) => {
                setSecondDoseDate(text);
                // Automatically calculate third dose date when second dose date changes
                if (text.length === 10) {
                  const estimatedDate = getDateAfterFiveMonths(text);
                  setThirdDoseDate(estimatedDate);
                }
                if (errors.secondDoseDate) {
                  setErrors({ ...errors, secondDoseDate: null });
                }
              }}
              keyboardType="numeric"
              maxLength={10}
            />
            {errors.secondDoseDate && (
              <Text style={styles.errorText}>{errors.secondDoseDate}</Text>
            )}
          </View>

          {/* Estimated Third Dose Date */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              Estimated date of third dose (after six months)
            </Text>
            <TextInput
              style={styles.input}
              placeholder="DD/MM/YYYY"
              placeholderTextColor="#9CA3AF"
              value={thirdDoseDate}
              editable={false}
            />
          </View>

          {/* Side Effects */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Any side effects observed</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe any side effects..."
              placeholderTextColor="#9CA3AF"
              value={sideEffects}
              onChangeText={setSideEffects}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Navigation Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
            activeOpacity={0.8}
          >
            <Text style={styles.backButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.saveButton,
              (!selectedPatient || !doseHistory?.dose1Date || isSaving) && styles.saveButtonDisabled,
            ]}
            onPress={handleSave}
            disabled={!selectedPatient || !doseHistory?.dose1Date || isSaving}
            activeOpacity={0.8}
          >
            <Text style={styles.saveButtonText}>Mark Dose 2 Complete</Text>
          </TouchableOpacity>
        </View>
        {selectedPatient && !doseHistory?.dose1Date && (
          <Text style={styles.lockedMessage}>Previous dose not completed</Text>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
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
  timelineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    marginTop: 10,
  },
  timelineStep: {
    alignItems: 'center',
  },
  timelineCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0E6EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  timelineCircleActive: {
    backgroundColor: '#005A9C',
  },
  timelineCircleCompleted: {
    backgroundColor: '#4CAF50',
  },
  timelineNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  timelineNumberActive: {
    color: '#FFFFFF',
  },
  timelineLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  timelineLabelActive: {
    color: '#005A9C',
    fontWeight: '600',
  },
  timelineLine: {
    width: 60,
    height: 2,
    backgroundColor: '#E0E6EB',
    marginHorizontal: 8,
    marginBottom: 32,
  },
  timelineLineCompleted: {
    backgroundColor: '#4CAF50',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0f1923',
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  alertBox: {
    flexDirection: 'row',
    backgroundColor: '#FFF9E6',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#FFA000',
  },
  alertIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f1923',
    marginBottom: 4,
  },
  alertText: {
    fontSize: 14,
    color: '#0f1923',
    lineHeight: 20,
  },
  historyLoadingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  historyLoadingText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },
  historyHintCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  historyHintTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  historyHintText: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
  },
  form: {
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f1923',
    marginBottom: 8,
  },
  required: {
    color: '#D32F2F',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E6EB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#0f1923',
  },
  inputError: {
    borderColor: '#D32F2F',
  },
  genderContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  genderOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E6EB',
    borderRadius: 12,
    padding: 14,
  },
  genderOptionSelected: {
    borderColor: '#005A9C',
    backgroundColor: '#E6F0F7',
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    borderColor: '#005A9C',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#005A9C',
  },
  genderText: {
    fontSize: 15,
    color: '#666',
    fontWeight: '500',
  },
  genderTextSelected: {
    color: '#005A9C',
    fontWeight: '600',
  },
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 14,
    marginTop: 4,
  },
  searchingText: {
    color: '#3B82F6',
    fontSize: 13,
    marginTop: 4,
    fontStyle: 'italic',
  },
  selectedPatientCard: {
    backgroundColor: '#EFF6FF',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#3B82F6',
  },
  selectedPatientName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  selectedPatientDetails: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  selectedPatientId: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  // Autocomplete Dropdown Styles
  dropdownContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    maxHeight: 250,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 10,
    marginTop: -8,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  dropdownHeader: {
    padding: 12,
    backgroundColor: '#EFF6FF',
    fontWeight: '600',
    color: '#3B82F6',
    fontSize: 14,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  dropdownScroll: {
    maxHeight: 250,
  },
  dropdownItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    backgroundColor: '#FFFFFF',
  },
  dropdownItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  dropdownItemDetails: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  dropdownItemId: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
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
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  backButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#9CA3AF',
  },
  backButtonText: {
    color: '#666',
    fontSize: 18,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
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
  // Success Animation Modal Styles
  successModalOverlay: {
    flex: 1,
  saveButtonDisabled: {
    backgroundColor: '#94A3B8',
  },
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successModalContent: {
  lockedMessage: {
    marginTop: 12,
    textAlign: 'center',
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '600',
  },
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 40,
    alignItems: 'center',
    width: '85%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  checkmarkCircle: {
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 12,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 20,
    fontWeight: '600',
    color: '#0f1923',
    marginBottom: 8,
    textAlign: 'center',
  },
  successSubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});
