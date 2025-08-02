import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { User } from '../types/auth';

class UserServiceImpl {
  private getUsersCollection() {
    return firestore().collection('users');
  }

  async createUser(userData: User): Promise<User> {
    try {
      const now = firestore.Timestamp.now();
      
      console.log('userService: User verisi alındı:', userData);
      console.log('userService: User ID:', userData.id);
      console.log('userService: User email:', userData.email);
      console.log('userService: User name:', userData.name);
      
      const userDoc = {
        id: userData.id, // Firebase UID'yi Firestore'da da saklayalım
        email: userData.email,
        name: userData.name,
        photoUrl: userData.photoUrl,
        createdAt: now,
        updatedAt: now,
      };

      console.log('userService: Firebase\'e gönderilecek user verisi:', userDoc);

      // Firebase UID'yi döküman ID'si olarak kullan
      await this.getUsersCollection().doc(userData.id).set(userDoc);
      
      console.log('userService: User başarıyla kaydedildi, Firestore ID:', userData.id);
      
      return userData; // Aynı user objesini döndür
    } catch (error) {
      console.error('User oluşturma hatası:', error);
      throw new Error('Kullanıcı kaydedilirken hata oluştu');
    }
  }

  async getUserById(userId: string): Promise<User | null> {
    try {
      const doc = await this.getUsersCollection().doc(userId).get();
      
      if (!doc.exists()) {
        return null;
      }

      return {
        id: doc.id,
        ...doc.data(),
      } as User;
    } catch (error) {
      console.error('User alma hatası:', error);
      throw new Error('Kullanıcı bilgisi alınırken hata oluştu');
    }
  }

  async updateUser(userId: string, userData: Partial<User>): Promise<void> {
    try {
      console.log('userService: Kullanıcı güncelleme başlatılıyor, User ID:', userId);
      console.log('userService: Güncellenecek veriler:', userData);
      
      const docRef = this.getUsersCollection().doc(userId);
      const now = firestore.Timestamp.now();
      
      // Güncellenecek verileri hazırla
      const updateData = {
        ...userData,
        updatedAt: now,
      };
      
      // set() fonksiyonunu merge: true seçeneği ile kullan
      // Bu sayede mevcut döküman varsa günceller, yoksa yeni oluşturur
      await docRef.set(updateData, { merge: true });
      
      console.log('userService: Kullanıcı başarıyla güncellendi/oluşturuldu, ID:', userId);
    } catch (error) {
      console.error('User güncelleme hatası:', error);
      throw new Error('Kullanıcı güncellenirken hata oluştu');
    }
  }

  async getUserByFirebaseUid(firebaseUid: string): Promise<User | null> {
    try {
      console.log('userService: Firebase UID ile kullanıcı aranıyor:', firebaseUid);
      
      // Firebase UID'yi döküman ID'si olarak kullan
      const doc = await this.getUsersCollection().doc(firebaseUid).get();

      if (!doc.exists()) {
        console.log('userService: Kullanıcı bulunamadı, yeni kullanıcı oluşturulacak');
        return null;
      }

      const userData = doc.data();
      const user = {
        id: userData?.id || firebaseUid,
        email: userData?.email || '',
        name: userData?.name || '',
        photoUrl: userData?.photoUrl,
      } as User;
      
      console.log('userService: Kullanıcı bulundu:', user);
      return user;
    } catch (error) {
      console.error('User Firebase UID ile alma hatası:', error);
      // Permission denied hatası durumunda kullanıcı yok kabul et
      if (error && typeof error === 'object' && 'code' in error && error.code === 'permission-denied') {
        console.log('userService: Permission denied, kullanıcı yok kabul ediliyor');
        return null;
      }
      throw new Error('Kullanıcı bilgisi alınırken hata oluştu');
    }
  }
}

export const userService = new UserServiceImpl(); 