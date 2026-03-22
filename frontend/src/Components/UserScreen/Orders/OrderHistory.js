// CVPetShop/frontend/src/Components/UserScreen/Orders/OrderHistory.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Image,
  RefreshControl,
  Alert,
  ScrollView,
} from 'react-native';
import axios from 'axios';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { getToken, logout } from '../../../utils/helper';  // Changed: went up 3 levels
import UserDrawer from '../UserDrawer';  // Changed: went up 1 level then to UserDrawer
import Header from '../../layouts/Header';  // Changed: went up 2 levels then to layouts/Header

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
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
    warning: '#A16207',
    warningSoft: '#FEF3C7',
    danger: '#C65D3B',
    dangerSoft: '#FDECE8',
    star: '#D4A017',
    overlay: 'rgba(15, 23, 15, 0.55)',
  },
};

// Status color mapping
const STATUS_COLORS = {
  'Processing': THEME.colors.warning,
  'Accepted': '#3D6C78',
  'Out for Delivery': '#9A6A1B',
  'Shipped': '#3D6C78',
  'Delivered': THEME.colors.success,
  'Cancelled': THEME.colors.danger,
  'Pending': THEME.colors.warning,
  'Completed': THEME.colors.success,
};

// ─── Order Item Component ───────────────────────────────────────────────────
const OrderItem = ({ item, onPress }) => {
  const statusColor = STATUS_COLORS[item.orderStatus] || '#999';
  const date = new Date(item.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <TouchableOpacity style={styles.orderCard} onPress={onPress} activeOpacity={0.7}>
      {/* Order Header */}
      <View style={styles.orderHeader}>
        <View style={styles.orderHeaderLeft}>
          <Icon name="shopping-bag" size={18} color={THEME.colors.accentDark} />
          <Text style={styles.orderId}>Order #{item._id.slice(-8).toUpperCase()}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <Text style={[styles.statusText, { color: statusColor }]}>
            {item.orderStatus}
          </Text>
        </View>
      </View>

      {/* Order Items Preview */}
      <View style={styles.itemsPreview}>
        {item.orderItems.slice(0, 3).map((orderItem, index) => (
          <View key={index} style={styles.previewItem}>
            {orderItem.image ? (
              <Image source={{ uri: orderItem.image }} style={styles.previewImage} />
            ) : (
              <View style={styles.previewImagePlaceholder}>
                <Icon name="local-florist" size={16} color={THEME.colors.muted} />
              </View>
            )}
          </View>
        ))}
        {item.orderItems.length > 3 && (
          <View style={styles.moreItemsBadge}>
            <Text style={styles.moreItemsText}>+{item.orderItems.length - 3}</Text>
          </View>
        )}
      </View>

      {/* Order Footer */}
      <View style={styles.orderFooter}>
        <View style={styles.orderFooterLeft}>
          <Icon name="calendar-today" size={14} color={THEME.colors.muted} />
          <Text style={styles.orderDate}>{date}</Text>
        </View>
        <View style={styles.orderFooterRight}>
          <Text style={styles.orderTotalLabel}>Total: </Text>
          <Text style={styles.orderTotal}>₱{item.totalPrice?.toFixed(2) || '0.00'}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// ─── Empty State Component ─────────────────────────────────────────────────
const EmptyState = ({ onShopNow }) => (
  <View style={styles.emptyContainer}>
    <Icon name="local-florist" size={80} color={THEME.colors.border} />
    <Text style={styles.emptyTitle}>No Orders Yet</Text>
    <Text style={styles.emptySubtitle}>
      Your plant and tool orders will appear here after your first checkout.
    </Text>
    <TouchableOpacity style={styles.shopNowBtn} onPress={onShopNow}>
      <Icon name="storefront" size={20} color="white" />
      <Text style={styles.shopNowText}>Shop Now</Text>
    </TouchableOpacity>
  </View>
);

// ─── Main Order History Screen ─────────────────────────────────────────────
export default function OrderHistory({ navigation }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('All'); // All, Processing, Shipped, Delivered, Cancelled

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchOrders();
    });

    return unsubscribe;
  }, [navigation]);

  const fetchOrders = async () => {
    try {
      const token = await getToken();
      if (!token) {
        navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        return;
      }

      // Fixed: Removed duplicate '/orders' from the path
      const response = await axios.get(`${BACKEND_URL}/api/v1/orders/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setOrders(response.data.orders || []);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);

      if (error.response?.status === 401) {
        Alert.alert(
          'Session Expired',
          error.response?.data?.message || 'Please sign in again to view your orders.',
          [{ text: 'OK', onPress: () => logout(navigation) }]
        );
        return;
      }

      Alert.alert('Error', error.response?.data?.message || 'Failed to load orders. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
  };

  const handleOrderPress = (order) => {
    navigation.navigate('OrderDetails', { orderId: order._id, order });
  };

  const handleShopNow = () => {
    navigation.navigate('Home');
  };

  // Filter orders based on selected filter
  const filteredOrders = filter === 'All' 
    ? orders 
    : orders.filter(order => order.orderStatus === filter);

  // Get unique statuses for filter buttons
  const statuses = ['All', ...new Set(orders.map(order => order.orderStatus))];

  // ─── Render Filter Button ────────────────────────────────────────────────
  const renderFilterButton = (status) => (
    <TouchableOpacity
      key={status}
      style={[
        styles.filterButton,
        filter === status && styles.filterButtonActive,
      ]}
      onPress={() => setFilter(status)}
    >
      <Text
        style={[
          styles.filterButtonText,
          filter === status && styles.filterButtonTextActive,
        ]}
      >
        {status}
      </Text>
    </TouchableOpacity>
  );

  // ─── Loading State ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <UserDrawer>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={THEME.colors.accent} />
          <Text style={styles.loadingText}>Loading your orders...</Text>
        </View>
      </UserDrawer>
    );
  }

  return (
    <UserDrawer>
      <SafeAreaView style={styles.safeArea}>
        <Header />

        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Order History</Text>
            <Text style={styles.headerSubtitle}>
              {orders.length} {orders.length === 1 ? 'order' : 'orders'} found
            </Text>
          </View>

          {/* Filter Buttons */}
          {orders.length > 0 && (
            <View style={styles.filterContainer}>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterScrollContent}
              >
                {statuses.map(renderFilterButton)}
              </ScrollView>
            </View>
          )}

          {/* Orders List */}
          {filteredOrders.length > 0 ? (
            <FlatList
              data={filteredOrders}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <OrderItem item={item} onPress={() => handleOrderPress(item)} />
              )}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={[THEME.colors.accent]}
                  tintColor={THEME.colors.accent}
                />
              }
              ListFooterComponent={<View style={{ height: 20 }} />}
            />
          ) : (
            <EmptyState onShopNow={handleShopNow} />
          )}
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
    backgroundColor: THEME.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: THEME.colors.background,
  },
  loadingText: {
    fontSize: 15,
    color: THEME.colors.muted,
    marginTop: 12,
  },
  header: {
    backgroundColor: THEME.colors.surface,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: THEME.colors.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: THEME.colors.muted,
  },
  filterContainer: {
    backgroundColor: THEME.colors.surface,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
  },
  filterScrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: THEME.colors.surfaceAlt,
    marginRight: 8,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  filterButtonActive: {
    backgroundColor: THEME.colors.accent,
    borderColor: THEME.colors.accent,
  },
  filterButtonText: {
    fontSize: 13,
    color: THEME.colors.muted,
    fontWeight: '700',
  },
  filterButtonTextActive: {
    color: 'white',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  orderCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  orderHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  orderId: {
    fontSize: 14,
    fontWeight: '800',
    color: THEME.colors.text,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    gap: 5,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  itemsPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 8,
  },
  previewItem: {
    width: 44,
    height: 44,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: THEME.colors.surfaceAlt,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  previewImagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: THEME.colors.surfaceAlt,
  },
  moreItemsBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: THEME.colors.accentSoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreItemsText: {
    fontSize: 12,
    fontWeight: '800',
    color: THEME.colors.accentDark,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.border,
  },
  orderFooterLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  orderDate: {
    fontSize: 12,
    color: THEME.colors.muted,
  },
  orderFooterRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderTotalLabel: {
    fontSize: 12,
    color: THEME.colors.muted,
  },
  orderTotal: {
    fontSize: 15,
    fontWeight: '900',
    color: THEME.colors.accentDark,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    marginTop: -32,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: THEME.colors.text,
    marginTop: 18,
  },
  emptySubtitle: {
    fontSize: 14,
    color: THEME.colors.muted,
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 8,
    marginBottom: 22,
  },
  shopNowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.accent,
    paddingHorizontal: 24,
    paddingVertical: 13,
    borderRadius: 999,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
  },
  shopNowText: {
    fontSize: 15,
    fontWeight: '800',
    color: 'white',
    marginLeft: 7,
  },
});
