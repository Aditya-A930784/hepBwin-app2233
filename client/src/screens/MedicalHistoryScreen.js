import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

// Icons
const BackIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path d="M15 18l-6-6 6-6" stroke="#0f1923" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const HeartIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path
      d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
      fill="#E3F2FD"
      stroke="#2196F3"
      strokeWidth={1.5}
    />
  </Svg>
);

const AllergyIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Circle cx={12} cy={12} r={10} fill="#E8F5E9" stroke="#4CAF50" strokeWidth={1.5} />
    <Path d="M12 8v8M8 12h8" stroke="#4CAF50" strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

const PillIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Rect x={6} y={6} width={12} height={12} rx={6} fill="#FFF3E0" stroke="#FF9800" strokeWidth={1.5} />
    <Path d="M12 6v12M6 12h12" stroke="#FF9800" strokeWidth={1.5} />
  </Svg>
);

const SurgeryIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Rect x={4} y={4} width={16} height={16} rx={2} fill="#F3E5F5" stroke="#9C27B0" strokeWidth={1.5} />
    <Path d="M9 12h6M12 9v6" stroke="#9C27B0" strokeWidth={1.5} strokeLinecap="round" />
  </Svg>
);

const CloseIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M18 6L6 18M6 6l12 12" stroke="#666" strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

