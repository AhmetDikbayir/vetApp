import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { appleAuth } from '@invertase/react-native-apple-authentication';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { User, LoginCredentials, AuthService } from '../types/auth';
import { userService } from './userService';

class AuthServiceImpl implements AuthService {
  constructor() {
    this.initializeGoogleSignIn();
  }

  private initializeGoogleSignIn(): void {
    GoogleSignin.configure({
      webClientId: '257645513339-1djo7q8bt9u2enhahgcbrvk60hrq4oqe.apps.googleusercontent.com',
    });
  }

  async signInWithGoogle(): Promise<User> {
    console.log("Google Sign-In başladı");
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  
      const userInfo = await GoogleSignin.signIn();
  
      const { idToken } = await GoogleSignin.getTokens(); // 🔑 ID token al
      const googleCredential = auth.GoogleAuthProvider.credential(idToken); // 🔐 Firebase'e hazırla
  
      const firebaseUserCredential = await auth().signInWithCredential(googleCredential); // ✅ Firebase login
  
      const user: User = {
        id: firebaseUserCredential.user.uid,
        email: firebaseUserCredential.user.email || '',
        name: firebaseUserCredential.user.displayName || '',
        photoUrl: firebaseUserCredential.user.photoURL || undefined,
      };
  
      // Kullanıcıyı Firestore'a kaydet
      try {
        await userService.createUser(user);
        console.log('authService: Google kullanıcısı Firestore\'a başarıyla kaydedildi');
      } catch (firestoreError) {
        console.error('authService: Firestore kullanıcı kaydetme hatası:', firestoreError);
        // Firestore hatası durumunda updateUser ile tekrar dene
        try {
          console.log('authService: updateUser ile tekrar deneniyor...');
          await userService.updateUser(user.id, {
            email: user.email,
            name: user.name,
            photoUrl: user.photoUrl,
          });
          console.log('authService: updateUser ile başarıyla kaydedildi');
        } catch (updateError) {
          console.error('authService: updateUser da başarısız:', updateError);
          // Son çare olarak merge ile dene
          try {
            console.log('authService: Son çare olarak merge ile deneniyor...');
            const docRef = firestore().collection('users').doc(user.id);
            await docRef.set({
              id: user.id,
              email: user.email,
              name: user.name,
              photoUrl: user.photoUrl,
              createdAt: firestore.Timestamp.now(),
              updatedAt: firestore.Timestamp.now(),
            }, { merge: true });
            console.log('authService: Merge ile başarıyla kaydedildi');
          } catch (mergeError) {
            console.error('authService: Tüm Firestore kaydetme yöntemleri başarısız:', mergeError);
            // Firestore hatası olsa bile giriş işlemi devam etsin
          }
        }
      }
  
      // currentUser will be updated by Firebase auth state listener
      return user;
    } catch (error) {
      console.error('Google Sign-In Error Details:', error);
      throw new Error(`Google ile giriş başarısız: ${error}`);
    }
  }
  

  async signInWithApple(): Promise<User> {
    try {
      console.log('authService: Apple giriş işlemi başlatılıyor...');
      
      const appleAuthRequestResponse = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
      });

      // Apple Sign-In'den gelen credential'ı Firebase ile kullan
      const { identityToken } = appleAuthRequestResponse;
      if (!identityToken) {
        throw new Error('Apple identity token alınamadı');
      }

      const appleCredential = auth.AppleAuthProvider.credential(identityToken);
      const firebaseUserCredential = await auth().signInWithCredential(appleCredential);

      const user: User = {
        id: firebaseUserCredential.user.uid,
        email: firebaseUserCredential.user.email || '',
        name: firebaseUserCredential.user.displayName || '',
      };

      console.log('authService: Apple kullanıcısı giriş yaptı:', user);

      // Kullanıcıyı Firestore'a kaydet
      try {
        await userService.createUser(user);
        console.log('authService: Apple kullanıcısı Firestore\'a başarıyla kaydedildi');
      } catch (firestoreError) {
        console.error('authService: Firestore kullanıcı kaydetme hatası:', firestoreError);
        // Firestore hatası durumunda updateUser ile tekrar dene
        try {
          console.log('authService: updateUser ile tekrar deneniyor...');
          await userService.updateUser(user.id, {
            email: user.email,
            name: user.name,
          });
          console.log('authService: updateUser ile başarıyla kaydedildi');
        } catch (updateError) {
          console.error('authService: updateUser da başarısız:', updateError);
          // Son çare olarak merge ile dene
          try {
            console.log('authService: Son çare olarak merge ile deneniyor...');
            const docRef = firestore().collection('users').doc(user.id);
            await docRef.set({
              id: user.id,
              email: user.email,
              name: user.name,
              createdAt: firestore.Timestamp.now(),
              updatedAt: firestore.Timestamp.now(),
            }, { merge: true });
            console.log('authService: Merge ile başarıyla kaydedildi');
          } catch (mergeError) {
            console.error('authService: Tüm Firestore kaydetme yöntemleri başarısız:', mergeError);
            // Firestore hatası olsa bile giriş işlemi devam etsin
          }
        }
      }

      // currentUser will be updated by Firebase auth state listener
      return user;
    } catch (error) {
      console.error('Apple Sign-In Error:', error);
      throw new Error('Apple ile giriş başarısız');
    }
  }

  async signInWithEmail(credentials: LoginCredentials): Promise<User> {
    try {
      console.log('authService: Email giriş işlemi başlatılıyor...');
      
      const firebaseUserCredential = await auth().signInWithEmailAndPassword(
        credentials.email,
        credentials.password
      );

      const user: User = {
        id: firebaseUserCredential.user.uid,
        email: firebaseUserCredential.user.email || '',
        name: firebaseUserCredential.user.displayName || credentials.email.split('@')[0],
      };

      console.log('authService: Firebase kullanıcısı giriş yaptı:', user);

      // Kullanıcının Firestore'da kaydı var mı kontrol et, yoksa oluştur
      try {
        const existingUser = await userService.getUserByFirebaseUid(user.id);
        if (!existingUser) {
          console.log('authService: Kullanıcı Firestore\'da bulunamadı, yeni kayıt oluşturuluyor');
          try {
            await userService.createUser(user);
            console.log('authService: Kullanıcı Firestore\'a başarıyla kaydedildi');
          } catch (createError) {
            console.error('authService: createUser hatası, updateUser deneniyor:', createError);
            // createUser başarısız olursa updateUser ile dene
            try {
              await userService.updateUser(user.id, {
                email: user.email,
                name: user.name,
              });
              console.log('authService: updateUser ile başarıyla kaydedildi');
            } catch (updateError) {
              console.error('authService: updateUser da başarısız:', updateError);
              // Son çare olarak merge ile dene
              try {
                const docRef = firestore().collection('users').doc(user.id);
                await docRef.set({
                  id: user.id,
                  email: user.email,
                  name: user.name,
                  createdAt: firestore.Timestamp.now(),
                  updatedAt: firestore.Timestamp.now(),
                }, { merge: true });
                console.log('authService: Merge ile başarıyla kaydedildi');
              } catch (mergeError) {
                console.error('authService: Tüm Firestore kaydetme yöntemleri başarısız:', mergeError);
              }
            }
          }
        } else {
          console.log('authService: Kullanıcı Firestore\'da mevcut');
        }
      } catch (firestoreError) {
        console.error('authService: Firestore kullanıcı kontrolü hatası:', firestoreError);
        // Firestore hatası olsa bile giriş işlemi devam etsin
      }

      // currentUser will be updated by Firebase auth state listener
      return user;
    } catch (error) {
      console.error('Email Sign-In Error:', error);
      throw new Error('Email ile giriş başarısız');
    }
  }

  async signUpWithEmail(credentials: LoginCredentials): Promise<User> {
    try {
      console.log('authService: Email kayıt işlemi başlatılıyor...');
      
      const firebaseUserCredential = await auth().createUserWithEmailAndPassword(
        credentials.email,
        credentials.password
      );

      const user: User = {
        id: firebaseUserCredential.user.uid,
        email: firebaseUserCredential.user.email || '',
        name: credentials.email.split('@')[0],
      };

      console.log('authService: Firebase kullanıcısı oluşturuldu:', user);

      // Kullanıcıyı Firestore'a kaydet
      try {
        console.log('authService: Firestore\'a kaydetme başlatılıyor...');
        await userService.createUser(user);
        console.log('authService: Kullanıcı Firestore\'a başarıyla kaydedildi');
      } catch (firestoreError) {
        console.error('authService: Firestore kullanıcı kaydetme hatası:', firestoreError);
        
        // Firestore hatası durumunda updateUser ile tekrar dene
        try {
          console.log('authService: updateUser ile tekrar deneniyor...');
          await userService.updateUser(user.id, {
            email: user.email,
            name: user.name,
          });
          console.log('authService: updateUser ile başarıyla kaydedildi');
        } catch (updateError) {
          console.error('authService: updateUser da başarısız:', updateError);
          // Son çare olarak merge ile dene
          try {
            console.log('authService: Son çare olarak merge ile deneniyor...');
            const docRef = firestore().collection('users').doc(user.id);
            await docRef.set({
              id: user.id,
              email: user.email,
              name: user.name,
              createdAt: firestore.Timestamp.now(),
              updatedAt: firestore.Timestamp.now(),
            }, { merge: true });
            console.log('authService: Merge ile başarıyla kaydedildi');
          } catch (mergeError) {
            console.error('authService: Tüm Firestore kaydetme yöntemleri başarısız:', mergeError);
            // Firestore hatası olsa bile kayıt işlemi devam etsin
          }
        }
      }

      // currentUser will be updated by Firebase auth state listener
      return user;
    } catch (error) {
      console.error('Email Sign-Up Error:', error);
      throw new Error('Kayıt olma başarısız');
    }
  }

  async signOut(): Promise<void> {
    console.log('authService: SignOut başlatılıyor...');
    try {
      // Try to sign out from Google Sign-In (it's safe to call even if not signed in)
      try {
        await GoogleSignin.signOut();
      } catch (googleError) {
      }

      await auth().signOut();

    } catch (error) {
      console.error('authService: Sign-Out Error:', error);
      throw new Error(`Çıkış yapılırken hata oluştu: ${error}`);
    }
  }

  getCurrentUser(): User | null {
    const firebaseUser = auth().currentUser;
    if (firebaseUser) {
      return {
        id: firebaseUser.uid,
        email: firebaseUser.email || '',
        name: firebaseUser.displayName || '',
        photoUrl: firebaseUser.photoURL || undefined,
      };
    }
    return null;
  }

  // Firebase'den mevcut kullanıcıyı al
  getFirebaseUser() {
    return auth().currentUser;
  }
}

export const authService = new AuthServiceImpl(); 