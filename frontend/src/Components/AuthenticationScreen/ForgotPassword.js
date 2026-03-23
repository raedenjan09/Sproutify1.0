import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from 'react-native';
import axios from 'axios';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import AuthScreenShell from '../layouts/AuthScreenShell';
import gardenTheme from '../../theme/gardenTheme';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

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

    try {
      const response = await axios.post(`${getBackendUrl()}/api/v1/users/forgot-password`, {
        email,
      });

      if (response.data.success) {
        setMessage(response.data.message || 'Password reset email sent successfully.');
      } else {
        setError(response.data.message || 'Something went wrong. Please try again.');
      }
    } catch (requestError) {
      console.error('Forgot password error:', requestError.response?.data || requestError.message);
      setError(requestError.response?.data?.message || 'Server error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScreenShell
      navigation={navigation}
      showBackButton
      topBarTitle="Reset password"
      brandIcon="lock-reset"
      eyebrow="Garden account recovery"
      title="Regrow access to your account."
      subtitle="Enter your email and we will send a secure reset link so you can get back to your orders and plant plans."
      highlights={[
        { icon: 'verified-user', label: 'Secure recovery link' },
        { icon: 'mail-outline', label: 'Sent to your account email' },
      ]}
    >
      <View style={styles.formCard}>
        <Text style={styles.formTitle}>Email recovery</Text>
        <Text style={styles.formSubtitle}>
          We will send a reset link to the address tied to your Sproutify account.
        </Text>

        {message ? <Text style={styles.success}>{message}</Text> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Email address</Text>
          <View style={styles.inputContainer}>
            <Icon name="mail-outline" size={20} color={gardenTheme.colors.muted} style={styles.inputIcon} />
            <TextInput
              placeholder="you@example.com"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              style={styles.input}
              placeholderTextColor="#8FA08B"
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
            <ActivityIndicator color={gardenTheme.colors.white} />
          ) : (
            <>
              <Text style={styles.primaryButtonText}>Send Reset Email</Text>
              <Icon name="arrow-forward" size={18} color={gardenTheme.colors.white} />
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.secondaryAction}
          activeOpacity={0.85}
        >
          <Icon name="arrow-back" size={18} color={gardenTheme.colors.accentStrong} />
          <Text style={styles.secondaryActionText}>Back to login</Text>
        </TouchableOpacity>
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
  success: {
    marginBottom: 14,
    borderRadius: gardenTheme.radii.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: gardenTheme.colors.success,
    backgroundColor: '#EDF7EF',
    borderWidth: 1,
    borderColor: '#CCE4D1',
    fontWeight: '700',
  },
  error: {
    marginBottom: 14,
    borderRadius: gardenTheme.radii.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: gardenTheme.colors.danger,
    backgroundColor: '#FCEFEA',
    borderWidth: 1,
    borderColor: '#F0D2C9',
    fontWeight: '700',
  },
  fieldGroup: {
    marginBottom: 18,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: gardenTheme.colors.textStrong,
    marginBottom: 8,
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
  primaryButton: {
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
  secondaryAction: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  secondaryActionText: {
    fontSize: 14,
    fontWeight: '800',
    color: gardenTheme.colors.accentStrong,
  },
});
