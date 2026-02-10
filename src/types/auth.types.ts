export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  userId: number;
  email: string;
  name: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface UserResponse {
  id: number;
  name: string;
  email: string;
  enabled: boolean;
  createdAt: string;
}

export interface AuthState {
  user: LoginResponse | null;
  token: string | null;
  isAuthenticated: boolean;
}
