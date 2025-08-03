export interface Clinic {
  id?: string;
  name: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  phone: string;
  email: string;
  website?: string;
  description: string;
  services: string[];
  facilities: string[];
  emergencyService: boolean;
  isOpen24Hours: boolean;
  rating: number;
  reviewCount: number;
  photoUrl?: string;
  location: {
    latitude: number;
    longitude: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateClinicData {
  name: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  phone: string;
  email: string;
  website?: string;
  description: string;
  services: string[];
  facilities: string[];
  emergencyService: boolean;
  isOpen24Hours: boolean;
  photoUrl?: string;
  location: {
    latitude: number;
    longitude: number;
  };
} 