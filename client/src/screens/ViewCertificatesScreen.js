import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
  Linking,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Svg, { Path, Rect, Circle } from 'react-native-svg';
import { db } from '../config/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

// Certificate Icon
const CertificateIcon = ({ size = 80 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="3" width="18" height="18" rx="2" stroke="#005A9C" strokeWidth="2" fill="#E3F2FD" />
    <Path d="M7 7h10M7 11h10M7 15h6" stroke="#005A9C" strokeWidth="1.5" strokeLinecap="round" />
    <Circle cx="17" cy="17" r="4" fill="#FFA000" />
    <Path d="M17 14v6l-2-1 2-1 2 1z" fill="#FFFFFF" />
  </Svg>
);

// Download Icon
const DownloadIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"
      fill="#FFFFFF"
    />
  </Svg>
);

// Share Icon
const ShareIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"
      fill="#FFFFFF"
    />
  </Svg>
);

export default function ViewCertificatesScreen({ navigation, route }) {
  const profileData = route?.params || {};
  const [completedPatients, setCompletedPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompletedPatients();
  }, []);

  const fetchCompletedPatients = async () => {
    try {
      setLoading(true);
      console.log('Fetching all completed patients...');
      
      // Get all patients
      const patientsRef = collection(db, 'patients');
      const patientsSnapshot = await getDocs(patientsRef);
      
      // Get all third dose records
      const thirdDoseRef = collection(db, 'Thrid_dose');
      const thirdDoseSnapshot = await getDocs(thirdDoseRef);
      const thirdDoseMap = {};
      thirdDoseSnapshot.forEach((doc) => {
        const data = doc.data();
        thirdDoseMap[data.patientId] = { id: doc.id, ...data };
      });

      // Build list of patients with completed third dose
      const completed = [];
      patientsSnapshot.forEach((doc) => {
        const patientData = doc.data();
        const patientId = doc.id;
        const thirdDose = thirdDoseMap[patientId];
        
        if (thirdDose) {
          completed.push({
            id: patientId,
            name: patientData.name,
            age: patientData.age,
            gender: patientData.gender,
            department: patientData.department,
            designation: patientData.designation,
            phoneNumber: patientData.phoneNumber,
            emailId: patientData.emailId,
            firstDoseDate: patientData.firstDoseDate || patientData.doseZeroDate,
            thirdDoseDate: thirdDose.thirdDoseDate,
            thirdDoseData: thirdDose,
            certificateGenerated: thirdDose.certificateGenerated || false,
          });
        }
      });

      console.log('Found completed patients:', completed.length);
      setCompletedPatients(completed);
    } catch (error) {
      console.error('Error fetching completed patients:', error);
      Alert.alert('Error', 'Failed to load certificates');
    } finally {
      setLoading(false);
    }
  };

  const generateCertificatePDF = async (patient) => {
    if (!patient || !patient.thirdDoseData) {
      Alert.alert('Error', 'Patient data not available');
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 40px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            }
            .certificate {
              background: white;
              padding: 60px;
              border-radius: 20px;
              box-shadow: 0 10px 50px rgba(0,0,0,0.2);
              max-width: 800px;
              margin: 0 auto;
              border: 10px solid #005A9C;
            }
            .header {
              text-align: center;
              margin-bottom: 40px;
            }
            .title {
              font-size: 36px;
              font-weight: bold;
              color: #005A9C;
              margin-bottom: 10px;
            }
            .subtitle {
              font-size: 20px;
              color: #666;
            }
            .content {
              margin: 40px 0;
            }
            .field {
              margin: 20px 0;
              padding: 15px;
              background: #f5f5f5;
              border-radius: 8px;
            }
            .label {
              font-weight: bold;
              color: #005A9C;
              margin-bottom: 5px;
            }
            .value {
              font-size: 18px;
              color: #333;
            }
            .footer {
              text-align: center;
              margin-top: 60px;
              padding-top: 30px;
              border-top: 2px solid #005A9C;
            }
            .seal {
              width: 100px;
              height: 100px;
              margin: 20px auto;
              border: 3px solid #FFA000;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 14px;
              font-weight: bold;
              color: #FFA000;
            }
          </style>
        </head>
        <body>
          <div class="certificate">
            <div class="header">
              <div class="title">HEPATITIS B VACCINATION</div>
              <div class="subtitle">Completion Certificate</div>
            </div>
            
            <div class="content">
              <div class="field">
                <div class="label">Patient Name:</div>
                <div class="value">${patient.name || 'N/A'}</div>
              </div>
              
              <div class="field">
                <div class="label">Patient ID:</div>
                <div class="value">${patient.id || 'N/A'}</div>
              </div>
              
              <div class="field">
                <div class="label">Department:</div>
                <div class="value">${patient.department || 'N/A'}</div>
              </div>
              
              <div class="field">
                <div class="label">Designation:</div>
                <div class="value">${patient.designation || 'N/A'}</div>
              </div>
              
              <div class="field">
                <div class="label">First Dose Date:</div>
                <div class="value">${patient.firstDoseDate || 'N/A'}</div>
              </div>
              
              <div class="field">
                <div class="label">Third Dose Date:</div>
                <div class="value">${patient.thirdDoseDate || 'N/A'}</div>
              </div>
              
              <div class="field">
                <div class="label">Anti-HBs Test Date:</div>
                <div class="value">${patient.thirdDoseData.antiHBsDate || 'N/A'}</div>
              </div>
              
              <div class="field">
                <div class="label">Certificate Issued Date:</div>
                <div class="value">${new Date().toLocaleDateString()}</div>
              </div>
            </div>
            
            <div class="footer">
              <div class="seal">VERIFIED ✓</div>
              <p>This certificate confirms the completion of the full series<br/>of Hepatitis B vaccination (3 doses).</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return htmlContent;
  };

  const handleDownload = async (patient) => {
    if (!patient || !patient.thirdDoseData) {
      Alert.alert('Not Available', 'Certificate data is not available');
      return;
    }

    try {
      const htmlContent = await generateCertificatePDF(patient);
      const fileName = `Certificate_${patient.name.replace(/\s+/g, '_')}_${patient.id}.html`;
      const fileUri = FileSystem.documentDirectory + fileName;

      await FileSystem.writeAsStringAsync(fileUri, htmlContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/html',
          dialogTitle: 'Save Vaccination Certificate',
        });
        Alert.alert('Success', 'Certificate downloaded successfully!');
      } else {
        Alert.alert('Info', 'Certificate generated. File saved to: ' + fileUri);
      }
    } catch (error) {
      console.error('Error downloading certificate:', error);
      Alert.alert('Error', 'Failed to download certificate. Please try again.');
    }
  };

  const handleShare = async (patient) => {
    if (!patient || !patient.thirdDoseData) {
      Alert.alert('Not Available', 'Certificate data is not available for sharing');
      return;
    }

    try {
      const htmlContent = await generateCertificatePDF(patient);
      const fileName = `Certificate_${patient.name.replace(/\s+/g, '_')}_${patient.id}.html`;
      const fileUri = FileSystem.documentDirectory + fileName;

      await FileSystem.writeAsStringAsync(fileUri, htmlContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/html',
          dialogTitle: 'Share Third Dose Certificate',
        });
      } else {
        Alert.alert('Not Available', 'Sharing is not available on this device');
      }
    } catch (error) {
      console.error('Error sharing certificate:', error);
      Alert.alert('Error', 'Failed to share certificate. Please try again.');
    }
  };

  const handleViewAll = () => {
    Alert.alert(
      'All Certificates',
      'Opening complete vaccination certificate package...'
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Vaccination Certificates</Text>
          <Text style={styles.subtitle}>
            View and download certificates for completed vaccinations
          </Text>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#005A9C" />
            <Text style={styles.loadingText}>Loading certificates...</Text>
          </View>
        ) : completedPatients.length === 0 ? (
          <View style={styles.emptyContainer}>
            <CertificateIcon size={100} />
            <Text style={styles.emptyTitle}>No Certificates Available</Text>
            <Text style={styles.emptyText}>
              No patients have completed all three doses yet.
            </Text>
          </View>
        ) : (
          <>
            {/* Summary Card */}
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>📋 Certificate Summary</Text>
              <Text style={styles.summaryText}>
                Total Completed: {completedPatients.length} {completedPatients.length === 1 ? 'Patient' : 'Patients'}
              </Text>
              <Text style={styles.summarySubtext}>
                All patients below have completed the full vaccination series
              </Text>
            </View>

            {/* Certificate List */}
            <Text style={styles.sectionTitle}>Available Certificates</Text>
            {completedPatients.map((patient) => (
              <View key={patient.id} style={styles.certCard}>
                {/* Patient Info */}
                <View style={styles.certHeader}>
                  <View style={styles.certIcon}>
                    <Text style={styles.certIconText}>✓</Text>
                  </View>
                  <View style={styles.certInfo}>
                    <Text style={styles.certTitle}>{patient.name}</Text>
                    <Text style={styles.certDetail}>
                      {patient.age} years • {patient.gender}
                    </Text>
                    <Text style={styles.certDetail}>
                      {patient.department} • {patient.designation}
                    </Text>
                  </View>
                </View>

                {/* Dose Information */}
                <View style={styles.doseInfo}>
                  <View style={styles.doseInfoRow}>
                    <Text style={styles.doseLabel}>First Dose:</Text>
                    <Text style={styles.doseValue}>{patient.firstDoseDate}</Text>
                  </View>
                  <View style={styles.doseInfoRow}>
                    <Text style={styles.doseLabel}>Third Dose:</Text>
                    <Text style={styles.doseValue}>{patient.thirdDoseDate}</Text>
                  </View>
                  <View style={styles.completionBadge}>
                    <Text style={styles.completionText}>✓ Vaccination Complete</Text>
                  </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.certActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleDownload(patient)}
                  >
                    <DownloadIcon />
                    <Text style={styles.actionButtonText}>Download</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleShare(patient)}
                  >
                    <ShareIcon />
                    <Text style={styles.actionButtonText}>Share</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </>
        )}

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Text style={styles.infoIcon}>📄</Text>
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>About Certificates</Text>
            <Text style={styles.infoText}>
              Certificates are available for all patients who have completed the full 3-dose vaccination series.
            </Text>
          </View>
        </View>

        {/* Help Section */}
        <View style={styles.helpSection}>
          <Text style={styles.helpTitle}>Need help?</Text>
          <TouchableOpacity 
            style={styles.helpButton}
            onPress={() => navigation.navigate('HelpSupport')}
          >
            <Text style={styles.helpButtonText}>Contact Support</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
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
  header: {
    marginBottom: 24,
    marginTop: 10,
  },
  backButton: {
    marginBottom: 16,
  },
  backText: {
    fontSize: 16,
    color: '#005A9C',
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0f1923',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  mainCertCard: {
    backgroundColor: '#FFFFFF',
    padding: 30,
    borderRadius: 20,
    marginBottom: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 3,
    borderColor: '#005A9C',
  },
  mainCertTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f1923',
    marginTop: 20,
    textAlign: 'center',
  },
  mainCertName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#005A9C',
    marginTop: 12,
  },
  mainCertStatus: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  viewAllButton: {
    backgroundColor: '#005A9C',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 20,
  },
  viewAllButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  viewAllButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f1923',
    marginBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f1923',
    marginTop: 20,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  summaryCard: {
    backgroundColor: '#E3F2FD',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#005A9C',
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f1923',
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#005A9C',
    marginBottom: 4,
  },
  summarySubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  certCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  certHeader: {
    flexDirection: 'row',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  certCardDisabled: {
    opacity: 0.5,
  },
  certIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E3F2FD',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  certIconText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#005A9C',
  },
  certInfo: {
    flex: 1,
  },
  certTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f1923',
    marginBottom: 4,
  },
  certTitleDisabled: {
    color: '#9CA3AF',
  },
  certDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  certHospital: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 6,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFF9E6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusBadgeAvailable: {
    backgroundColor: '#E8F5E9',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFA000',
  },
  statusTextAvailable: {
    color: '#4CAF50',
  },
  certActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#005A9C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonDisabled: {
    backgroundColor: '#9CA3AF',
    opacity: 0.5,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
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
  helpSection: {
    marginTop: 30,
    alignItems: 'center',
  },
  helpTitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
  },
  helpButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#005A9C',
  },
  helpButtonText: {
    color: '#005A9C',
    fontSize: 16,
    fontWeight: '600',
  },
});
