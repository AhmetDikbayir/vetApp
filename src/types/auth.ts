export interface User {
  id: string; // Firebase UID
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  photoUrl?: string;
  clinicId?: string; // Veteriner rolü için klinik ID'si
}

export interface LoginCredentials {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  role?: string;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface AuthService {
  signInWithGoogle(): Promise<User>;
  signInWithApple(): Promise<User>;
  signInWithEmail(credentials: LoginCredentials): Promise<User>;
  signUpWithEmail(credentials: LoginCredentials): Promise<User>;
  signOut(): Promise<void>;
  getCurrentUser(): User | null;
  getFirebaseUser(): any;
} 