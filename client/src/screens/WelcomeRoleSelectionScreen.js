import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  Image,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Svg, { Path, Circle } from 'react-native-svg';

const { width } = Dimensions.get('window');

// Student Icon
const StudentIcon = () => (
  <Svg width="48" height="48" viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 14L21 9L12 4L3 9L12 14Z"
      stroke="#0f1923"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M12 14V20"
      stroke="#0f1923"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <Path
      d="M7 11.5V16C7 16 9 18 12 18C15 18 17 16 17 16V11.5"
      stroke="#0f1923"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Staff Icon
const StaffIcon = () => (
  <Svg width="48" height="48" viewBox="0 0 24 24" fill="none">
    <Path
      d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21"
      stroke="#0f1923"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle
      cx="12"
      cy="7"
      r="4"
      stroke="#0f1923"
      strokeWidth="2"
    />
  </Svg>
);

// Admin Icon
const AdminIcon = () => (
  <Svg width="48" height="48" viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
      stroke="#0f1923"
      strokeWidth="2"
    />
    <Path
      d="M12 16V12M12 8H12.01"
      stroke="#0f1923"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </Svg>
);

export default function WelcomeRoleSelectionScreen({ navigation }) {
  const [selectedRole, setSelectedRole] = useState(null);

  const roles = [
    {
      id: 'admin',
      title: 'Admin',
      description: 'System administration and management',
      icon: <AdminIcon />,
    },
    {
      id: 'coordinator',
      title: 'Coordinator',
      description: 'Manage your health records',
      icon: <StaffIcon />,
    },
  ];

  const handleContinue = () => {
    if (selectedRole) {
      // Route to different login screens based on role
      if (selectedRole === 'admin') {
        navigation.navigate('AdminLogin');
      } else {
        navigation.navigate('Login', { role: selectedRole });
      }
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require('../../hepbwin1.jpg')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Welcome to HepBwin</Text>
          <Text style={styles.subtitle}>
            Choose your role to get started
          </Text>
        </View>

        {/* Role Cards */}
        <View style={styles.rolesContainer}>
          {roles.map((role) => (
            <TouchableOpacity
              key={role.id}
              style={[
                styles.roleCard,
                selectedRole === role.id && styles.roleCardSelected,
              ]}
              onPress={() => setSelectedRole(role.id)}
              activeOpacity={0.7}
            >
              <View style={styles.iconContainer}>{role.icon}</View>
              <Text style={styles.roleTitle}>{role.title}</Text>
              <Text style={styles.roleDescription}>{role.description}</Text>
              
              {/* Radio Button */}
              <View style={styles.radioContainer}>
                <View
                  style={[
                    styles.radioOuter,
                    selectedRole === role.id && styles.radioOuterSelected,
                  ]}
                >
                  {selectedRole === role.id && (
                    <View style={styles.radioInner} />
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Continue Button */}
        <TouchableOpacity
          style={[
            styles.continueButton,
            !selectedRole && styles.continueButtonDisabled,
          ]}
          onPress={handleContinue}
          disabled={!selectedRole}
          activeOpacity={0.8}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4F7',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    // Note: elevation and shadowColor/shadowOffset/shadowOpacity/shadowRadius
    // are only valid for View components, not Image components
  },
  header: {
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#0f1923',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  rolesContainer: {
    marginBottom: 32,
  },
  roleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#E0E6EB',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  roleCardSelected: {
    borderColor: '#0f1923',
    backgroundColor: '#E6F0F7',
  },
  iconContainer: {
    marginBottom: 16,
  },
  roleTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f1923',
    marginBottom: 8,
  },
  roleDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  radioContainer: {
    marginTop: 8,
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuterSelected: {
    borderColor: '#0f1923',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#0f1923',
  },
  continueButton: {
    backgroundColor: '#0f1923',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#0f1923',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  continueButtonDisabled: {
    backgroundColor: '#9CA3AF',
    shadowOpacity: 0.1,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
});
