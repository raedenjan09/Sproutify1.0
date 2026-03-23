// Sproutify/frontend/src/Components/UserScreen/UserDrawer.js
import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Modal,
  TouchableWithoutFeedback,
  Alert,
  Platform,
  StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getUser, logout } from '../../utils/helper';
import gardenTheme from '../../theme/gardenTheme';

const THEME = {
  colors: {
    bg: gardenTheme.colors.canvas,
    surface: gardenTheme.colors.surface,
    surfaceAlt: gardenTheme.colors.accentGlow,
    text: gardenTheme.colors.textStrong,
    muted: gardenTheme.colors.muted,
    border: gardenTheme.colors.border,
    accentDark: gardenTheme.colors.accentStrong,
    danger: gardenTheme.colors.danger,
    overlay: gardenTheme.colors.overlay,
  },
  radius: {
    md: gardenTheme.radii.md,
    lg: gardenTheme.radii.lg,
    pill: gardenTheme.radii.pill,
  },
};

const DRAWER_WIDTH = 280;

const UserDrawer = ({ children }) => {
  const navigation = useNavigation();
  const route = useRoute();
  
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('Home');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const slideAnim = useRef(new Animated.Value(DRAWER_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Keep bottom-nav active state aligned to current screen
  useEffect(() => {
    const routeToTab = {
      Home: 'Home',
      Cart: 'Cart',
      Notifications: null,
      OrderNotification: null,
      ProductNotification: null,
      Profile: 'Menu',
      ChangePassword: 'Menu',
      OrderHistory: 'Menu',
      OrderDetails: 'Menu',
    };

    if (Object.prototype.hasOwnProperty.call(routeToTab, route.name)) {
      setActiveTab(routeToTab[route.name]);
    }
  }, [route.name]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const userData = await getUser();
      setUser(userData);
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setLoading(false);
    }
  };

  const showDrawer = useCallback(() => {
    setDrawerVisible(true);
    loadUserData();
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const hideDrawer = useCallback(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: DRAWER_WIDTH,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setDrawerVisible(false);
      setUser(null);
    });
  }, [fadeAnim, slideAnim]);

  const handleLogout = useCallback(async () => {
    hideDrawer();
    
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Logout",
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          },
          style: "destructive"
        }
      ]
    );
  }, [hideDrawer, navigation]);

  const handleNavigation = useCallback((screenName) => {
    hideDrawer();

    // Handle alias routes from tab/drawer
    if (screenName === 'Orders') {
      setActiveTab('Menu');
      navigation.navigate('OrderHistory');
      return;
    }

    if (screenName === 'Notifications') {
      setActiveTab('Notifications');
      navigation.navigate('OrderNotification');
      return;
    }

    setActiveTab(screenName === 'Profile' ? 'Menu' : screenName);

    try {
      navigation.navigate(screenName);
    } catch (error) {
      console.log(`Navigation to ${screenName} failed:`, error);
      Alert.alert('Error', `Cannot navigate to ${screenName}`);
    }
  }, [hideDrawer, navigation]);

  const drawerItems = [
    {
      id: 'orders',
      label: 'My Orders',
      icon: 'receipt-outline',
      activeIcon: 'receipt',
      color: THEME.colors.accentDark,
      screen: 'Orders'  // This will be mapped to OrderHistory in handleNavigation
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: 'person-outline',
      activeIcon: 'person',
      color: THEME.colors.accentDark,
      screen: 'Profile'
    },
    {
      id: 'logout',
      label: 'Logout',
      icon: 'log-out-outline',
      activeIcon: 'log-out',
      color: THEME.colors.danger,
      isLogout: true
    },
  ];

  const tabs = [
    {
      id: 'home',
      label: 'Home',
      icon: 'home-outline',
      activeIcon: 'home',
      screen: 'Home'
    },
    {
      id: 'cart',
      label: 'Cart',
      icon: 'cart-outline',
      activeIcon: 'cart',
      screen: 'Cart'
    },
    {
      id: 'menu',
      label: 'Menu',
      icon: 'menu-outline',
      activeIcon: 'menu',
      screen: 'Menu',
      isMenu: true
    },
  ];

  const renderTab = useCallback((tab) => {
    const isActive = activeTab === tab.screen;
    const isMenuTab = tab.isMenu;

    return (
      <TouchableOpacity
        key={tab.id}
        style={[styles.tabItem, isActive && styles.tabItemActive]}
        onPress={() => isMenuTab ? showDrawer() : handleNavigation(tab.screen)}
        activeOpacity={0.82}
        accessibilityLabel={`${tab.label} tab`}
        accessibilityRole="tab"
        accessibilityState={{ selected: isActive }}
      >
        <View style={styles.iconContainer}>
          <Ionicons
            name={isActive ? tab.activeIcon : tab.icon}
            size={20}
            color={isActive ? THEME.colors.accentDark : THEME.colors.muted}
          />
        </View>
        <Text style={[styles.tabLabel, isActive && styles.activeTabLabel]}>
          {tab.label}
        </Text>
      </TouchableOpacity>
    );
  }, [activeTab, showDrawer, handleNavigation]);

  const renderDrawerItem = useCallback((item) => {
    const handlePress = () => {
      if (item.isLogout) {
        handleLogout();
      } else {
        handleNavigation(item.screen);
      }
    };

    return (
      <TouchableOpacity
        key={item.id}
        style={styles.drawerItem}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <View style={[styles.drawerIconContainer, { backgroundColor: `${item.color}15` }]}>
          <Ionicons
            name={item.icon}
            size={22}
            color={item.color}
          />
        </View>
        <Text style={[styles.drawerItemText, { color: item.color }]}>
          {item.label}
        </Text>
        {!item.isLogout && (
          <Ionicons name="chevron-forward" size={18} color={THEME.colors.muted} />
        )}
      </TouchableOpacity>
    );
  }, [handleNavigation, handleLogout]);

  const getUserInitials = () => {
    if (!user?.name) return 'U';
    const names = user.name.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return names[0][0].toUpperCase();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar backgroundColor={THEME.colors.surface} barStyle="dark-content" />
      
      {/* Main Content */}
      <View style={styles.content}>
        <View style={styles.childContent}>
          {children}
        </View>

        {/* Bottom Tab Bar */}
        <View style={styles.tabBarContainer}>
          <View style={styles.tabBar}>
            {tabs.map(renderTab)}
          </View>
        </View>
      </View>

      {/* Drawer Modal */}
      <Modal
        transparent={true}
        visible={drawerVisible}
        onRequestClose={hideDrawer}
        animationType="none"
      >
        <TouchableWithoutFeedback onPress={hideDrawer}>
          <Animated.View style={[styles.drawerOverlay, { opacity: fadeAnim }]}>
            <TouchableWithoutFeedback>
              <Animated.View
                style={[
                  styles.drawerContainer,
                  { transform: [{ translateX: slideAnim }] }
                ]}
              >
                <SafeAreaView style={styles.drawerSafeArea} edges={['top', 'right', 'bottom']}>
                  {/* Drawer Header */}
                  <View style={styles.drawerHeader}>
                    <View style={styles.userInfo}>
                      <View style={styles.avatar}>
                        {loading ? (
                          <Text style={styles.avatarText}>...</Text>
                        ) : (
                          <Text style={styles.avatarText}>{getUserInitials()}</Text>
                        )}
                      </View>
                      <View style={styles.userDetails}>
                        {loading ? (
                          <>
                            <Text style={styles.drawerEyebrow}>Garden menu</Text>
                            <Text style={styles.userName}>Loading...</Text>
                            <Text style={styles.userEmail}>Please wait</Text>
                          </>
                        ) : (
                          <>
                            <Text style={styles.drawerEyebrow}>Garden menu</Text>
                            <Text style={styles.userName}>{user?.name || 'User'}</Text>
                            <Text style={styles.userEmail}>{user?.email || 'user@email.com'}</Text>
                          </>
                        )}
                      </View>
                    </View>
                    <TouchableOpacity onPress={hideDrawer} style={styles.closeButton}>
                      <Ionicons name="close" size={22} color={THEME.colors.text} />
                    </TouchableOpacity>
                  </View>

                  {/* Drawer Items */}
                  <View style={styles.drawerItems}>
                    {drawerItems.map(renderDrawerItem)}
                  </View>

                  {/* Drawer Footer */}
                  <View style={styles.drawerFooter}>
                    <Text style={styles.appVersion}>Sproutify v1.0.0</Text>
                  </View>
                </SafeAreaView>
              </Animated.View>
            </TouchableWithoutFeedback>
          </Animated.View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.bg,
  },
  content: {
    flex: 1,
    backgroundColor: THEME.colors.bg,
  },
  childContent: {
    flex: 1,
  },
  tabBarContainer: {
    backgroundColor: 'transparent',
    paddingHorizontal: 14,
    paddingTop: 6,
    paddingBottom: Platform.OS === 'ios' ? 18 : 12,
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.radius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    paddingHorizontal: 8,
    paddingVertical: 8,
    ...gardenTheme.shadows.soft,
  },
  tabItem: {
    minHeight: 46,
    borderRadius: THEME.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 6,
  },
  tabItemActive: {
    backgroundColor: THEME.colors.surfaceAlt,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  iconContainer: {
    position: 'relative',
  },
  tabLabel: {
    fontSize: 11,
    marginTop: 3,
    color: THEME.colors.muted,
    fontWeight: '600',
  },
  activeTabLabel: {
    color: THEME.colors.text,
    fontWeight: '700',
  },
  drawerOverlay: {
    flex: 1,
    backgroundColor: THEME.colors.overlay,
  },
  drawerContainer: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    backgroundColor: THEME.colors.surface,
    borderLeftWidth: 1,
    borderLeftColor: THEME.colors.border,
    ...Platform.select({
      ios: {
        shadowColor: gardenTheme.colors.shadow,
        shadowOffset: { width: -2, height: 0 },
        shadowOpacity: 0.18,
        shadowRadius: 10,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  drawerSafeArea: {
    flex: 1,
    backgroundColor: THEME.colors.surface,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
    backgroundColor: THEME.colors.surfaceAlt,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: THEME.colors.accentDark,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  drawerEyebrow: {
    fontSize: 11,
    fontWeight: '800',
    color: THEME.colors.accentDark,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '800',
    color: THEME.colors.text,
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 12,
    color: THEME.colors.muted,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  drawerItems: {
    flex: 1,
    paddingTop: 16,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
  },
  drawerIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  drawerItemText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
  },
  drawerFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.border,
  },
  appVersion: {
    fontSize: 12,
    color: THEME.colors.muted,
    textAlign: 'center',
  },
});

export default UserDrawer;
