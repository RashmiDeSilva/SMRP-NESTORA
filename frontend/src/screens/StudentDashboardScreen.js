import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Dimensions,
  Platform,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function StudentDashboardScreen({ currentUser, boardings = [], onLogout }) {
  const [searchText, setSearchText] = useState('');

  const firstName = currentUser?.fullName?.split(' ')[0]
    || currentUser?.email?.split('@')[0]
    || 'Student';

  const stats = [
    {
      icon: 'heart',
      label: 'Saveds',
      value: '12',
      iconColor: '#6D28D9',
    },
    {
      icon: 'calendar',
      label: 'Bookings',
      value: '3 Active',
      iconColor: '#6D28D9',
    },
    {
      icon: 'star',
      label: 'Reviews',
      value: '8',
      iconColor: '#6D28D9',
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ── Purple Header ── */}
        <View style={styles.headerContainer}>
          <SafeAreaView>
            {/* Top Bar */}
            <View style={styles.topBar}>
              <TouchableOpacity style={styles.iconButton}>
                <Ionicons name="menu-outline" size={26} color="#FFFFFF" />
              </TouchableOpacity>

              <View style={styles.topBarRight}>
                <TouchableOpacity style={styles.notifButton}>
                  <Feather name="bell" size={22} color="#FFFFFF" />
                  {/* Notification dot */}
                  <View style={styles.notifDot} />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.iconButton, { marginLeft: 4 }]} onPress={onLogout}>
                  <Feather name="log-out" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Greeting */}
            <View style={styles.greetingContainer}>
              <Text style={styles.greetingText}>Hello, {firstName}! 👋</Text>
              <Text style={styles.subGreetingText}>Ready to find your perfect stay?</Text>
            </View>

            {/* Search Bar */}
            <View style={styles.searchBar}>
              <Feather name="search" size={18} color="#94A3B8" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search location, university, area..."
                placeholderTextColor="#94A3B8"
                value={searchText}
                onChangeText={setSearchText}
              />
              <TouchableOpacity style={styles.searchButton}>
                <Feather name="search" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>

        {/* ── Stats Row ── */}
        <View style={styles.statsRow}>
          {stats.map((stat, index) => (
            <View key={index} style={styles.statCard}>
              <Feather name={stat.icon} size={22} color={stat.iconColor} />
              <Text style={styles.statLabel}>{stat.label}</Text>
              <Text style={styles.statValue}>{stat.value}</Text>
            </View>
          ))}
        </View>

        {/* ── Recently Viewed (Live from DB) ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Available Boardings</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          {boardings.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="home-outline" size={40} color="#CBD5E1" />
              <Text style={styles.emptyStateText}>No boarding places available yet.</Text>
              <Text style={styles.emptyStateSub}>Check back soon!</Text>
            </View>
          ) : (
            boardings.map((item) => (
              <TouchableOpacity key={item._id} style={styles.propertyCard} activeOpacity={0.88}>
                {/* Property Image */}
                <View style={styles.propertyImageWrapper}>
                  {item.coverImage ? (
                    <Image source={{ uri: item.coverImage }} style={styles.propertyImage} />
                  ) : (
                    <View style={styles.propertyImagePlaceholder}>
                      <Ionicons name="home-outline" size={32} color="#6D28D9" />
                    </View>
                  )}
                </View>

                {/* Property Info */}
                <View style={styles.propertyInfo}>
                  <View style={styles.typeBadge}>
                    <Text style={styles.typeBadgeText}>{item.boardingType}</Text>
                  </View>
                  <Text style={styles.propertyName} numberOfLines={1}>{item.boardingName}</Text>

                  <View style={styles.propertyLocationRow}>
                    <Feather name="map-pin" size={11} color="#94A3B8" style={{ marginRight: 3 }} />
                    <Text style={styles.propertyLocation} numberOfLines={1}>{item.location}</Text>
                  </View>

                  <Text style={styles.propertyPrice}>
                    Rs. {parseInt(item.pricePerMonth || 0).toLocaleString()}{' '}
                    <Text style={styles.propertyPriceSuffix}>/ month</Text>
                  </Text>

                  <View style={styles.propertyMeta}>
                    <Text style={styles.roomsText}>{item.totalRooms} Rooms</Text>
                    {item.totalBeds > 0 && (
                      <Text style={styles.roomsText}> • {item.totalBeds} Beds</Text>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>

      {/* ── Bottom Tab Bar ── */}
      <View style={styles.bottomTabBar}>
        <TouchableOpacity style={styles.tabItem}>
          <Feather name="home" size={22} color="#6D28D9" />
          <Text style={[styles.tabLabel, styles.activeTabLabel]}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem}>
          <Feather name="search" size={22} color="#94A3B8" />
          <Text style={styles.tabLabel}>Search</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem}>
          <Feather name="calendar" size={22} color="#94A3B8" />
          <Text style={styles.tabLabel}>Bookings</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem}>
          <Feather name="user" size={22} color="#94A3B8" />
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
    paddingBottom: 90,
  },

  // ── Header ──────────────────────────────────────────────
  headerContainer: {
    backgroundColor: '#6D28D9',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 18 : 10,
    paddingBottom: 28,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 6,
  },
  notifButton: {
    padding: 6,
    position: 'relative',
  },
  notifDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F59E0B',
    borderWidth: 1.5,
    borderColor: '#6D28D9',
  },
  greetingContainer: {
    marginTop: 10,
    marginBottom: 20,
  },
  greetingText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
  },
  subGreetingText: {
    color: '#E9D5FF',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
  },

  // ── Search Bar ──────────────────────────────────────────
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#FFFFFF',
    paddingVertical: 8,
    fontWeight: '500',
  },
  searchButton: {
    backgroundColor: '#5B21B6',
    borderRadius: 10,
    padding: 8,
    marginLeft: 6,
  },

  // ── Stats ────────────────────────────────────────────────
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 20,
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 8,
    alignItems: 'center',
    shadowColor: '#6D28D9',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
    marginTop: 6,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 3,
    textAlign: 'center',
  },

  // ── Section ──────────────────────────────────────────────
  section: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6D28D9',
  },

  // ── Property Card ────────────────────────────────────────
  propertyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  propertyImageWrapper: {
    marginRight: 14,
    borderRadius: 14,
    overflow: 'hidden',
  },
  propertyImage: {
    width: 90,
    height: 90,
    borderRadius: 14,
  },
  propertyImagePlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 14,
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  propertyInfo: {
    flex: 1,
  },
  propertyName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  propertyLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  propertyLocation: {
    fontSize: 12,
    color: '#94A3B8',
    flex: 1,
    fontWeight: '500',
  },
  propertyPriceRow: {
    marginBottom: 6,
  },
  propertyPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: '#6D28D9',
  },
  propertyPriceSuffix: {
    fontSize: 12,
    fontWeight: '500',
    color: '#94A3B8',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F59E0B',
  },

  // ── Bottom Tab Bar ───────────────────────────────────────
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
    color: '#94A3B8',
    marginTop: 3,
  },
  activeTabLabel: {
    color: '#6D28D9',
    fontWeight: '700',
  },

  // ── Type Badge ───────────────────────────────────────────
  typeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#F3E8FF',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginBottom: 4,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#6D28D9',
  },

  // ── Property Meta ────────────────────────────────────────
  propertyMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  roomsText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },

  // ── Empty State ──────────────────────────────────────────
  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
  },
  emptyStateText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
    marginTop: 10,
  },
  emptyStateSub: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
  },
});
