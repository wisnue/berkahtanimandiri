import { api, ApiResponse } from './api';

export interface TwoFactorSetupData {
  qrCode: string;
  secret: string;
  backupCodes: string[];
}

export interface TwoFactorStatusData {
  enabled: boolean;
  backupCodesRemaining: number;
}

/**
 * Setup 2FA - Generate QR code and secret
 */
export async function setup2FA(): Promise<ApiResponse<TwoFactorSetupData>> {
  return api.post<TwoFactorSetupData>('/auth/2fa/setup', {});
}

/**
 * Verify and enable 2FA
 */
export async function verify2FA(token: string): Promise<ApiResponse<{ backupCodes: string[] }>> {
  return api.post<{ backupCodes: string[] }>('/auth/2fa/verify', { token });
}

/**
 * Disable 2FA
 */
export async function disable2FA(password: string): Promise<ApiResponse<void>> {
  return api.post<void>('/auth/2fa/disable', { password });
}

/**
 * Verify 2FA during login
 */
export async function verify2FALogin(userId: string, token: string, isBackupCode: boolean = false): Promise<ApiResponse<any>> {
  return api.post<any>('/auth/2fa/verify-login', { userId, token, isBackupCode });
}

/**
 * Get 2FA status
 */
export async function get2FAStatus(): Promise<ApiResponse<TwoFactorStatusData>> {
  return api.get<TwoFactorStatusData>('/auth/2fa/status');
}
