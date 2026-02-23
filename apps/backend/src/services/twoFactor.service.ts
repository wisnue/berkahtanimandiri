import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import bcrypt from 'bcrypt';
import { db } from '../config/db';
import { users, twoFactorBackupCodes } from '../db/schema';
import { eq, and } from 'drizzle-orm';

// =====================================================
// GENERATE 2FA SECRET & QR CODE
// =====================================================

export async function generate2FASecret(_userId: string, email: string) {
  // Generate secret
  const secret = speakeasy.generateSecret({
    name: `KTH BTM (${email})`,
    issuer: 'KTH BTM',
    length: 32,
  });

  // Generate QR code as data URL
  const qrCodeDataUrl = await QRCode.toDataURL(secret.otpauth_url || '');

  return {
    secret: secret.base32,
    qrCode: qrCodeDataUrl,
    otpauthUrl: secret.otpauth_url,
  };
}

// =====================================================
// VERIFY OTP TOKEN
// =====================================================

export function verifyOTP(secret: string, token: string): boolean {
  return speakeasy.totp.verify({
    secret: secret,
    encoding: 'base32',
    token: token,
    window: 2, // Allow 2 steps before/after for time drift
  });
}

// =====================================================
// GENERATE BACKUP CODES
// =====================================================

export async function generateBackupCodes(userId: string): Promise<string[]> {
  const codes: string[] = [];
  const hashedCodes: { userId: string; code: string }[] = [];

  // Generate 10 backup codes
  for (let i = 0; i < 10; i++) {
    // Generate random 8-character code
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    codes.push(code);

    // Hash the code for storage
    const hashedCode = await bcrypt.hash(code, 10);
    hashedCodes.push({ userId, code: hashedCode });
  }

  // Store hashed codes in database
  await db.insert(twoFactorBackupCodes).values(hashedCodes);

  // Return plaintext codes (only shown once to user)
  return codes;
}

// =====================================================
// VERIFY BACKUP CODE
// =====================================================

export async function verifyBackupCode(userId: string, code: string): Promise<boolean> {
  // Get all unused backup codes for this user
  const backupCodes = await db
    .select()
    .from(twoFactorBackupCodes)
    .where(
      and(
        eq(twoFactorBackupCodes.userId, userId),
        eq(twoFactorBackupCodes.used, false)
      )
    );

  // Check if code matches any unused backup code
  for (const backupCode of backupCodes) {
    const isMatch = await bcrypt.compare(code, backupCode.code);
    
    if (isMatch) {
      // Mark code as used
      await db
        .update(twoFactorBackupCodes)
        .set({ used: true, usedAt: new Date() })
        .where(eq(twoFactorBackupCodes.id, backupCode.id));
      
      return true;
    }
  }

  return false;
}

// =====================================================
// ENABLE 2FA FOR USER
// =====================================================

export async function enable2FA(userId: string, secret: string) {
  await db
    .update(users)
    .set({
      twoFactorEnabled: true,
      twoFactorSecret: secret,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));
}

// =====================================================
// DISABLE 2FA FOR USER
// =====================================================

export async function disable2FA(userId: string) {
  // Disable 2FA
  await db
    .update(users)
    .set({
      twoFactorEnabled: false,
      twoFactorSecret: null,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));

  // Delete all backup codes
  await db
    .delete(twoFactorBackupCodes)
    .where(eq(twoFactorBackupCodes.userId, userId));
}

// =====================================================
// CHECK IF USER HAS 2FA ENABLED
// =====================================================

export async function check2FAStatus(userId: string): Promise<boolean> {
  const [user] = await db
    .select({ twoFactorEnabled: users.twoFactorEnabled })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return user?.twoFactorEnabled || false;
}

// =====================================================
// GET REMAINING BACKUP CODES COUNT
// =====================================================

export async function getRemainingBackupCodesCount(userId: string): Promise<number> {
  const result = await db
    .select()
    .from(twoFactorBackupCodes)
    .where(
      and(
        eq(twoFactorBackupCodes.userId, userId),
        eq(twoFactorBackupCodes.used, false)
      )
    );

  return result.length;
}
