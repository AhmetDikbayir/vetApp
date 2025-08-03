export interface Appointment {
  id?: string;
  userId: string;
  petId: string;
  veterinarianId: string;
  clinicId: string;
  date: string; // YYYY-MM-DD formatında
  time: string; // HH:MM formatında
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
  type: 'checkup' | 'vaccination' | 'surgery' | 'emergency' | 'consultation' | 'other';
  reason: string;
  notes?: string;
  price?: number;
  paymentStatus: 'pending' | 'paid' | 'refunded';
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAppointmentData {
  petId: string;
  veterinarianId: string;
  clinicId: string;
  date: string;
  time: string;
  type: 'checkup' | 'vaccination' | 'surgery' | 'emergency' | 'consultation' | 'other';
  reason: string;
  notes?: string;
} 