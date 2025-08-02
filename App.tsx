import React from 'react';
import { AuthProvider } from './src/context/AuthContext';
import { StatusBar } from 'react-native';
import { AppNavigator } from './src/navigation/AppNavigator';

export default function App() {
  return (
    <AuthProvider>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
      <AppNavigator />
    </AuthProvider>
  );
}
