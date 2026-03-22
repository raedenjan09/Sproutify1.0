import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const TOKEN_KEY = 'token';
const USER_KEY = 'user';
const PROFILE_CACHE_KEY = 'userData';

// Auth change listeners array
let authChangeListeners = [];
const useSecureStore = Platform.OS !== 'web';

const storeSecureValue = async (key, value, label) => {
  if (!useSecureStore) {
    await AsyncStorage.setItem(key, value);
    return;
  }

  try {
    await SecureStore.setItemAsync(key, value);
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error(`Error storing ${label} in SecureStore, falling back to AsyncStorage`, error);
    await AsyncStorage.setItem(key, value);
  }
};

const readSecureValue = async (key, label) => {
  if (!useSecureStore) {
    try {
      return (await AsyncStorage.getItem(key)) || null;
    } catch (error) {
      console.error(`Error getting ${label} from AsyncStorage`, error);
      return null;
    }
  }

  try {
    const secureValue = await SecureStore.getItemAsync(key);
    if (secureValue) {
      return secureValue;
    }
  } catch (error) {
    console.error(`Error reading ${label} from SecureStore, checking AsyncStorage`, error);
  }

  try {
    const legacyValue = await AsyncStorage.getItem(key);

    if (legacyValue) {
      try {
        await SecureStore.setItemAsync(key, legacyValue);
        await AsyncStorage.removeItem(key);
      } catch (migrationError) {
        console.error(`Error migrating ${label} to SecureStore`, migrationError);
      }
    }

    return legacyValue || null;
  } catch (error) {
    console.error(`Error getting ${label} from AsyncStorage`, error);
    return null;
  }
};

const clearSecureValue = async (key, label) => {
  if (!useSecureStore) {
    await AsyncStorage.removeItem(key);
    return;
  }

  try {
    await SecureStore.deleteItemAsync(key);
  } catch (error) {
    console.error(`Error deleting ${label} from SecureStore`, error);
  }

  await AsyncStorage.removeItem(key);
};

const storeToken = async (token) => storeSecureValue(TOKEN_KEY, token, 'token');
const readToken = async () => readSecureValue(TOKEN_KEY, 'token');
const clearToken = async () => clearSecureValue(TOKEN_KEY, 'token');

const storeUser = async (user) => {
  await storeSecureValue(USER_KEY, JSON.stringify(user), 'user');
};

const readUser = async () => {
  const storedUser = await readSecureValue(USER_KEY, 'user');

  if (!storedUser) {
    return null;
  }

  try {
    return JSON.parse(storedUser);
  } catch (error) {
    console.error('Error parsing stored user', error);
    return null;
  }
};

const clearUser = async () => clearSecureValue(USER_KEY, 'user');

export const cacheUserProfile = async (profile) => {
  await storeSecureValue(PROFILE_CACHE_KEY, JSON.stringify(profile), 'profile');
};

export const getCachedUserProfile = async () => {
  const storedProfile = await readSecureValue(PROFILE_CACHE_KEY, 'profile');

  if (!storedProfile) {
    return null;
  }

  try {
    return JSON.parse(storedProfile);
  } catch (error) {
    console.error('Error parsing cached profile', error);
    return null;
  }
};

const clearCachedUserProfile = async () => clearSecureValue(PROFILE_CACHE_KEY, 'profile');

// Notify all listeners when auth state changes
export const notifyAuthChange = (user) => {
  authChangeListeners.forEach(listener => listener(user));
};

// Subscribe to auth changes
export const onAuthChange = (callback) => {
  authChangeListeners.push(callback);

  // Return unsubscribe function
  return () => {
    authChangeListeners = authChangeListeners.filter(cb => cb !== callback);
  };
};

// Save token and user info
export const authenticate = async (data, next) => {
  try {
    const userData = {
      name: data.user.name,
      email: data.user.email,
      role: data.user.role,
      id: data.user._id,
      authProvider: data.user.authProvider || 'local',
      avatar: data.user.avatar?.url || null,
    };

    await storeToken(data.token);
    await storeUser(userData);

    // Notify listeners about auth change
    notifyAuthChange(userData);

    if (next) next();
  } catch (error) {
    console.error('Error storing auth data', error);
  }
};

// Get user info
export const getUser = async () => {
  try {
    return await readUser();
  } catch (error) {
    console.error('Error getting user', error);
    return null;
  }
};

// Get JWT token
export const getToken = async () => {
  try {
    return await readToken();
  } catch (error) {
    console.error('Error getting token', error);
    return null;
  }
};

// Check if admin
export const isAdmin = async () => {
  const user = await getUser();
  return user && user.role === 'admin';
};

// Check if authenticated
export const isAuthenticated = async () => {
  const token = await getToken();
  return !!token;
};

// Logout
export const logout = async () => {
  try {
    await clearToken();
    await clearUser();
    await clearCachedUserProfile();

    // Let AppNavigator switch back to the auth stack after logout.
    notifyAuthChange(null);
  } catch (error) {
    console.error('Error logging out', error);
  }
};
