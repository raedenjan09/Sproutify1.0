import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Alert,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import UserDrawer from './UserDrawer';
import * as ImagePicker from 'expo-image-picker';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { cacheUserProfile, getCachedUserProfile, getToken as getAuthToken } from '../../utils/helper';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

const THEME = {
  colors: {
    bg: '#F5F3EE',
    surface: '#FFFFFF',
    surfaceAlt: '#F0F6F0',
    text: '#1F2A1F',
    muted: '#6B7C6A',
    accent: '#2E7D32',
    accentDark: '#1B5E20',
    accentSoft: '#E6F2E6',
    border: '#E6E0D9',
    danger: '#C62828',
    dangerSoft: '#FDECEC',
    success: '#2E7D32',
    warning: '#B45309',
    warningSoft: '#FFF4E5',
  },
  radius: {
    sm: 10,
    md: 16,
    lg: 22,
    pill: 999,
  },
};

const getInitials = (name) => {
  if (!name) return 'U';
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
};

const getProviderLabel = (provider) => {
  if (provider === 'google') return 'Google';
  if (provider === 'facebook') return 'Facebook';
  return 'Email';
};

const InfoRow = ({ icon, label, value, iconColor = THEME.colors.muted }) => (
  <View style={styles.infoRow}>
    <View style={styles.infoIconWrap}>
      <Ionicons name={icon} size={17} color={iconColor} />
    </View>
    <View style={styles.infoCopy}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, !value && styles.infoValueMuted]}>{value || 'Not added yet'}</Text>
    </View>
  </View>
);

