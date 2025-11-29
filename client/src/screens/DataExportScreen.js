import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  Linking,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Svg, Path, Circle, Rect, Line } from 'react-native-svg';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { db } from '../config/firebase';
import { collection, getDocs } from 'firebase/firestore';
import * as XLSX from 'xlsx';

// Custom Icons
const ChevronLeftIcon = ({ size = 24, color = "#FFFFFF" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M15 18L9 12L15 6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const DownloadIcon = ({ size = 24, color = "#3B82F6" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M7 10L12 15L17 10" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M12 15V3" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const FileTextIcon = ({ size = 24, color = "#3B82F6" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path d="M14 2V8H20" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M16 13H8" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M16 17H8" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M10 9H9H8" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const CalendarIcon = ({ size = 20, color = "#6B7280" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M16 2V6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M8 2V6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M3 10H21" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const CheckIcon = ({ size = 20, color = "#FFFFFF" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M20 6L9 17L4 12" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const DatabaseIcon = ({ size = 24, color = "#3B82F6" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 2C6.5 2 2 3.79086 2 6V18C2 20.2091 6.5 22 12 22C17.5 22 22 20.2091 22 18V6C22 3.79086 17.5 2 12 2Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M2 12C2 14.2091 6.5 16 12 16C17.5 16 22 14.2091 22 12" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M2 6C2 8.20914 6.5 10 12 10C17.5 10 22 8.20914 22 6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const UsersIcon = ({ size = 24, color = "#3B82F6" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const AwardIcon = ({ size = 24, color = "#3B82F6" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="8" r="7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M8.21 13.89L7 23L12 20L17 23L15.79 13.88" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const BarChartIcon = ({ size = 24, color = "#3B82F6" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 20V10" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M18 20V4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M6 20V16" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const DataExportScreen = ({ navigation }) => {
  const [selectedDataType, setSelectedDataType] = useState('all');
  const [selectedFormat, setSelectedFormat] = useState('excel');
  const [isExporting, setIsExporting] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loadingCount, setLoadingCount] = useState(true);

  useEffect(() => {
    fetchRecordCount();
  }, []);

  const fetchRecordCount = async () => {
    try {
      setLoadingCount(true);
      const patientsRef = collection(db, 'patients');
      const patientsSnapshot = await getDocs(patientsRef);
      setTotalRecords(patientsSnapshot.size);
      setLoadingCount(false);
    } catch (error) {
      console.error('Error fetching record count:', error);
      setLoadingCount(false);
    }
  };

  const dataTypes = [
    { id: 'all', label: 'All Data', icon: <DatabaseIcon size={24} color="#3B82F6" />, description: 'Complete vaccination records' },
  ];

  const fileFormats = [
    { id: 'excel', label: 'Excel', extension: '.xlsx', icon: '📊' },
  ];

  const dateRanges = [];

  const handleExport = async () => {
    setIsExporting(true);

    try {
      console.log('Starting data export...');
      
      // Fetch all patients data
      const patientsRef = collection(db, 'patients');
      const patientsSnapshot = await getDocs(patientsRef);
      
      // Fetch second dose data
      const secondDoseRef = collection(db, 'second_dose');
      const secondDoseSnapshot = await getDocs(secondDoseRef);
      const secondDoseMap = {};
      secondDoseSnapshot.forEach((doc) => {
        const data = doc.data();
        secondDoseMap[data.patientId] = data;
      });

      // Fetch third dose data
      const thirdDoseRef = collection(db, 'Thrid_dose');
      const thirdDoseSnapshot = await getDocs(thirdDoseRef);
      const thirdDoseMap = {};
      thirdDoseSnapshot.forEach((doc) => {
        const data = doc.data();
        thirdDoseMap[data.patientId] = data;
      });

      // Prepare data for Excel
      const excelData = [];
      
      // Add header row
      excelData.push([
        'Name',
        'Age',
        'Gender',
        'Department',
        'Designation',
        'Phone',
        'Email',
        'First Dose Date',
        'First Dose Side Effects',
        'Second Dose Date',
        'Second Dose Side Effects',
        'Third Dose Date',
        'Third Dose Side Effects',
        'Anti-HBs Test Date',
        'Status'
      ]);
      
      // Add data rows
      patientsSnapshot.forEach((doc) => {
        const patient = doc.data();
        const patientId = doc.id;
        const secondDose = secondDoseMap[patientId];
        const thirdDose = thirdDoseMap[patientId];
        
        const firstDoseDate = patient.firstDoseDate || patient.doseZeroDate || 'N/A';
        const firstDoseSideEffects = patient.sideEffects || 'None';
        const secondDoseDate = secondDose?.secondDoseDate || patient.secondDoseDate || 'N/A';
        const secondDoseSideEffects = secondDose?.sideEffects || 'None';
        const thirdDoseDate = thirdDose?.thirdDoseDate || patient.thirdDoseDate || 'N/A';
        const thirdDoseSideEffects = thirdDose?.sideEffects || 'None';
        const antiHBsDate = thirdDose?.antiHBsDate || 'N/A';
        const status = thirdDose ? 'Completed' : (secondDose ? 'In Progress' : 'First Dose Only');
        
        excelData.push([
          patient.name || '',
          patient.age || '',
          patient.gender || '',
          patient.department || '',
          patient.designation || '',
          patient.phoneNumber || '',
          patient.emailId || '',
          firstDoseDate,
          firstDoseSideEffects,
          secondDoseDate,
          secondDoseSideEffects,
          thirdDoseDate,
          thirdDoseSideEffects,
          antiHBsDate,
          status
        ]);
      });

      // Create a new workbook and worksheet
      const ws = XLSX.utils.aoa_to_sheet(excelData);
      
      // Set column widths for better readability
      const colWidths = [
        { wch: 25 }, // Name
        { wch: 8 },  // Age
        { wch: 10 }, // Gender
        { wch: 20 }, // Department
        { wch: 20 }, // Designation
        { wch: 15 }, // Phone
        { wch: 25 }, // Email
        { wch: 15 }, // First Dose Date
        { wch: 25 }, // First Dose Side Effects
        { wch: 15 }, // Second Dose Date
        { wch: 25 }, // Second Dose Side Effects
        { wch: 15 }, // Third Dose Date
        { wch: 25 }, // Third Dose Side Effects
        { wch: 15 }, // Anti-HBs Test Date
        { wch: 15 }  // Status
      ];
      ws['!cols'] = colWidths;

      // Create workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Vaccination Records');

      // Generate Excel file (binary string)
      const excelBuffer = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `vaccination_records_${timestamp}.xlsx`;
      const fileUri = FileSystem.documentDirectory + filename;

      // Write Excel file
      await FileSystem.writeAsStringAsync(fileUri, excelBuffer, {
        encoding: FileSystem.EncodingType.Base64,
      });

      console.log('Excel file created at:', fileUri);

      // Share the file
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          dialogTitle: 'Export Vaccination Records',
          UTI: 'com.microsoft.excel.xlsx',
        });
        
        setIsExporting(false);
        Alert.alert(
          'Export Successful',
          `Vaccination records exported successfully!\n\nTotal records: ${patientsSnapshot.size}\n\nThe file is in proper Excel format (.xlsx) and can be opened in Microsoft Excel, Google Sheets, or any spreadsheet application.`,
          [{ text: 'OK' }]
        );
      } else {
        setIsExporting(false);
        Alert.alert(
          'Export Created',
          `File saved to: ${fileUri}\n\nTotal records: ${patientsSnapshot.size}`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      setIsExporting(false);
      Alert.alert(
        'Export Failed',
        `Failed to export data: ${error.message}`,
        [{ text: 'OK' }]
      );
    }
  };

  const DataTypeCard = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.dataTypeCard,
        selectedDataType === item.id && styles.dataTypeCardActive,
      ]}
      onPress={() => setSelectedDataType(item.id)}
    >
      <View style={[
        styles.dataTypeIcon,
        selectedDataType === item.id && styles.dataTypeIconActive,
      ]}>
        {item.icon}
      </View>
      <View style={styles.dataTypeInfo}>
        <Text style={[
          styles.dataTypeLabel,
          selectedDataType === item.id && styles.dataTypeLabelActive,
        ]}>
          {item.label}
        </Text>
        <Text style={styles.dataTypeDescription}>{item.description}</Text>
      </View>
      {selectedDataType === item.id && (
        <View style={styles.checkmark}>
          <CheckIcon size={20} color="#FFFFFF" />
        </View>
      )}
    </TouchableOpacity>
  );

  const FormatChip = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.formatChip,
        selectedFormat === item.id && styles.formatChipActive,
      ]}
      onPress={() => setSelectedFormat(item.id)}
    >
      <Text style={styles.formatIcon}>{item.icon}</Text>
      <View>
        <Text style={[
          styles.formatLabel,
          selectedFormat === item.id && styles.formatLabelActive,
        ]}>
          {item.label}
        </Text>
        <Text style={[
          styles.formatExtension,
          selectedFormat === item.id && styles.formatExtensionActive,
        ]}>
          {item.extension}
        </Text>
      </View>
      {selectedFormat === item.id && (
        <View style={styles.formatCheck}>
          <CheckIcon size={16} color="#FFFFFF" />
        </View>
      )}
    </TouchableOpacity>
  );

  const DateRangeOption = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.dateRangeOption,
        selectedDateRange === item.id && styles.dateRangeOptionActive,
      ]}
      onPress={() => setSelectedDateRange(item.id)}
    >
      <View style={styles.dateRangeIcon}>
        <CalendarIcon size={20} color={selectedDateRange === item.id ? '#3B82F6' : '#6B7280'} />
      </View>
      <View style={styles.dateRangeInfo}>
        <Text style={[
          styles.dateRangeLabel,
          selectedDateRange === item.id && styles.dateRangeLabelActive,
        ]}>
          {item.label}
        </Text>
        <Text style={styles.dateRangeDescription}>{item.description}</Text>
      </View>
      {selectedDateRange === item.id && (
        <View style={styles.radioButton}>
          <View style={styles.radioButtonInner} />
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#3B82F6" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ChevronLeftIcon size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Data Export</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Record Count Card */}
        <View style={styles.recordCountCard}>
          <View style={styles.recordCountHeader}>
            <DatabaseIcon size={32} color="#3B82F6" />
            <View style={styles.recordCountInfo}>
              <Text style={styles.recordCountLabel}>Total Records Available</Text>
              {loadingCount ? (
                <ActivityIndicator size="small" color="#3B82F6" />
              ) : (
                <Text style={styles.recordCountValue}>{totalRecords} Patients</Text>
              )}
            </View>
          </View>
          <Text style={styles.recordCountDescription}>
            This includes all vaccination records in the database
          </Text>
        </View>

        {/* Data Type Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Data Type</Text>
          <Text style={styles.sectionDescription}>
            Choose what data you want to export
          </Text>
          {dataTypes.map((item) => (
            <DataTypeCard key={item.id} item={item} />
          ))}
        </View>

        {/* File Format Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Export Format</Text>
          <Text style={styles.sectionDescription}>
            Choose your preferred file format
          </Text>
          <View style={styles.formatGrid}>
            {fileFormats.map((item) => (
              <FormatChip key={item.id} item={item} />
            ))}
          </View>
        </View>

        {/* Export Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Export Summary</Text>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Data Type:</Text>
            <Text style={styles.summaryValue}>
              {dataTypes.find(dt => dt.id === selectedDataType)?.label}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Format:</Text>
            <Text style={styles.summaryValue}>
              {fileFormats.find(ff => ff.id === selectedFormat)?.label}
              {fileFormats.find(ff => ff.id === selectedFormat)?.extension}
            </Text>
          </View>
        </View>

        {/* Export Button */}
        <TouchableOpacity
          style={[styles.exportButton, isExporting && styles.exportButtonDisabled]}
          onPress={handleExport}
          disabled={isExporting}
        >
          {isExporting ? (
            <>
              <Text style={styles.exportButtonText}>Exporting...</Text>
            </>
          ) : (
            <>
              <DownloadIcon size={24} color="#FFFFFF" />
              <Text style={styles.exportButtonText}>Export Data</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingTop: 40,
  },
  header: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  recordCountCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginTop: 20,
    borderWidth: 2,
    borderColor: '#BFDBFE',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  recordCountHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  recordCountInfo: {
    marginLeft: 16,
    flex: 1,
  },
  recordCountLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
    fontWeight: '500',
  },
  recordCountValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  recordCountDescription: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 8,
    lineHeight: 18,
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  dataTypeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  dataTypeCardActive: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  dataTypeIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  dataTypeIconActive: {
    backgroundColor: '#DBEAFE',
  },
  dataTypeInfo: {
    flex: 1,
  },
  dataTypeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  dataTypeLabelActive: {
    color: '#3B82F6',
  },
  dataTypeDescription: {
    fontSize: 13,
    color: '#6B7280',
  },
  checkmark: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  formatGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  formatChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  formatChipActive: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  formatIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  formatLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  formatLabelActive: {
    color: '#3B82F6',
  },
  formatExtension: {
    fontSize: 12,
    color: '#6B7280',
  },
  formatExtensionActive: {
    color: '#3B82F6',
  },
  formatCheck: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateRangeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  dateRangeOptionActive: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  dateRangeIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  dateRangeInfo: {
    flex: 1,
  },
  dateRangeLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  dateRangeLabelActive: {
    color: '#3B82F6',
  },
  dateRangeDescription: {
    fontSize: 12,
    color: '#6B7280',
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#3B82F6',
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginTop: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '600',
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    marginHorizontal: 20,
    marginTop: 24,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 10,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  exportButtonDisabled: {
    backgroundColor: '#9CA3AF',
    shadowOpacity: 0.1,
  },
  exportButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});

export default DataExportScreen;
