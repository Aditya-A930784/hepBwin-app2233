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
  FlatList,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Svg, { Path, Circle } from 'react-native-svg';

// Family Member Icon
const PersonIcon = () => (
  <Svg width={40} height={40} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="8" r="4" fill="#005A9C" />
    <Path
      d="M12 14c-6 0-8 3-8 5v2h16v-2c0-2-2-5-8-5z"
      fill="#005A9C"
    />
  </Svg>
);

// Add Icon
const AddIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path
      d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"
      fill="#FFFFFF"
    />
  </Svg>
);

// Trash Icon
const TrashIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"
      fill="#D32F2F"
    />
  </Svg>
);

export default function FamilyRegistrationScreen({ navigation }) {
  const [familyMembers, setFamilyMembers] = useState([
    {
      id: '1',
      name: 'John Doe (You)',
      relation: 'Self',
      age: '25',
      vaccinated: 'In Progress',
    },
  ]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMember, setNewMember] = useState({
    name: '',
    relation: '',
    age: '',
    vaccinated: 'Not Started',
  });

  const relations = ['Spouse', 'Child', 'Parent', 'Sibling', 'Other'];

  const handleAddMember = () => {
    if (!newMember.name || !newMember.relation || !newMember.age) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    const member = {
      id: Date.now().toString(),
      ...newMember,
    };

    setFamilyMembers([...familyMembers, member]);
    setNewMember({ name: '', relation: '', age: '', vaccinated: 'Not Started' });
    setShowAddForm(false);
    Alert.alert('Success', 'Family member added successfully!');
  };

  const handleDeleteMember = (id) => {
    if (id === '1') {
      Alert.alert('Error', 'Cannot delete your own profile');
      return;
    }

    Alert.alert(
      'Delete Member',
      'Are you sure you want to remove this family member?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setFamilyMembers(familyMembers.filter(m => m.id !== id));
          },
        },
      ]
    );
  };

  const renderMemberCard = ({ item }) => (
    <View style={styles.memberCard}>
      <View style={styles.memberIconContainer}>
        <PersonIcon />
      </View>
      <View style={styles.memberInfo}>
        <Text style={styles.memberName}>{item.name}</Text>
        <Text style={styles.memberDetails}>
          {item.relation} • {item.age} years
        </Text>
        <View style={[
          styles.statusBadge,
          item.vaccinated === 'Completed' && styles.statusBadgeCompleted,
          item.vaccinated === 'In Progress' && styles.statusBadgeInProgress,
        ]}>
          <Text style={styles.statusText}>{item.vaccinated}</Text>
        </View>
      </View>
      {item.id !== '1' && (
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteMember(item.id)}
        >
          <TrashIcon />
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar style="dark" />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Family Members</Text>
          <Text style={styles.subtitle}>
            Track vaccination for your entire family
          </Text>
        </View>

        {/* Family Members List */}
        <FlatList
          data={familyMembers}
          renderItem={renderMemberCard}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />

        {/* Add Member Form */}
        {showAddForm && (
          <View style={styles.addForm}>
            <Text style={styles.formTitle}>Add Family Member</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              placeholderTextColor="#9CA3AF"
              value={newMember.name}
              onChangeText={(text) => setNewMember({ ...newMember, name: text })}
            />

            <View style={styles.relationGrid}>
              {relations.map((rel) => (
                <TouchableOpacity
                  key={rel}
                  style={[
                    styles.relationButton,
                    newMember.relation === rel && styles.relationButtonActive,
                  ]}
                  onPress={() => setNewMember({ ...newMember, relation: rel })}
                >
                  <Text style={[
                    styles.relationText,
                    newMember.relation === rel && styles.relationTextActive,
                  ]}>
                    {rel}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.input}
              placeholder="Age"
              placeholderTextColor="#9CA3AF"
              value={newMember.age}
              onChangeText={(text) => setNewMember({ ...newMember, age: text })}
              keyboardType="numeric"
            />

            <View style={styles.formButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowAddForm(false);
                  setNewMember({ name: '', relation: '', age: '', vaccinated: 'Not Started' });
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.addButton}
                onPress={handleAddMember}
              >
                <Text style={styles.addButtonText}>Add Member</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Floating Add Button */}
        {!showAddForm && (
          <TouchableOpacity
            style={styles.floatingButton}
            onPress={() => setShowAddForm(true)}
            activeOpacity={0.8}
          >
            <AddIcon />
            <Text style={styles.floatingButtonText}>Add Member</Text>
          </TouchableOpacity>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E6F0F7',
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    paddingTop: 50,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
  listContent: {
    padding: 20,
    paddingBottom: 100,
  },
  memberCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  memberIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E3F2FD',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f1923',
    marginBottom: 4,
  },
  memberDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFF9E6',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusBadgeCompleted: {
    backgroundColor: '#E8F5E9',
  },
  statusBadgeInProgress: {
    backgroundColor: '#E3F2FD',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0f1923',
  },
  deleteButton: {
    padding: 8,
  },
  addForm: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f1923',
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#F0F4F7',
    borderWidth: 1,
    borderColor: '#E0E6EB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#0f1923',
    marginBottom: 12,
  },
  relationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  relationButton: {
    backgroundColor: '#F0F4F7',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#E0E6EB',
  },
  relationButtonActive: {
    backgroundColor: '#E3F2FD',
    borderColor: '#005A9C',
  },
  relationText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  relationTextActive: {
    color: '#005A9C',
  },
  formButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F0F4F7',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  addButton: {
    flex: 1,
    backgroundColor: '#005A9C',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: '#005A9C',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  floatingButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
});
