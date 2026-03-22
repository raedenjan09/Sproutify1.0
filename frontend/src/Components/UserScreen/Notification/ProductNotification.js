// PetShop/frontend/src/Components/UserScreen/Notification/ProductNotification.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
  RefreshControl,
  Alert,
  FlatList,
} from 'react-native';
import axios from 'axios';
import { getToken } from '../../../utils/helper';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

// You need to have a placeholder image in your assets folder
// If you don't have one, you can remove the defaultSource prop or use a different approach


export default function ProductNotificationScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [notifications, setNotifications] = useState({
    newDiscounts: [],
    endingSoonDiscounts: [],
    total: 0
  });
  const [activeTab, setActiveTab] = useState('new'); // 'new' or 'ending'

  const fetchNotifications = async () => {
    try {
      const token = await getToken();
      const response = await axios.get(
        `${BACKEND_URL}/api/v1/notifications/discounts`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (response.data.success) {
        setNotifications(response.data.notifications);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      Alert.alert('Error', 'Failed to load notifications');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchNotifications();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const calculateTimeLeft = (endDate) => {
    const end = new Date(endDate).getTime();
    const now = new Date().getTime();
    const difference = end - now;

    if (difference <= 0) return 'Expired';

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} left`;
    } else {
      return `${hours} hour${hours > 1 ? 's' : ''} left`;
    }
  };

  const renderDiscountCard = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('ProductDetail', { productId: item._id })}
    >
      <Image
        source={{ uri: item.images[0]?.url }}
        style={styles.productImage}
        // Option 1: Remove defaultSource if you don't have a placeholder
        // defaultSource={PLACEHOLDER_IMAGE}
        
        // Option 2: Use a fallback with onError
        onError={(e) => {
          console.log('Image failed to load:', item.images[0]?.url);
          // You can set a fallback state here if needed
        }}
      />
      
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={styles.productName} numberOfLines={2}>
            {item.name}
          </Text>
          {item.discountPercentage && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{item.discountPercentage}% OFF</Text>
            </View>
          )}
        </View>

        <Text style={styles.category}>{item.category}</Text>

        <View style={styles.priceContainer}>
          <Text style={styles.originalPrice}>â‚±{item.price.toFixed(2)}</Text>
          <Text style={styles.discountedPrice}>â‚±{item.discountedPrice.toFixed(2)}</Text>
        </View>

        {item.discountEndDate && (
          <View style={styles.timeLeftContainer}>
            <Icon name="timer" size={16} color="#e74c3c" />
            <Text style={styles.timeLeftText}>
              {calculateTimeLeft(item.discountEndDate)}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon name="notifications-none" size={80} color="#ccc" />
      <Text style={styles.emptyTitle}>No Notifications</Text>
      <Text style={styles.emptyText}>
        {activeTab === 'new' 
          ? "There are no new discount notifications at the moment."
          : "There are no ending soon discounts at the moment."}
      </Text>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Discount Notifications</Text>
        {notifications.total > 0 && (
          <View style={styles.totalBadge}>
            <Text style={styles.totalText}>{notifications.total}</Text>
          </View>
        )}
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'new' && styles.activeTab]}
          onPress={() => setActiveTab('new')}
        >
          <Text style={[styles.tabText, activeTab === 'new' && styles.activeTabText]}>
            New Discounts
          </Text>
          {notifications.newDiscounts.length > 0 && (
            <View style={styles.tabBadge}>
              <Text style={styles.tabBadgeText}>{notifications.newDiscounts.length}</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'ending' && styles.activeTab]}
          onPress={() => setActiveTab('ending')}
        >
          <Text style={[styles.tabText, activeTab === 'ending' && styles.activeTabText]}>
            Ending Soon
          </Text>
          {notifications.endingSoonDiscounts.length > 0 && (
            <View style={styles.tabBadge}>
              <Text style={styles.tabBadgeText}>{notifications.endingSoonDiscounts.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <FlatList
        data={activeTab === 'new' ? notifications.newDiscounts : notifications.endingSoonDiscounts}
        renderItem={renderDiscountCard}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={renderEmptyState}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  totalBadge: {
    backgroundColor: '#3498db',
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  totalText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    marginHorizontal: 5,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  activeTab: {
    backgroundColor: '#3498db',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginRight: 5,
  },
  activeTabText: {
    color: 'white',
  },
  tabBadge: {
    backgroundColor: '#e74c3c',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  tabBadgeText: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 15,
    flexGrow: 1,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 15,
    flexDirection: 'row',
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  productImage: {
    width: 100,
    height: 100,
    resizeMode: 'cover',
  },
  cardContent: {
    flex: 1,
    padding: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 5,
  },
  productName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginRight: 10,
  },
  discountBadge: {
    backgroundColor: '#e74c3c',
    borderRadius: 5,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  discountText: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
  },
  category: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  originalPrice: {
    fontSize: 12,
    color: '#999',
    textDecorationLine: 'line-through',
    marginRight: 8,
  },
  discountedPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e74c3c',
  },
  timeLeftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef5f5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
    alignSelf: 'flex-start',
  },
  timeLeftText: {
    fontSize: 11,
    color: '#e74c3c',
    marginLeft: 4,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 10,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 5,
    paddingHorizontal: 40,
  },
});

