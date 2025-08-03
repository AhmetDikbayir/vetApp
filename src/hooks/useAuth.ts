import { useState, useCallback, useEffect } from 'react';
import { User, LoginCredentials, AuthState } from '../types/auth';
import { authService } from '../services/authService';
import { userService } from '../services/userService';
import auth from '@react-native-firebase/auth';

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: false,
    isAuthenticated: false,
  });

  // Listen to Firebase auth state changes
  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(async (firebaseUser) => {
      console.log('useAuth: Firebase auth state değişti:', firebaseUser ? 'Kullanıcı var' : 'Kullanıcı yok');
      
      if (firebaseUser) {
        try {
          // Önce Firestore'dan kullanıcı bilgilerini almaya çalış
          const firestoreUser = await userService.getUserByFirebaseUid(firebaseUser.uid);
          
          if (firestoreUser) {
            console.log('useAuth: Firestore\'dan kullanıcı bilgileri alındı:', firestoreUser);
            setAuthState({
              user: firestoreUser,
              isLoading: false,
              isAuthenticated: true,
            });
          } else {
                         // Firestore'da yoksa yeni kullanıcı oluştur
             console.log('useAuth: Firestore\'da kullanıcı bulunamadı, yeni kullanıcı oluşturuluyor');
             const newUser: User = {
               id: firebaseUser.uid,
               email: firebaseUser.email || '',
               name: firebaseUser.displayName || '',
               role: 'hayvan_sahibi', // Varsayılan rol
             };
             
             // Sadece tanımlı photoUrl varsa ekle
             if (firebaseUser.photoURL) {
               newUser.photoUrl = firebaseUser.photoURL;
             }
            
            try {
              // Yeni kullanıcıyı Firestore'a kaydet
              await userService.createUser(newUser);
              console.log('useAuth: Yeni kullanıcı Firestore\'a kaydedildi');
              setAuthState({
                user: newUser,
                isLoading: false,
                isAuthenticated: true,
              });
            } catch (createError) {
              console.error('useAuth: Kullanıcı oluşturma hatası, varsayılan kullanıcı kullanılıyor:', createError);
              // Hata durumunda varsayılan kullanıcı ile devam et
              setAuthState({
                user: newUser,
                isLoading: false,
                isAuthenticated: true,
              });
            }
          }
        } catch (error) {
          console.error('useAuth: Firestore kullanıcı bilgisi alma hatası:', error);
                     // Hata durumunda yeni kullanıcı oluşturmayı dene
           const newUser: User = {
             id: firebaseUser.uid,
             email: firebaseUser.email || '',
             name: firebaseUser.displayName || '',
             role: 'hayvan_sahibi', // Varsayılan rol
           };
           
           // Sadece tanımlı photoUrl varsa ekle
           if (firebaseUser.photoURL) {
             newUser.photoUrl = firebaseUser.photoURL;
           }
          
          try {
            // Yeni kullanıcıyı Firestore'a kaydet
            await userService.createUser(newUser);
            console.log('useAuth: Hata sonrası yeni kullanıcı Firestore\'a kaydedildi');
            setAuthState({
              user: newUser,
              isLoading: false,
              isAuthenticated: true,
            });
          } catch (createError) {
            console.error('useAuth: Hata sonrası kullanıcı oluşturma da başarısız, varsayılan kullanıcı kullanılıyor:', createError);
            // Son çare olarak varsayılan kullanıcı ile devam et
            setAuthState({
              user: newUser,
              isLoading: false,
              isAuthenticated: true,
            });
          }
        }
        console.log('useAuth: Kullanıcı oturumu açık, state güncellendi');
      } else {
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
        });
        console.log('useAuth: Kullanıcı oturumu kapalı, state güncellendi');
      }
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = useCallback(async () => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    try {
      const user = await authService.signInWithGoogle();
      console.log('useAuth: Google Sign-In başarılı, user:', user);
      // State will be updated by the Firebase auth state listener
      return user;
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, []);

  const signInWithApple = useCallback(async () => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    try {
      const user = await authService.signInWithApple();
      // State will be updated by the Firebase auth state listener
      return user;
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, []);

  const signInWithEmail = useCallback(async (credentials: LoginCredentials) => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    try {
      const user = await authService.signInWithEmail(credentials);
      // State will be updated by the Firebase auth state listener
      return user;
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, []);

  const signUpWithEmail = useCallback(async (credentials: LoginCredentials) => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    try {
      const user = await authService.signUpWithEmail(credentials);
      // State will be updated by the Firebase auth state listener
      return user;
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, []);

  const signOut = useCallback(async () => {
    console.log('useAuth: SignOut başlatılıyor...');
    setAuthState(prev => ({ ...prev, isLoading: true }));
    try {
      await authService.signOut();
      console.log('useAuth: SignOut başarılı, Firebase auth state listener state güncelleyecek');
      // State will be updated by the Firebase auth state listener
    } catch (error) {
      console.error('useAuth: SignOut hatası:', error);
      setAuthState(prev => ({ ...prev, isLoading: false }));
      // Don't throw error, just log it and continue
      // This prevents the app from crashing if signOut fails
    }
  }, []);

  const updateUser = useCallback((updatedUser: User) => {
    setAuthState(prev => ({
      ...prev,
      user: updatedUser,
    }));
    console.log('useAuth: Kullanıcı bilgileri güncellendi:', updatedUser);
  }, []);

  return {
    ...authState,
    signInWithGoogle,
    signInWithApple,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    updateUser,
  };
}; 