import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
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
    border: '#E3DDD2',
    danger: '#C75B39',
    success: '#2F7D4B',
    shadow: '#1A221A',
  },
};

export default function ForgotPassword({ navigation }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const getBackendUrl = () => {
    if (Platform.OS === 'android') {
      return BACKEND_URL.replace('localhost', '10.0.2.2');
    }
    return BACKEND_URL;
  };

  const handleSubmit = async () => {
    if (!email) {
      setError('Please enter your email');
      setMessage('');
      return;
    }

    setLoading(true);
    setMessage('');
    setError('');

    const url = `${getBackendUrl()}/api/v1/users/forgot-password`;
    console.log('Forgot password URL:', url);

    try {
      const response = await axios.post(url, { email });
      console.log('Forgot password response:', response.data);

      if (response.data.success) {
        setMessage(response.data.message || 'Password reset email sent successfully.');
      } else {
        setError(response.data.message || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      console.error('Forgot password error:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Server error. Please try again.');
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
            <Text style={styles.topBarTitle}>Reset password</Text>
            <View style={styles.topBarSpacer} />
          </View>

          <View style={styles.brandHeader}>
            <View style={styles.brandBadge}>
              <Icon name="lock-reset" size={28} color={THEME.colors.accentDark} />
            </View>
            <Text style={styles.brandTitle}>Forgot your password?</Text>
            <Text style={styles.brandSubtitle}>
              Enter the email tied to your account and we&apos;ll send reset instructions.
            </Text>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Email recovery</Text>
            <Text style={styles.formSubtitle}>
              We&apos;ll send a secure reset link so you can get back into Sproutify.
            </Text>

            {message ? <Text style={styles.success}>{message}</Text> : null}
            {error ? <Text style={styles.error}>{error}</Text> : null}

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Email address</Text>
              <View style={styles.inputContainer}>
                <Icon name="mail-outline" size={20} color={THEME.colors.muted} style={styles.inputIcon} />
                <TextInput
                  placeholder="you@example.com"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  style={styles.input}
                  placeholderTextColor="#93A094"
                />
              </View>
            </View>

            <TouchableOpacity
              style={[styles.primaryButton, loading && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.88}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Text style={styles.primaryButtonText}>Send Reset Email</Text>
                  <Icon name="arrow-forward" size={18} color="#FFFFFF" />
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.secondaryAction} activeOpacity={0.85}>
              <Icon name="arrow-back" size={18} color={THEME.colors.accentDark} />
              <Text style={styles.secondaryActionText}>Back to login</Text>
            </TouchableOpacity>
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
    justifyContent: 'center',
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
    textAlign: 'center',
  },
  brandSubtitle: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
    color: THEME.colors.muted,
    textAlign: 'center',
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
    marginBottom: 18,
    fontSize: 14,
    lineHeight: 21,
    color: THEME.colors.muted,
  },
  success: {
    marginBottom: 14,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: THEME.colors.success,
    backgroundColor: '#EDF8F0',
    borderWidth: 1,
    borderColor: '#CAE7D0',
    fontWeight: '600',
  },
  error: {
    marginBottom: 14,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: THEME.colors.danger,
    backgroundColor: '#FCEFEA',
    borderWidth: 1,
    borderColor: '#F2D3C6',
    fontWeight: '600',
  },
  fieldGroup: {
    marginBottom: 18,
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
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: THEME.colors.text,
    paddingVertical: 14,
  },
  primaryButton: {
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
  secondaryAction: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  secondaryActionText: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.colors.accentDark,
  },
});
