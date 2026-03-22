import React, { useEffect, useState } from 'react';
import {
  View,
  TextInput,
  Alert,
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import { FontAwesome, MaterialIcons as Icon } from '@expo/vector-icons';
import { AccessToken, LoginManager } from 'react-native-fbsdk-next';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { FacebookAuthProvider, GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { authenticate } from '../../utils/helper';
import { firebaseAuth } from '../../utils/firebase';
import { registerForPushNotificationsAsync } from '../../hooks/usePushNotifications';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

const THEME = {
  colors: {
    background: '#F5F3EE',
    backgroundSoft: '#FBF9F4',
    surface: '#FFFFFF',
    text: '#1F2A1F',
    muted: '#657565',
    accent: '#2F6B3B',
    accentDark: '#1E4E2B',
    accentSoft: '#E4F0E4',
    accentSoftAlt: '#EEF5EA',
    border: '#E3DDD2',
    subtleBorder: '#EEE7DD',
    googleBorder: '#D7DDD7',
    googleText: '#283128',
    facebookBg: '#1877F2',
    facebookBorder: '#D8E4FA',
    pillText: '#35513A',
    shadow: '#1A221A',
  },
};

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [facebookLoading, setFacebookLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || undefined,
      iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || undefined,
      offlineAccess: false,
      scopes: ['profile', 'email'],
    });
  }, []);

  const persistAuthenticatedUser = async (payload, successMessage) => {
    await authenticate(payload, async () => {
      Alert.alert('Success', successMessage);

      setTimeout(async () => {
        try {
          const token = await registerForPushNotificationsAsync();
          if (token) {
            console.log('Push token registered successfully');
          }
        } catch (error) {
          console.error('Push registration after login failed:', error);
        }
      }, 1000);
    });
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${BACKEND_URL}/api/v1/users/login`, { email, password });
      await persistAuthenticatedUser(res.data, 'Login successful');
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Login Failed', error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (!process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID) {
      Alert.alert(
        'Google Login Not Configured',
        'Add EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID to frontend/.env before using Google sign-in.'
      );
      return;
    }

    setGoogleLoading(true);
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const result = await GoogleSignin.signIn();

      if (result.type === 'cancelled') {
        return;
      }

      const googleUser = result.data;
      const googleIdToken = googleUser?.idToken;

      if (!googleIdToken) {
        throw new Error('Google did not return an ID token.');
      }

      const credential = GoogleAuthProvider.credential(googleIdToken);
      const firebaseUser = await signInWithCredential(firebaseAuth, credential);
      const firebaseIdToken = await firebaseUser.user.getIdToken();

      const response = await axios.post(`${BACKEND_URL}/api/v1/users/firebase/auth/google`, {
        idToken: firebaseIdToken,
      });

      await persistAuthenticatedUser(response.data, 'Google login successful');
    } catch (error) {
      console.error('Google login error:', error);

      if (error?.code === statusCodes.SIGN_IN_CANCELLED) {
        return;
      }

      if (error?.code === statusCodes.IN_PROGRESS) {
        Alert.alert('Please Wait', 'Google sign-in is already in progress.');
        return;
      }

      if (error?.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Alert.alert(
          'Google Play Services Required',
          'Google Play Services is unavailable or needs an update on this device.'
        );
        return;
      }

      const message = error.response?.data?.message || error.message || 'Google sign-in failed';
      Alert.alert('Google Login Failed', message);
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleFacebookLogin = async () => {
    if (!process.env.EXPO_PUBLIC_FACEBOOK_APP_ID) {
      Alert.alert(
        'Facebook Login Not Configured',
        'Add EXPO_PUBLIC_FACEBOOK_APP_ID to frontend/.env before using Facebook sign-in.'
      );
      return;
    }

    setFacebookLoading(true);
    try {
      LoginManager.logOut();
      const loginResult = await LoginManager.logInWithPermissions(['public_profile', 'email']);

      if (loginResult.isCancelled) {
        return;
      }

      const accessTokenData = await AccessToken.getCurrentAccessToken();
      const facebookAccessToken = accessTokenData?.accessToken;

      if (!facebookAccessToken) {
        throw new Error('Facebook did not return an access token.');
      }

      const credential = FacebookAuthProvider.credential(facebookAccessToken);
      const firebaseUser = await signInWithCredential(firebaseAuth, credential);
      const firebaseIdToken = await firebaseUser.user.getIdToken();

      const response = await axios.post(`${BACKEND_URL}/api/v1/users/firebase/auth/facebook`, {
        idToken: firebaseIdToken,
      });

      await persistAuthenticatedUser(response.data, 'Facebook login successful');
    } catch (error) {
      console.error('Facebook login error:', error);
      const message = error.response?.data?.message || error.message || 'Facebook sign-in failed';
      Alert.alert('Facebook Login Failed', message);
    } finally {
      setFacebookLoading(false);
    }
  };

  const isBusy = loading || googleLoading || facebookLoading;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar backgroundColor={THEME.colors.background} barStyle="dark-content" />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.brandHeader}>
            <View style={styles.brandBadge}>
              <Icon name="spa" size={26} color={THEME.colors.accentDark} />
            </View>
            <Text style={styles.brandTitle}>Sproutify</Text>
            <Text style={styles.brandSubtitle}>Plants, tools, and growing essentials.</Text>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Sign in</Text>
            <Text style={styles.formSubtitle}>
              Use your email or continue with Google or Facebook.
            </Text>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Email address</Text>
              <View style={styles.inputContainer}>
                <Icon name="mail-outline" size={20} color={THEME.colors.muted} style={styles.inputIcon} />
                <TextInput
                  placeholder="you@example.com"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoCorrect={false}
                  style={styles.input}
                  placeholderTextColor="#93A094"
                />
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <View style={styles.passwordHeader}>
                <Text style={styles.fieldLabel}>Password</Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate('ForgotPassword')}
                  style={styles.inlineLinkButton}
                >
                  <Text style={styles.inlineLinkText}>Forgot password?</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.inputContainer}>
                <Icon name="lock-outline" size={20} color={THEME.colors.muted} style={styles.inputIcon} />
                <TextInput
                  placeholder="Enter your password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  style={[styles.input, styles.passwordInput]}
                  placeholderTextColor="#93A094"
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Icon
                    name={showPassword ? 'visibility' : 'visibility-off'}
                    size={20}
                    color={THEME.colors.muted}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.primaryButton, isBusy && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={isBusy}
              activeOpacity={0.88}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Text style={styles.primaryButtonText}>Sign In</Text>
                  <Icon name="arrow-forward" size={18} color="#FFFFFF" />
                </>
              )}
            </TouchableOpacity>

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or continue with</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              style={[styles.socialButton, styles.googleButton, isBusy && styles.buttonDisabled]}
              onPress={handleGoogleLogin}
              disabled={isBusy}
              activeOpacity={0.88}
            >
              {googleLoading ? (
                <ActivityIndicator color={THEME.colors.googleText} />
              ) : (
                <>
                  <FontAwesome name="google" size={18} color="#DB4437" />
                  <Text style={styles.googleButtonText}>Continue with Google</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.socialButton, styles.facebookButton, isBusy && styles.buttonDisabled]}
              onPress={handleFacebookLogin}
              disabled={isBusy}
              activeOpacity={0.88}
            >
              {facebookLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <FontAwesome name="facebook" size={18} color="#FFFFFF" />
                  <Text style={styles.facebookButtonText}>Continue with Facebook</Text>
                </>
              )}
            </TouchableOpacity>

            <View style={styles.signUpContainer}>
              <Text style={styles.signUpText}>New here?</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.signUpLink}>Create an account</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>By signing in, you agree to our Terms of Service and Privacy Policy.</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 28,
    justifyContent: 'center',
  },
  brandHeader: {
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  brandBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME.colors.accentSoft,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    marginBottom: 12,
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: THEME.colors.accentDark,
  },
  brandSubtitle: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
    color: THEME.colors.muted,
    textAlign: 'center',
  },
  heroCard: {
    backgroundColor: THEME.colors.accentSoftAlt,
    borderRadius: 28,
    padding: 22,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    marginBottom: 18,
  },
  heroBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: THEME.colors.subtleBorder,
    marginBottom: 16,
  },
  heroBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.accentDark,
  },
  heroTitle: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '800',
    color: THEME.colors.text,
  },
  heroSubtitle: {
    marginTop: 10,
    fontSize: 15,
    lineHeight: 22,
    color: THEME.colors.muted,
  },
  highlightRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 18,
  },
  highlightPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: THEME.colors.accentSoft,
  },
  highlightText: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.pillText,
  },
  formCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: 28,
    padding: 22,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    shadowColor: THEME.colors.shadow,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: THEME.colors.text,
  },
  formSubtitle: {
    marginTop: 6,
    marginBottom: 20,
    fontSize: 14,
    lineHeight: 21,
    color: THEME.colors.muted,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.text,
    marginBottom: 8,
  },
  passwordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  inlineLinkButton: {
    paddingVertical: 4,
  },
  inlineLinkText: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.accentDark,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 56,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    borderRadius: 18,
    paddingHorizontal: 14,
    backgroundColor: THEME.colors.backgroundSoft,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: THEME.colors.text,
    paddingVertical: 14,
  },
  passwordInput: {
    paddingRight: 10,
  },
  primaryButton: {
    marginTop: 8,
    minHeight: 56,
    borderRadius: 18,
    backgroundColor: THEME.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  buttonDisabled: {
    opacity: 0.65,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: THEME.colors.border,
  },
  dividerText: {
    marginHorizontal: 10,
    fontSize: 12,
    color: THEME.colors.muted,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  socialButton: {
    minHeight: 54,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
    borderWidth: 1,
  },
  googleButton: {
    borderColor: THEME.colors.googleBorder,
    backgroundColor: '#FFFFFF',
  },
  googleButtonText: {
    color: THEME.colors.googleText,
    fontSize: 15,
    fontWeight: '700',
  },
  facebookButton: {
    borderColor: THEME.colors.facebookBorder,
    backgroundColor: THEME.colors.facebookBg,
  },
  facebookButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 20,
  },
  signUpText: {
    fontSize: 14,
    color: THEME.colors.muted,
  },
  signUpLink: {
    fontSize: 14,
    color: THEME.colors.accentDark,
    fontWeight: '800',
  },
  footer: {
    marginTop: 18,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    color: '#839183',
  },
});
