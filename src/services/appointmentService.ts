import firestore from '@react-native-firebase/firestore';
import { eventManager } from '../events/EventManager';
import { EVENT_NAMES, AppointmentCreatedEvent } from '../events/NotificationEvents';
import { notificationService } from '../models/NotificationService';

export interface Appointment {
  id: string;
  petId: string;
  petName: string;
  ownerId: string;
  ownerName: string;
  veterinarianId: string;
  veterinarianName?: string;
  clinicId?: string;
  clinicName?: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class AppointmentService {
  private static instance: AppointmentService;

  private constructor() {
    // Event listener'ları kur
    this.setupEventListeners();
  }

  static getInstance(): AppointmentService {
    if (!AppointmentService.instance) {
      AppointmentService.instance = new AppointmentService();
    }
    return AppointmentService.instance;
  }

  private setupEventListeners(): void {
    // Randevu oluşturulduğunda bildirim gönder
    eventManager.addEventListener<AppointmentCreatedEvent>(
      EVENT_NAMES.APPOINTMENT_CREATED,
      async (event) => {
        console.log('📅 Randevu oluşturuldu, bildirim gönderiliyor:', event);
        await notificationService.sendAppointmentNotification(event);
      }
    );
  }

  async createAppointment(appointmentData: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const appointment: Omit<Appointment, 'id'> = {
        ...appointmentData,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const docRef = await firestore()
        .collection('appointments')
        .add(appointment);

      const appointmentId = docRef.id;

      // Event emit et
      const appointmentEvent: AppointmentCreatedEvent = {
        appointmentId,
        petName: appointmentData.petName,
        ownerName: appointmentData.ownerName,
        veterinarianId: appointmentData.veterinarianId,
        appointmentDate: appointmentData.date,
        appointmentTime: appointmentData.time,
        clinicName: appointmentData.clinicName
      };

      eventManager.emit(EVENT_NAMES.APPOINTMENT_CREATED, appointmentEvent);

      console.log('✅ Randevu oluşturuldu:', appointmentId);
      return appointmentId;

    } catch (error) {
      console.error('❌ Randevu oluşturulamadı:', error);
      throw error;
    }
  }

  async getAppointmentsByUserId(userId: string, userType: 'owner' | 'veterinarian'): Promise<Appointment[]> {
    try {
      const collectionRef = firestore().collection('appointments');
      let query: any = collectionRef;

      if (userType === 'owner') {
        query = collectionRef.where('ownerId', '==', userId);
      } else {
        query = collectionRef.where('veterinarianId', '==', userId);
      }

      const snapshot = await query.orderBy('createdAt', 'desc').get();
      
      return snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data()
      })) as Appointment[];

    } catch (error) {
      console.error('❌ Randevular alınamadı:', error);
      throw error;
    }
  }

  async updateAppointmentStatus(appointmentId: string, status: Appointment['status']): Promise<void> {
    try {
      await firestore()
        .collection('appointments')
        .doc(appointmentId)
        .update({
          status,
          updatedAt: new Date()
        });

      console.log('✅ Randevu durumu güncellendi:', appointmentId, status);
    } catch (error) {
      console.error('❌ Randevu durumu güncellenemedi:', error);
      throw error;
    }
  }

  async checkAvailability(veterinarianId: string, date: string, time: string): Promise<boolean> {
    try {
      const snapshot = await firestore()
        .collection('appointments')
        .where('veterinarianId', '==', veterinarianId)
        .where('date', '==', date)
        .where('time', '==', time)
        .get();

      // Client-side filtering for status
      const conflictingAppointments = snapshot.docs.filter(doc => {
        const data = doc.data();
        return data.status === 'pending' || data.status === 'confirmed';
      });

      return conflictingAppointments.length === 0; // Eğer hiç randevu yoksa müsait
    } catch (error) {
      console.error('❌ Müsaitlik kontrolü yapılamadı:', error);
      throw error;
    }
  }

  async deleteAppointment(appointmentId: string): Promise<void> {
    try {
      await firestore()
        .collection('appointments')
        .doc(appointmentId)
        .delete();

      console.log('✅ Randevu silindi:', appointmentId);
    } catch (error) {
      console.error('❌ Randevu silinemedi:', error);
      throw error;
    }
  }
}

export const appointmentService = AppointmentService.getInstance(); 