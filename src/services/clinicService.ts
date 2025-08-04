import firestore from '@react-native-firebase/firestore';
import { Clinic, CreateClinicData } from '../types/clinic';

class ClinicServiceImpl {
  private getClinicsCollection() {
    return firestore().collection('clinics');
  }

  async createClinic(clinicData: CreateClinicData): Promise<Clinic> {
    try {
      const now = firestore.Timestamp.now();
      
      const firestoreData = {
        ...clinicData,
        rating: 0,
        reviewCount: 0,
        createdAt: now,
        updatedAt: now,
      };

      const docRef = await this.getClinicsCollection().add(firestoreData);
      
      return {
        id: docRef.id,
        ...clinicData,
        rating: 0,
        reviewCount: 0,
        createdAt: now.toDate(),
        updatedAt: now.toDate(),
      };
    } catch (error) {
      console.error('Clinic oluşturma hatası:', error);
      throw new Error('Klinik kaydedilirken hata oluştu');
    }
  }

  async getClinics(): Promise<Clinic[]> {
    try {
      const snapshot = await this.getClinicsCollection().get();
      console.log('Clinic listesi:', snapshot.docs.map(doc => doc.data()));

      // Client-side sıralama yap
      const clinics = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt ? data.createdAt.toDate() : new Date(),
          updatedAt: data.updatedAt ? data.updatedAt.toDate() : new Date(),
        };
      }) as Clinic[];
      
      // Rating'e göre sırala (en yüksekten en düşüğe)
      return clinics.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } catch (error) {
      console.error('Clinic listesi alma hatası:', error);
      
      // Permission denied hatası durumunda boş liste döndür
      if (error && typeof error === 'object' && 'code' in error) {
        const firebaseError = error as { code: string; message?: string };
        if (firebaseError.code === 'firestore/permission-denied') {
          console.log('Clinic service: Permission denied, boş liste döndürülüyor');
          return [];
        }
      }
      
      throw new Error('Klinik listesi alınırken hata oluştu');
    }
  }

  async getClinicById(clinicId: string): Promise<Clinic | null> {
    try {
      const doc = await this.getClinicsCollection().doc(clinicId).get();
      
      if (!doc.exists) {
        return null;
      }

      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data?.createdAt ? data.createdAt.toDate() : new Date(),
        updatedAt: data?.updatedAt ? data.updatedAt.toDate() : new Date(),
      } as Clinic;
    } catch (error) {
      console.error('Clinic alma hatası:', error);
      throw new Error('Klinik bilgisi alınırken hata oluştu');
    }
  }

  async updateClinic(clinicId: string, updates: Partial<Clinic>): Promise<void> {
    try {
      const now = firestore.Timestamp.now();
      
      await this.getClinicsCollection().doc(clinicId).update({
        ...updates,
        updatedAt: now,
      });
    } catch (error) {
      console.error('Clinic güncelleme hatası:', error);
      throw new Error('Klinik güncellenirken hata oluştu');
    }
  }

  async deleteClinic(clinicId: string): Promise<void> {
    try {
      await this.getClinicsCollection().doc(clinicId).delete();
    } catch (error) {
      console.error('Clinic silme hatası:', error);
      throw new Error('Klinik silinirken hata oluştu');
    }
  }

  async searchClinicsByLocation(latitude: number, longitude: number, radiusKm: number = 10): Promise<Clinic[]> {
    try {
      // Basit bir yakınlık araması (gerçek uygulamada daha gelişmiş algoritma kullanılabilir)
      const snapshot = await this.getClinicsCollection().get();
      
      const clinics = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt ? data.createdAt.toDate() : new Date(),
          updatedAt: data.updatedAt ? data.updatedAt.toDate() : new Date(),
        };
      }) as Clinic[];

      // Mesafe hesaplama (Haversine formülü)
      const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
        const R = 6371; // Dünya'nın yarıçapı (km)
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
      };

      return clinics.filter(clinic => {
        const distance = calculateDistance(
          latitude, longitude,
          clinic.location.latitude, clinic.location.longitude
        );
        return distance <= radiusKm;
      }).sort((a, b) => {
        const distanceA = calculateDistance(
          latitude, longitude,
          a.location.latitude, a.location.longitude
        );
        const distanceB = calculateDistance(
          latitude, longitude,
          b.location.latitude, b.location.longitude
        );
        return distanceA - distanceB;
      });
    } catch (error) {
      console.error('Konum bazlı klinik arama hatası:', error);
      throw new Error('Yakındaki klinikler aranırken hata oluştu');
    }
  }
}

export const clinicService = new ClinicServiceImpl(); 