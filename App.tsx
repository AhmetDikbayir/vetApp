import React from 'react';
import { AuthProvider } from './src/context/AuthContext';
import { StatusBar } from 'react-native';
import { AppNavigator } from './src/navigation/AppNavigator';
import { View, Text, StyleSheet } from 'react-native';
import { useEffect } from 'react';
import { notificationService } from './src/models/NotificationService';
import { auth } from './src/firebase';

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Bir hata oluştu</Text>
          <Text style={styles.errorSubtext}>{this.state.error?.message}</Text>
        </View>
      );
    }

    return this.props.children;
  }
}


export default function App() {
  React.useEffect(() => {
    const init = async () => {
      await notificationService.initialize();
      // Kullanıcı giriş yaptığında
      const user = auth().currentUser;
      if (user) {
        await notificationService.setUserId(user.uid);
      }
    };
    init();
  }, []);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
        <AppNavigator />
      </AuthProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 20,
  },
  errorText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#E74C3C',
    marginBottom: 10,
  },
  errorSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});
