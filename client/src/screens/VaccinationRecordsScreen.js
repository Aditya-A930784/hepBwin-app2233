import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { Svg, Path, Circle, Rect, Line, G } from 'react-native-svg';

const { width } = Dimensions.get('window');

// Custom Icons
const ChevronLeftIcon = ({ size = 24, color = "#FFFFFF" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M15 18L9 12L15 6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const SearchIcon = ({ size = 20, color = "#6B7280" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="11" cy="11" r="8" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M21 21L16.65 16.65" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const FilterIcon = ({ size = 20, color = "#3B82F6" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M22 3H2L10 12.46V19L14 21V12.46L22 3Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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

const TrendingUpIcon = ({ size = 24, color = "#10B981" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M23 6L13.5 15.5L8.5 10.5L1 18" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M17 6H23V12" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const ActivityIcon = ({ size = 24, color = "#3B82F6" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M22 12H18L15 21L9 3L6 12H2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const CheckCircleIcon = ({ size = 20, color = "#10B981" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.7088 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18455 2.99721 7.13631 4.39828 5.49706C5.79935 3.85781 7.69279 2.71537 9.79619 2.24013C11.8996 1.7649 14.1003 1.98232 16.07 2.85999"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path d="M22 4L12 14.01L9 11.01" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const ClockIcon = ({ size = 20, color = "#F59E0B" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M12 6V12L16 14" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const VaccinationRecordsScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');

  const stats = {
    totalRecords: 1380,
    completed: 1230,
    pending: 150,
    completionRate: 89,
  };

  const chartData = [
    { month: 'May', completed: 180, pending: 30 },
    { month: 'Jun', completed: 210, pending: 25 },
    { month: 'Jul', completed: 195, pending: 28 },
    { month: 'Aug', completed: 225, pending: 22 },
    { month: 'Sep', completed: 200, pending: 20 },
    { month: 'Oct', completed: 220, pending: 25 },
  ];

  const recentRecords = [
    {
      id: '1',
      patientName: 'Dr. Sarah Johnson',
      department: 'Cardiology',
      doseNumber: 'Dose 3',
      date: '2025-11-10',
      status: 'Completed',
    },
    {
      id: '2',
      patientName: 'Nurse Michael Chen',
      department: 'Emergency',
      doseNumber: 'Dose 2',
      date: '2025-11-08',
      status: 'Completed',
    },
    {
      id: '3',
      patientName: 'Dr. Emily Rodriguez',
      department: 'Pediatrics',
      doseNumber: 'Dose 3',
      date: '2025-11-05',
      status: 'Pending',
    },
    {
      id: '4',
      patientName: 'Tech. James Wilson',
      department: 'Radiology',
      doseNumber: 'Dose 3',
      date: '2025-11-03',
      status: 'Completed',
    },
    {
      id: '5',
      patientName: 'Dr. Amanda Lee',
      department: 'Surgery',
      doseNumber: 'Dose 2',
      date: '2025-11-01',
      status: 'Completed',
    },
  ];

  const filters = ['All', 'Completed', 'Pending', 'This Week', 'This Month'];

  const getStatusColor = (status) => {
    return status === 'Completed' ? '#10B981' : '#F59E0B';
  };

  const getStatusBgColor = (status) => {
    return status === 'Completed' ? '#D1FAE5' : '#FEF3C7';
  };

  const maxValue = Math.max(...chartData.map(d => d.completed + d.pending));
  const chartHeight = 180;
  const chartWidth = width - 80;
  const barWidth = chartWidth / chartData.length / 2.5;
  const barGap = 8;

  const StatCard = ({ label, value, color, icon }) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={styles.statIcon}>{icon}</View>
      <View style={styles.statContent}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#3B82F6" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ChevronLeftIcon size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Vaccination Records</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Statistics Cards */}
        <View style={styles.statsGrid}>
          <StatCard
            label="Total Records"
            value={stats.totalRecords}
            color="#3B82F6"
            icon={<ActivityIcon size={24} color="#3B82F6" />}
          />
          <StatCard
            label="Completed"
            value={stats.completed}
            color="#10B981"
            icon={<CheckCircleIcon size={24} color="#10B981" />}
          />
          <StatCard
            label="Pending"
            value={stats.pending}
            color="#F59E0B"
            icon={<ClockIcon size={24} color="#F59E0B" />}
          />
          <StatCard
            label="Completion Rate"
            value={`${stats.completionRate}%`}
            color="#10B981"
            icon={<TrendingUpIcon size={24} color="#10B981" />}
          />
        </View>

        {/* Chart Section */}
        <View style={styles.chartSection}>
          <Text style={styles.sectionTitle}>Monthly Vaccination Trends</Text>
          <View style={styles.chartContainer}>
            <Svg width={chartWidth + 40} height={chartHeight + 40}>
              {/* Grid lines */}
              {[0, 1, 2, 3, 4].map((i) => (
                <G key={i}>
                  <Line
                    x1="30"
                    y1={10 + (chartHeight / 4) * i}
                    x2={chartWidth + 30}
                    y2={10 + (chartHeight / 4) * i}
                    stroke="#E5E7EB"
                    strokeWidth="1"
                  />
                </G>
              ))}

              {/* Bars */}
              {chartData.map((data, index) => {
                const completedHeight = (data.completed / maxValue) * chartHeight;
                const pendingHeight = (data.pending / maxValue) * chartHeight;
                const x = 40 + index * (barWidth * 2 + barGap * 3);

                return (
                  <G key={index}>
                    {/* Completed Bar */}
                    <Rect
                      x={x}
                      y={chartHeight + 10 - completedHeight}
                      width={barWidth}
                      height={completedHeight}
                      fill="#10B981"
                      rx="4"
                    />
                    {/* Pending Bar */}
                    <Rect
                      x={x + barWidth + barGap}
                      y={chartHeight + 10 - pendingHeight}
                      width={barWidth}
                      height={pendingHeight}
                      fill="#F59E0B"
                      rx="4"
                    />
                  </G>
                );
              })}
            </Svg>

            {/* Month Labels */}
            <View style={styles.chartLabels}>
              {chartData.map((data, index) => (
                <Text key={index} style={styles.chartLabel}>
                  {data.month}
                </Text>
              ))}
            </View>

            {/* Legend */}
            <View style={styles.chartLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
                <Text style={styles.legendText}>Completed</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
                <Text style={styles.legendText}>Pending</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Recent Records Section */}
        <View style={styles.recordsSection}>
          <Text style={styles.sectionTitle}>Recent Records</Text>

          {/* Search Bar */}
          <View style={styles.searchBar}>
            <SearchIcon size={20} color="#6B7280" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search records..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Filter Chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterContainer}
            contentContainerStyle={styles.filterContent}
          >
            {filters.map((filter) => (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.filterChip,
                  selectedFilter === filter && styles.filterChipActive,
                ]}
                onPress={() => setSelectedFilter(filter)}
              >
                <FilterIcon
                  size={16}
                  color={selectedFilter === filter ? '#FFFFFF' : '#3B82F6'}
                />
                <Text
                  style={[
                    styles.filterText,
                    selectedFilter === filter && styles.filterTextActive,
                  ]}
                >
                  {filter}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Records List */}
          {recentRecords.map((record) => (
            <View key={record.id} style={styles.recordCard}>
              <View style={styles.recordHeader}>
                <View style={styles.recordInfo}>
                  <Text style={styles.recordName}>{record.patientName}</Text>
                  <Text style={styles.recordDepartment}>{record.department}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusBgColor(record.status) }]}>
                  {record.status === 'Completed' ? (
                    <CheckCircleIcon size={16} color={getStatusColor(record.status)} />
                  ) : (
                    <ClockIcon size={16} color={getStatusColor(record.status)} />
                  )}
                  <Text style={[styles.statusText, { color: getStatusColor(record.status) }]}>
                    {record.status}
                  </Text>
                </View>
              </View>

              <View style={styles.recordDivider} />

              <View style={styles.recordDetails}>
                <View style={styles.recordDetailItem}>
                  <Text style={styles.recordDetailLabel}>Dose:</Text>
                  <Text style={styles.recordDetailValue}>{record.doseNumber}</Text>
                </View>
                <View style={styles.recordDetailItem}>
                  <CalendarIcon size={16} color="#6B7280" />
                  <Text style={styles.recordDetailValue}>{record.date}</Text>
                </View>
              </View>
            </View>
          ))}

          <TouchableOpacity style={styles.viewAllButton}>
            <Text style={styles.viewAllText}>View All Records</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  chartSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  chartContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  chartLabels: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  chartLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
    gap: 24,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  recordsSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  filterContainer: {
    maxHeight: 50,
    marginBottom: 16,
  },
  filterContent: {
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 6,
  },
  filterChipActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  recordCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  recordInfo: {
    flex: 1,
  },
  recordName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  recordDepartment: {
    fontSize: 14,
    color: '#6B7280',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  recordDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 12,
  },
  recordDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  recordDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  recordDetailLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  recordDetailValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '600',
  },
  viewAllButton: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  viewAllText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#3B82F6',
  },
});

export default VaccinationRecordsScreen;
