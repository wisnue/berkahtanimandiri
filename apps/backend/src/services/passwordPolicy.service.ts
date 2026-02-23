import bcrypt from 'bcrypt';
import { db } from '../config/db';
import { users, passwordHistory } from '../db/schema';
import { eq, desc } from 'drizzle-orm';

export interface PasswordStrength {
  score: number; // 0-4 (weak to very strong)
  feedback: string[];
  isValid: boolean;
}

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  strength?: PasswordStrength;
}

/**
 * Validate password against policy requirements
 * - Min 8 characters
 * - At least 1 uppercase letter
 * - At least 1 lowercase letter
 * - At least 1 number
 * - At least 1 special character
 */
export function validatePasswordStrength(password: string): PasswordValidationResult {
  const errors: string[] = [];
  const feedback: string[] = [];
  let score = 0;

  // Check minimum length
  if (password.length < 8) {
    errors.push('Password minimal 8 karakter');
  } else {
    score++;
    if (password.length >= 12) {
      score++;
      feedback.push('Panjang password bagus');
    }
  }

  // Check uppercase
  if (!/[A-Z]/.test(password)) {
    errors.push('Password harus mengandung minimal 1 huruf besar');
  } else {
    score++;
  }

  // Check lowercase
  if (!/[a-z]/.test(password)) {
    errors.push('Password harus mengandung minimal 1 huruf kecil');
  } else {
    score++;
  }

  // Check number
  if (!/[0-9]/.test(password)) {
    errors.push('Password harus mengandung minimal 1 angka');
  } else {
    score++;
  }

  // Check special character
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password harus mengandung minimal 1 karakter spesial (!@#$%^&*...)');
  } else {
    score++;
  }

  // Additional strength checks
  if (password.length >= 16) {
    feedback.push('Password sangat panjang dan aman');
  }

  if (/(.)\1{2,}/.test(password)) {
    feedback.push('Hindari karakter berulang');
    score = Math.max(0, score - 1);
  }

  // Common patterns check
  const commonPatterns = ['123', 'abc', 'qwerty', 'password', 'admin'];
  if (commonPatterns.some(pattern => password.toLowerCase().includes(pattern))) {
    feedback.push('Hindari pola umum seperti "123", "abc", "password"');
    score = Math.max(0, score - 1);
  }

  const strength: PasswordStrength = {
    score: Math.min(4, score),
    feedback,
    isValid: errors.length === 0
  };

  return {
    isValid: errors.length === 0,
    errors,
    strength
  };
}

/**
 * Check if password was used in the last 5 passwords
 */
export async function checkPasswordHistory(
  userId: string,
  newPassword: string
): Promise<boolean> {
  try {
    // Get last 5 password hashes
    const history = await db
      .select()
      .from(passwordHistory)
      .where(eq(passwordHistory.userId, userId))
      .orderBy(desc(passwordHistory.createdAt))
      .limit(5);

    // Check if new password matches any of the last 5
    for (const record of history) {
      const isMatch = await bcrypt.compare(newPassword, record.passwordHash);
      if (isMatch) {
        return false; // Password was used before
      }
    }

    return true; // Password is new
  } catch (error) {
    console.error('Error checking password history:', error);
    throw new Error('Gagal memeriksa riwayat password');
  }
}

/**
 * Add password to history
 */
export async function addPasswordToHistory(
  userId: string,
  passwordHash: string
): Promise<void> {
  try {
    // Insert new password into history
    await db.insert(passwordHistory).values({
      userId,
      passwordHash,
      createdAt: new Date()
    });

    // Keep only last 5 passwords (delete older ones)
    const allHistory = await db
      .select()
      .from(passwordHistory)
      .where(eq(passwordHistory.userId, userId))
      .orderBy(desc(passwordHistory.createdAt));

    // Delete records beyond the 5 most recent
    if (allHistory.length > 5) {
      const idsToDelete = allHistory.slice(5).map(h => h.id);
      for (const id of idsToDelete) {
        await db.delete(passwordHistory).where(eq(passwordHistory.id, id));
      }
    }
  } catch (error) {
    console.error('Error adding password to history:', error);
    throw new Error('Gagal menyimpan riwayat password');
  }
}

/**
 * Check if user's password has expired (90 days)
 */
export async function checkPasswordExpiry(userId: string): Promise<{
  isExpired: boolean;
  daysUntilExpiry: number;
  expiryDate: Date | null;
}> {
  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      throw new Error('User tidak ditemukan');
    }

    // If no password changed date, use current date minus 90 days (force change)
    const passwordChangedAt = user.passwordChangedAt || new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const expiryDate = new Date(passwordChangedAt.getTime() + 90 * 24 * 60 * 60 * 1000);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));

    return {
      isExpired: daysUntilExpiry <= 0 || user.forcePasswordChange || false,
      daysUntilExpiry,
      expiryDate
    };
  } catch (error) {
    console.error('Error checking password expiry:', error);
    throw new Error('Gagal memeriksa masa berlaku password');
  }
}

/**
 * Update user's password with history tracking
 */
export async function updateUserPassword(
  userId: string,
  newPassword: string
): Promise<void> {
  try {
    // Hash the new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // Add old password to history (get current password first)
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (user && user.password) {
      await addPasswordToHistory(userId, user.password);
    }

    // Update user's password
    const now = new Date();
    const expiryDate = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

    await db
      .update(users)
      .set({
        password: newPasswordHash,
        passwordChangedAt: now,
        passwordExpiresAt: expiryDate,
        forcePasswordChange: false
      })
      .where(eq(users.id, userId));
  } catch (error) {
    console.error('Error updating user password:', error);
    throw new Error('Gagal mengupdate password');
  }
}

/**
 * Get password strength label
 */
export function getPasswordStrengthLabel(score: number): string {
  switch (score) {
    case 0:
    case 1:
      return 'Sangat Lemah';
    case 2:
      return 'Lemah';
    case 3:
      return 'Sedang';
    case 4:
      return 'Kuat';
    case 5:
    case 6:
      return 'Sangat Kuat';
    default:
      return 'Tidak Valid';
  }
}

/**
 * Get password strength color
 */
export function getPasswordStrengthColor(score: number): string {
  switch (score) {
    case 0:
    case 1:
      return 'red';
    case 2:
      return 'orange';
    case 3:
      return 'yellow';
    case 4:
      return 'green';
    case 5:
    case 6:
      return 'emerald';
    default:
      return 'gray';
  }
}
