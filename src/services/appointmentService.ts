import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { Appointment, CreateAppointmentData } from '../types/appointment';

class AppointmentServiceImpl {
  private getCurrentUserId(): string {
    const user = auth().currentUser;
    if (!user) {
      throw new Error('Kullanıcı oturumu bulunamadı');
    }
    return user.uid;
  }

  private getAppointmentsCollection() {
    return firestore().collection('appointments');
  }

  async createAppointment(appointmentData: CreateAppointmentData): Promise<Appointment> {
    try {
      const userId = this.getCurrentUserId();
      const now = firestore.Timestamp.now();
      
      const firestoreData = {
        userId,
        ...appointmentData,
        status: 'pending',
        paymentStatus: 'pending',
        createdAt: now,
        updatedAt: now,
      };

      const docRef = await this.getAppointmentsCollection().add(firestoreData);
      
      return {
        id: docRef.id,
        userId,
        ...appointmentData,
        status: 'pending',
        paymentStatus: 'pending',
        createdAt: now.toDate(),
        updatedAt: now.toDate(),
      };
    } catch (error) {
      console.error('Appointment oluşturma hatası:', error);
      throw new Error('Randevu oluşturulurken hata oluştu');
    }
  }

  async getUserAppointments(): Promise<Appointment[]> {
    try {
      const userId = this.getCurrentUserId();
      
      const snapshot = await this.getAppointmentsCollection()
        .where('userId', '==', userId)
        .orderBy('date', 'desc')
        .orderBy('time', 'desc')
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate(),
        updatedAt: doc.data().updatedAt.toDate(),
      })) as Appointment[];
    } catch (error) {
      console.error('Kullanıcı randevuları alma hatası:', error);
      throw new Error('Randevular alınırken hata oluştu');
    }
  }

  async getAppointmentById(appointmentId: string): Promise<Appointment | null> {
    try {
      const userId = this.getCurrentUserId();
      
      const doc = await this.getAppointmentsCollection().doc(appointmentId).get();
      
      if (!doc.exists) {
        return null;
      }

      const data = doc.data();
      if (data?.userId !== userId) {
        throw new Error('Bu randevuya erişim izniniz yok');
      }

      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      } as Appointment;
    } catch (error) {
      console.error('Appointment alma hatası:', error);
      throw new Error('Randevu bilgisi alınırken hata oluştu');
    }
  }

  async updateAppointment(appointmentId: string, updates: Partial<Appointment>): Promise<void> {
    try {
      const userId = this.getCurrentUserId();
      const now = firestore.Timestamp.now();
      
      // Kullanıcının bu randevuya sahip olduğunu kontrol et
      const doc = await this.getAppointmentsCollection().doc(appointmentId).get();
      if (!doc.exists || doc.data()?.userId !== userId) {
        throw new Error('Bu randevuya erişim izniniz yok');
      }
      
      await this.getAppointmentsCollection().doc(appointmentId).update({
        ...updates,
        updatedAt: now,
      });
    } catch (error) {
      console.error('Appointment güncelleme hatası:', error);
      throw new Error('Randevu güncellenirken hata oluştu');
    }
  }

  async cancelAppointment(appointmentId: string): Promise<void> {
    try {
      await this.updateAppointment(appointmentId, { status: 'cancelled' });
    } catch (error) {
      console.error('Appointment iptal hatası:', error);
      throw new Error('Randevu iptal edilirken hata oluştu');
    }
  }

  async getVeterinarianAppointments(veterinarianId: string): Promise<Appointment[]> {
    try {
      const snapshot = await this.getAppointmentsCollection()
        .where('veterinarianId', '==', veterinarianId)
        .orderBy('date', 'asc')
        .orderBy('time', 'asc')
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate(),
        updatedAt: doc.data().updatedAt.toDate(),
      })) as Appointment[];
    } catch (error) {
      console.error('Veteriner randevuları alma hatası:', error);
      throw new Error('Veteriner randevuları alınırken hata oluştu');
    }
  }

  async getClinicAppointments(clinicId: string): Promise<Appointment[]> {
    try {
      const snapshot = await this.getAppointmentsCollection()
        .where('clinicId', '==', clinicId)
        .orderBy('date', 'asc')
        .orderBy('time', 'asc')
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate(),
        updatedAt: doc.data().updatedAt.toDate(),
      })) as Appointment[];
    } catch (error) {
      console.error('Klinik randevuları alma hatası:', error);
      throw new Error('Klinik randevuları alınırken hata oluştu');
    }
  }

  async checkAvailability(veterinarianId: string, date: string, time: string): Promise<boolean> {
    try {
      const snapshot = await this.getAppointmentsCollection()
        .where('veterinarianId', '==', veterinarianId)
        .where('date', '==', date)
        .where('time', '==', time)
        .where('status', 'in', ['pending', 'confirmed'])
        .get();

      return snapshot.empty; // Eğer hiç randevu yoksa müsait
    } catch (error) {
      console.error('Müsaitlik kontrolü hatası:', error);
      throw new Error('Müsaitlik kontrol edilirken hata oluştu');
    }
  }
}

export const appointmentService = new AppointmentServiceImpl(); 