const Profile = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [city, setCity] = useState('');
  const [barangay, setBarangay] = useState('');
  const [street, setStreet] = useState('');
  const [zipcode, setZipcode] = useState('');

  const getToken = async () => {
    const storedToken = await getAuthToken();
    if (storedToken) return storedToken;

    const possibleKeys = [
      'userToken',
      'token',
      'accessToken',
      'access_token',
      'authToken',
      'jwt',
    ];

    for (const key of possibleKeys) {
      const token = await AsyncStorage.getItem(key);
      if (token) return token;
    }

    try {
      const cachedProfile = await getCachedUserProfile();
      if (cachedProfile?.token) return cachedProfile.token;
      if (cachedProfile?.accessToken) return cachedProfile.accessToken;
    } catch (error) {
      console.error('Error parsing cached profile token:', error);
    }

    return null;
  };

  const normalizedAddress = useMemo(() => ({
    city: user?.address?.city || user?.city || '',
    barangay: user?.address?.barangay || user?.barangay || '',
    street: user?.address?.street || user?.street || '',
    zipcode: user?.address?.zipcode || user?.zipcode || '',
  }), [user]);

  const avatarUrl = user?.avatar?.url || (typeof user?.avatar === 'string' ? user.avatar : null);
  const providerLabel = getProviderLabel(user?.authProvider);

  const seedFormFields = (sourceUser) => {
    const nextAddress = sourceUser?.address || {};
    setName(sourceUser?.name || '');
    setContact(sourceUser?.contact || '');
    setCity(nextAddress.city || sourceUser?.city || '');
    setBarangay(nextAddress.barangay || sourceUser?.barangay || '');
    setStreet(nextAddress.street || sourceUser?.street || '');
    setZipcode(nextAddress.zipcode || sourceUser?.zipcode || '');
  };

  useEffect(() => {
    fetchProfile();

    const unsubscribe = navigation.addListener('focus', () => {
      fetchProfile();
    });

    return unsubscribe;
  }, [navigation]);

  const fetchProfile = async () => {
    try {
      setLoading(true);

      const token = await getToken();
      if (!token) {
        setLoading(false);
        Alert.alert(
          'Session Expired',
          'Please login again',
          [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
        );
        return;
      }

      const response = await axios.get(`${BACKEND_URL}/api/v1/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const userData = response.data.user || response.data;
      setUser(userData);
      seedFormFields(userData);
      await cacheUserProfile(userData);
    } catch (error) {
      console.error('Fetch profile error:', error.response?.data || error.message);

      try {
        const storedUser = await getCachedUserProfile();
        if (storedUser) {
          setUser(storedUser);
          seedFormFields(storedUser);
        }
      } catch (storageError) {
        console.error('Error reading cached profile:', storageError);
      }

      if (error.response?.status === 401) {
        Alert.alert(
          'Session Expired',
          'Your session has expired. Please login again.',
          [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
        );
      } else {
        Alert.alert('Error', 'Failed to load profile from server');
      }
    } finally {
      setLoading(false);
    }
  };

  const pickImageFromLibrary = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please allow photo library access to change your avatar');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadAvatar(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to open your gallery');
    }
  };

  const captureImage = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please allow camera access to take a profile photo');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadAvatar(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error capturing image:', error);
      Alert.alert('Error', 'Failed to open your camera');
    }
  };

  const handleAvatarPress = () => {
    if (uploadingImage) {
      return;
    }

    if (Platform.OS === 'web') {
      pickImageFromLibrary();
      return;
    }

    Alert.alert(
      'Update Profile Picture',
      'Choose how you want to update your profile picture.',
      [
        { text: 'Take Photo', onPress: captureImage },
        { text: 'Choose from Library', onPress: pickImageFromLibrary },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const uploadAvatar = async (imageUri) => {
    setUploadingImage(true);
    try {
      const manipulatedImage = await manipulateAsync(
        imageUri,
        [{ resize: { width: 500 } }],
        { compress: 0.7, format: SaveFormat.JPEG, base64: true }
      );

      const token = await getToken();
      if (!token) {
        Alert.alert('Session Expired', 'Please login again');
        navigation.navigate('Login');
        return;
      }

      if (!manipulatedImage.base64) {
        throw new Error('Failed to prepare avatar image');
      }

      const avatar = `data:image/jpeg;base64,${manipulatedImage.base64}`;

      const response = await axios.put(
        `${BACKEND_URL}/api/v1/users/me/update`,
        { avatar },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        }
      );

      const updatedUser = response.data.user || response.data;
      setUser(updatedUser);
      await cacheUserProfile(updatedUser);
      Alert.alert('Success', 'Avatar updated successfully');
    } catch (error) {
      console.error('Upload avatar error:', error.response?.data || error.message);
      Alert.alert('Error', error.response?.data?.message || error.message || 'Failed to upload avatar');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }

    setUpdating(true);
    try {
      const token = await getToken();

      const updatedData = { name: name.trim() };
      if (contact.trim()) updatedData.contact = contact.trim();
      if (city.trim()) updatedData.city = city.trim();
      if (barangay.trim()) updatedData.barangay = barangay.trim();
      if (street.trim()) updatedData.street = street.trim();

      if (zipcode.trim()) {
        if (!/^\d{4}$/.test(zipcode.trim())) {
          Alert.alert('Error', 'Please enter a valid 4-digit zipcode');
          setUpdating(false);
          return;
        }
        updatedData.zipcode = zipcode.trim();
      }

      const response = await axios.put(
        `${BACKEND_URL}/api/v1/users/me/update`,
        updatedData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const updatedUser = response.data.user || response.data;
      setUser(updatedUser);
      seedFormFields(updatedUser);
      await cacheUserProfile(updatedUser);
      setEditModalVisible(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      console.error('Update profile error:', error.response?.data || error.message);
      Alert.alert('Error', error.response?.data?.message || 'Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  const handleChangePassword = () => {
    navigation.navigate('ChangePassword');
  };

  if (loading) {
    return (
      <UserDrawer>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={THEME.colors.accent} />
          <Text style={styles.loadingText}>Loading your profile...</Text>
        </View>
      </UserDrawer>
    );
  }

  return (
    <UserDrawer>
      <View style={styles.container}>
        <View style={styles.topBar}>
          <View>
            <Text style={styles.topEyebrow}>Account</Text>
            <Text style={styles.topTitle}>Profile</Text>
          </View>
          <TouchableOpacity
            style={styles.topAction}
            onPress={() => setEditModalVisible(true)}
            activeOpacity={0.85}
          >
            <Ionicons name="create-outline" size={20} color={THEME.colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.heroCard}>
            <View style={styles.heroRow}>
              <TouchableOpacity
                style={styles.avatarContainer}
                onPress={handleAvatarPress}
                disabled={uploadingImage}
                activeOpacity={0.9}
              >
                {uploadingImage ? (
                  <View style={styles.avatarFallback}>
                    <ActivityIndicator size="small" color={THEME.colors.accentDark} />
                  </View>
                ) : avatarUrl ? (
                  <Image source={{ uri: avatarUrl }} style={styles.avatar} />
                ) : (
                  <View style={styles.avatarFallback}>
                    <Text style={styles.avatarFallbackText}>{getInitials(user?.name)}</Text>
                  </View>
                )}

                <View style={styles.editAvatarBadge}>
                  <Ionicons name="camera-outline" size={14} color="#FFFFFF" />
                </View>
              </TouchableOpacity>

              <View style={styles.heroInfo}>
                <Text style={styles.userName}>{user?.name || 'Your account'}</Text>
                <Text style={styles.userEmail}>{user?.email || 'No email available'}</Text>
                <Text style={styles.userMetaLine}>
                  {providerLabel} {user?.isVerified ? '· Verified' : '· Not verified'}
                </Text>
                <Text style={styles.avatarHint}>Tap your photo to use the camera or your gallery.</Text>
              </View>
            </View>

            <View style={styles.heroActions}>
              <TouchableOpacity
                style={[styles.heroButton, styles.secondaryButton]}
                onPress={() => setEditModalVisible(true)}
                activeOpacity={0.88}
              >
                <Ionicons name="create-outline" size={16} color={THEME.colors.accentDark} />
                <Text style={styles.secondaryButtonText}>Edit Profile</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.heroButton, styles.primaryButton]}
                onPress={handleChangePassword}
                activeOpacity={0.88}
              >
                <Ionicons name="key-outline" size={16} color="#FFFFFF" />
                <Text style={styles.primaryButtonText}>Change Password</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account Details</Text>
            <View style={styles.infoCard}>
              <InfoRow icon="mail-outline" label="Email" value={user?.email || ''} />
              <InfoRow icon="call-outline" label="Contact" value={user?.contact || ''} />
              <InfoRow
                icon={user?.isVerified ? 'checkmark-circle-outline' : 'close-circle-outline'}
                label="Verification"
                value={user?.isVerified ? 'Email verified' : 'Verification pending'}
                iconColor={user?.isVerified ? THEME.colors.success : THEME.colors.warning}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Delivery Address</Text>
            <View style={styles.infoCard}>
              <InfoRow icon="home-outline" label="Street" value={normalizedAddress.street} />
              <InfoRow icon="map-outline" label="Barangay" value={normalizedAddress.barangay} />
              <InfoRow icon="business-outline" label="City" value={normalizedAddress.city} />
              <InfoRow icon="mail-open-outline" label="ZIP code" value={normalizedAddress.zipcode} />
            </View>
          </View>
        </ScrollView>

        <Modal
          visible={editModalVisible}
          animationType="slide"
          transparent
          onRequestClose={() => setEditModalVisible(false)}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalOverlay}
          >
            <View style={styles.modalSheet}>
              <View style={styles.modalHandle} />
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalTitle}>Edit Profile</Text>
                  <Text style={styles.modalSubtitle}>Update your account and delivery details.</Text>
                </View>
                <TouchableOpacity
                  style={styles.modalClose}
                  onPress={() => setEditModalVisible(false)}
                  activeOpacity={0.85}
                >
                  <Ionicons name="close" size={22} color={THEME.colors.text} />
                </TouchableOpacity>
              </View>

              <ScrollView contentContainerStyle={styles.modalBody} showsVerticalScrollIndicator={false}>
                <Text style={styles.modalSectionTitle}>Personal Information</Text>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Full Name *</Text>
                  <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                    placeholder="Enter your full name"
                    placeholderTextColor="#90A08F"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Email</Text>
                  <TextInput
                    style={[styles.input, styles.inputDisabled]}
                    value={user?.email || ''}
                    editable={false}
                  />
                  <Text style={styles.inputHint}>Email cannot be changed here.</Text>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Contact Number</Text>
                  <TextInput
                    style={styles.input}
                    value={contact}
                    onChangeText={setContact}
                    placeholder="Enter your contact number"
                    placeholderTextColor="#90A08F"
                    keyboardType="phone-pad"
                  />
                </View>

                <Text style={styles.modalSectionTitle}>Address Information</Text>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Street</Text>
                  <TextInput
                    style={styles.input}
                    value={street}
                    onChangeText={setStreet}
                    placeholder="Enter your street"
                    placeholderTextColor="#90A08F"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Barangay</Text>
                  <TextInput
                    style={styles.input}
                    value={barangay}
                    onChangeText={setBarangay}
                    placeholder="Enter your barangay"
                    placeholderTextColor="#90A08F"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>City</Text>
                  <TextInput
                    style={styles.input}
                    value={city}
                    onChangeText={setCity}
                    placeholder="Enter your city"
                    placeholderTextColor="#90A08F"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>ZIP Code</Text>
                  <TextInput
                    style={styles.input}
                    value={zipcode}
                    onChangeText={setZipcode}
                    placeholder="Enter your zip code"
                    placeholderTextColor="#90A08F"
                    keyboardType="numeric"
                    maxLength={4}
                  />
                  <Text style={styles.inputHint}>Use a valid 4-digit ZIP code.</Text>
                </View>
              </ScrollView>

              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setEditModalVisible(false)}
                  activeOpacity={0.88}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={handleUpdateProfile}
                  disabled={updating}
                  activeOpacity={0.88}
                >
                  {updating ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.saveButtonText}>Save Changes</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </View>
    </UserDrawer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.bg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: THEME.colors.bg,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '600',
    color: THEME.colors.muted,
  },
  topBar: {
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topEyebrow: {
    fontSize: 12,
    color: THEME.colors.muted,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  topTitle: {
    marginTop: 2,
    fontSize: 24,
    fontWeight: '800',
    color: THEME.colors.text,
  },
  topAction: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME.colors.surfaceAlt,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingBottom: 34,
  },
  heroCard: {
    marginTop: 4,
    borderRadius: THEME.radius.md,
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    padding: 16,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 84,
    height: 84,
    borderRadius: 42,
    marginRight: 12,
    position: 'relative',
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 42,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  avatarFallback: {
    width: '100%',
    height: '100%',
    borderRadius: 42,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1EEE7',
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  avatarFallbackText: {
    fontSize: 26,
    fontWeight: '800',
    color: THEME.colors.text,
  },
  editAvatarBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME.colors.text,
    borderWidth: 1,
    borderColor: THEME.colors.surface,
  },
  heroInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 22,
    fontWeight: '800',
    color: THEME.colors.text,
  },
  userEmail: {
    marginTop: 3,
    fontSize: 13,
    color: THEME.colors.muted,
    fontWeight: '600',
  },
  userMetaLine: {
    marginTop: 6,
    fontSize: 12,
    color: THEME.colors.muted,
    fontWeight: '600',
  },
  avatarHint: {
    marginTop: 8,
    fontSize: 12,
    color: THEME.colors.accentDark,
    fontWeight: '600',
  },
  heroActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  heroButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: THEME.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 7,
  },
  primaryButton: {
    backgroundColor: THEME.colors.text,
  },
  secondaryButton: {
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  secondaryButtonText: {
    color: THEME.colors.accentDark,
    fontSize: 14,
    fontWeight: '800',
  },
  section: {
    marginTop: 18,
  },
  sectionTitle: {
    fontSize: 17,
    color: THEME.colors.text,
    fontWeight: '800',
  },
  infoCard: {
    marginTop: 8,
    borderRadius: THEME.radius.md,
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    padding: 14,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE8DF',
  },
  infoIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F7F4EE',
    marginRight: 10,
  },
  infoCopy: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: THEME.colors.muted,
    fontWeight: '600',
  },
  infoValue: {
    marginTop: 3,
    fontSize: 14,
    color: THEME.colors.text,
    fontWeight: '600',
  },
  infoValueMuted: {
    color: THEME.colors.muted,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.38)',
  },
  modalSheet: {
    maxHeight: '92%',
    backgroundColor: THEME.colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalHandle: {
    width: 58,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#D9D4CC',
    alignSelf: 'center',
    marginTop: 10,
  },
  modalHeader: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  modalTitle: {
    fontSize: 20,
    color: THEME.colors.text,
    fontWeight: '800',
  },
  modalSubtitle: {
    marginTop: 3,
    fontSize: 12,
    lineHeight: 17,
    color: THEME.colors.muted,
    fontWeight: '600',
  },
  modalClose: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME.colors.surfaceAlt,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingBottom: 14,
  },
  modalSectionTitle: {
    marginTop: 10,
    marginBottom: 10,
    fontSize: 14,
    color: THEME.colors.text,
    fontWeight: '700',
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 13,
    color: THEME.colors.text,
    fontWeight: '700',
    marginBottom: 8,
  },
  input: {
    minHeight: 50,
    borderRadius: THEME.radius.md,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    backgroundColor: THEME.colors.surface,
    paddingHorizontal: 13,
    paddingVertical: 12,
    fontSize: 15,
    color: THEME.colors.text,
  },
  inputDisabled: {
    color: THEME.colors.muted,
    backgroundColor: '#F2EEE6',
  },
  inputHint: {
    marginTop: 4,
    marginLeft: 4,
    fontSize: 12,
    color: THEME.colors.muted,
    fontWeight: '600',
  },
  modalFooter: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.border,
    flexDirection: 'row',
    gap: 10,
  },
  modalButton: {
    flex: 1,
    minHeight: 50,
    borderRadius: THEME.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: THEME.colors.surfaceAlt,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  cancelButtonText: {
    fontSize: 15,
    color: THEME.colors.text,
    fontWeight: '800',
  },
  saveButton: {
    backgroundColor: THEME.colors.accentDark,
  },
  saveButtonText: {
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '800',
  },
});

export default Profile;
