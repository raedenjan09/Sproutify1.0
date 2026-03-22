import React, { useState } from 'react';
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
import { MaterialIcons as Icon } from '@expo/vector-icons';

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
    danger: '#C75B39',
    shadow: '#1A221A',
  },
};

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const apiUrl = `${BACKEND_URL}/api/v1/users/register`;
      const res = await axios.post(apiUrl, {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      });

      console.log('Registration successful:', res.data);

      Alert.alert(
        'Success',
        'Registration successful! Please check your email for verification.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Login'),
          },
        ]
      );
    } catch (error) {
      console.error('Registration error:', error);

      let errorMessage = 'Registration failed';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }

      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

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
          <View style={styles.topBar}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} activeOpacity={0.85}>
              <Icon name="arrow-back" size={22} color={THEME.colors.text} />
            </TouchableOpacity>
            <Text style={styles.topBarTitle}>Create account</Text>
            <View style={styles.topBarSpacer} />
          </View>

          <View style={styles.brandHeader}>
            <View style={styles.brandBadge}>
              <Icon name="spa" size={26} color={THEME.colors.accentDark} />
            </View>
            <Text style={styles.brandTitle}>Sproutify</Text>
            <Text style={styles.brandSubtitle}>Create your account and start shopping smarter.</Text>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Get started</Text>
            <Text style={styles.formSubtitle}>
              We only need a few details to create your account.
            </Text>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Full name</Text>
              <View style={[styles.inputContainer, errors.name && styles.inputError]}>
                <Icon name="person-outline" size={20} color={THEME.colors.muted} style={styles.inputIcon} />
                <TextInput
                  placeholder="Your full name"
                  value={name}
                  onChangeText={(text) => {
                    setName(text);
                    if (errors.name) setErrors({ ...errors, name: null });
                  }}
                  style={styles.input}
                  placeholderTextColor="#93A094"
                />
              </View>
              {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Email address</Text>
              <View style={[styles.inputContainer, errors.email && styles.inputError]}>
                <Icon name="mail-outline" size={20} color={THEME.colors.muted} style={styles.inputIcon} />
                <TextInput
                  placeholder="you@example.com"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (errors.email) setErrors({ ...errors, email: null });
                  }}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  style={styles.input}
                  placeholderTextColor="#93A094"
                />
              </View>
              {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Password</Text>
              <View style={[styles.inputContainer, errors.password && styles.inputError]}>
                <Icon name="lock-outline" size={20} color={THEME.colors.muted} style={styles.inputIcon} />
                <TextInput
                  placeholder="Create a password"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (errors.password) setErrors({ ...errors, password: null });
                  }}
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
              {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
              <Text style={styles.hintText}>Use at least 6 characters.</Text>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Confirm password</Text>
              <View style={[styles.inputContainer, errors.confirmPassword && styles.inputError]}>
                <Icon name="verified-user" size={20} color={THEME.colors.muted} style={styles.inputIcon} />
                <TextInput
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: null });
                  }}
                  secureTextEntry={!showConfirmPassword}
                  style={[styles.input, styles.passwordInput]}
                  placeholderTextColor="#93A094"
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <Icon
                    name={showConfirmPassword ? 'visibility' : 'visibility-off'}
                    size={20}
                    color={THEME.colors.muted}
                  />
                </TouchableOpacity>
              </View>
              {errors.confirmPassword ? <Text style={styles.errorText}>{errors.confirmPassword}</Text> : null}
            </View>

            <View style={styles.noteCard}>
              <Icon name="mark-email-read" size={18} color={THEME.colors.accentDark} />
              <Text style={styles.noteText}>
                We will send a verification email after registration so your account is ready for checkout.
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.primaryButton, loading && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.88}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Text style={styles.primaryButtonText}>Create Account</Text>
                  <Icon name="arrow-forward" size={18} color="#FFFFFF" />
                </>
              )}
            </TouchableOpacity>

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account?</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.loginLink}>Sign in</Text>
              </TouchableOpacity>
            </View>
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
    paddingTop: 8,
    paddingBottom: 28,
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
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  topBarTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: THEME.colors.text,
  },
  topBarSpacer: {
    width: 42,
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
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
    color: THEME.colors.text,
  },
  heroSubtitle: {
    marginTop: 10,
    fontSize: 15,
    lineHeight: 22,
    color: THEME.colors.muted,
  },
  highlightColumn: {
    marginTop: 18,
    gap: 10,
  },
  highlightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  highlightIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME.colors.accentSoft,
  },
  highlightText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: THEME.colors.text,
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
  inputError: {
    borderColor: THEME.colors.danger,
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
  errorText: {
    marginTop: 6,
    marginLeft: 4,
    fontSize: 12,
    color: THEME.colors.danger,
    fontWeight: '600',
  },
  hintText: {
    marginTop: 6,
    marginLeft: 4,
    fontSize: 12,
    color: THEME.colors.muted,
  },
  noteCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    borderRadius: 18,
    padding: 14,
    marginTop: 4,
    backgroundColor: THEME.colors.accentSoftAlt,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  noteText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
    color: THEME.colors.muted,
  },
  primaryButton: {
    marginTop: 20,
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
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 18,
  },
  loginText: {
    fontSize: 14,
    color: THEME.colors.muted,
  },
  loginLink: {
    fontSize: 14,
    color: THEME.colors.accentDark,
    fontWeight: '800',
  },
});
