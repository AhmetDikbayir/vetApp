import firestore from '@react-native-firebase/firestore';
import { Pet, CreatePetData } from '../types/pet';
import auth from '@react-native-firebase/auth';

class PetServiceImpl {
  private getCurrentUserId(): string {
    const user = auth().currentUser;
    if (!user) {
      throw new Error('Kullanıcı oturumu açık değil');
    }
    return user.uid;
  }

  private getPetsCollection() {
    return firestore().collection('pets');
  }

  async createPet(petData: CreatePetData): Promise<Pet> {
    try {
      const userId = this.getCurrentUserId();
      const now = firestore.Timestamp.now();
      
      console.log('petService: Pet verisi alındı:', petData);
      console.log('petService: User ID:', userId);
      
      // Firestore'a gönderilecek veri
      const firestoreData = {
        userId,
        name: petData.name,
        type: petData.type,
        breed: petData.breed,
        age: petData.age,
        weight: petData.weight,
        color: petData.color,
        gender: petData.gender,
        microchipNumber: petData.microchipNumber,
        notes: petData.notes,
        createdAt: now,
        updatedAt: now,
      };

      console.log('petService: Firebase\'e gönderilecek veri:', firestoreData);

      const docRef = await this.getPetsCollection().add(firestoreData);
      
      console.log('petService: Pet başarıyla kaydedildi, ID:', docRef.id);
      
      // Döndürülecek veri (Date objeleri ile)
      const pet: Pet = {
        id: docRef.id,
        userId,
        name: petData.name,
        type: petData.type,
        breed: petData.breed,
        age: petData.age,
        weight: petData.weight,
        color: petData.color,
        gender: petData.gender,
        microchipNumber: petData.microchipNumber,
        notes: petData.notes,
        createdAt: now.toDate(),
        updatedAt: now.toDate(),
      };
      
      return pet;
    } catch (error) {
      console.error('Pet oluşturma hatası:', error);
      throw new Error('Evcil hayvan kaydedilirken hata oluştu');
    }
  }

  async getPets(): Promise<Pet[]> {
    try {
      const userId = this.getCurrentUserId();
      
      const snapshot = await this.getPetsCollection()
        .where('userId', '==', userId)
        .get();

      // Client-side sıralama yap
      const pets = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt ? data.createdAt.toDate() : new Date(),
          updatedAt: data.updatedAt ? data.updatedAt.toDate() : new Date(),
        };
      }) as Pet[];
      
      // En yeni tarihten en eskiye sırala
      return pets.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } catch (error) {
      console.error('Pet listesi alma hatası:', error);
      throw new Error('Evcil hayvan listesi alınırken hata oluştu');
    }
  }

  async getPetById(petId: string): Promise<Pet | null> {
    try {
      const doc = await this.getPetsCollection().doc(petId).get();
      
      if (!doc.exists) {
        return null;
      }

      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data?.createdAt ? data.createdAt.toDate() : new Date(),
        updatedAt: data?.updatedAt ? data.updatedAt.toDate() : new Date(),
      } as Pet;
    } catch (error) {
      console.error('Pet alma hatası:', error);
      throw new Error('Evcil hayvan bilgisi alınırken hata oluştu');
    }
  }

  async updatePet(petId: string, petData: Partial<CreatePetData>): Promise<void> {
    try {
      const userId = this.getCurrentUserId();
      
      await this.getPetsCollection().doc(petId).update({
        ...petData,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Pet güncelleme hatası:', error);
      throw new Error('Evcil hayvan güncellenirken hata oluştu');
    }
  }

  async deletePet(petId: string): Promise<void> {
    try {
      await this.getPetsCollection().doc(petId).delete();
    } catch (error) {
      console.error('Pet silme hatası:', error);
      throw new Error('Evcil hayvan silinirken hata oluştu');
    }
  }
}

export const petService = new PetServiceImpl(); 