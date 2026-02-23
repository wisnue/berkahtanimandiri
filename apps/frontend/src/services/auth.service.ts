import { api, ApiResponse } from './api';

export interface User {
  id: string;
  email: string;
  namaLengkap: string;
  noTelepon?: string;
  role: string;
  status: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  twoFactorEnabled: boolean;
  isLocked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  namaLengkap: string;
  noTelepon?: string;
}

export interface ChangePasswordRequest {
  currentPassword?: string;
  oldPassword?: string;
  newPassword: string;
}

export const authService = {
  async login(data: LoginRequest): Promise<ApiResponse<User>> {
    return api.post<User>('/auth/login', data);
  },

  async logout(): Promise<ApiResponse<void>> {
    return api.post('/auth/logout', {});
  },

  async getCurrentUser(): Promise<ApiResponse<User>> {
    return api.get<User>('/auth/me');
  },

  async register(data: RegisterRequest): Promise<ApiResponse<User>> {
    return api.post<User>('/auth/register', data);
  },

  async changePassword(data: ChangePasswordRequest): Promise<ApiResponse<void>> {
    return api.put('/auth/change-password', data);
  },
};

// Named exports for convenience
export const login = authService.login.bind(authService);
export const logout = authService.logout.bind(authService);
export const getCurrentUser = authService.getCurrentUser.bind(authService);
export const register = authService.register.bind(authService);
export const changePassword = authService.changePassword.bind(authService);
