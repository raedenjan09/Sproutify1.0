import React, { useState } from 'react';
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
import { MaterialIcons as Icon } from '@expo/vector-icons';
import AuthScreenShell from '../layouts/AuthScreenShell';
import gardenTheme from '../../theme/gardenTheme';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

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
    const nextErrors = {};

    if (!name.trim()) {
      nextErrors.name = 'Name is required';
    }

    if (!email.trim()) {
      nextErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      nextErrors.email = 'Email is invalid';
    }

    if (!password) {
      nextErrors.password = 'Password is required';
    } else if (password.length < 6) {
      nextErrors.password = 'Password must be at least 6 characters';
    }

    if (password !== confirmPassword) {
      nextErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const clearError = (field) => {
    if (!errors[field]) {
      return;
    }

    setErrors((current) => ({ ...current, [field]: null }));
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${BACKEND_URL}/api/v1/users/register`, {
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
    <AuthScreenShell
      navigation={navigation}
      showBackButton
      topBarTitle="Create account"
      brandIcon="local-florist"
      eyebrow="Fresh garden start"
      title="Build your Sproutify account and grow with confidence."
      subtitle="Save your details, follow orders more easily, and keep every plant project rooted in one place."
      highlights={[
        { icon: 'shopping-bag', label: 'Faster checkout' },
        { icon: 'favorite-border', label: 'Saved favorites and orders' },
        { icon: 'mark-email-read', label: 'Email verification after signup' },
      ]}
    >
      <View style={styles.formCard}>
        <Text style={styles.formTitle}>Get started</Text>
        <Text style={styles.formSubtitle}>
          Share a few details and we will prepare your account for checkout.
        </Text>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Full name</Text>
          <View style={[styles.inputContainer, errors.name && styles.inputError]}>
            <Icon name="person-outline" size={20} color={gardenTheme.colors.muted} style={styles.inputIcon} />
            <TextInput
              placeholder="Your full name"
              value={name}
              onChangeText={(text) => {
                setName(text);
                clearError('name');
              }}
              style={styles.input}
              placeholderTextColor="#8FA08B"
            />
          </View>
          {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Email address</Text>
          <View style={[styles.inputContainer, errors.email && styles.inputError]}>
            <Icon name="mail-outline" size={20} color={gardenTheme.colors.muted} style={styles.inputIcon} />
            <TextInput
              placeholder="you@example.com"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                clearError('email');
              }}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              style={styles.input}
              placeholderTextColor="#8FA08B"
            />
          </View>
          {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Password</Text>
          <View style={[styles.inputContainer, errors.password && styles.inputError]}>
            <Icon name="lock-outline" size={20} color={gardenTheme.colors.muted} style={styles.inputIcon} />
            <TextInput
              placeholder="Create a password"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                clearError('password');
              }}
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
          {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
          <Text style={styles.hintText}>Use at least 6 characters.</Text>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Confirm password</Text>
          <View style={[styles.inputContainer, errors.confirmPassword && styles.inputError]}>
            <Icon name="verified-user" size={20} color={gardenTheme.colors.muted} style={styles.inputIcon} />
            <TextInput
              placeholder="Confirm your password"
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                clearError('confirmPassword');
              }}
              secureTextEntry={!showConfirmPassword}
              style={[styles.input, styles.passwordInput]}
              placeholderTextColor="#8FA08B"
            />
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
              <Icon
                name={showConfirmPassword ? 'visibility' : 'visibility-off'}
                size={20}
                color={gardenTheme.colors.muted}
              />
            </TouchableOpacity>
          </View>
          {errors.confirmPassword ? <Text style={styles.errorText}>{errors.confirmPassword}</Text> : null}
        </View>

        <View style={styles.noteCard}>
          <Icon name="mark-email-read" size={18} color={gardenTheme.colors.accentStrong} />
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
            <ActivityIndicator color={gardenTheme.colors.white} />
          ) : (
            <>
              <Text style={styles.primaryButtonText}>Create Account</Text>
              <Icon name="arrow-forward" size={18} color={gardenTheme.colors.white} />
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
    marginBottom: 20,
    fontSize: 14,
    lineHeight: 21,
    color: gardenTheme.colors.muted,
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
  inputError: {
    borderColor: gardenTheme.colors.danger,
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
  errorText: {
    marginTop: 6,
    marginLeft: 4,
    fontSize: 12,
    color: gardenTheme.colors.danger,
    fontWeight: '700',
  },
  hintText: {
    marginTop: 6,
    marginLeft: 4,
    fontSize: 12,
    color: gardenTheme.colors.muted,
  },
  noteCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
    marginTop: 4,
    borderRadius: gardenTheme.radii.md,
    backgroundColor: gardenTheme.colors.accentGlow,
    borderWidth: 1,
    borderColor: gardenTheme.colors.border,
  },
  noteText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 13,
    lineHeight: 20,
    color: gardenTheme.colors.muted,
  },
  primaryButton: {
    marginTop: 20,
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
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 18,
  },
  loginText: {
    fontSize: 14,
    color: gardenTheme.colors.muted,
  },
  loginLink: {
    fontSize: 14,
    color: gardenTheme.colors.accentStrong,
    fontWeight: '900',
  },
});
