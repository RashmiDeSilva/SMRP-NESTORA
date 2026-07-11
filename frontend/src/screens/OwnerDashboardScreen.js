import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Platform,
  Image,
  Alert,
} from 'react-native';

import { SafeAreaView } from 'react-native';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function OwnerDashboardScreen({ currentUser, boardings = [], onLogout, onAddBoarding, onDeleteBoarding, onEditBoarding }) {
  const handleDelete = (id) => {
    if (Platform.OS === 'web') {
      const confirmDelete = window.confirm('Are you sure you want to delete this boarding place?');
      if (confirmDelete && onDeleteBoarding) {
        onDeleteBoarding(id);
      }
    } else {
      Alert.alert(
        'Confirm Delete',
        'Are you sure you want to delete this boarding place?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => {
              if (onDeleteBoarding) onDeleteBoarding(id);
            },
          },
        ]
      );
    }
  };

  // Dynamic stats calculation
  const totalBoardings = boardings.length;
  const totalBeds = boardings.reduce((sum, b) => sum + (parseInt(b.totalBeds, 10) || 0), 0);

  // Stat cards data
  const stats = [
    {
      title: 'Total Boardings',
      value: String(totalBoardings),
      titleColor: '#3B82F6', // Blue
    },
    {
      title: 'Total Beds',
      value: String(totalBeds),
      titleColor: '#6366F1', // Indigo
    },
    {
      title: 'Active Reservations',
      value: '12',
      titleColor: '#F97316', // Orange
    },
    {
      title: 'Monthly Revenue',
      value: 'Rs.245,000',
      titleColor: '#EA580C', // Dark Orange
    },
    {
      title: 'Pending Payments',
      value: '4',
      titleColor: '#8B5CF6', // Purple
      hasIcon: true,
    },
    {
      title: 'Reviews',
      value: '32',
      titleColor: '#10B981', // Green
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Purple Header Section */}
        <View style={styles.headerContainer}>
          <SafeAreaView>
            {/* Top Bar */}
            <View style={styles.topBar}>
              <TouchableOpacity style={styles.iconButton}>
                <Ionicons name="menu-outline" size={26} color="#FFFFFF" />
              </TouchableOpacity>

              <Text style={styles.headerTitle}>Owner Dashboard</Text>

              <View style={styles.topBarRight}>
                <TouchableOpacity style={[styles.iconButton, { marginRight: 8 }]} onPress={onLogout}>
                  <Feather name="log-out" size={20} color="#FFFFFF" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconButton}>
                  <Feather name="search" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Greeting */}
            <View style={styles.greetingContainer}>
              <Text style={styles.greetingText}>
                Hello, {currentUser?.fullName || currentUser?.email?.split('@')[0] || 'Owner'}! 👋
              </Text>
              <Text style={styles.subGreetingText}>Here's your property overview.</Text>
            </View>
          </SafeAreaView>

          {/* Stats Grid Layout */}
          <View style={styles.statsGrid}>
            {stats.map((item, index) => (
              <View key={index} style={styles.statCard}>
                <Text style={[styles.statCardTitle, { color: item.titleColor }]}>
                  {item.title}
                </Text>
                <View style={styles.statCardValueRow}>
                  <Text style={styles.statCardValue}>{item.value}</Text>
                  {item.hasIcon && (
                    <MaterialCommunityIcons
                      name="clock-alert-outline"
                      size={18}
                      color="#8B5CF6"
                      style={styles.statIcon}
                    />
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Lower Content Section */}
        <View style={styles.lowerSection}>
          <Text style={styles.sectionTitle}>My Boarding Places</Text>

          {boardings.length === 0 ? (
            <View style={styles.emptyStateContainer}>
              <Feather name="home" size={32} color="#94A3B8" />
              <Text style={styles.emptyStateText}>No boarding places listed yet.</Text>
              <Text style={styles.emptyStateSubtext}>Tap "Add New Boarding" to add your first property!</Text>
            </View>
          ) : (
            boardings.map((boarding, index) => (
              <TouchableOpacity
                key={boarding._id || index}
                style={styles.boardingCard}
                activeOpacity={0.9}
                onPress={() => onEditBoarding && onEditBoarding(boarding)}
              >
                <View style={styles.boardingHeaderRow}>
                  <View style={styles.boardingTypeContainer}>
                    <Text style={styles.boardingTypeText}>{boarding.boardingType}</Text>
                  </View>
                  <Text style={styles.propertyName} numberOfLines={1}>
                    {boarding.boardingName}
                  </Text>
                  <TouchableOpacity
                    onPress={() => handleDelete(boarding._id)}
                    style={styles.deleteButton}
                    hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
                  >
                    <Feather name="trash-2" size={18} color="#EF4444" />
                  </TouchableOpacity>
                </View>

                <View style={styles.boardingBodyRow}>
                  {boarding.coverImage ? (
                    <Image source={{ uri: boarding.coverImage }} style={styles.boardingImage} />
                  ) : (
                    <View style={styles.boardingImagePlaceholder}>
                      <Ionicons name="image-outline" size={20} color="#94A3B8" />
                    </View>
                  )}

                  <View style={styles.boardingDetails}>
                    <View style={styles.locationRow}>
                      <Feather name="map-pin" size={11} color="#64748B" style={{ marginRight: 4 }} />
                      <Text style={styles.boardingLocation} numberOfLines={1}>
                        {boarding.location}
                      </Text>
                    </View>
                    <Text style={styles.boardingRoomStats}>
                      {boarding.totalRooms} Rooms • {boarding.totalBeds || 0} Beds
                    </Text>
                    <Text style={styles.boardingPrice}>
                      Rs. {parseInt(boarding.pricePerMonth || 0).toLocaleString()} / mo
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}


          <TouchableOpacity
            style={styles.addBoardingButton}
            onPress={onAddBoarding}
            activeOpacity={0.85}
          >
            <Text style={styles.addBoardingButtonText}>Add New Boarding</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>



      {/* Bottom Tab Navigation Bar */}
      <View style={styles.bottomTabBar}>
        <TouchableOpacity style={styles.tabItem}>
          <Feather name="home" size={22} color="#6D28D9" />
          <Text style={[styles.tabLabel, styles.activeTabLabel]}>Dashboard</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem}>
          <Feather name="calendar" size={22} color="#64748B" />
          <Text style={styles.tabLabel}>Reservations</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem}>
          <Feather name="user" size={22} color="#64748B" />
          <Text style={styles.tabLabel}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    paddingBottom: 100, // Margin to prevent overlapping with bottom tab bar
  },
  headerContainer: {
    backgroundColor: '#6D28D9', // Deep purple
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 20 : 10,
    paddingBottom: 25,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 6,
  },
  greetingContainer: {
    marginTop: 15,
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  greetingText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
  },
  subGreetingText: {
    color: '#E9D5FF', // Soft purple
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 10,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 14,
    width: (width - 32 - 16) / 3, // Calculated width for 3 cards per row including paddings
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    justifyContent: 'space-between',
    height: 78,
  },
  statCardTitle: {
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 12,
  },
  statCardValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: 4,
  },
  statCardValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  statIcon: {
    marginLeft: 4,
  },
  lowerSection: {
    paddingHorizontal: 20,
    paddingTop: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 15,
  },
  reservationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  reservationHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  floorText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E3A8A', // Dark blue
    marginRight: 10,
  },
  propertyName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1,
  },
  arrowIcon: {
    alignSelf: 'center',
  },
  reservationBodyRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  reservationDetails: {
    flex: 1,
  },
  guestName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E3A8A', // matching the mockup's guest name style color
  },
  checkInDate: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  statusBadge: {
    backgroundColor: '#FFF7ED', // light orange
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FFEDD5',
  },
  statusText: {
    color: '#EA580C', // orange
    fontSize: 12,
    fontWeight: '700',
  },
  bottomTabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 65,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingBottom: Platform.OS === 'ios' ? 15 : 0,
  },
  tabItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 3,
  },
  activeTabLabel: {
    color: '#6D28D9',
    fontWeight: '700',
  },
  addBoardingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6D28D9',
    borderRadius: 14,
    paddingVertical: 14,
    marginTop: 16,
    shadowColor: '#6D28D9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  addBoardingButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  fab: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6D28D9',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6D28D9',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  boardingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 12,
  },
  boardingHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  boardingTypeContainer: {
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginRight: 10,
  },
  boardingTypeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#6D28D9',
  },
  boardingBodyRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  boardingImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
    marginRight: 12,
    backgroundColor: '#F1F5F9',
  },
  boardingImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  boardingDetails: {
    flex: 1,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  boardingLocation: {
    fontSize: 12,
    color: '#64748B',
    flex: 1,
  },
  boardingRoomStats: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 2,
  },
  boardingPrice: {
    fontSize: 13,
    fontWeight: '700',
    color: '#10B981',
  },
  emptyStateContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 25,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    marginBottom: 12,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#475569',
    marginTop: 8,
    fontWeight: '700',
  },
  emptyStateSubtext: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
    textAlign: 'center',
  },
  deleteButton: {
    padding: 6,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
