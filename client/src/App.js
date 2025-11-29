import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from './config/firebase';
import { signOut } from 'firebase/auth';
import SplashScreen from './screens/SplashScreen';
import WelcomeRoleSelectionScreen from './screens/WelcomeRoleSelectionScreen';
import LoginScreen from './screens/LoginScreen';
import AdminLoginScreen from './screens/AdminLoginScreen';
import AdminDashboardScreen from './screens/AdminDashboardScreen';
import StaffVaccinationScreen from './screens/StaffVaccinationScreen';
import CertificateAuthorityScreen from './screens/CertificateAuthorityScreen';
import DataExportScreen from './screens/DataExportScreen';
import SettingsScreen from './screens/SettingsScreen';
import VaccinationRecordsScreen from './screens/VaccinationRecordsScreen';
import CoordinatorManagementScreen from './screens/CoordinatorManagementScreen';
import AddCoordinatorScreen from './screens/AddCoordinatorScreen';
import AdminNotificationsScreen from './screens/AdminNotificationsScreen';
import TotalStaffListScreen from './screens/TotalStaffListScreen';
import PendingStaffListScreen from './screens/PendingStaffListScreen';
import CompletedStaffListScreen from './screens/CompletedStaffListScreen';
import OverdueStaffListScreen from './screens/OverdueStaffListScreen';
import DataInformationScreen from './screens/DataInformationScreen';
import RegisterScreen from './screens/RegisterScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import VerifyOTPScreen from './screens/VerifyOTPScreen';
import SetNewPasswordScreen from './screens/SetNewPasswordScreen';
import ProfileManagement1Screen from './screens/ProfileManagement1Screen';
import ProfileManagement2Screen from './screens/ProfileManagement2Screen';
import ProfileManagement3Screen from './screens/ProfileManagement3Screen';
import ProfileManagement4Screen from './screens/ProfileManagement4Screen';
import ProfileManagement5Screen from './screens/ProfileManagement5Screen';
import FirstDoseEntryScreen from './screens/FirstDoseEntryScreen';
import SecondDoseEntryScreen from './screens/SecondDoseEntryScreen';
import ThirdDoseEntryScreen from './screens/ThirdDoseEntryScreen';
import ViewCertificatesScreen from './screens/ViewCertificatesScreen';
import ReminderSettingsScreen from './screens/ReminderSettingsScreen';
import NotificationHistoryScreen from './screens/NotificationHistoryScreen';
import MyRecordsScreen from './screens/MyRecordsScreen';
import HelpSupportScreen from './screens/HelpSupportScreen';
import HomeScreen from './screens/HomeScreen';

const Stack = createStackNavigator();

export default function App() {
  useEffect(() => {
    checkSessionExpiration();
  }, []);

  const checkSessionExpiration = async () => {
    try {
      const loginTimestamp = await AsyncStorage.getItem('loginTimestamp');
      
      if (loginTimestamp) {
        const currentTime = new Date().getTime();
        const loginTime = parseInt(loginTimestamp);
        const twelveHoursInMs = 12 * 60 * 60 * 1000; // 12 hours in milliseconds
        
        // Check if 12 hours have passed
        if (currentTime - loginTime > twelveHoursInMs) {
          console.log('Session expired - logging out user');
          // Clear login timestamp
          await AsyncStorage.removeItem('loginTimestamp');
          // Sign out from Firebase
          if (auth.currentUser) {
            await signOut(auth);
          }
        } else {
          console.log('Session still valid');
        }
      }
    } catch (error) {
      console.error('Error checking session expiration:', error);
    }
  };

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
        initialRouteName="Splash"
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="WelcomeRoleSelection" component={WelcomeRoleSelectionScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="AdminLogin" component={AdminLoginScreen} />
        <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
        <Stack.Screen name="StaffVaccination" component={StaffVaccinationScreen} />
        <Stack.Screen name="CertificateAuthority" component={CertificateAuthorityScreen} />
        <Stack.Screen name="DataExport" component={DataExportScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="VaccinationRecords" component={VaccinationRecordsScreen} />
        <Stack.Screen name="CoordinatorManagement" component={CoordinatorManagementScreen} />
        <Stack.Screen name="AddCoordinator" component={AddCoordinatorScreen} />
        <Stack.Screen name="AdminNotifications" component={AdminNotificationsScreen} />
        <Stack.Screen name="TotalStaffList" component={TotalStaffListScreen} />
        <Stack.Screen name="PendingStaffList" component={PendingStaffListScreen} />
        <Stack.Screen name="CompletedStaffList" component={CompletedStaffListScreen} />
        <Stack.Screen name="OverdueStaffList" component={OverdueStaffListScreen} />
        <Stack.Screen name="DataInformation" component={DataInformationScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="VerifyOTP" component={VerifyOTPScreen} />
        <Stack.Screen name="SetNewPassword" component={SetNewPasswordScreen} />
        <Stack.Screen name="ProfileManagement1" component={ProfileManagement1Screen} />
        <Stack.Screen name="ProfileManagement2" component={ProfileManagement2Screen} />
        <Stack.Screen name="ProfileManagement3" component={ProfileManagement3Screen} />
        <Stack.Screen name="ProfileManagement4" component={ProfileManagement4Screen} />
        <Stack.Screen name="ProfileManagement5" component={ProfileManagement5Screen} />
        <Stack.Screen name="FirstDoseEntry" component={FirstDoseEntryScreen} />
        <Stack.Screen name="SecondDoseEntry" component={SecondDoseEntryScreen} />
        <Stack.Screen name="ThirdDoseEntry" component={ThirdDoseEntryScreen} />
        <Stack.Screen name="ViewCertificates" component={ViewCertificatesScreen} />
        <Stack.Screen name="ReminderSettings" component={ReminderSettingsScreen} />
        <Stack.Screen name="NotificationHistory" component={NotificationHistoryScreen} />
        <Stack.Screen name="MyRecords" component={MyRecordsScreen} />
        <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}