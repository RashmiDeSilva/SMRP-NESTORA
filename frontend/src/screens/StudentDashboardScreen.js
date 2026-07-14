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
  Alert,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import { SafeAreaView } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function StudentDashboardScreen({
  currentUser,
  boardings = [],
  onLogout,
  onViewBoarding,
  savedBoardingIds = [],
  bookings = [],
}) {
  const [activeFilter, setActiveFilter] = useState('all');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [bookingTab, setBookingTab] = useState('Active'); // Active, Completed, Cancelled
  const [searchText, setSearchText] = useState('');

  const firstName = currentUser?.fullName?.split(' ')[0]
    || currentUser?.email?.split('@')[0]
    || 'Student';

  const stats = [
    {
      id: 'saved',
      icon: 'heart',
      label: 'Saveds',
      value: String(savedBoardingIds.length),
      iconColor: '#6D28D9',
    },
    {
      id: 'bookings',
      icon: 'calendar',
      label: 'Bookings',
      value: String(bookings.length),
      iconColor: '#6D28D9',
    },
  ];

  // Filter list depending on active filter and search text
  let baseBoardings = activeFilter === 'saved'
    ? boardings.filter((b) => savedBoardingIds.includes(b._id))
    : boardings;

  const filteredBoardings = searchText.trim() === ''
    ? baseBoardings
    : baseBoardings.filter(b => {
      const q = searchText.toLowerCase();
      return (b.location && b.location.toLowerCase().includes(q)) ||
        (b.boardingName && b.boardingName.toLowerCase().includes(q));
    });

  const renderBookingCard = (booking) => {
    let statusLabel = 'Pending';
    let statusColor = '#F97316'; // orange
    let statusBg = '#FFF7ED';

    if (booking.status === 'confirmed') {
      statusLabel = 'Confirmed';
      statusColor = '#10B981'; // green
      statusBg = '#ECFDF5';
    } else if (booking.status === 'completed' || booking.status === 'paid') {
      statusLabel = 'Completed';
      statusColor = '#10B981';
      statusBg = '#ECFDF5';
    } else if (booking.status === 'rejected' || booking.status === 'cancelled') {
      statusLabel = 'Cancelled';
      statusColor = '#EF4444'; // red
      statusBg = '#FEF2F2';
    }

    // Determine mocked dates based on createdAt to look like the mockup
    const dateObj = new Date(booking.createdAt || Date.now());
    const checkinDateStr = dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, ' ');
    dateObj.setMonth(dateObj.getMonth() + 6);
    const checkoutDateStr = dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, ' ');

    return (
      <TouchableOpacity
        key={booking._id}
        style={styles.mockupCard}
        activeOpacity={0.88}
        onPress={() => onViewBoarding && onViewBoarding(booking.boarding)}
      >
        <View style={styles.mockupImageWrapper}>
          {booking.boarding?.coverImage ? (
            <Image source={{ uri: booking.boarding.coverImage }} style={styles.mockupImage} />
          ) : (
            <View style={[styles.mockupImage, { backgroundColor: '#F3E8FF', justifyContent: 'center', alignItems: 'center' }]}>
              <Ionicons name="home-outline" size={24} color="#6D28D9" />
            </View>
          )}
        </View>

        <View style={styles.mockupInfo}>
          <View style={styles.mockupTitleRow}>
            <Text style={styles.mockupTitle} numberOfLines={1}>{booking.boarding?.boardingName || 'Boarding Place'}</Text>
            <Feather name="chevron-right" size={16} color="#2563EB" />
          </View>

          <View style={styles.mockupDatesRow}>
            <View style={styles.mockupDateCol}>
              <Text style={styles.mockupDateLabel}>Check-in</Text>
              <Text style={styles.mockupDateValue}>{checkinDateStr}</Text>
            </View>
            <View style={styles.mockupDateCol}>
              <Text style={styles.mockupDateLabel}>Check-out</Text>
              <Text style={styles.mockupDateValue}>{checkoutDateStr}</Text>
            </View>

            <View style={styles.mockupStatusCol}>
              {statusLabel === 'Confirmed' && <Text style={styles.mockupStatusTopLabel}>Confirmed</Text>}
              <View style={[styles.mockupBadge, { backgroundColor: statusBg }]}>
                <Text style={[styles.mockupBadgeText, { color: statusColor }]}>{statusLabel}</Text>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderBoardingCard = (item) => (
    <TouchableOpacity
      key={item._id}
      style={styles.propertyCard}
      activeOpacity={0.88}
      onPress={() => onViewBoarding && onViewBoarding(item)}
    >
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
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {activeFilter === 'bookings' ? (
          <SafeAreaView>
            <View style={styles.bookingsHeaderRow}>
              <TouchableOpacity onPress={() => setActiveFilter('all')}>
                <Feather name="arrow-left" size={24} color="#0F172A" />
              </TouchableOpacity>
              <Text style={styles.bookingsHeaderTitle}>My Bookings</Text>
              <View style={{ width: 24 }} />
            </View>
            <View style={styles.bookingTabsContainer}>
              {['Active', 'Cancelled'].map(tab => (
                <TouchableOpacity
                  key={tab}
                  style={[styles.bookingTabButton, bookingTab === tab && styles.bookingTabButtonActive]}
                  onPress={() => setBookingTab(tab)}
                >
                  <Text style={[styles.bookingTabText, bookingTab === tab && styles.bookingTabTextActive]}>{tab}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </SafeAreaView>
        ) : (
          <>
            {/* ── Purple Header ── */}
            <View style={styles.headerContainer}>
              <SafeAreaView>
                {/* Top Bar */}
                <View style={styles.topBar}>
                  <TouchableOpacity style={styles.iconButton} onPress={() => setIsMenuOpen(true)}>
                    <Ionicons name="menu-outline" size={26} color="#FFFFFF" />
                  </TouchableOpacity>

                  <View style={styles.topBarRight}>
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
                    placeholder="Search by location"
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

          </>
        )}

        {/* ── Main List Area ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            {activeFilter !== 'bookings' && (
              <Text style={styles.sectionTitle}>
                {activeFilter === 'saved' ? 'Saved Boardings' : 'Available Boardings'}
              </Text>
            )}
            {activeFilter !== 'all' && activeFilter !== 'bookings' && (
              <TouchableOpacity onPress={() => setActiveFilter('all')}>
                <Text style={styles.viewAllText}>Show All</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Main List mappings */}
          {activeFilter === 'bookings' ? (
            bookings.filter(b => {
              if (bookingTab === 'Active') return b.status === 'pending' || b.status === 'confirmed' || b.status === 'completed' || b.status === 'paid';
              if (bookingTab === 'Cancelled') return b.status === 'rejected' || b.status === 'cancelled';
              return true;
            }).length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="calendar-outline" size={40} color="#CBD5E1" />
                <Text style={styles.emptyStateText}>No {bookingTab.toLowerCase()} bookings found.</Text>
                <Text style={styles.emptyStateSub}>Tap any boarding place card and select "Inquire / Book" to start!</Text>
              </View>
            ) : (
              bookings
                .filter(b => {
                  if (bookingTab === 'Active') return b.status === 'pending' || b.status === 'confirmed' || b.status === 'completed' || b.status === 'paid';
                  if (bookingTab === 'Cancelled') return b.status === 'rejected' || b.status === 'cancelled';
                  return true;
                })
                .map(renderBookingCard)
            )
          ) : (
            filteredBoardings.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="home-outline" size={40} color="#CBD5E1" />
                <Text style={styles.emptyStateText}>
                  {activeFilter === 'saved' ? 'No saved boardings yet.' : 'No boarding places available yet.'}
                </Text>
                <Text style={styles.emptyStateSub}>
                  {activeFilter === 'saved' ? 'Go back and click the heart icon to save!' : 'Check back soon!'}
                </Text>
              </View>
            ) : (
              filteredBoardings.map(renderBoardingCard)
            )
          )}
        </View>
      </ScrollView>

      {/* ── Bottom Tab Bar ── */}
      <View style={styles.bottomTabBar}>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveFilter('all')}
        >
          <Feather name="home" size={22} color={activeFilter === 'all' ? '#6D28D9' : '#94A3B8'} />
          <Text style={[styles.tabLabel, activeFilter === 'all' && styles.activeTabLabel]}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveFilter('saved')}
        >
          <Feather name="heart" size={22} color={activeFilter === 'saved' ? '#6D28D9' : '#94A3B8'} />
          <Text style={[styles.tabLabel, activeFilter === 'saved' && styles.activeTabLabel]}>Saved</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveFilter('bookings')}
        >
          <Feather name="calendar" size={22} color={activeFilter === 'bookings' ? '#6D28D9' : '#94A3B8'} />
          <Text style={[styles.tabLabel, activeFilter === 'bookings' && styles.activeTabLabel]}>Bookings</Text>
        </TouchableOpacity>

      </View>
    
      {/* ── Side Menu Modal ── */}
      <Modal visible={isMenuOpen} transparent animationType="fade" onRequestClose={() => setIsMenuOpen(false)}>
        <View style={styles.menuOverlay}>
          <TouchableWithoutFeedback onPress={() => setIsMenuOpen(false)}>
            <View style={styles.menuBackdrop} />
          </TouchableWithoutFeedback>
          
          <View style={styles.menuContent}>
            <View style={styles.menuHeader}>
              <View style={styles.menuAvatarWrapper}>
                <Image 
                  source={{uri: 'https://cdn-icons-png.flaticon.com/512/149/149071.png'}} 
                  style={styles.menuAvatar} 
                />
              </View>
              <Text style={[styles.menuUserName, {color: '#6D28D9'}]}>{firstName || 'shasha!'}</Text>
            </View>

            <ScrollView style={styles.menuList}>
              <TouchableOpacity style={styles.menuItem}>
                <Feather name="user" size={20} color="#64748B" style={styles.menuItemIcon} />
                <Text style={styles.menuItemText}>Edit Profile</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem}>
                <Feather name="lock" size={20} color="#64748B" style={styles.menuItemIcon} />
                <Text style={styles.menuItemText}>Security Settings</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem}>
                <Feather name="bell" size={20} color="#64748B" style={styles.menuItemIcon} />
                <Text style={styles.menuItemText}>Notification Preferences</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem}>
                <Feather name="shield" size={20} color="#64748B" style={styles.menuItemIcon} />
                <Text style={styles.menuItemText}>Verification Center</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem}>
                <Feather name="settings" size={20} color="#64748B" style={styles.menuItemIcon} />
                <Text style={styles.menuItemText}>Account Settings</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem}>
                <Feather name="help-circle" size={20} color="#64748B" style={styles.menuItemIcon} />
                <Text style={styles.menuItemText}>Help & Support</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem} onPress={() => { setIsMenuOpen(false); onLogout && onLogout(); }}>
                <Feather name="log-out" size={20} color="#64748B" style={styles.menuItemIcon} />
                <Text style={styles.menuItemText}>Logout</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  
  // ── Menu Styles ──
  menuOverlay: {
    flex: 1,
    flexDirection: 'row',
  },
  menuBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  menuContent: {
    width: width * 0.75,
    backgroundColor: '#FFFFFF',
    height: '100%',
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    borderTopRightRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  menuHeader: {
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  menuAvatarWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    overflow: 'hidden',
  },
  menuAvatar: {
    width: '100%',
    height: '100%',
  },
  menuUserName: {
    fontSize: 22,
    fontWeight: '900',
  },
  menuList: {
    flex: 1,
    paddingTop: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  menuItemIcon: {
    marginRight: 16,
  },
  menuItemText: {
    fontSize: 15,
    color: '#1E293B',
    fontWeight: '500',
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

  // ── Mockup UI (Bookings) ──────────────────────────────
  bookingsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#F8FAFC',
  },
  bookingsHeaderTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  bookingTabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 10,
    gap: 8,
  },
  bookingTabButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  bookingTabButtonActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  bookingTabText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  bookingTabTextActive: {
    color: '#FFFFFF',
  },
  mockupCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 14,
    flexDirection: 'row',
    shadowColor: '#6D28D9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  mockupImageWrapper: {
    width: 80,
    height: 80,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    marginRight: 12,
  },
  mockupImage: {
    width: '100%',
    height: '100%',
  },
  mockupHeartIcon: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 12,
    padding: 4,
  },
  mockupInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  mockupTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  mockupTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1,
  },
  mockupDatesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  mockupDateCol: {
    flexDirection: 'column',
  },
  mockupDateLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 2,
  },
  mockupDateValue: {
    fontSize: 11,
    color: '#2563EB',
    fontWeight: '700',
  },
  mockupStatusCol: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  mockupStatusTopLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#10B981',
    marginBottom: 4,
  },
  mockupBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  mockupBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  typeBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusPending: {
    backgroundColor: '#FFFBEB',
  },
  statusConfirmed: {
    backgroundColor: '#ECFDF5',
  },
  statusRejected: {
    backgroundColor: '#FEF2F2',
  },
  statusBadgeText: {
    fontSize: 9,
    fontWeight: '800',
  },
  statusTextPending: {
    color: '#D97706',
  },
  statusTextConfirmed: {
    color: '#059669',
  },
  statusTextRejected: {
    color: '#DC2626',
  },
  bookingMessage: {
    fontSize: 11,
    color: '#475569',
    fontStyle: 'italic',
    marginBottom: 4,
    fontWeight: '500',
  },
});
