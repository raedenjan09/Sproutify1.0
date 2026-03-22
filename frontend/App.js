// CVPetShop/frontend/App.js
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Platform, Alert, AppState } from 'react-native';
import * as Notifications from 'expo-notifications';
import AppNavigator from './src/Components/Navigation/AppNavigator';
import { getToken } from './src/utils/helper';
import * as SplashScreen from 'expo-splash-screen';

const notificationsEnabled = Platform.OS !== 'web';

// Configure notification handler for foreground
if (notificationsEnabled) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
}

// Keep splash screen visible while we initialize
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);
  const navigationRef = useRef();
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    async function prepare() {
      try {
        if (notificationsEnabled) {
          await setupNotifications();
        }
        
        // Add any other initialization here
        
      } catch (e) {
        console.warn('Error during app initialization:', e);
      } finally {
        setAppIsReady(true);
        await SplashScreen.hideAsync();
      }
    }

    prepare();

    if (notificationsEnabled) {
      // Setup notification listeners
      setupNotificationListeners();
    }

    // Handle app state changes
    const subscription = notificationsEnabled
      ? AppState.addEventListener('change', handleAppStateChange)
      : null;

    // Cleanup on unmount
    return () => {
      cleanupNotificationListeners();
      subscription?.remove();
    };
  }, []);

  const setupNotifications = async () => {
    if (!notificationsEnabled) {
      return;
    }

    try {
      // Set up Android notification channel
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('order-updates', {
          name: 'Order Updates',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#f39c12',
          sound: 'default',
          enableVibrate: true,
          bypassDnd: true,
          lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
          showBadge: true,
        });

        await Notifications.setNotificationChannelAsync('default', {
          name: 'Default',
          importance: Notifications.AndroidImportance.DEFAULT,
          vibrationPattern: [0, 250, 250, 250],
          sound: 'default',
        });
      }

      // Check if we have permission
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return;
      }

    } catch (error) {
      console.error('Error setting up notifications:', error);
    }
  };

  const setupNotificationListeners = () => {
    if (!notificationsEnabled) {
      return;
    }

    // Listener for notifications received while app is foregrounded
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('🔔 Notification received in foreground:', notification);
      
      // Optional: Show an alert when notification is received in foreground
      const { title, body } = notification.request.content;
      if (title && body) {
        Alert.alert(
          title,
          body,
          [{ text: 'OK' }],
          { cancelable: true }
        );
      }
    });

    // Listener for user tapping on notification
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('👆 Notification tapped:', response);
      handleNotificationResponse(response);
    });
  };

  // ✅ FIXED: Use .remove() method instead of removeNotificationSubscription
  const cleanupNotificationListeners = () => {
    if (notificationListener.current) {
      notificationListener.current.remove();
    }
    if (responseListener.current) {
      responseListener.current.remove();
    }
  };

  const handleAppStateChange = (nextAppState) => {
    console.log('App state changed to:', nextAppState);
  };

  const handleNotificationResponse = (response) => {
    const data = response.notification.request.content.data;
    
    if (data && data.type === 'ORDER_STATUS_UPDATE' && data.orderId) {
      // Navigate to order details
      if (navigationRef.current) {
        // Small delay to ensure navigation is ready
        setTimeout(() => {
          navigationRef.current?.navigate('OrderDetails', { 
            orderId: data.orderId,
            fromNotification: true 
          });
        }, 500);
      }
    }
  };

  if (!appIsReady) {
    return null; // Splash screen is showing
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <AppNavigator ref={navigationRef} />
    </SafeAreaProvider>
  );
}
