// AuthContext.tsx
import React, { createContext, useContext } from 'react';
import { useAuth } from '../hooks/useAuth'; // senin gönderdiğin useAuth hook'u

const AuthContext = createContext<ReturnType<typeof useAuth> | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useAuth();
  console.log('AuthProvider: Current auth state - user:', auth?.user, 'isLoading:', auth?.isLoading, 'user type:', typeof auth?.user);
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};