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
  Image,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Svg, { Path } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../config/firebase';
import { doc, getDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';

// Gold Shield Icon Component matching the design
const GoldShieldIcon = ({ size = 80 }) => (
  <Svg width={size} height={size} viewBox="0 0 100 120" fill="none">
    {/* Shield Outline */}
    <Path
      d="M50 5 L85 20 L85 50 C85 75 70 95 50 115 C30 95 15 75 15 50 L15 20 Z"
      stroke="#D4AF37"
      strokeWidth="3"
      fill="#1a1a1a"
    />
    {/* Inner Shield */}
    <Path
      d="M50 15 L75 27 L75 50 C75 70 63 85 50 100 C37 85 25 70 25 50 L25 27 Z"
      fill="#2a2a2a"
    />
    {/* Letter H */}
    <Path
      d="M35 40 L35 70 M35 55 L45 55 M45 40 L45 70"
      stroke="#D4AF37"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Vertical bars on sides */}
    <Path
      d="M55 45 L55 65 M62 45 L62 65"
      stroke="#D4AF37"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
  </Svg>
);

export default function LoginScreen({ navigation }) {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!usernameOrEmail.trim()) {
      newErrors.usernameOrEmail = 'Username or email is required';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      // Sign in with Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(
        auth,
        usernameOrEmail.trim(),
        password
      );
      
      const userId = userCredential.user.uid;
      
      // Log coordinator login activity
      try {
        const coordinatorDocRef = doc(db, 'coordinator_login_info', userId);
        const coordinatorDoc = await getDoc(coordinatorDocRef);
        
        let userData = null;
        let userType = 'user';
        
        if (coordinatorDoc.exists()) {
          userData = coordinatorDoc.data();
          userType = 'coordinator';
          console.log('User logged in as coordinator');
        } else {
          // Check if user exists in users collection
          const userDocRef = doc(db, 'users', userId);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            userData = userDoc.data();
            console.log('User logged in as regular user');
          } else {
            // Create a basic user entry
            userData = {
              name: usernameOrEmail.split('@')[0],
              email: usernameOrEmail.trim(),
            };
            console.log('New user, created basic profile');
          }
        }
        
        if (userData) {
          // Create activity log entry
          await addDoc(collection(db, 'coordinator_activity'), {
            coordinatorId: userId,
            coordinatorName: userData.name || userData.fullName || userData.username || usernameOrEmail.split('@')[0],
            coordinatorEmail: userData.email || usernameOrEmail.trim(),
            activityType: 'login',
            userType: userType,
            timestamp: serverTimestamp(),
            date: new Date().toISOString(),
          });
          
          // Store login timestamp for 12-hour expiration
          await AsyncStorage.setItem('loginTimestamp', new Date().getTime().toString());
          
          console.log('Login activity logged successfully as', userType);
        }
      } catch (logError) {
        console.error('Error logging coordinator activity:', logError);
        // Continue with login even if activity logging fails
      }
      
      setIsLoading(false);
      // Navigate to Home after successful login
      navigation.navigate('Home', { userId: userId });
      
    } catch (error) {
      setIsLoading(false);
      
      let errorMessage = 'Login failed. Please try again.';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = 'This account has been disabled.';
      }
      
      Alert.alert('Login Error', errorMessage);
    }
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
        {/* Logo */}
        <View style={styles.iconContainer}>
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
            Sign in to your account to continue
          </Text>
        </View>

        {/* Username/Email Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Username/Email</Text>
          <TextInput
            style={[
              styles.input,
              errors.usernameOrEmail && styles.inputError,
            ]}
            placeholder="Enter your username or email"
            placeholderTextColor="#9CA3AF"
            value={usernameOrEmail}
            onChangeText={(text) => {
              setUsernameOrEmail(text);
              if (errors.usernameOrEmail) {
                setErrors({ ...errors, usernameOrEmail: null });
              }
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
          {errors.usernameOrEmail && (
            <Text style={styles.errorText}>{errors.usernameOrEmail}</Text>
          )}
        </View>

        {/* Password Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={[
                styles.passwordInput,
                errors.password && styles.inputError,
              ]}
              placeholder="Enter your password"
              placeholderTextColor="#9CA3AF"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (errors.password) {
                  setErrors({ ...errors, password: null });
                }
              }}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoComplete="password"
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Text style={styles.eyeText}>{showPassword ? '👁️' : '🔒'}</Text>
            </TouchableOpacity>
          </View>
          {errors.password && (
            <Text style={styles.errorText}>{errors.password}</Text>
          )}
        </View>

        {/* Forgot Password Link */}
        <TouchableOpacity 
          style={styles.forgotPassword}
          onPress={() => navigation.navigate('ForgotPassword')}
        >
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </TouchableOpacity>

        {/* Sign In Button */}
        <TouchableOpacity
          style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
          onPress={handleLogin}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          <Text style={styles.loginButtonText}>
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Text>
        </TouchableOpacity>

        {/* Register Link */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>New User? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.registerText}>Register Here</Text>
          </TouchableOpacity>
        </View>

        {/* Help & Support */}
        <View style={styles.bottomSection}>
          <Text style={styles.helpText}>Help & Support</Text>
          <Text style={styles.versionText}>v1.0.0</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8EDF2',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    // Note: elevation property is not supported on Image components
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#1a1a1a',
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    paddingRight: 50,
    fontSize: 15,
    color: '#1a1a1a',
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    top: 14,
  },
  eyeText: {
    fontSize: 20,
  },
  inputError: {
    borderColor: '#D32F2F',
    backgroundColor: '#FEF2F2',
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 13,
    marginTop: 6,
    marginLeft: 4,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 30,
  },
  forgotPasswordText: {
    color: '#0066CC',
    fontSize: 14,
    fontWeight: '600',
  },
  loginButton: {
    backgroundColor: '#0066CC',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#0066CC',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  loginButtonDisabled: {
    backgroundColor: '#9CA3AF',
    shadowOpacity: 0.1,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  footerText: {
    color: '#6B7280',
    fontSize: 14,
  },
  registerText: {
    color: '#0066CC',
    fontSize: 14,
    fontWeight: '700',
  },
  bottomSection: {
    alignItems: 'center',
    marginTop: 20,
  },
  helpText: {
    color: '#6B7280',
    fontSize: 14,
    marginBottom: 8,
  },
  versionText: {
    color: '#9CA3AF',
    fontSize: 12,
  },
});
