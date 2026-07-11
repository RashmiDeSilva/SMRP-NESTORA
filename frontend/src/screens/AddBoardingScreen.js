import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  StatusBar,
  SafeAreaView,
  Alert,
  Image,
  ActionSheetIOS,
} from 'react-native';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

const { width } = Dimensions.get('window');

// Step labels as shown in the mockup
const STEPS = ['Basic Information', 'Media & Photos', 'Facilities & Review'];
const BOARDING_TYPES = ['Hostel', 'Annex', 'Room'];

export default function AddBoardingScreen({ onBack, onSubmit, initialData }) {
  const [currentStep, setCurrentStep] = useState(1);

  // Helper to initialize photos
  const getInitialPhotos = () => {
    const photos = initialData?.morePhotos || [];
    const slots = [null, null, null, null];
    for (let i = 0; i < 4; i++) {
      if (photos[i]) {
        slots[i] = photos[i];
      }
    }
    return slots;
  };

  // ── Step 1 state ─────────────────────────────────────
  const [boardingName, setBoardingName] = useState(initialData?.boardingName || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [boardingType, setBoardingType] = useState(initialData?.boardingType || 'Annex');
  const [location, setLocation] = useState(initialData?.location || '');

  // ── Step 2 state ─────────────────────────────────────
  const [coverImage, setCoverImage] = useState(initialData?.coverImage || null);   // URI string once picked
  const [morePhotos, setMorePhotos] = useState(getInitialPhotos()); // up to 4 extra photos

  // ── Step 3 state ─────────────────────────────────────
  const [totalRooms, setTotalRooms] = useState(initialData?.totalRooms ? String(initialData.totalRooms) : '');
  const [totalBeds, setTotalBeds] = useState(initialData?.totalBeds ? String(initialData.totalBeds) : '');
  const [pricePerMonth, setPricePerMonth] = useState(initialData?.pricePerMonth ? String(initialData.pricePerMonth) : '');
  const [facilities, setFacilities] = useState(initialData?.facilities || {
    wifi: false,
    parking: false,
    laundry: false,
    kitchen: false,
    ac: false,
    hotWater: false,
  });
  const [contactNumber, setContactNumber] = useState(initialData?.contactNumber || '');
  const [rules, setRules] = useState(initialData?.rules || '');

  const toggleFacility = (key) =>
    setFacilities((prev) => ({ ...prev, [key]: !prev[key] }));

  // ── Navigation ────────────────────────────────────────
  const handleNext = () => {
    if (currentStep === 1) {
      if (!boardingName.trim()) {
        Alert.alert('Validation', 'Please enter a boarding name.');
        return;
      }
      if (!location.trim()) {
        Alert.alert('Validation', 'Please enter a location.');
        return;
      }
    }
    if (currentStep === 3) {
      if (!totalRooms.trim() || !pricePerMonth.trim()) {
        Alert.alert('Validation', 'Please fill in required room details.');
        return;
      }
      handleSubmit();
      return;
    }
    setCurrentStep((s) => s + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((s) => s - 1);
    } else {
      if (onBack) onBack();
    }
  };

  const handleSubmit = () => {
    const boardingData = {
      boardingName,
      description,
      boardingType,
      location,
      coverImage,
      morePhotos: morePhotos.filter(Boolean),
      totalRooms,
      totalBeds,
      pricePerMonth,
      facilities,
      contactNumber,
      rules,
    };
    if (onSubmit) {
      onSubmit(boardingData);
    } else {
      Alert.alert('Success! 🎉', 'Your boarding has been submitted for review.');
    }
  };

  // ── Image Picker Helpers ──────────────────────────────
  /**
   * Ask for media-library permission, then open the given source.
   * Returns the picked URI or null.
   */
  const openPicker = useCallback(async (useCamera = false) => {
    if (useCamera) {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Camera access is required to take photos.');
        return null;
      }
    } else {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Photo library access is required to pick images.');
        return null;
      }
    }

    const result = await (useCamera
      ? ImagePicker.launchCameraAsync
      : ImagePicker.launchImageLibraryAsync)({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.85,
      });

    if (!result.canceled && result.assets?.length > 0) {
      return result.assets[0].uri;
    }
    return null;
  }, []);

  /**
   * Show action sheet (iOS) or Alert (Android) to choose Camera vs Gallery,
   * then call openPicker.
   */
  const showPickerOptions = useCallback((onPicked) => {
    if (Platform.OS === 'web') {
      // Alert.alert with custom buttons doesn't work on React Native Web,
      // so just open the gallery picker directly — no camera choice needed on web.
      openPicker(false).then((uri) => {
        if (uri) onPicked(uri);
      });
      return;
    }

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Take Photo', 'Choose from Library'],
          cancelButtonIndex: 0,
        },
        async (buttonIndex) => {
          if (buttonIndex === 1) {
            const uri = await openPicker(true);
            if (uri) onPicked(uri);
          } else if (buttonIndex === 2) {
            const uri = await openPicker(false);
            if (uri) onPicked(uri);
          }
        },
      );
    } else {
      // Android – use Alert as a simple action sheet
      Alert.alert(
        'Add Photo',
        'Choose how you want to add a photo',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: '📷  Take Photo',
            onPress: async () => {
              const uri = await openPicker(true);
              if (uri) onPicked(uri);
            },
          },
          {
            text: '🖼️  Choose from Library',
            onPress: async () => {
              const uri = await openPicker(false);
              if (uri) onPicked(uri);
            },
          },
        ],
      );
    }
  }, [openPicker]);

  /** Pick / replace the cover image */
  const pickCoverImage = () => {
    showPickerOptions((uri) => setCoverImage(uri));
  };

  /** Remove cover image */
  const removeCoverImage = () => {
    if (Platform.OS === 'web') {
      setCoverImage(null);
      return;
    }
    Alert.alert('Remove Cover Photo', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => setCoverImage(null) },
    ]);
  };

  /** Pick a photo for a specific slot in the morePhotos grid */
  const pickMorePhoto = (index) => {
    if (morePhotos[index]) {
      if (Platform.OS === 'web') {
        // No native Alert action sheet on web — just remove directly on click.
        setMorePhotos((prev) => {
          const next = [...prev];
          next[index] = null;
          return next;
        });
        return;
      }
      Alert.alert('Photo Options', 'What would you like to do?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Replace',
          onPress: () =>
            showPickerOptions((uri) => {
              setMorePhotos((prev) => {
                const next = [...prev];
                next[index] = uri;
                return next;
              });
            }),
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () =>
            setMorePhotos((prev) => {
              const next = [...prev];
              next[index] = null;
              return next;
            }),
        },
      ]);
    } else {
      showPickerOptions((uri) => {
        setMorePhotos((prev) => {
          const next = [...prev];
          next[index] = uri;
          return next;
        });
      });
    }
  };

  const facilityList = [
    { key: 'wifi', label: 'Wi-Fi', icon: 'wifi' },
    { key: 'parking', label: 'Parking', icon: 'car' },
    { key: 'laundry', label: 'Laundry', icon: 'layers' },
    { key: 'kitchen', label: 'Kitchen', icon: 'coffee' },
    { key: 'ac', label: 'AC', icon: 'wind' },
    { key: 'hotWater', label: 'Hot Water', icon: 'droplet' },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      {/* ── Header ── */}
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton} activeOpacity={0.7}>
            <Feather name="arrow-left" size={22} color="#1E293B" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{initialData ? 'Update Boarding' : 'Add New Boarding'}</Text>
          <View style={styles.headerPlaceholder} />
        </View>

        {/* ── Step Indicator ── */}
        <View style={styles.stepIndicatorContainer}>
          <Text style={styles.stepLabel}>
            <Text style={styles.stepLabelBold}>
              {currentStep}/{STEPS.length} {STEPS[currentStep - 1]}
            </Text>
          </Text>
          {/* Purple underline under step label */}
          <View style={styles.stepUnderline} />
          {/* Bar track */}
          <View style={styles.stepBarTrack}>
            {STEPS.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.stepBarSegment,
                  i < currentStep ? styles.stepBarActive : styles.stepBarInactive,
                  i < STEPS.length - 1 && { marginRight: 4 },
                ]}
              />
            ))}
          </View>
        </View>
      </SafeAreaView>

      {/* ── Body ── */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >

          {/* ══════════════════════════════════════════
              STEP 1 – Basic Information
          ══════════════════════════════════════════ */}
          {currentStep === 1 && (
            <View>
              {/* Boarding Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Boarding Name</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter boarding name"
                    placeholderTextColor="#94A3B8"
                    value={boardingName}
                    onChangeText={setBoardingName}
                  />
                </View>
              </View>

              {/* Description */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Description</Text>
                <View style={[styles.inputWrapper, styles.textAreaWrapper]}>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Describe your property"
                    placeholderTextColor="#94A3B8"
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                    value={description}
                    onChangeText={setDescription}
                  />
                </View>
              </View>

              {/* Boarding Type */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Boarding Type</Text>
                <View style={styles.typeSelector}>
                  {BOARDING_TYPES.map((type) => (
                    <TouchableOpacity
                      key={type}
                      onPress={() => setBoardingType(type)}
                      style={[
                        styles.typeButton,
                        boardingType === type && styles.typeButtonActive,
                      ]}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.typeButtonText,
                          boardingType === type && styles.typeButtonTextActive,
                        ]}
                      >
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Location */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Location</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter location"
                    placeholderTextColor="#94A3B8"
                    value={location}
                    onChangeText={setLocation}
                  />
                  <TouchableOpacity
                    style={styles.mapButton}
                    onPress={() => Alert.alert('Map', 'Map picker coming soon!')}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="location-outline" size={16} color="#6D28D9" />
                    <Text style={styles.mapButtonText}>Select on Map</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {/* ══════════════════════════════════════════
              STEP 2 – Media & Photos
          ══════════════════════════════════════════ */}
          {currentStep === 2 && (
            <View>
              {/* Add Cover Image */}
              <Text style={styles.sectionHeading}>Add Cover Image</Text>

              {/* Cover upload / preview */}
              <View style={styles.coverContainer}>
                <TouchableOpacity
                  style={styles.coverUploadBox}
                  onPress={pickCoverImage}
                  activeOpacity={0.8}
                >
                  {coverImage ? (
                    <Image
                      source={{ uri: coverImage }}
                      style={[styles.coverPreview, { resizeMode: 'contain', backgroundColor: '#F1F5F9' }]}
                    />
                  ) : (
                    <View style={styles.coverUploadInner}>
                      <View style={styles.cameraIconWrapper}>
                        <Feather name="camera" size={40} color="#6D28D9" />
                      </View>
                      <Text style={styles.coverUploadText}>Tap to Upload a Cover Photo</Text>
                    </View>
                  )}
                </TouchableOpacity>

                {/* Remove cover button – only when image is set */}
                {coverImage && (
                  <TouchableOpacity
                    style={styles.removeCornerBtn}
                    onPress={removeCoverImage}
                    hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
                  >
                    <Feather name="x" size={14} color="#FFFFFF" />
                  </TouchableOpacity>
                )}
              </View>

              {/* More Photos */}
              <Text style={styles.morePhotosLabel}>More Photos</Text>

              <View style={styles.photoGrid}>
                {/* First cell: camera + add button */}
                <View style={styles.photoCell}>
                  <TouchableOpacity
                    style={[styles.photoAddCell, morePhotos[0] && styles.photoCellFilled]}
                    onPress={() => pickMorePhoto(0)}
                    activeOpacity={0.8}
                  >
                    {morePhotos[0] ? (
                      <Image
                        source={{ uri: morePhotos[0] }}
                        style={[styles.photoThumb, { resizeMode: 'contain', backgroundColor: '#F1F5F9' }]}
                      />
                    ) : (
                      <View style={styles.photoAddIcon}>
                        <Feather name="camera" size={22} color="#6D28D9" />
                        <View style={styles.plusBadge}>
                          <Feather name="plus" size={9} color="#FFFFFF" />
                        </View>
                      </View>
                    )}
                  </TouchableOpacity>
                  {morePhotos[0] && (
                    <TouchableOpacity
                      style={styles.removePhotoBtn}
                      onPress={() => pickMorePhoto(0)}
                      hitSlop={{ top: 6, right: 6, bottom: 6, left: 6 }}
                    >
                      <Feather name="x" size={10} color="#FFFFFF" />
                    </TouchableOpacity>
                  )}
                </View>

                {/* Remaining 3 cells */}
                {[1, 2, 3].map((i) => (
                  <View key={i} style={styles.photoCell}>
                    <TouchableOpacity
                      style={[styles.photoEmptyCell, morePhotos[i] && styles.photoCellFilled]}
                      onPress={() => pickMorePhoto(i)}
                      activeOpacity={0.8}
                    >
                      {morePhotos[i] ? (
                        <Image
                          source={{ uri: morePhotos[i] }}
                          style={[styles.photoThumb, { resizeMode: 'contain', backgroundColor: '#F1F5F9' }]}
                        />
                      ) : (
                        <View style={styles.photoEmptyIcon}>
                          <Feather name="plus" size={18} color="#94A3B8" />
                        </View>
                      )}
                    </TouchableOpacity>
                    {morePhotos[i] && (
                      <TouchableOpacity
                        style={styles.removePhotoBtn}
                        onPress={() => pickMorePhoto(i)}
                        hitSlop={{ top: 6, right: 6, bottom: 6, left: 6 }}
                      >
                        <Feather name="x" size={10} color="#FFFFFF" />
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
              </View>

              <Text style={styles.addPhotosHint}>Add Photos</Text>
            </View>
          )}

          {/* ══════════════════════════════════════════
              STEP 3 – Facilities & Review
          ══════════════════════════════════════════ */}
          {currentStep === 3 && (
            <View>
              {/* Summary Card */}
              <View style={styles.summaryCard}>
                <View style={styles.summaryRow}>
                  <MaterialCommunityIcons name="home-city-outline" size={20} color="#6D28D9" />
                  <Text style={styles.summaryTitle}>{boardingName || 'My Boarding'}</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryDetail}>
                  <Text style={styles.summaryKey}>Type</Text>
                  <Text style={styles.summaryValue}>{boardingType}</Text>
                </View>
                <View style={styles.summaryDetail}>
                  <Text style={styles.summaryKey}>Location</Text>
                  <Text style={styles.summaryValue}>{location || '—'}</Text>
                </View>
                <View style={styles.summaryDetail}>
                  <Text style={styles.summaryKey}>Cover Photo</Text>
                  <Text style={styles.summaryValue}>{coverImage ? '✓ Added' : 'Not added'}</Text>
                </View>
              </View>

              {/* Room Details */}
              <View style={styles.rowInputGroup}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.inputLabel}>Total Rooms *</Text>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g. 10"
                      placeholderTextColor="#94A3B8"
                      keyboardType="numeric"
                      value={totalRooms}
                      onChangeText={setTotalRooms}
                    />
                  </View>
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Total Beds</Text>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g. 20"
                      placeholderTextColor="#94A3B8"
                      keyboardType="numeric"
                      value={totalBeds}
                      onChangeText={setTotalBeds}
                    />
                  </View>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Price Per Month (Rs.) *</Text>
                <View style={styles.inputWrapper}>
                  <Text style={styles.currencyPrefix}>Rs.</Text>
                  <TextInput
                    style={[styles.input, { paddingLeft: 4 }]}
                    placeholder="e.g. 15000"
                    placeholderTextColor="#94A3B8"
                    keyboardType="numeric"
                    value={pricePerMonth}
                    onChangeText={setPricePerMonth}
                  />
                </View>
              </View>

              {/* Facilities */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Facilities</Text>
                <View style={styles.facilitiesGrid}>
                  {facilityList.map((fac) => (
                    <TouchableOpacity
                      key={fac.key}
                      onPress={() => toggleFacility(fac.key)}
                      style={[
                        styles.facilityChip,
                        facilities[fac.key] && styles.facilityChipActive,
                      ]}
                      activeOpacity={0.8}
                    >
                      <Feather
                        name={fac.icon}
                        size={14}
                        color={facilities[fac.key] ? '#6D28D9' : '#64748B'}
                        style={{ marginRight: 5 }}
                      />
                      <Text
                        style={[
                          styles.facilityChipText,
                          facilities[fac.key] && styles.facilityChipTextActive,
                        ]}
                      >
                        {fac.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Contact Number */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Contact Number</Text>
                <View style={styles.inputWrapper}>
                  <Feather name="phone" size={16} color="#94A3B8" style={{ marginRight: 8 }} />
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. 0771234567"
                    placeholderTextColor="#94A3B8"
                    keyboardType="phone-pad"
                    value={contactNumber}
                    onChangeText={setContactNumber}
                  />
                </View>
              </View>

              {/* House Rules */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>House Rules (optional)</Text>
                <View style={[styles.inputWrapper, styles.textAreaWrapper]}>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="e.g. No smoking, no pets..."
                    placeholderTextColor="#94A3B8"
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                    value={rules}
                    onChangeText={setRules}
                  />
                </View>
              </View>

              <View style={styles.infoNotice}>
                <Ionicons name="information-circle-outline" size={16} color="#6D28D9" />
                <Text style={styles.infoNoticeText}>
                  Your boarding listing will be reviewed before going live.
                </Text>
              </View>
            </View>
          )}

        </ScrollView>
      </KeyboardAvoidingView>

      {/* ── Bottom Button ── */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.nextButton}
          onPress={handleNext}
          activeOpacity={0.85}
        >
          <Text style={styles.nextButtonText}>
            {currentStep === 3 ? (initialData ? 'Update' : 'Submit') : 'Next'}
          </Text>
          {currentStep < 3 && (
            <Feather name="arrow-right" size={18} color="#FFFFFF" style={{ marginLeft: 6 }} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  safeArea: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 3,
  },

  // ── Header ──────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 44 : 16,
    paddingBottom: 12,
  },
  backButton: {
    padding: 6,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerPlaceholder: { width: 34 },

  // ── Step Indicator ──────────────────────────────────────
  stepIndicatorContainer: {
    paddingHorizontal: 20,
    paddingBottom: 14,
    paddingTop: 6,
  },
  stepLabel: {
    fontSize: 13,
    color: '#0F172A',
    marginBottom: 4,
  },
  stepLabelBold: {
    fontWeight: '800',
    color: '#0F172A',
  },
  stepUnderline: {
    height: 3,
    width: 120,
    backgroundColor: '#6D28D9',
    borderRadius: 4,
    marginBottom: 10,
  },
  stepBarTrack: {
    flexDirection: 'row',
  },
  stepBarSegment: {
    flex: 1,
    height: 4,
    borderRadius: 4,
  },
  stepBarActive: { backgroundColor: '#6D28D9' },
  stepBarInactive: { backgroundColor: '#E2E8F0' },

  // ── Scroll / Form ────────────────────────────────────────
  keyboardView: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 110,
  },

  // ── Generic Input ────────────────────────────────────────
  inputGroup: { marginBottom: 20 },
  rowInputGroup: { flexDirection: 'row', marginBottom: 0 },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    minHeight: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  textAreaWrapper: { alignItems: 'flex-start', paddingVertical: 12 },
  input: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#0F172A',
  },
  textArea: { height: 90 },
  currencyPrefix: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
    marginRight: 4,
  },

  // ── Boarding Type Selector ───────────────────────────────
  typeSelector: { flexDirection: 'row', gap: 10 },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  typeButtonActive: {
    backgroundColor: '#6D28D9',
    borderColor: '#6D28D9',
    shadowColor: '#6D28D9',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  typeButtonText: { fontSize: 13, fontWeight: '700', color: '#475569' },
  typeButtonTextActive: { color: '#FFFFFF' },

  // ── Map Button ───────────────────────────────────────────
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EDE9FE',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  mapButtonText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6D28D9',
    marginLeft: 4,
  },

  // ── STEP 2 – Cover Image ─────────────────────────────────
  sectionHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6D28D9',
    marginBottom: 12,
  },
  coverContainer: {
    position: 'relative',
    marginBottom: 28,
  },
  coverUploadBox: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    borderWidth: 1.8,
    borderColor: '#6D28D9',
    borderStyle: 'dashed',
    backgroundColor: '#FAFAFF',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeCornerBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(220,38,38,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverUploadInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraIconWrapper: {
    marginBottom: 14,
    opacity: 0.75,
  },
  coverUploadText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#334155',
  },
  coverPreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },

  // ── STEP 2 – More Photos ─────────────────────────────────
  morePhotosLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
  },
  photoGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  photoCell: {
    position: 'relative',
  },
  photoAddCell: {
    width: (width - 40 - 30) / 4,
    height: (width - 40 - 30) / 4,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  photoEmptyCell: {
    width: (width - 40 - 30) / 4,
    height: (width - 40 - 30) / 4,
    borderRadius: 12,
    backgroundColor: '#E8E8EE',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoCellFilled: {
    borderWidth: 0,
    backgroundColor: 'transparent',
  },
  photoAddIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  photoEmptyIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusBadge: {
    position: 'absolute',
    bottom: -2,
    right: -8,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#6D28D9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoThumb: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  removePhotoBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(220,38,38,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addPhotosHint: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 8,
  },

  // ── STEP 3 – Facilities ──────────────────────────────────
  facilitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  facilityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  facilityChipActive: {
    borderColor: '#6D28D9',
    backgroundColor: '#EDE9FE',
  },
  facilityChipText: { fontSize: 12, fontWeight: '600', color: '#64748B' },
  facilityChipTextActive: { color: '#6D28D9' },

  // ── STEP 3 – Summary Card ────────────────────────────────
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginLeft: 8,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginBottom: 12,
  },
  summaryDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryKey: { fontSize: 13, color: '#64748B', fontWeight: '500' },
  summaryValue: {
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '700',
    maxWidth: width * 0.5,
    textAlign: 'right',
  },

  // ── Info Notice ───────────────────────────────────────────
  infoNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#EDE9FE',
    borderRadius: 10,
    padding: 12,
    marginTop: 4,
  },
  infoNoticeText: {
    fontSize: 12,
    color: '#5B21B6',
    fontWeight: '500',
    marginLeft: 6,
    flex: 1,
    lineHeight: 18,
  },

  // ── Bottom Bar ────────────────────────────────────────────
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 8,
  },
  nextButton: {
    backgroundColor: '#6D28D9',
    height: 52,
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6D28D9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
