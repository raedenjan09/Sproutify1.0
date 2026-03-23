// C&V PetShop/frontend/src/Components/Navigation/AuthenticationStack.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../AuthenticationScreen/Login';
import RegisterScreen from '../AuthenticationScreen/Register';
import ForgotPassword from '../AuthenticationScreen/ForgotPassword';
import gardenTheme from '../../theme/gardenTheme';

const Stack = createNativeStackNavigator();

export default function AuthenticationStack() {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: {
          backgroundColor: gardenTheme.colors.canvas,
        },
      }}
    >
      <Stack.Screen 
        name="Login" 
        component={LoginScreen} 
        options={{
          animation: 'fade',
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
          animation: 'slide_from_bottom',
        }}
      />
    </Stack.Navigator>
  );
}
