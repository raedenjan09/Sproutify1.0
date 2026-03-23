import React, { useEffect, useState } from 'react';
import {
  View,
  TextInput,
  Alert,
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { FontAwesome, MaterialIcons as Icon } from '@expo/vector-icons';
import { FacebookAuthProvider, GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { authenticate } from '../../utils/helper';
import { firebaseAuth } from '../../utils/firebase';
import { registerForPushNotificationsAsync } from '../../hooks/usePushNotifications';
import AuthScreenShell from '../layouts/AuthScreenShell';
import gardenTheme from '../../theme/gardenTheme';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

const getGoogleSigninModule = () => {
  try {
    return require('@react-native-google-signin/google-signin');
  } catch (error) {
    console.error('Google Sign-In native module is unavailable in this runtime:', error);
    return null;
  }
};

const getFacebookSdkModule = () => {
  try {
    return require('react-native-fbsdk-next');
  } catch (error) {
    console.error('Facebook SDK native module is unavailable in this runtime:', error);
    return null;
  }
};

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [facebookLoading, setFacebookLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isExpoGo) {
      return;
    }

    const googleSigninModule = getGoogleSigninModule();
    googleSigninModule?.GoogleSignin?.configure({
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
    if (isExpoGo) {
      Alert.alert(
        'Google Login Requires a Development Build',
        'Expo Go does not include the native Google Sign-In module used by this project. Use a development build or APK for Google login.'
      );
      return;
    }

    if (!firebaseAuth) {
      Alert.alert(
        'Google Login Not Available',
        'This build is missing Firebase configuration. Rebuild the app with the Expo environment variables set.'
      );
      return;
    }

    if (!process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID) {
      Alert.alert(
        'Google Login Not Configured',
        'Add EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID to frontend/.env before using Google sign-in.'
      );
      return;
    }

    let googleStatusCodes;

    setGoogleLoading(true);
    try {
      const googleSigninModule = getGoogleSigninModule();
      const GoogleSignin = googleSigninModule?.GoogleSignin;
      googleStatusCodes = googleSigninModule?.statusCodes;

      if (!GoogleSignin || !googleStatusCodes) {
        throw new Error('Google Sign-In native module is unavailable in this runtime.');
      }

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

      if (error?.code === googleStatusCodes?.SIGN_IN_CANCELLED) {
        return;
      }

      if (error?.code === googleStatusCodes?.IN_PROGRESS) {
        Alert.alert('Please Wait', 'Google sign-in is already in progress.');
        return;
      }

      if (error?.code === googleStatusCodes?.PLAY_SERVICES_NOT_AVAILABLE) {
        Alert.alert(
          'Google Play Services Required',
          'Google Play Services is unavailable or needs an update on this device.'
        );
        return;
      }

      const googleErrorText = `${error?.code || ''} ${error?.message || ''}`.toUpperCase();
      if (googleErrorText.includes('DEVELOPER_ERROR') || googleErrorText.includes('CODE 10')) {
        Alert.alert(
          'Google Login Setup Needed',
          'This Android build is signed with a release key that is not registered in Firebase Google Sign-In yet. Add the current release SHA-1/SHA-256 to your Firebase Android app, download a new google-services.json, and rebuild.'
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
    if (isExpoGo) {
      Alert.alert(
        'Facebook Login Requires a Development Build',
        'Expo Go does not include the native Facebook SDK used by this project. Use a development build or APK for Facebook login.'
      );
      return;
    }

    if (!firebaseAuth) {
      Alert.alert(
        'Facebook Login Not Available',
        'This build is missing Firebase configuration. Rebuild the app with the Expo environment variables set.'
      );
      return;
    }

    if (!process.env.EXPO_PUBLIC_FACEBOOK_APP_ID) {
      Alert.alert(
        'Facebook Login Not Configured',
        'Add EXPO_PUBLIC_FACEBOOK_APP_ID to frontend/.env before using Facebook sign-in.'
      );
      return;
    }

    setFacebookLoading(true);
    try {
      const facebookSdkModule = getFacebookSdkModule();
      const LoginManager = facebookSdkModule?.LoginManager;
      const AccessToken = facebookSdkModule?.AccessToken;

      if (!LoginManager || !AccessToken) {
        throw new Error('Facebook SDK native module is unavailable in this runtime.');
      }

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

      const facebookErrorText = `${error?.code || ''} ${error?.message || ''}`.toLowerCase();
      if (facebookErrorText.includes('invalid key hash')) {
        Alert.alert(
          'Facebook Login Setup Needed',
          'This Android build key hash is not registered in your Meta app yet. Add the current release key hash in Meta for Developers, then rebuild the app.'
        );
        return;
      }

      const message = error.response?.data?.message || error.message || 'Facebook sign-in failed';
      Alert.alert('Facebook Login Failed', message);
    } finally {
      setFacebookLoading(false);
    }
  };

  const isBusy = loading || googleLoading || facebookLoading;
  const socialLoginDisabled = isBusy || isExpoGo;
  const loginSubtitle = isExpoGo
    ? 'Email sign-in is available in Expo Go. Google and Facebook sign-in need a development build or APK.'
    : 'Use your email or continue with Google or Facebook to return to your saved garden essentials.';

  return (
    <AuthScreenShell
      navigation={navigation}
      brandIcon="spa"
      eyebrow="Garden welcome back"
      title="Step back into your calmer garden routine."
      subtitle="Track orders, revisit favorite plants, and shop tools that make everyday care feel lighter."
      highlights={[
        { icon: 'eco', label: 'Leafy picks and care goods' },
        { icon: 'local-shipping', label: 'Order updates in one place' },
        { icon: 'shopping-basket', label: 'Quick return to your cart' },
      ]}
      footer={<Text style={styles.footerText}>By signing in, you agree to our Terms of Service and Privacy Policy.</Text>}
    >
      <View style={styles.formCard}>
        <Text style={styles.formTitle}>Sign in</Text>
        <Text style={styles.formSubtitle}>{loginSubtitle}</Text>

        {isExpoGo ? (
          <View style={styles.noticeCard}>
            <Icon name="construction" size={18} color={gardenTheme.colors.clay} />
            <Text style={styles.noticeText}>Social login is disabled in Expo Go for this project.</Text>
          </View>
        ) : null}

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Email address</Text>
          <View style={styles.inputContainer}>
            <Icon name="mail-outline" size={20} color={gardenTheme.colors.muted} style={styles.inputIcon} />
            <TextInput
              placeholder="you@example.com"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoCorrect={false}
              style={styles.input}
              placeholderTextColor="#8FA08B"
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
            <Icon name="lock-outline" size={20} color={gardenTheme.colors.muted} style={styles.inputIcon} />
            <TextInput
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              style={[styles.input, styles.passwordInput]}
              placeholderTextColor="#8FA08B"
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Icon
                name={showPassword ? 'visibility' : 'visibility-off'}
                size={20}
                color={gardenTheme.colors.muted}
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
            <ActivityIndicator color={gardenTheme.colors.white} />
          ) : (
            <>
              <Text style={styles.primaryButtonText}>Sign In</Text>
              <Icon name="arrow-forward" size={18} color={gardenTheme.colors.white} />
            </>
          )}
        </TouchableOpacity>

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or continue with</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity
          style={[styles.socialButton, styles.googleButton, socialLoginDisabled && styles.buttonDisabled]}
          onPress={handleGoogleLogin}
          disabled={socialLoginDisabled}
          activeOpacity={0.88}
        >
          {googleLoading ? (
            <ActivityIndicator color={gardenTheme.colors.textStrong} />
          ) : (
            <>
              <FontAwesome name="google" size={18} color="#DB4437" />
              <Text style={styles.googleButtonText}>Continue with Google</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.socialButton, styles.facebookButton, socialLoginDisabled && styles.buttonDisabled]}
          onPress={handleFacebookLogin}
          disabled={socialLoginDisabled}
          activeOpacity={0.88}
        >
          {facebookLoading ? (
            <ActivityIndicator color={gardenTheme.colors.white} />
          ) : (
            <>
              <FontAwesome name="facebook" size={18} color={gardenTheme.colors.white} />
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
    </AuthScreenShell>
  );
}

const styles = StyleSheet.create({
  formCard: {
    backgroundColor: gardenTheme.colors.surface,
    borderRadius: gardenTheme.radii.lg,
    padding: 22,
    borderWidth: 1,
    borderColor: gardenTheme.colors.border,
    ...gardenTheme.shadows.medium,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: gardenTheme.colors.textStrong,
  },
  formSubtitle: {
    marginTop: 6,
    marginBottom: 18,
    fontSize: 14,
    lineHeight: 21,
    color: gardenTheme.colors.muted,
  },
  noticeCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
    borderRadius: gardenTheme.radii.md,
    marginBottom: 18,
    backgroundColor: gardenTheme.colors.claySoft,
    borderWidth: 1,
    borderColor: gardenTheme.colors.borderStrong,
  },
  noticeText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 13,
    lineHeight: 20,
    color: gardenTheme.colors.textStrong,
    fontWeight: '700',
  },
  fieldGroup: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: gardenTheme.colors.textStrong,
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
    fontWeight: '800',
    color: gardenTheme.colors.accentStrong,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 56,
    borderWidth: 1,
    borderColor: gardenTheme.colors.border,
    borderRadius: 20,
    paddingHorizontal: 14,
    backgroundColor: gardenTheme.colors.canvasSoft,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: gardenTheme.colors.textStrong,
    paddingVertical: 14,
  },
  passwordInput: {
    paddingRight: 10,
  },
  primaryButton: {
    marginTop: 8,
    minHeight: 56,
    borderRadius: 20,
    backgroundColor: gardenTheme.colors.accentStrong,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  primaryButtonText: {
    color: gardenTheme.colors.white,
    fontSize: 16,
    fontWeight: '900',
  },
  buttonDisabled: {
    opacity: 0.65,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: gardenTheme.colors.border,
  },
  dividerText: {
    marginHorizontal: 10,
    fontSize: 12,
    color: gardenTheme.colors.muted,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  socialButton: {
    minHeight: 54,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
    borderWidth: 1,
  },
  googleButton: {
    borderColor: gardenTheme.colors.border,
    backgroundColor: gardenTheme.colors.white,
  },
  googleButtonText: {
    color: gardenTheme.colors.textStrong,
    fontSize: 15,
    fontWeight: '800',
  },
  facebookButton: {
    borderColor: '#DAE5F7',
    backgroundColor: '#295FAE',
  },
  facebookButtonText: {
    color: gardenTheme.colors.white,
    fontSize: 15,
    fontWeight: '800',
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
    color: gardenTheme.colors.muted,
  },
  signUpLink: {
    fontSize: 14,
    color: gardenTheme.colors.accentStrong,
    fontWeight: '900',
  },
  footerText: {
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    color: '#7A8878',
  },
});
