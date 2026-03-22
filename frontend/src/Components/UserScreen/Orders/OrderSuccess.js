// CVPetShop/frontend/src/Components/UserScreen/Orders/OrderSuccess.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import UserDrawer from '../UserDrawer';
import Header from '../../layouts/Header';

const THEME = {
  colors: {
    background: '#F5F3EE',
    surface: '#FFFFFF',
    surfaceAlt: '#F0F6F0',
    text: '#1F2A1F',
    muted: '#6B7C6A',
    accent: '#2E7D32',
    accentDark: '#1B5E20',
    accentSoft: '#E6F2E6',
    border: '#E6E0D9',
    success: '#2F855A',
  },
};

export default function OrderSuccess({ route, navigation }) {
  const { order, orderId, orderNumber } = route.params || {};

  return (
    <UserDrawer>
      <SafeAreaView style={styles.safeArea}>
        <Header />

        <View style={styles.container}>
          <View style={styles.successBadge}>
            <View style={styles.successIconWrap}>
              <Icon name="check-circle" size={96} color={THEME.colors.success} />
            </View>
            <Text style={styles.kicker}>Garden Order Confirmed</Text>
            <Text style={styles.title}>Order Placed Successfully</Text>
            <Text style={styles.subtitle}>
              Thanks for shopping with us. We have received your order and will start preparing it right away.
            </Text>
          </View>

          <View style={styles.orderInfo}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Order ID</Text>
              <Text style={styles.infoValue}>{orderId || order?._id || 'N/A'}</Text>
            </View>
            {orderNumber && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Order Number</Text>
                <Text style={styles.infoValue}>{orderNumber}</Text>
              </View>
            )}
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Total</Text>
              <Text style={styles.totalValue}>???{order?.totalPrice?.toFixed(2) || '0.00'}</Text>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={() => navigation.navigate('Home')}
            >
              <Icon name="storefront" size={20} color="#fff" />
              <Text style={styles.primaryButtonText}>Continue Shopping</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={() => navigation.navigate('OrderHistory')}
            >
              <Icon name="history" size={20} color={THEME.colors.accentDark} />
              <Text style={styles.secondaryButtonText}>View Order History</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </UserDrawer>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    backgroundColor: THEME.colors.background,
  },
  successBadge: {
    backgroundColor: THEME.colors.surface,
    borderRadius: 28,
    paddingHorizontal: 24,
    paddingVertical: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME.colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 3,
  },
  successIconWrap: {
    width: 126,
    height: 126,
    borderRadius: 63,
    backgroundColor: THEME.colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  kicker: {
    fontSize: 12,
    fontWeight: '800',
    color: THEME.colors.accentDark,
    textTransform: 'uppercase',
    letterSpacing: 1.1,
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: THEME.colors.text,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: THEME.colors.muted,
    textAlign: 'center',
    lineHeight: 22,
  },
  orderInfo: {
    backgroundColor: THEME.colors.surface,
    borderRadius: 24,
    padding: 20,
    width: '100%',
    marginTop: 18,
    marginBottom: 26,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  infoValue: {
    flex: 1,
    marginLeft: 16,
    textAlign: 'right',
    fontSize: 14,
    fontWeight: '700',
    color: THEME.colors.text,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '900',
    color: THEME.colors.accentDark,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 18,
    gap: 8,
  },
  primaryButton: {
    backgroundColor: THEME.colors.accent,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
  secondaryButton: {
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  secondaryButtonText: {
    color: THEME.colors.accentDark,
    fontSize: 16,
    fontWeight: '800',
  },
});

