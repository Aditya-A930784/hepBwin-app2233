import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TextInput,
  Linking,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

// Icons
const BackIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path d="M15 18l-6-6 6-6" stroke="#0f1923" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const SearchIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Circle cx={11} cy={11} r={8} stroke="#9CA3AF" strokeWidth={2} />
    <Path d="M21 21l-4.35-4.35" stroke="#9CA3AF" strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

const FAQIcon = () => (
  <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
    <Rect x={3} y={3} width={18} height={18} rx={2} fill="#E3F2FD" />
    <Path d="M9 9h6M9 13h6M9 17h4" stroke="#2196F3" strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

const ChatIcon = () => (
  <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
    <Path
      d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
      fill="#E8F5E9"
      stroke="#4CAF50"
      strokeWidth={2}
    />
  </Svg>
);

const FeedbackIcon = () => (
  <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
    <Circle cx={12} cy={12} r={10} fill="#FFF9C4" stroke="#FBC02D" strokeWidth={2} />
    <Path d="M12 8v4M12 16h.01" stroke="#FBC02D" strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

const BugIcon = () => (
  <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
    <Circle cx={12} cy={12} r={10} fill="#FFEBEE" stroke="#F44336" strokeWidth={2} />
    <Path d="M8 12h8M12 8v8" stroke="#F44336" strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

const EmailIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Rect x={3} y={5} width={18} height={14} rx={2} stroke="#4CAF50" strokeWidth={2} />
    <Path d="M3 7l9 6 9-6" stroke="#4CAF50" strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

const PhoneIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path
      d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
      fill="#E3F2FD"
      stroke="#2196F3"
      strokeWidth={2}
    />
  </Svg>
);

const ChevronRightIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M9 18l6-6-6-6" stroke="#9CA3AF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export default function HelpSupportScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleEmail = () => {
    Linking.openURL('mailto:support@hepbwin.com');
  };

  const handlePhone = () => {
    Linking.openURL('tel:+18001234567');
  };

  const supportOptions = [
    {
      id: 'faq',
      title: 'Frequently Asked Questions',
      description: 'Find answers to common questions',
      icon: <FAQIcon />,
      onPress: () => {
        // Navigate to FAQ screen or open FAQ section
        console.log('Open FAQ');
      },
    },
    {
      id: 'chat',
      title: 'Support Chat',
      description: 'Chat with an agent',
      icon: <ChatIcon />,
      onPress: () => {
        // Navigate to chat screen
        console.log('Open Support Chat');
      },
    },
    {
      id: 'feedback',
      title: 'Submit Feedback',
      description: 'Share your ideas and suggestions',
      icon: <FeedbackIcon />,
      onPress: () => {
        // Navigate to feedback form
        console.log('Open Feedback Form');
      },
    },
    {
      id: 'bug',
      title: 'Report a Bug',
      description: 'Found a problem? Let us know',
      icon: <BugIcon />,
      onPress: () => {
        // Navigate to bug report form
        console.log('Open Bug Report');
      },
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <BackIcon />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support Center</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <SearchIcon />
          <TextInput
            style={styles.searchInput}
            placeholder="Search FAQs..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Support Options */}
        <View style={styles.optionsContainer}>
          {supportOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={styles.optionCard}
              onPress={option.onPress}
              activeOpacity={0.7}
            >
              <View style={styles.optionIcon}>{option.icon}</View>
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>{option.title}</Text>
                <Text style={styles.optionDescription}>{option.description}</Text>
              </View>
              <ChevronRightIcon />
            </TouchableOpacity>
          ))}
        </View>

        {/* Contact Us Section */}
        <View style={styles.contactSection}>
          <Text style={styles.contactSectionTitle}>Contact Us</Text>

          {/* Email */}
          <TouchableOpacity style={styles.contactCard} onPress={handleEmail}>
            <EmailIcon />
            <View style={styles.contactContent}>
              <Text style={styles.contactLabel}>Email</Text>
              <Text style={styles.contactValue}>support@hepbwin.com</Text>
            </View>
          </TouchableOpacity>

          {/* Phone */}
          <TouchableOpacity style={styles.contactCard} onPress={handlePhone}>
            <PhoneIcon />
            <View style={styles.contactContent}>
              <Text style={styles.contactLabel}>Phone</Text>
              <Text style={styles.contactValue}>+1 (800) 123-4567</Text>
              <Text style={styles.contactHours}>Mon-Fri, 9am-6pm EST</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    paddingBottom: 40,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#0f1923',
    marginLeft: 12,
  },
  optionsContainer: {
    marginBottom: 32,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f1923',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 13,
    color: '#6B7280',
  },
  contactSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
  },
  contactSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f1923',
    marginBottom: 16,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  contactContent: {
    flex: 1,
    marginLeft: 16,
  },
  contactLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
  },
  contactValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f1923',
    marginBottom: 2,
  },
  contactHours: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});
