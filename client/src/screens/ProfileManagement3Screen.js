import React, { useState } from 'react';
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
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function ProfileManagement3Screen({ navigation, route }) {
  const [medicalId, setMedicalId] = useState('');
  const [hospitalName, setHospitalName] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!medicalId.trim()) {
      newErrors.medicalId = 'Medical/Student ID is required';
    }

    if (!hospitalName.trim()) {
      newErrors.hospitalName = 'Hospital/Clinic name is required';
    }

    // Doctor name is optional
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateForm()) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    const step3Data = {
      medicalId,
      hospitalName,
      doctorName,
    };

    navigation.navigate('ProfileManagement4', { 
      ...route.params,
      step3Data 
    });
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
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '60%' }]} />
          </View>
          <Text style={styles.progressText}>Step 3 of 5</Text>
        </View>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Medical Information</Text>
          <Text style={styles.subtitle}>
            Please provide your medical details
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Medical/Student ID */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              Medical/Student ID <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, errors.medicalId && styles.inputError]}
              placeholder="Enter your Medical or Student ID"
              placeholderTextColor="#9CA3AF"
              value={medicalId}
              onChangeText={(text) => {
                setMedicalId(text);
                if (errors.medicalId) {
                  setErrors({ ...errors, medicalId: null });
                }
              }}
              autoCapitalize="characters"
            />
            {errors.medicalId && (
              <Text style={styles.errorText}>{errors.medicalId}</Text>
            )}
            <Text style={styles.helperText}>
              This ID will be used to track your vaccination records
            </Text>
          </View>

          {/* Hospital/Clinic Name */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              Hospital/Clinic Name <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, errors.hospitalName && styles.inputError]}
              placeholder="Enter hospital or clinic name"
              placeholderTextColor="#9CA3AF"
              value={hospitalName}
              onChangeText={(text) => {
                setHospitalName(text);
                if (errors.hospitalName) {
                  setErrors({ ...errors, hospitalName: null });
                }
              }}
            />
            {errors.hospitalName && (
              <Text style={styles.errorText}>{errors.hospitalName}</Text>
            )}
          </View>

          {/* Doctor Name */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              Doctor/Physician Name (Optional)
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your doctor's name"
              placeholderTextColor="#9CA3AF"
              value={doctorName}
              onChangeText={setDoctorName}
            />
            <Text style={styles.helperText}>
              Name of the doctor who administered the vaccine
            </Text>
          </View>

          {/* Info Box */}
          <View style={styles.infoBox}>
            <Text style={styles.infoIcon}>ℹ️</Text>
            <Text style={styles.infoText}>
              Your medical information is kept secure and confidential. It will only be used for vaccination tracking purposes.
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
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.nextButton}
            onPress={handleNext}
            activeOpacity={0.8}
          >
            <Text style={styles.nextButtonText}>Next</Text>
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
  progressContainer: {
    marginBottom: 30,
    marginTop: 10,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E6EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#005A9C',
    borderRadius: 4,
  },
  progressText: {
    marginTop: 8,
    fontSize: 14,
    color: '#005A9C',
    fontWeight: '600',
    textAlign: 'center',
  },
  header: {
    marginBottom: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0f1923',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  form: {
    marginBottom: 30,
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
  errorText: {
    color: '#D32F2F',
    fontSize: 14,
    marginTop: 4,
  },
  helperText: {
    color: '#666',
    fontSize: 14,
    marginTop: 4,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    padding: 16,
    borderRadius: 12,
    marginTop: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#005A9C',
  },
  infoIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  infoText: {
    flex: 1,
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
    borderColor: '#005A9C',
  },
  backButtonText: {
    color: '#005A9C',
    fontSize: 18,
    fontWeight: '600',
  },
  nextButton: {
    flex: 1,
    backgroundColor: '#005A9C',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});
