import firestore from '@react-native-firebase/firestore';
import { eventManager } from '../events/EventManager';
import { 
  EVENT_NAMES, 
  AppointmentCreatedEvent, 
  NotificationSentEvent 
} from '../events/NotificationEvents';
import OneSignal from 'react-native-onesignal';

const OneSignalAny = OneSignal as any;

export interface NotificationPayload {
  title: string;
  body: string;
  data?: any;
  playerIds?: string[];
  includePlayerIds?: string[];
  excludePlayerIds?: string[];
}

export class NotificationService {
  private static instance: NotificationService;
  private isInitialized = false;
  private readonly ONESIGNAL_APP_ID = 'a59f68be-74d9-4bfd-8eb6-48b4b67777ae';
  private readonly REST_API_KEY = 'zka3zk3zkuexeszk3vyfpjqyt'; // OneSignal Dashboard'dan alınacak

  private constructor() {}

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    console.log('🧪 OneSignal typeof:', typeof OneSignal);
    console.log('🧪 OneSignal objesi:', OneSignal);
    console.log('🧪 OneSignalAny typeof:', typeof OneSignalAny);
    console.log('🧪 OneSignalAny objesi:', OneSignalAny);

    try {
      // OneSignal modülünün yüklenip yüklenmediğini kontrol et
      if (typeof OneSignalAny === 'undefined') {
        throw new Error('OneSignal modülü yüklenemedi. Lütfen react-native-onesignal paketini kontrol edin.');
      }
      console.log('🔍 OneSignal modülü yüklendi:', typeof OneSignalAny);

      console.log('🔍 OneSignal modülü yüklendi:', typeof OneSignalAny);
      
      // OneSignal v5 API'si ile başlat
      OneSignalAny.initialize(this.ONESIGNAL_APP_ID);
      
      // Bildirim izni iste
      OneSignalAny.Notifications.requestPermission(true);

      // Bildirim alındığında
      OneSignalAny.Notifications.addEventListener('foregroundWillDisplay', (event: any) => {
        console.log('📬 Bildirim alındı (foreground):', event);
        
        eventManager.emit(EVENT_NAMES.NOTIFICATION_RECEIVED, {
          appointmentId: event.notification.additionalData?.appointmentId || '',
          title: event.notification.title || '',
          body: event.notification.body || '',
          data: event.notification.additionalData,
          timestamp: new Date().toISOString()
        });
      });

      // Bildirim tıklandığında
      OneSignalAny.Notifications.addEventListener('click', (event: any) => {
        console.log('📬 Bildirim tıklandı:', event);
        
        eventManager.emit(EVENT_NAMES.NOTIFICATION_CLICKED, {
          appointmentId: event.notification.additionalData?.appointmentId || '',
          title: event.notification.title || '',
          body: event.notification.body || '',
          data: event.notification.additionalData,
          timestamp: new Date().toISOString()
        });
      });

      this.isInitialized = true;
      console.log('✅ NotificationService başlatıldı');
    } catch (error) {
      console.error('❌ NotificationService başlatılamadı:', error);
      throw error;
    }
  }

  async setUserId(userId: string): Promise<void> {
    try {
      OneSignalAny.login(userId);
      console.log('✅ OneSignal kullanıcı ID set edildi:', userId);
    } catch (error) {
      console.error('❌ OneSignal kullanıcı ID set edilemedi:', error);
    }
  }

  async getPlayerId(): Promise<string | null> {
    try {
      const playerId = OneSignalAny.User.getOnesignalId();
      return playerId;
    } catch (error) {
      console.error('❌ Player ID alınamadı:', error);
      return null;
    }
  }

  async savePlayerId(userId: string, playerId: string): Promise<void> {
    try {
      await firestore()
        .collection('oneSignalPlayers')
        .doc(userId)
        .set({ playerId, updatedAt: new Date() });
      
      console.log('✅ Player ID kaydedildi:', playerId);
    } catch (error) {
      console.error('❌ Player ID kaydedilemedi:', error);
      throw error;
    }
  }

  async getVeterinarianPlayerId(veterinarianId: string): Promise<string | null> {
    try {
      const doc = await firestore()
        .collection('oneSignalPlayers')
        .doc(veterinarianId)
        .get();

      if (doc.exists()) {
        return doc.data()?.playerId || null;
      }
      return null;
    } catch (error) {
      console.error('❌ Veteriner Player ID alınamadı:', error);
      return null;
    }
  }

  async sendNotification(payload: NotificationPayload): Promise<boolean> {
    try {
      const response = await fetch('https://onesignal.com/api/v1/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${this.REST_API_KEY}`
        },
        body: JSON.stringify({
          app_id: this.ONESIGNAL_APP_ID,
          headings: { en: payload.title },
          contents: { en: payload.body },
          data: payload.data,
          include_player_ids: payload.playerIds || [],
          include_external_user_ids: payload.includePlayerIds || [],
          excluded_player_ids: payload.excludePlayerIds || []
        })
      });

      const result = await response.json();
      
      if (response.ok) {
        console.log('✅ Bildirim gönderildi:', result);
        return true;
      } else {
        console.error('❌ Bildirim gönderilemedi:', result);
        return false;
      }
    } catch (error) {
      console.error('❌ Bildirim gönderme hatası:', error);
      return false;
    }
  }

  async sendAppointmentNotification(appointmentEvent: AppointmentCreatedEvent): Promise<void> {
    try {
      // Veterinerin Player ID'sini al
      const veterinarianPlayerId = await this.getVeterinarianPlayerId(appointmentEvent.veterinarianId);
      
      if (!veterinarianPlayerId) {
        console.log('❌ Veteriner Player ID bulunamadı:', appointmentEvent.veterinarianId);
        return;
      }

      // Bildirim gönder
      const success = await this.sendNotification({
        title: 'Yeni Randevu Talebi',
        body: `${appointmentEvent.petName} için ${appointmentEvent.ownerName} tarafından randevu talebi oluşturuldu.`,
        data: {
          appointmentId: appointmentEvent.appointmentId,
          type: 'appointment_created',
          petName: appointmentEvent.petName,
          ownerName: appointmentEvent.ownerName,
          appointmentDate: appointmentEvent.appointmentDate,
          appointmentTime: appointmentEvent.appointmentTime
        },
        playerIds: [veterinarianPlayerId]
      });

      // Event emit et
      eventManager.emit(EVENT_NAMES.NOTIFICATION_SENT, {
        appointmentId: appointmentEvent.appointmentId,
        recipientId: appointmentEvent.veterinarianId,
        recipientType: 'veterinarian',
        success,
        timestamp: new Date().toISOString()
      } as NotificationSentEvent);

    } catch (error) {
      console.error('❌ Randevu bildirimi gönderilemedi:', error);
      
      eventManager.emit(EVENT_NAMES.NOTIFICATION_SENT, {
        appointmentId: appointmentEvent.appointmentId,
        recipientId: appointmentEvent.veterinarianId,
        recipientType: 'veterinarian',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      } as NotificationSentEvent);
    }
  }

  async checkNotificationPermission(): Promise<boolean> {
    try {
      return OneSignalAny.Notifications.hasPermission();
    } catch (error) {
      console.error('❌ Bildirim izni kontrol edilemedi:', error);
      return false;
    }
  }

  async requestNotificationPermission(): Promise<boolean> {
    try {
      return OneSignalAny.Notifications.requestPermission(true);
    } catch (error) {
      console.error('❌ Bildirim izni istenemedi:', error);
      return false;
    }
  }
}

export const notificationService = NotificationService.getInstance(); 