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

// Trophy Icon for completion
const TrophyIcon = () => (
  <Svg width={50} height={50} viewBox="0 0 24 24" fill="none">
    <Path
      d="M20 7h-5V4c0-1.1-.9-2-2-2H9c-1.1 0-2 .9-2 2v3H2v4c0 2.21 1.79 4 4 4h.69l1.66 5.69c.18.61.75 1.03 1.39 1.03h6.52c.64 0 1.21-.42 1.39-1.03L19.31 15H20c2.21 0 4-1.79 4-4V7h-4zM6 13c-1.1 0-2-.9-2-2V9h3v4H6zm13 0h-1V9h3v2c0 1.1-.9 2-2 2z"
      fill="#FFA000"
    />
  </Svg>
);

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

export default function ThirdDoseEntryScreen({ navigation, route }) {
  // Get today's date in DD/MM/YYYY format
  const getTodayDate = () => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Calculate date after 2 months
  const getDateAfterTwoMonths = (dateString) => {
    if (!dateString) return '';
    
    try {
      const [day, month, year] = dateString.split('/');
      const date = new Date(year, month - 1, day);
      
      // Add 2 months
      date.setMonth(date.getMonth() + 2);
      
      const newDay = String(date.getDate()).padStart(2, '0');
      const newMonth = String(date.getMonth() + 1).padStart(2, '0');
      const newYear = date.getFullYear();
      
      return `${newDay}/${newMonth}/${newYear}`;
    } catch (error) {
      return '';
    }
  };

  const [patientId, setPatientId] = useState('');
  const [thirdDoseDate, setThirdDoseDate] = useState(getTodayDate());
  const [antiHBsDate, setAntiHBsDate] = useState(getDateAfterTwoMonths(getTodayDate()));
  const [sideEffects, setSideEffects] = useState('');
  const [errors, setErrors] = useState({});

  // Autocomplete states
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  // Success animation state
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const handleDoseSwitch = (doseNumber) => {
    if (doseNumber === 1) {
      navigation.navigate('FirstDoseEntry');
    } else if (doseNumber === 2) {
      navigation.navigate('SecondDoseEntry');
    }
    // If doseNumber === 3, stay on current screen (ThirdDoseEntry)
  };

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
      const patientsRef = collection(db, 'patients');
      const q = query(patientsRef);
      const querySnapshot = await getDocs(q);
      
      console.log('Total patients in database:', querySnapshot.size);
      
      const results = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const patientName = data.name || '';
        
        // Case-insensitive search
        if (patientName.toLowerCase().includes(searchText.toLowerCase())) {
          results.push({
            id: doc.id,
            ...data,
          });
        }
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

    if (!thirdDoseDate.trim()) {
      newErrors.thirdDoseDate = 'Third dose date is required';
    } else {
      const datePattern = /^(\d{2})\/(\d{2})\/(\d{4})$/;
      if (!datePattern.test(thirdDoseDate.trim())) {
        newErrors.thirdDoseDate = 'Date must be in DD/MM/YYYY format';
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

    const dose3Data = {
      patientId,
      thirdDoseDate,
      antiHBsDate,
      sideEffects,
      createdAt: serverTimestamp(),
      recordedAt: new Date().toISOString(),
    };

    try {
      const uid = 'igHZxc2fPieFyTz3KPYt'; // Fixed UID
      
      // Save to Firestore using UID as document ID in Thrid_dose collection
      await setDoc(doc(db, 'Thrid_dose', uid), dose3Data);
      
      console.log('Third dose saved successfully to Thrid_dose collection with UID:', uid);

      // Log coordinator activity for third dose entry
      try {
        const userId = auth.currentUser?.uid;
        console.log('Current user ID:', userId);
        
        if (userId) {
          const coordinatorDocRef = doc(db, 'coordinator_login_info', userId);
          const coordinatorDoc = await getDoc(coordinatorDocRef);
          
          let userData = null;
          let userType = 'user';
          
          console.log('Coordinator doc exists:', coordinatorDoc.exists());
          
          if (coordinatorDoc.exists()) {
            userData = coordinatorDoc.data();
            userType = 'coordinator';
            console.log('Recording as coordinator:', userData);
          } else {
            // Check users collection
            const userDocRef = doc(db, 'users', userId);
            const userDoc = await getDoc(userDocRef);
            
            if (userDoc.exists()) {
              userData = userDoc.data();
              console.log('Recording as regular user:', userData);
            } else {
              // Use auth email as fallback
              userData = {
                name: auth.currentUser?.email?.split('@')[0] || 'Unknown',
                email: auth.currentUser?.email || 'unknown@email.com',
              };
              console.log('Using fallback user data:', userData);
            }
          }
          
          if (userData) {
            const activityData = {
              coordinatorId: userId,
              coordinatorName: userData.name || userData.fullName || userData.username || 'Unknown',
              coordinatorEmail: userData.email,
              activityType: 'dose_entry',
              doseType: 'third_dose',
              patientId: patientId,
              userType: userType,
              timestamp: serverTimestamp(),
              date: new Date().toISOString(),
            };
            
            console.log('Activity data to save:', activityData);
            
            const docRef = await addDoc(collection(db, 'coordinator_activity'), activityData);
            
            console.log('Third dose entry activity logged with ID:', docRef.id);
          }
        } else {
          console.log('No authenticated user found');
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
            {/* Trophy Icon */}
            <View style={styles.trophyCircle}>
              <Svg width={80} height={80} viewBox="0 0 24 24">
                <Circle cx="12" cy="12" r="10" fill="#FFA000" />
                <Path
                  d="M20 7h-5V4c0-1.1-.9-2-2-2H9c-1.1 0-2 .9-2 2v3H2v4c0 2.21 1.79 4 4 4h.69l1.66 5.69c.18.61.75 1.03 1.39 1.03h6.52c.64 0 1.21-.42 1.39-1.03L19.31 15H20c2.21 0 4-1.79 4-4V7h-4z"
                  fill="#FFF"
                />
              </Svg>
            </View>
            
            {/* Success Message */}
            <Text style={styles.successTitleThird}>🎉 Congratulations! 🎉</Text>
            <Text style={styles.successMessage}>
              Your Third Dose is Completed!
            </Text>
            <Text style={styles.successSubtext}>
              You have completed all 3 doses of Hepatitis B vaccination!
              Your certificate is now available.
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
        <Timeline currentStep={3} onStepPress={handleDoseSwitch} />

        {/* Header */}
        <View style={styles.header}>
          <TrophyIcon />
          <Text style={styles.title}>Third & Final Dose</Text>
          <Text style={styles.subtitle}>
            Complete your Hepatitis B vaccination journey!
          </Text>
        </View>

        {/* Congratulations Box */}
        <View style={styles.congratsBox}>
          <Text style={styles.congratsIcon}>🎊</Text>
          <View style={styles.congratsContent}>
            <Text style={styles.congratsTitle}>Almost There!</Text>
            <Text style={styles.congratsText}>
              This is your final dose. After recording this, you'll receive your completion certificate!
            </Text>
          </View>
        </View>

        {/* Info Alert */}
        <View style={styles.alertBox}>
          <Text style={styles.alertIcon}>⏰</Text>
          <View style={styles.alertContent}>
            <Text style={styles.alertTitle}>Timing Reminder</Text>
            <Text style={styles.alertText}>
              Third dose should be taken 6 months after the first dose
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

          {/* Date of Administration of Third Dose */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              Date of Administration of third dose <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, errors.thirdDoseDate && styles.inputError]}
              placeholder="DD/MM/YYYY"
              placeholderTextColor="#9CA3AF"
              value={thirdDoseDate}
              onChangeText={(text) => {
                setThirdDoseDate(text);
                // Automatically calculate anti-HBs date when third dose date changes
                if (text.length === 10) {
                  const estimatedDate = getDateAfterTwoMonths(text);
                  setAntiHBsDate(estimatedDate);
                }
                if (errors.thirdDoseDate) {
                  setErrors({ ...errors, thirdDoseDate: null });
                }
              }}
              keyboardType="numeric"
              maxLength={10}
            />
            {errors.thirdDoseDate && (
              <Text style={styles.errorText}>{errors.thirdDoseDate}</Text>
            )}
          </View>

          {/* Estimated Anti-HBs Titre Date */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              Estimated date of anti - HBs titre (after two months)
            </Text>
            <TextInput
              style={styles.input}
              placeholder="DD/MM/YYYY"
              placeholderTextColor="#9CA3AF"
              value={antiHBsDate}
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

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Text style={styles.infoIcon}>✅</Text>
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>What's Next?</Text>
            <Text style={styles.infoText}>
              After completing all doses, you should get an Anti-HBs titre test after 1-2 months to confirm immunity. We'll remind you!
            </Text>
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
            style={styles.saveButton}
            onPress={handleSave}
            activeOpacity={0.8}
          >
            <Text style={styles.saveButtonText}>Complete ✓</Text>
          </TouchableOpacity>
        </View>
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
  congratsBox: {
    flexDirection: 'row',
    backgroundColor: '#FFF3E0',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FFA000',
  },
  congratsIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  congratsContent: {
    flex: 1,
  },
  congratsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f1923',
    marginBottom: 6,
  },
  congratsText: {
    fontSize: 14,
    color: '#0f1923',
    lineHeight: 20,
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
    backgroundColor: '#E8F5E9',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
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
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successModalContent: {
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
  trophyCircle: {
    marginBottom: 24,
  },
  successTitleThird: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFA000',
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
