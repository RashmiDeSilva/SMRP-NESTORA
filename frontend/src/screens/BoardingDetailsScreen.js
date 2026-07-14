import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  Dimensions,
  Platform,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function BoardingDetailsScreen({ boarding, onBack, isSaved, onToggleSave, onBook }) {
  if (!boarding) return null;

  // Resolve active facilities from database
  const activeFacilities = [];
  if (boarding.facilities) {
    if (boarding.facilities.wifi) activeFacilities.push({ label: 'Wi-Fi', icon: 'wifi' });
    if (boarding.facilities.ac) activeFacilities.push({ label: 'AC', icon: 'wind' });
    if (boarding.facilities.hotWater) activeFacilities.push({ label: 'Hot Water', icon: 'droplet' });
    if (boarding.facilities.parking) activeFacilities.push({ label: 'Parking', icon: 'car' });
    if (boarding.facilities.laundry) activeFacilities.push({ label: 'Laundry', icon: 'layers' });
    if (boarding.facilities.kitchen) activeFacilities.push({ label: 'Kitchen', icon: 'coffee' });
  }

  // Ensure default/fallback list matches the mockup visual layout perfectly
  if (activeFacilities.length === 0) {
    activeFacilities.push({ label: 'Wi-Fi', icon: 'wifi' });
    activeFacilities.push({ label: 'AC', icon: 'wind' });
    activeFacilities.push({ label: 'Hot Water', icon: 'droplet' });
    activeFacilities.push({ label: 'CCTV', icon: 'video' });
    activeFacilities.push({ label: 'Kitchen', icon: 'coffee' });
  }

  const handleBook = () => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Would you like to send a booking inquiry for this boarding place?');
      if (confirmed && onBook) {
        onBook('Hi, I am interested in booking this boarding place. Please confirm my request!');
      }
    } else if (Platform.OS === 'ios') {
      Alert.prompt(
        'Confirm Booking Inquiry',
        'Send a message to the boarding owner:',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Send Inquiry',
            onPress: (message) => {
              if (onBook) onBook(message || 'Hi, I would like to book this boarding place!');
            },
          },
        ],
        'plain-text',
        'Hi, I would like to book this boarding place!'
      );
    } else {
      Alert.alert(
        'Confirm Booking Inquiry',
        'Would you like to send a booking inquiry for this boarding place?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Send Inquiry',
            onPress: () => {
              if (onBook) onBook('Hi, I am interested in booking this boarding place. Please confirm my request!');
            },
          },
        ]
      );
    }
  };

  const toggleSave = () => {
    if (onToggleSave) onToggleSave(boarding._id);
    Alert.alert('Save', isSaved ? 'Removed from saved boarding places.' : 'Saved to your profile!');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Top Cover Image Card */}
        <View style={styles.imageCard}>
          {boarding.coverImage ? (
            <Image source={{ uri: boarding.coverImage }} style={styles.coverImage} />
          ) : (
            <View style={styles.coverImagePlaceholder}>
              <Ionicons name="home-outline" size={80} color="#CBD5E1" />
            </View>
          )}

          {/* Top Actions Overlay */}
          <SafeAreaView style={styles.headerOverlay}>
            <View style={styles.headerBar}>
              <TouchableOpacity style={styles.circleBtn} onPress={onBack} activeOpacity={0.8}>
                <Ionicons name="arrow-back" size={20} color="#1E293B" />
              </TouchableOpacity>

              <View style={styles.headerRight}>
                <TouchableOpacity style={[styles.circleBtn, { marginRight: 10 }]} activeOpacity={0.8}>
                  <Ionicons name="share-social-outline" size={20} color="#1E293B" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.circleBtn} onPress={toggleSave} activeOpacity={0.8}>
                  <Ionicons 
                    name={isSaved ? "heart" : "heart-outline"} 
                    size={20} 
                    color={isSaved ? "#EF4444" : "#1E293B"} 
                  />
                </TouchableOpacity>
              </View>
            </View>
          </SafeAreaView>

          {/* V10 status badge bottom right */}
          <View style={styles.badgeOverlay}>
            <Text style={styles.badgeText}>V10</Text>
          </View>
        </View>

        {/* Content Body */}
        <View style={styles.body}>
          {/* Title & Info Section */}
          <View style={styles.titleSection}>
            <View style={styles.titleLeft}>
              <Text style={styles.boardingName}>{boarding.boardingName}</Text>
              <View style={styles.locationRow}>
                <Ionicons name="location" size={16} color="#6D28D9" style={styles.pinIcon} />
                <Text style={styles.locationText}>{boarding.location || 'Colombo, Sri Lanka'}</Text>
              </View>
            </View>

            <View style={styles.titleRight}>
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={16} color="#F59E0B" style={{ marginRight: 4 }} />
                <Text style={styles.ratingText}>4.6</Text>
                <Text style={styles.reviewCountText}> (108 Review)</Text>
              </View>
              <Text style={styles.priceText}>
                <Text style={styles.priceBold}>Rs. {parseInt(boarding.pricePerMonth || 0).toLocaleString()}</Text>
                <Text style={styles.priceSuffix}> / month</Text>
              </Text>
            </View>
          </View>

          {/* Facilities Row */}
          <View style={styles.facilitiesSection}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.facilitiesScroll}>
              {activeFacilities.map((fac, idx) => (
                <View key={idx} style={styles.facilityCard}>
                  <View style={styles.facilityIconBox}>
                    <Feather name={fac.icon} size={20} color="#6D28D9" />
                  </View>
                  <Text style={styles.facilityLabel}>{fac.label}</Text>
                </View>
              ))}
              <View style={styles.facilityCard}>
                <View style={[styles.facilityIconBox, styles.facilityIconBoxExtra]}>
                  <Text style={styles.extraText}>+5</Text>
                </View>
                <Text style={styles.facilityLabel}>+5</Text>
              </View>
            </ScrollView>
          </View>

          {/* Description Section */}
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.descriptionText}>
              {boarding.description || 
                "A comfortable and safe annex located in a quiet environment. Perfect for students and working professionals. Includes easy access to supermarkets, public transportation, and nearby universities."}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.saveBtn} onPress={toggleSave} activeOpacity={0.8}>
          <Ionicons 
            name={isSaved ? "heart" : "heart-outline"} 
            size={20} 
            color="#6D28D9" 
            style={{ marginRight: 6 }} 
          />
          <Text style={styles.saveBtnText}>Save</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.bookBtn} onPress={handleBook} activeOpacity={0.85}>
          <Text style={styles.bookBtnText}>Inquire / Book</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingBottom: 110,
  },
  
  // ── Cover Image Card ──────────────────────────────────────
  imageCard: {
    width: width,
    height: height * 0.36,
    position: 'relative',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: 'hidden',
    backgroundColor: '#F1F5F9',
  },
  coverImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  coverImagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Overlay header buttons
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 24 : 10,
  },
  circleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  // V10 Badge bottom right overlay
  badgeOverlay: {
    position: 'absolute',
    bottom: 14,
    right: 16,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },

  // ── Content Body ──────────────────────────────────────────
  body: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  titleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  titleLeft: {
    flex: 1.1,
    paddingRight: 6,
  },
  boardingName: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 6,
    lineHeight: 26,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pinIcon: {
    marginRight: 3,
  },
  locationText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  titleRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  reviewCountText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  priceText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  priceBold: {
    fontSize: 17,
    fontWeight: '900',
    color: '#6D28D9',
  },
  priceSuffix: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },

  // ── Facilities Row ────────────────────────────────────────
  facilitiesSection: {
    marginBottom: 20,
    marginLeft: -20,
    marginRight: -20,
  },
  facilitiesScroll: {
    paddingHorizontal: 20,
    paddingVertical: 2,
  },
  facilityCard: {
    alignItems: 'center',
    marginRight: 14,
  },
  facilityIconBox: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  facilityIconBoxExtra: {
    backgroundColor: '#EEF2F6',
  },
  extraText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#6D28D9',
  },
  facilityLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },

  // ── Description Block ─────────────────────────────────────
  descriptionSection: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 20,
    fontWeight: '500',
  },

  // ── Bottom Fixed Bar ──────────────────────────────────────
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: Platform.OS === 'ios' ? 88 : 68,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 20 : 0,
  },
  saveBtn: {
    flex: 0.35,
    height: 44,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#6D28D9',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  saveBtnText: {
    color: '#6D28D9',
    fontSize: 14,
    fontWeight: '800',
  },
  bookBtn: {
    flex: 0.65,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#6D28D9',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6D28D9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  bookBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
