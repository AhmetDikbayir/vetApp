export interface Pet {
  id?: string;
  userId: string;
  name: string;
  type: 'dog' | 'cat' | 'bird' | 'fish' | 'rabbit' | 'hamster' | 'other';
  breed?: string;
  age: number;
  weight: number;
  color: string;
  gender: 'male' | 'female';
  microchipNumber?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePetData {
  name: string;
  type: 'dog' | 'cat' | 'bird' | 'fish' | 'rabbit' | 'hamster' | 'other';
  breed: string;
  age: number;
  weight: number;
  color: string;
  gender: 'male' | 'female';
  microchipNumber: string;
  notes: string;
} 