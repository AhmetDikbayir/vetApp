import firestore from '@react-native-firebase/firestore';
import { Veterinarian, CreateVeterinarianData } from '../types/veterinarian';

class VeterinarianServiceImpl {
  private getVeterinariansCollection() {
    return firestore().collection('veterinarians');
  }

  async createVeterinarian(veterinarianData: CreateVeterinarianData): Promise<Veterinarian> {
    try {
      const now = firestore.Timestamp.now();
      
      const firestoreData = {
        ...veterinarianData,
        isAvailable: true,
        rating: 0,
        reviewCount: 0,
        createdAt: now,
        updatedAt: now,
      };

      const docRef = await this.getVeterinariansCollection().add(firestoreData);
      
      return {
        id: docRef.id,
        ...veterinarianData,
        isAvailable: true,
        rating: 0,
        reviewCount: 0,
        createdAt: now.toDate(),
        updatedAt: now.toDate(),
      };
    } catch (error) {
      console.error('Veterinarian oluşturma hatası:', error);
      throw new Error('Veteriner kaydedilirken hata oluştu');
    }
  }

  async getVeterinarians(): Promise<Veterinarian[]> {
    try {
      const snapshot = await this.getVeterinariansCollection()
        .where('isAvailable', '==', true)
        .orderBy('rating', 'desc')
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate(),
        updatedAt: doc.data().updatedAt.toDate(),
      })) as Veterinarian[];
    } catch (error) {
      console.error('Veterinarian listesi alma hatası:', error);
      throw new Error('Veteriner listesi alınırken hata oluştu');
    }
  }

  async getVeterinariansByClinic(clinicId: string): Promise<Veterinarian[]> {
    try {
      const snapshot = await this.getVeterinariansCollection()
        .where('clinicId', '==', clinicId)
        .where('isAvailable', '==', true)
        .orderBy('rating', 'desc')
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate(),
        updatedAt: doc.data().updatedAt.toDate(),
      })) as Veterinarian[];
    } catch (error) {
      console.error('Klinik veterinerleri alma hatası:', error);
      throw new Error('Klinik veterinerleri alınırken hata oluştu');
    }
  }

  async getVeterinarianById(veterinarianId: string): Promise<Veterinarian | null> {
    try {
      const doc = await this.getVeterinariansCollection().doc(veterinarianId).get();
      
      if (!doc.exists) {
        return null;
      }

      return {
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data()?.createdAt.toDate(),
        updatedAt: doc.data()?.updatedAt.toDate(),
      } as Veterinarian;
    } catch (error) {
      console.error('Veterinarian alma hatası:', error);
      throw new Error('Veteriner bilgisi alınırken hata oluştu');
    }
  }

  async updateVeterinarian(veterinarianId: string, updates: Partial<Veterinarian>): Promise<void> {
    try {
      const now = firestore.Timestamp.now();
      
      await this.getVeterinariansCollection().doc(veterinarianId).update({
        ...updates,
        updatedAt: now,
      });
    } catch (error) {
      console.error('Veterinarian güncelleme hatası:', error);
      throw new Error('Veteriner güncellenirken hata oluştu');
    }
  }

  async deleteVeterinarian(veterinarianId: string): Promise<void> {
    try {
      await this.getVeterinariansCollection().doc(veterinarianId).delete();
    } catch (error) {
      console.error('Veterinarian silme hatası:', error);
      throw new Error('Veteriner silinirken hata oluştu');
    }
  }
}

export const veterinarianService = new VeterinarianServiceImpl(); 