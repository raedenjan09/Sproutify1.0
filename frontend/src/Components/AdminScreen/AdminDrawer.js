// Sproutify/frontend/src/Components/AdminScreen/AdminDrawer.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  ScrollView,
  TouchableWithoutFeedback,
} from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const DRAWER_WIDTH = width * 0.7;

const AdminDrawer = ({ children, onLogout }) => {
  const navigation = useNavigation();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState('Dashboard');
  const [drawerAnimation] = useState(new Animated.Value(0));

  const menuItems = [
    { name: 'Dashboard', icon: 'view-dashboard', screen: 'Dashboard' },
    { name: 'User', icon: 'account-group', screen: 'User' },
    { name: 'Order', icon: 'cart', screen: 'Order' },
    { name: 'Supplier', icon: 'truck-delivery', screen: 'Supplier' },
    { name: 'Reviews', icon: 'star', screen: 'Reviews' },
    { name: 'Product', icon: 'package-variant', screen: 'Product' },
  ];

  const toggleDrawer = () => {
    const toValue = isDrawerOpen ? 0 : 1;
    Animated.spring(drawerAnimation, {
      toValue,
      useNativeDriver: true,
      friction: 8,
    }).start();
    setIsDrawerOpen(!isDrawerOpen);
  };

  const handleMenuItemPress = (itemName) => {
    setSelectedItem(itemName);
    
    switch(itemName) {
      case 'User':
        navigation.navigate('UserList');
        break;
      case 'Supplier':
        navigation.navigate('SupplierList');
        break;
      case 'Product':
        navigation.navigate('ProductList');
        break;
      case 'Dashboard':
        navigation.navigate('Dashboard');
        break;
      case 'Order':
        navigation.navigate('OrderList');
        break;
      case 'Reviews':
        navigation.navigate('ReviewList');
        break;
      default:
        break;
    }
    
    toggleDrawer();
  };

  const translateX = drawerAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [-DRAWER_WIDTH, 0],
  });

  const overlayOpacity = drawerAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.5],
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={toggleDrawer} 
          style={styles.hamburgerButton}
        >
          <Icon name="menu" size={30} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Admin Dashboard</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content} collapsable={false}>
        {children}
      </View>

      {isDrawerOpen && (
        <TouchableWithoutFeedback onPress={toggleDrawer}>
          <Animated.View 
            style={[styles.overlay, { opacity: overlayOpacity }]} 
          />
        </TouchableWithoutFeedback>
      )}

      {isDrawerOpen && (
        <Animated.View
          style={[
            styles.drawer,
            { transform: [{ translateX }] },
          ]}
        >
          {/* 🌿 UPDATED HEADER */}
          <View style={styles.drawerHeader}>
            <Icon name="sprout" size={42} color="#4CAF50" />
            <Text style={styles.drawerHeaderText}>Sproutify</Text>
            <Text style={styles.drawerSubHeaderText}>Admin Panel</Text>
          </View>

          <ScrollView style={styles.drawerContent}>
            {menuItems.map((item) => (
              <TouchableOpacity
                key={item.name}
                style={[
                  styles.drawerItem,
                  selectedItem === item.name && styles.drawerItemSelected,
                ]}
                onPress={() => handleMenuItemPress(item.name)}
              >
                <Icon
                  name={item.icon}
                  size={24}
                  color={selectedItem === item.name ? '#4CAF50' : '#666'}
                />
                <Text
                  style={[
                    styles.drawerItemText,
                    selectedItem === item.name && styles.drawerItemTextSelected,
                  ]}
                >
                  {item.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.drawerFooter}>
            <TouchableOpacity style={styles.drawerFooterItem}>
              <Icon name="cog" size={20} color="#666" />
              <Text style={styles.drawerFooterText}>Settings</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.drawerFooterItem}
              onPress={onLogout}
            >
              <Icon name="logout" size={20} color="#666" />
              <Text style={styles.drawerFooterText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingTop: 50,
    paddingBottom: 15,
    backgroundColor: '#fff',
    elevation: 4,
    zIndex: 10,
  },

  hamburgerButton: { padding: 5 },

  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },

  placeholder: { width: 40 },

  content: { flex: 1, zIndex: 1 },

  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000',
    zIndex: 20,
  },

  drawer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: DRAWER_WIDTH,
    height: '100%',
    backgroundColor: '#fff',
    elevation: 8,
    zIndex: 30,
  },

  drawerHeader: {
    padding: 20,
    paddingTop: 50,
    backgroundColor: '#f1f8f4',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
  },

  drawerHeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginTop: 10,
  },

  drawerSubHeaderText: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },

  drawerContent: { flex: 1, paddingTop: 10 },

  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    marginHorizontal: 10,
    borderRadius: 8,
    marginVertical: 2,
  },

  drawerItemSelected: {
    backgroundColor: '#E8F5E9',
  },

  drawerItemText: {
    marginLeft: 15,
    fontSize: 16,
    color: '#666',
  },

  drawerItemTextSelected: {
    color: '#4CAF50',
    fontWeight: '600',
  },

  drawerFooter: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    padding: 15,
  },

  drawerFooterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },

  drawerFooterText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#666',
  },
});

export default AdminDrawer;