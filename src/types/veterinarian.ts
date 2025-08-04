export interface Veterinarian {
  id?: string;
  userId?: string; // Kullanıcı ID'si
  name: string;
  email: string;
  phone: string;
  specialization: string[];
  experience: number;
  education: string;
  licenseNumber: string;
  photoUrl?: string;
  clinicId: string;
  isAvailable: boolean;
  workingHours: {
    monday: { start: string; end: string; isWorking: boolean };
    tuesday: { start: string; end: string; isWorking: boolean };
    wednesday: { start: string; end: string; isWorking: boolean };
    thursday: { start: string; end: string; isWorking: boolean };
    friday: { start: string; end: string; isWorking: boolean };
    saturday: { start: string; end: string; isWorking: boolean };
    sunday: { start: string; end: string; isWorking: boolean };
  };
  rating: number;
  reviewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateVeterinarianData {
  userId?: string; // Kullanıcı ID'si
  name: string;
  email: string;
  phone: string;
  specialization: string[];
  experience: number;
  education: string;
  licenseNumber: string;
  photoUrl?: string;
  clinicId: string;
  workingHours: {
    monday: { start: string; end: string; isWorking: boolean };
    tuesday: { start: string; end: string; isWorking: boolean };
    wednesday: { start: string; end: string; isWorking: boolean };
    thursday: { start: string; end: string; isWorking: boolean };
    friday: { start: string; end: string; isWorking: boolean };
    saturday: { start: string; end: string; isWorking: boolean };
    sunday: { start: string; end: string; isWorking: boolean };
  };
} 