export default function MedicalHistoryScreen({ navigation }) {
  // State for each category
  const [conditions, setConditions] = useState(['Hypertension', 'Asthma']);
  const [allergies, setAllergies] = useState(['Penicillin', 'Peanuts']);
  const [medications, setMedications] = useState(['Lisinopril 10mg', 'Metformin 500mg']);
  const [surgeries, setSurgeries] = useState([]);

  // Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState('');
  const [inputValue, setInputValue] = useState('');

  const openModal = (type) => {
    setModalType(type);
    setInputValue('');
    setModalVisible(true);
  };

  const handleAdd = () => {
    if (!inputValue.trim()) {
      Alert.alert('Error', 'Please enter a value');
      return;
    }

    switch (modalType) {
      case 'condition':
        setConditions([...conditions, inputValue.trim()]);
        break;
      case 'allergy':
        setAllergies([...allergies, inputValue.trim()]);
        break;
      case 'medication':
        setMedications([...medications, inputValue.trim()]);
        break;
      case 'surgery':
        setSurgeries([...surgeries, inputValue.trim()]);
        break;
    }

    setModalVisible(false);
    setInputValue('');
  };

  const handleRemove = (type, index) => {
    switch (type) {
      case 'condition':
        setConditions(conditions.filter((_, i) => i !== index));
        break;
      case 'allergy':
        setAllergies(allergies.filter((_, i) => i !== index));
        break;
      case 'medication':
        setMedications(medications.filter((_, i) => i !== index));
        break;
      case 'surgery':
        setSurgeries(surgeries.filter((_, i) => i !== index));
        break;
    }
  };

  const renderTag = (item, index, type) => (
    <View key={index} style={styles.tag}>
      <Text style={styles.tagText}>{item}</Text>
      <TouchableOpacity onPress={() => handleRemove(type, index)} style={styles.tagClose}>
        <CloseIcon />
      </TouchableOpacity>
    </View>
  );

  const getModalTitle = () => {
    switch (modalType) {
      case 'condition':
        return 'Add Pre-existing Condition';
      case 'allergy':
        return 'Add Allergy';
      case 'medication':
        return 'Add Medication';
      case 'surgery':
        return 'Add Surgery';
      default:
        return '';
    }
  };

  const getModalPlaceholder = () => {
    switch (modalType) {
      case 'condition':
        return 'e.g., Diabetes, Hypertension';
      case 'allergy':
        return 'e.g., Penicillin, Peanuts';
      case 'medication':
        return 'e.g., Aspirin 100mg';
      case 'surgery':
        return 'e.g., Appendectomy (2020)';
      default:
        return '';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <BackIcon />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Medical History</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Pre-existing Conditions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <HeartIcon />
            <View style={styles.sectionHeaderText}>
              <Text style={styles.sectionTitle}>Pre-existing Conditions</Text>
              <Text style={styles.sectionSubtitle}>Manage your ongoing health conditions.</Text>
            </View>
          </View>

          <View style={styles.tagsContainer}>
            {conditions.map((condition, index) => renderTag(condition, index, 'condition'))}
          </View>

          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => openModal('condition')}
          >
            <Text style={styles.addButtonText}>+ Add Condition</Text>
          </TouchableOpacity>
        </View>

        {/* Known Allergies */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <AllergyIcon />
            <View style={styles.sectionHeaderText}>
              <Text style={styles.sectionTitle}>Known Allergies</Text>
              <Text style={styles.sectionSubtitle}>List any allergies to medications or substances.</Text>
            </View>
          </View>

          <View style={styles.tagsContainer}>
            {allergies.map((allergy, index) => renderTag(allergy, index, 'allergy'))}
          </View>

          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => openModal('allergy')}
          >
            <Text style={styles.addButtonText}>+ Add Allergy</Text>
          </TouchableOpacity>
        </View>

        {/* Current Medications */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <PillIcon />
            <View style={styles.sectionHeaderText}>
              <Text style={styles.sectionTitle}>Current Medications</Text>
              <Text style={styles.sectionSubtitle}>Include all prescribed and over-the-counter drugs.</Text>
            </View>
          </View>

          <View style={styles.tagsContainer}>
            {medications.map((medication, index) => renderTag(medication, index, 'medication'))}
          </View>

          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => openModal('medication')}
          >
            <Text style={styles.addButtonText}>+ Add Medication</Text>
          </TouchableOpacity>
        </View>

        {/* Significant Surgeries */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <SurgeryIcon />
            <View style={styles.sectionHeaderText}>
              <Text style={styles.sectionTitle}>Significant Surgeries</Text>
              <Text style={styles.sectionSubtitle}>Record any important past surgeries.</Text>
            </View>
          </View>

          {surgeries.length > 0 ? (
            <View style={styles.tagsContainer}>
              {surgeries.map((surgery, index) => renderTag(surgery, index, 'surgery'))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                No surgeries added yet. Tap below to add one.
              </Text>
            </View>
          )}

          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => openModal('surgery')}
          >
            <Text style={styles.addButtonText}>+ Add Surgery</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('Home')}
        >
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
            <Path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="#9CA3AF" strokeWidth={2} />
          </Svg>
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
            <Path d="M9 11l3 3L22 4" stroke="#9CA3AF" strokeWidth={2} strokeLinecap="round" />
            <Path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" stroke="#9CA3AF" strokeWidth={2} />
          </Svg>
          <Text style={styles.navText}>Vaccines</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
            <Rect x={3} y={4} width={18} height={18} rx={2} stroke="#9CA3AF" strokeWidth={2} />
            <Path d="M16 2v4M8 2v4M3 10h18" stroke="#9CA3AF" strokeWidth={2} />
          </Svg>
          <Text style={styles.navText}>Calendar</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.navItem, styles.navItemActive]}>
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
            <Circle cx={12} cy={7} r={4} fill="#2196F3" />
            <Path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" stroke="#2196F3" strokeWidth={2} />
          </Svg>
          <Text style={[styles.navText, styles.navTextActive]}>Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Add Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{getModalTitle()}</Text>
            
            <TextInput
              style={styles.modalInput}
              placeholder={getModalPlaceholder()}
              placeholderTextColor="#9CA3AF"
              value={inputValue}
              onChangeText={setInputValue}
              autoFocus
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonAdd]}
                onPress={handleAdd}
              >
                <Text style={styles.modalButtonAddText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f1923',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  sectionHeaderText: {
    flex: 1,
    marginLeft: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f1923',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingVertical: 6,
    paddingLeft: 14,
    paddingRight: 8,
    gap: 6,
  },
  tagText: {
    fontSize: 14,
    color: '#374151',
  },
  tagClose: {
    padding: 2,
  },
  addButton: {
    backgroundColor: '#2196F3',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  emptyState: {
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    justifyContent: 'space-around',
  },
  navItem: {
    alignItems: 'center',
    gap: 4,
  },
  navItemActive: {
    // Active state
  },
  navText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  navTextActive: {
    color: '#2196F3',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f1923',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#0f1923',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: '#F3F4F6',
  },
  modalButtonCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  modalButtonAdd: {
    backgroundColor: '#2196F3',
  },
  modalButtonAddText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
