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
