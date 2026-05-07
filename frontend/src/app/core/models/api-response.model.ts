export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  errors?: string[];
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  email: string;
  userId: string;
}

export interface User {
  userId: string;
  email: string;
}
