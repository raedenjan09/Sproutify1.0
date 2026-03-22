// C&V PetShop/frontend/src/Components/Navigation/AuthenticationStack.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../AuthenticationScreen/Login';
import RegisterScreen from '../AuthenticationScreen/Register';
import ForgotPassword from '../AuthenticationScreen/ForgotPassword';

const Stack = createNativeStackNavigator();

export default function AuthenticationStack() {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerShown: false, // Hide headers since your screens have their own headers
        animation: 'slide_from_right', // Smooth transitions between screens
        contentStyle: {
          backgroundColor: '#f5f5f5', // Match your app's background color
        },
      }}
    >
      <Stack.Screen 
        name="Login" 
        component={LoginScreen} 
        options={{
          animation: 'fade', // Fade in for login screen
        }}
      />
      <Stack.Screen 
        name="Register" 
        component={RegisterScreen} 
        options={{
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen 
        name="ForgotPassword" 
        component={ForgotPassword} 
        options={{
          animation: 'slide_from_bottom', // Different animation for password recovery
        }}
      />
    </Stack.Navigator>
  );
}