import React, { useState } from 'react';
import { LoginScreen } from '../screens/LoginScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { AddPetScreen } from '../screens/AddPetScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import NotificationTestScreen from '../screens/NotificationTestScreen';
import { LoadingScreen } from '../components/LoadingScreen';
import { useAuthContext } from '../context/AuthContext';

type Screen = 'login' | 'home' | 'addPet' | 'profile' | 'notificationTest';

export const AppNavigator: React.FC = () => {
  const { user, isLoading } = useAuthContext();
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <LoginScreen />;
  }

  switch (currentScreen) {
    case 'addPet':
      return <AddPetScreen onBack={() => setCurrentScreen('home')} />;
    case 'profile':
      return <ProfileScreen onBack={() => setCurrentScreen('home')} />;
          case 'notificationTest':
        return <NotificationTestScreen />;
    case 'home':
    default:
      return <HomeScreen 
        onNavigateToAddPet={() => setCurrentScreen('addPet')} 
        onNavigateToProfile={() => setCurrentScreen('profile')}
        onNavigateToNotificationTest={() => setCurrentScreen('notificationTest')}
      />;
  }
}; 