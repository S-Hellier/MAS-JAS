export interface User {
  id: string;
  email: string;
  name?: string;
  created_at: string;
  updated_at: string;
}

export interface LoginRequest {
  email: string;
  name?: string;
}

export interface LoginResponse {
  user: User;
  message: string;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
}
