import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function ProfileManagement4Screen({ navigation, route }) {
  const [vaccinationStatus, setVaccinationStatus] = useState('');

  const vaccinationOptions = [
    { 
      id: 'not-started', 
      label: 'Not Started', 
      description: 'Haven\'t received any HepB vaccine dose yet' 
    },
    { 
      id: 'in-progress', 
      label: 'In Progress', 
      description: 'Received some doses, but not completed' 
    },
    { 
      id: 'completed', 
      label: 'Completed', 
      description: 'Completed all 3 doses of HepB vaccine' 
    },
    { 
      id: 'not-sure', 
      label: 'Not Sure', 
      description: 'Don\'t know my vaccination status' 
    },
  ];

  const handleNext = () => {
    if (!vaccinationStatus) {
      Alert.alert('Selection Required', 'Please select your vaccination status');
      return;
    }

    const step4Data = {
      vaccinationStatus,
    };

    navigation.navigate('ProfileManagement5', { 
      ...route.params,
      step4Data 
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
            <View style={[styles.progressFill, { width: '80%' }]} />
          </View>
          <Text style={styles.progressText}>Step 4 of 5</Text>
        </View>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Vaccination Status</Text>
          <Text style={styles.subtitle}>
            What is your current Hepatitis B vaccination status?
          </Text>
        </View>

        {/* Options */}
        <View style={styles.optionsContainer}>
          {vaccinationOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.optionCard,
                vaccinationStatus === option.id && styles.optionCardSelected,
              ]}
              onPress={() => setVaccinationStatus(option.id)}
              activeOpacity={0.7}
            >
              <View style={styles.radioContainer}>
                <View style={styles.radioOuter}>
                  {vaccinationStatus === option.id && (
                    <View style={styles.radioInner} />
                  )}
                </View>
              </View>
              <View style={styles.optionContent}>
                <Text style={[
                  styles.optionLabel,
                  vaccinationStatus === option.id && styles.optionLabelSelected,
                ]}>
                  {option.label}
                </Text>
                <Text style={styles.optionDescription}>
                  {option.description}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Text style={styles.infoIcon}>💉</Text>
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>About HepB Vaccination</Text>
            <Text style={styles.infoText}>
              The Hepatitis B vaccine is typically given in 3 doses:
            </Text>
            <Text style={styles.infoText}>• Dose 1: At birth or anytime</Text>
            <Text style={styles.infoText}>• Dose 2: 1 month after first dose</Text>
            <Text style={styles.infoText}>• Dose 3: 6 months after first dose</Text>
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
            style={[
              styles.nextButton,
              !vaccinationStatus && styles.nextButtonDisabled,
            ]}
            onPress={handleNext}
            activeOpacity={0.8}
            disabled={!vaccinationStatus}
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
    paddingHorizontal: 20,
  },
  optionsContainer: {
    marginBottom: 20,
  },
  optionCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#E0E6EB',
    alignItems: 'center',
  },
  optionCardSelected: {
    borderColor: '#005A9C',
    backgroundColor: '#E3F2FD',
  },
  radioContainer: {
    marginRight: 12,
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#005A9C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#005A9C',
  },
  optionContent: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f1923',
    marginBottom: 4,
  },
  optionLabelSelected: {
    color: '#005A9C',
  },
  optionDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#FFF9E6',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#FFA000',
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
    lineHeight: 20,
    marginBottom: 4,
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
  nextButtonDisabled: {
    backgroundColor: '#9CA3AF',
    opacity: 0.5,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});
