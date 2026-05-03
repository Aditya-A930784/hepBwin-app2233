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
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Svg, { Path, Circle } from 'react-native-svg';
import { auth, db } from '../config/firebase';
import { savePatientInfo } from '../services/firestore';
import { doc, getDoc, addDoc, collection, serverTimestamp, query, where, getDocs } from 'firebase/firestore';

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

export default function FirstDoseEntryScreen({ navigation, route }) {
  // Get today's date in DD/MM/YYYY format
  const getTodayDate = () => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Calculate date after one month
  const getDateAfterOneMonth = (dateString) => {
    if (!dateString) return '';
    
    try {
      const [day, month, year] = dateString.split('/');
      const date = new Date(year, month - 1, day);
      
      // Add one month
      date.setMonth(date.getMonth() + 1);
      
      const newDay = String(date.getDate()).padStart(2, '0');
      const newMonth = String(date.getMonth() + 1).padStart(2, '0');
      const newYear = date.getFullYear();
      
      return `${newDay}/${newMonth}/${newYear}`;
    } catch (error) {
      return '';
    }
  };

  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [department, setDepartment] = useState('');
  const [designation, setDesignation] = useState('');
  const [doseDate, setDoseDate] = useState(getTodayDate());
  const [phoneNumber, setPhoneNumber] = useState('');
  const [emailId, setEmailId] = useState('');
  const [secondDoseDate, setSecondDoseDate] = useState(getDateAfterOneMonth(getTodayDate()));
  const [errors, setErrors] = useState({});
  
  // Autocomplete states
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  
  // Success animation state
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const handleDoseSwitch = (doseNumber) => {
    if (doseNumber === 2) {
      navigation.navigate('SecondDoseEntry');
    } else if (doseNumber === 3) {
      navigation.navigate('ThirdDoseEntry');
    }
    // If doseNumber === 1, stay on current screen (FirstDoseEntry)
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
          navigation.navigate('Home', {
            ...route.params,
          });
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
      const patientsRef = collection(db, 'patients');
      const q = query(patientsRef);
      const querySnapshot = await getDocs(q);
      
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
      
      setSearchResults(results);
      setShowDropdown(results.length > 0);
    } catch (error) {
      console.error('Error searching patients:', error);
    }
  };

  // Handle patient selection from dropdown
  const handlePatientSelect = (patient) => {
    setSelectedPatientId(patient.id);
    setName(patient.name || '');
    setAge(patient.age || '');
    setGender(patient.gender || '');
    setDepartment(patient.department || '');
    setDesignation(patient.designation || '');
    setPhoneNumber(patient.phoneNumber || '');
    setEmailId(patient.emailId || '');
    
    setShowDropdown(false);
    setSearchResults([]);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!age.trim()) {
      newErrors.age = 'Age is required';
    } else if (isNaN(age) || parseInt(age) < 1 || parseInt(age) > 120) {
      newErrors.age = 'Please enter a valid age';
    }

    if (!gender.trim()) {
      newErrors.gender = 'Gender is required';
    }

    if (!department.trim()) {
      newErrors.department = 'Department is required';
    }

    if (!designation.trim()) {
      newErrors.designation = 'Designation is required';
    }

    if (!doseDate.trim()) {
      newErrors.doseDate = 'Date is required';
    } else {
      const datePattern = /^(\d{2})\/(\d{2})\/(\d{4})$/;
      if (!datePattern.test(doseDate.trim())) {
        newErrors.doseDate = 'Date must be in DD/MM/YYYY format';
      }
    }

    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (phoneNumber.length < 10) {
      newErrors.phoneNumber = 'Please enter a valid phone number';
    }

    if (!emailId.trim()) {
      newErrors.emailId = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(emailId)) {
      newErrors.emailId = 'Please enter a valid email';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      Alert.alert('Error', 'Please fill all required fields correctly');
      return;
    }

    const patientData = {
      name,
      age,
      gender,
      department,
      designation,
      doseZeroDate: doseDate,
      phoneNumber,
      emailId,
      estimatedSecondDoseDate: secondDoseDate,
    };

    try {
      // Save patient info to "patients" collection
      const result = await savePatientInfo(patientData);

      if (result.success) {
        // Log coordinator activity for first dose entry
        try {
          const userId = auth.currentUser?.uid;
          console.log('First dose - Current user ID:', userId);
          
          if (userId) {
            const coordinatorDocRef = doc(db, 'coordinator_login_info', userId);
            const coordinatorDoc = await getDoc(coordinatorDocRef);
            
            let userData = null;
            let userType = 'user';
            
            console.log('First dose - Coordinator doc exists:', coordinatorDoc.exists());
            
            if (coordinatorDoc.exists()) {
              userData = coordinatorDoc.data();
              userType = 'coordinator';
              console.log('First dose - Recording as coordinator');
            } else {
              const userDocRef = doc(db, 'users', userId);
              const userDoc = await getDoc(userDocRef);
              
              if (userDoc.exists()) {
                userData = userDoc.data();
                console.log('First dose - Recording as regular user');
              } else {
                userData = {
                  name: auth.currentUser?.email?.split('@')[0] || 'Unknown',
                  email: auth.currentUser?.email || 'unknown@email.com',
                };
                console.log('First dose - Using fallback data');
              }
            }
            
            if (userData) {
              const activityData = {
                coordinatorId: userId,
                coordinatorName: userData.name || userData.fullName || userData.username || 'Unknown',
                coordinatorEmail: userData.email,
                activityType: 'dose_entry',
                doseType: 'first_dose',
                patientId: result.patientId,
                patientName: name,
                userType: userType,
                timestamp: serverTimestamp(),
                date: new Date().toISOString(),
              };
              
              console.log('First dose - Activity data:', activityData);
              
              const docRef = await addDoc(collection(db, 'coordinator_activity'), activityData);
              
              console.log('First dose entry activity logged with ID:', docRef.id);
            }
          } else {
            console.log('First dose - No authenticated user');
          }
        } catch (logError) {
          console.error('Error logging dose entry activity:', logError);
          console.error('Error details:', logError.message, logError.code);
        }
        
        // Show success animation
        setShowSuccessAnimation(true);
      } else {
        Alert.alert('Error', 'Failed to save patient information. Please try again.');
      }
    } catch (error) {
      console.error('Error saving patient:', error);
      Alert.alert('Error', 'Failed to save patient information. Please try again.');
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
              Your First Dose is Completed!
            </Text>
            <Text style={styles.successSubtext}>
              Patient information has been recorded successfully
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
        <Timeline currentStep={1} onStepPress={handleDoseSwitch} />

        {/* Header */}
        <View style={styles.header}>
          <SyringeIcon filled={true} />
          <Text style={styles.title}>Patient Information</Text>
          <Text style={styles.subtitle}>
            Record patient details and first dose information
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Name with Autocomplete */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              Name <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, errors.name && styles.inputError]}
              placeholder="Enter or search patient name"
              placeholderTextColor="#9CA3AF"
              value={name}
              onChangeText={(text) => {
                setName(text);
                searchPatients(text);
                if (errors.name) {
                  setErrors({ ...errors, name: null });
                }
              }}
            />
            {errors.name && (
              <Text style={styles.errorText}>{errors.name}</Text>
            )}
            
            {/* Autocomplete Dropdown */}
            {showDropdown && searchResults.length > 0 && (
              <View style={styles.dropdownContainer}>
                {searchResults.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.dropdownItem}
                    onPress={() => handlePatientSelect(item)}
                  >
                    <Text style={styles.dropdownItemName}>{item.name}</Text>
                    <Text style={styles.dropdownItemDetails}>
                      {item.department} • {item.designation}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Age */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              Age <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, errors.age && styles.inputError]}
              placeholder="Enter your age"
              placeholderTextColor="#9CA3AF"
              value={age}
              onChangeText={(text) => {
                setAge(text);
                if (errors.age) {
                  setErrors({ ...errors, age: null });
                }
              }}
              keyboardType="numeric"
            />
            {errors.age && (
              <Text style={styles.errorText}>{errors.age}</Text>
            )}
          </View>

          {/* Gender */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              Gender <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.genderContainer}>
              <TouchableOpacity
                style={[
                  styles.genderOption,
                  gender === 'Male' && styles.genderOptionSelected,
                  errors.gender && styles.inputError,
                ]}
                onPress={() => {
                  setGender('Male');
                  if (errors.gender) {
                    setErrors({ ...errors, gender: null });
                  }
                }}
              >
                <View style={[
                  styles.radio,
                  gender === 'Male' && styles.radioSelected,
                ]}>
                  {gender === 'Male' && <View style={styles.radioInner} />}
                </View>
                <Text style={[
                  styles.genderText,
                  gender === 'Male' && styles.genderTextSelected,
                ]}>Male</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.genderOption,
                  gender === 'Female' && styles.genderOptionSelected,
                  errors.gender && styles.inputError,
                ]}
                onPress={() => {
                  setGender('Female');
                  if (errors.gender) {
                    setErrors({ ...errors, gender: null });
                  }
                }}
              >
                <View style={[
                  styles.radio,
                  gender === 'Female' && styles.radioSelected,
                ]}>
                  {gender === 'Female' && <View style={styles.radioInner} />}
                </View>
                <Text style={[
                  styles.genderText,
                  gender === 'Female' && styles.genderTextSelected,
                ]}>Female</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.genderOption,
                  gender === 'Other' && styles.genderOptionSelected,
                  errors.gender && styles.inputError,
                ]}
                onPress={() => {
                  setGender('Other');
                  if (errors.gender) {
                    setErrors({ ...errors, gender: null });
                  }
                }}
              >
                <View style={[
                  styles.radio,
                  gender === 'Other' && styles.radioSelected,
                ]}>
                  {gender === 'Other' && <View style={styles.radioInner} />}
                </View>
                <Text style={[
                  styles.genderText,
                  gender === 'Other' && styles.genderTextSelected,
                ]}>Other</Text>
              </TouchableOpacity>
            </View>
            {errors.gender && (
              <Text style={styles.errorText}>{errors.gender}</Text>
            )}
          </View>

          {/* Department */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              Department <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, errors.department && styles.inputError]}
              placeholder="Enter your department"
              placeholderTextColor="#9CA3AF"
              value={department}
              onChangeText={(text) => {
                setDepartment(text);
                if (errors.department) {
                  setErrors({ ...errors, department: null });
                }
              }}
            />
            {errors.department && (
              <Text style={styles.errorText}>{errors.department}</Text>
            )}
          </View>

          {/* Designation */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              Designation <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, errors.designation && styles.inputError]}
              placeholder="Enter your designation"
              placeholderTextColor="#9CA3AF"
              value={designation}
              onChangeText={(text) => {
                setDesignation(text);
                if (errors.designation) {
                  setErrors({ ...errors, designation: null });
                }
              }}
            />
            {errors.designation && (
              <Text style={styles.errorText}>{errors.designation}</Text>
            )}
          </View>

          {/* Date of Administration */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              Date of Administration of vaccine (Dose Zero) <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, errors.doseDate && styles.inputError]}
              placeholder="DD/MM/YYYY"
              placeholderTextColor="#9CA3AF"
              value={doseDate}
              onChangeText={(text) => {
                setDoseDate(text);
                // Automatically calculate second dose date when first dose date changes
                if (text.length === 10) {
                  const estimatedDate = getDateAfterOneMonth(text);
                  setSecondDoseDate(estimatedDate);
                }
                if (errors.doseDate) {
                  setErrors({ ...errors, doseDate: null });
                }
              }}
              keyboardType="numeric"
              maxLength={10}
            />
            {errors.doseDate && (
              <Text style={styles.errorText}>{errors.doseDate}</Text>
            )}
          </View>

          {/* Phone Number */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              Phone number <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, errors.phoneNumber && styles.inputError]}
              placeholder="Enter your phone number"
              placeholderTextColor="#9CA3AF"
              value={phoneNumber}
              onChangeText={(text) => {
                setPhoneNumber(text);
                if (errors.phoneNumber) {
                  setErrors({ ...errors, phoneNumber: null });
                }
              }}
              keyboardType="phone-pad"
            />
            {errors.phoneNumber && (
              <Text style={styles.errorText}>{errors.phoneNumber}</Text>
            )}
          </View>

          {/* Email */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              Email Id <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, errors.emailId && styles.inputError]}
              placeholder="Enter your email"
              placeholderTextColor="#9CA3AF"
              value={emailId}
              onChangeText={(text) => {
                setEmailId(text);
                if (errors.emailId) {
                  setErrors({ ...errors, emailId: null });
                }
              }}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {errors.emailId && (
              <Text style={styles.errorText}>{errors.emailId}</Text>
            )}
          </View>

          {/* Estimated Second Dose Date */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              Estimated date of second dose (after one month)
            </Text>
            <TextInput
              style={styles.input}
              placeholder="DD/MM/YYYY"
              placeholderTextColor="#9CA3AF"
              value={secondDoseDate}
              onChangeText={setSecondDoseDate}
              keyboardType="numeric"
              maxLength={10}
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
            style={styles.saveButton}
            onPress={handleSave}
            activeOpacity={0.8}
          >
            <Text style={styles.saveButtonText}>Save Dose</Text>
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
    marginBottom: 30,
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
  // Autocomplete Dropdown Styles
  dropdownContainer: {
    position: 'absolute',
    top: 80,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    maxHeight: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 1000,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  dropdownItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
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
