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
import Svg, { Path } from 'react-native-svg';

// Checkmark Icon
const CheckIcon = ({ size = 24, color = '#4CAF50' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"
      fill={color}
    />
  </Svg>
);

export default function ProfileManagement5Screen({ navigation, route }) {
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [dataShareAccepted, setDataShareAccepted] = useState(false);

  const handleComplete = () => {
    if (!termsAccepted || !privacyAccepted) {
      Alert.alert(
        'Consent Required', 
        'Please accept Terms & Conditions and Privacy Policy to continue'
      );
      return;
    }

    const step5Data = {
      termsAccepted,
      privacyAccepted,
      dataShareAccepted,
      completedAt: new Date().toISOString(),
    };

    // Show success message
    Alert.alert(
      'Profile Saved!',
      'Your profile has been successfully saved.',
      [
        {
          text: 'OK',
          onPress: () => {
            // Navigate back to Home with updated data
            navigation.navigate('Home', { 
              ...route.params,
              step5Data,
              profileComplete: true,
            });
          },
        },
      ]
    );
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
            <View style={[styles.progressFill, { width: '100%' }]} />
          </View>
          <Text style={styles.progressText}>Step 5 of 5</Text>
        </View>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Terms & Consent</Text>
          <Text style={styles.subtitle}>
            Please review and accept the following to complete your profile
          </Text>
        </View>

        {/* Consent Items */}
        <View style={styles.consentContainer}>
          {/* Terms & Conditions */}
          <TouchableOpacity
            style={styles.consentCard}
            onPress={() => setTermsAccepted(!termsAccepted)}
            activeOpacity={0.7}
          >
            <View style={styles.checkboxContainer}>
              <View style={[
                styles.checkbox,
                termsAccepted && styles.checkboxChecked,
              ]}>
                {termsAccepted && <CheckIcon size={20} color="#FFFFFF" />}
              </View>
            </View>
            <View style={styles.consentContent}>
              <Text style={styles.consentTitle}>
                Terms & Conditions <Text style={styles.required}>*</Text>
              </Text>
              <Text style={styles.consentDescription}>
                I agree to the terms and conditions of using HepBwin for vaccination tracking
              </Text>
              <TouchableOpacity>
                <Text style={styles.linkText}>Read Terms & Conditions</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>

          {/* Privacy Policy */}
          <TouchableOpacity
            style={styles.consentCard}
            onPress={() => setPrivacyAccepted(!privacyAccepted)}
            activeOpacity={0.7}
          >
            <View style={styles.checkboxContainer}>
              <View style={[
                styles.checkbox,
                privacyAccepted && styles.checkboxChecked,
              ]}>
                {privacyAccepted && <CheckIcon size={20} color="#FFFFFF" />}
              </View>
            </View>
            <View style={styles.consentContent}>
              <Text style={styles.consentTitle}>
                Privacy Policy <Text style={styles.required}>*</Text>
              </Text>
              <Text style={styles.consentDescription}>
                I understand how my personal and medical data will be stored and used
              </Text>
              <TouchableOpacity>
                <Text style={styles.linkText}>Read Privacy Policy</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>

          {/* Data Sharing (Optional) */}
          <TouchableOpacity
            style={styles.consentCard}
            onPress={() => setDataShareAccepted(!dataShareAccepted)}
            activeOpacity={0.7}
          >
            <View style={styles.checkboxContainer}>
              <View style={[
                styles.checkbox,
                dataShareAccepted && styles.checkboxChecked,
              ]}>
                {dataShareAccepted && <CheckIcon size={20} color="#FFFFFF" />}
              </View>
            </View>
            <View style={styles.consentContent}>
              <Text style={styles.consentTitle}>
                Anonymous Data Sharing (Optional)
              </Text>
              <Text style={styles.consentDescription}>
                I consent to share anonymous vaccination data for research and public health improvement
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Security Info */}
        <View style={styles.infoBox}>
          <Text style={styles.infoIcon}>🔒</Text>
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Your Data is Secure</Text>
            <Text style={styles.infoText}>
              All your personal and medical information is encrypted and stored securely. 
              We follow industry-standard security practices to protect your data.
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
            style={[
              styles.completeButton,
              (!termsAccepted || !privacyAccepted) && styles.completeButtonDisabled,
            ]}
            onPress={handleComplete}
            activeOpacity={0.8}
            disabled={!termsAccepted || !privacyAccepted}
          >
            <Text style={styles.completeButtonText}>Complete</Text>
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
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  progressText: {
    marginTop: 8,
    fontSize: 14,
    color: '#4CAF50',
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
    paddingHorizontal: 10,
  },
  consentContainer: {
    marginBottom: 20,
  },
  consentCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0E6EB',
  },
  checkboxContainer: {
    marginRight: 12,
    paddingTop: 2,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#005A9C',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxChecked: {
    backgroundColor: '#005A9C',
    borderColor: '#005A9C',
  },
  consentContent: {
    flex: 1,
  },
  consentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f1923',
    marginBottom: 6,
  },
  required: {
    color: '#D32F2F',
  },
  consentDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  linkText: {
    fontSize: 14,
    color: '#005A9C',
    fontWeight: '600',
    textDecorationLine: 'underline',
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
    borderColor: '#005A9C',
  },
  backButtonText: {
    color: '#005A9C',
    fontSize: 18,
    fontWeight: '600',
  },
  completeButton: {
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
  completeButtonDisabled: {
    backgroundColor: '#9CA3AF',
    opacity: 0.5,
  },
  completeButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});
