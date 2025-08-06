export interface AppointmentCreatedEvent {
  appointmentId: string;
  petName: string;
  ownerName: string;
  veterinarianId: string;
  appointmentDate: string;
  appointmentTime: string;
  clinicName?: string;
}

export interface NotificationSentEvent {
  appointmentId: string;
  recipientId: string;
  recipientType: 'veterinarian' | 'owner';
  success: boolean;
  error?: string;
  timestamp: string;
}

export interface NotificationReceivedEvent {
  appointmentId: string;
  title: string;
  body: string;
  data?: any;
  timestamp: string;
}

export interface NotificationClickedEvent {
  appointmentId: string;
  title: string;
  body: string;
  data?: any;
  timestamp: string;
}

export const EVENT_NAMES = {
  APPOINTMENT_CREATED: 'appointment_created',
  NOTIFICATION_SENT: 'notification_sent',
  NOTIFICATION_RECEIVED: 'notification_received',
  NOTIFICATION_CLICKED: 'notification_clicked',
  VETERINARIAN_ONLINE: 'veterinarian_online',
  VETERINARIAN_OFFLINE: 'veterinarian_offline',
} as const; 