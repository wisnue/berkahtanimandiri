import { useEffect, useState } from 'react';
import { Check, X } from 'lucide-react';

interface PasswordStrength {
  score: number;
  feedback: string[];
  isValid: boolean;
}

interface PasswordStrengthData {
  isValid: boolean;
  errors: string[];
  strength: PasswordStrength;
  label: string;
  color: string;
}

interface PasswordStrengthMeterProps {
  password: string;
  onValidationChange?: (isValid: boolean) => void;
  showRequirements?: boolean;
}

export default function PasswordStrengthMeter({
  password,
  onValidationChange,
  showRequirements = true,
}: PasswordStrengthMeterProps) {
  const [strengthData, setStrengthData] = useState<PasswordStrengthData | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    if (!password) {
      setStrengthData(null);
      onValidationChange?.(false);
      return;
    }

    // Debounce validation to avoid too many API calls
    const timeoutId = setTimeout(async () => {
      setIsChecking(true);
      try {
        // Perform client-side validation for real-time feedback
        const clientValidation = validatePasswordClient(password);
        
        // You can optionally call the server for additional validation
        // const response = await fetch('/api/auth/password/check-strength', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({ password }),
        //   credentials: 'include',
        // });
        // const data = await response.json();
        
        setStrengthData(clientValidation);
        onValidationChange?.(clientValidation.isValid);
      } catch (error) {
        console.error('Error checking password strength:', error);
      } finally {
        setIsChecking(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [password, onValidationChange]);

  if (!password) {
    return null;
  }

  const getColorClass = (color: string) => {
    switch (color) {
      case 'red':
        return 'bg-red-500';
      case 'orange':
        return 'bg-orange-500';
      case 'yellow':
        return 'bg-yellow-500';
      case 'green':
        return 'bg-green-500';
      case 'emerald':
        return 'bg-emerald-500';
      default:
        return 'bg-gray-300';
    }
  };

  const getTextColorClass = (color: string) => {
    switch (color) {
      case 'red':
        return 'text-red-600';
      case 'orange':
        return 'text-orange-600';
      case 'yellow':
        return 'text-yellow-600';
      case 'green':
        return 'text-green-600';
      case 'emerald':
        return 'text-emerald-600';
      default:
        return 'text-gray-600';
    }
  };

  const score = strengthData?.strength?.score || 0;
  const color = strengthData?.color || 'gray';
  const label = strengthData?.label || '';
  const percentage = Math.min(100, (score / 4) * 100);

  return (
    <div className="space-y-3">
      {/* Strength Meter Bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 font-medium">Kekuatan Password:</span>
          <span className={`font-semibold ${getTextColorClass(color)}`}>
            {isChecking ? 'Memeriksa...' : label}
          </span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${getColorClass(color)}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Requirements Checklist */}
      {showRequirements && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">Persyaratan Password:</p>
          <div className="space-y-1">
            <RequirementItem
              met={password.length >= 8}
              text="Minimal 8 karakter"
            />
            <RequirementItem
              met={/[A-Z]/.test(password)}
              text="Minimal 1 huruf besar (A-Z)"
            />
            <RequirementItem
              met={/[a-z]/.test(password)}
              text="Minimal 1 huruf kecil (a-z)"
            />
            <RequirementItem
              met={/[0-9]/.test(password)}
              text="Minimal 1 angka (0-9)"
            />
            <RequirementItem
              met={/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)}
              text="Minimal 1 karakter spesial (!@#$%...)"
            />
          </div>
        </div>
      )}

      {/* Validation Errors */}
      {strengthData && !strengthData.isValid && strengthData.errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm font-medium text-red-800 mb-2">Masalah yang harus diperbaiki:</p>
          <ul className="space-y-1">
            {strengthData.errors.map((error, index) => (
              <li key={index} className="text-sm text-red-700 flex items-start gap-2">
                <X size={16} className="mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Feedback */}
      {strengthData && strengthData.strength.feedback.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm font-medium text-blue-800 mb-1">Tips:</p>
          <ul className="space-y-1">
            {strengthData.strength.feedback.map((tip, index) => (
              <li key={index} className="text-sm text-blue-700">
                • {tip}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

interface RequirementItemProps {
  met: boolean;
  text: string;
}

function RequirementItem({ met, text }: RequirementItemProps) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {met ? (
        <Check size={16} className="text-green-600 flex-shrink-0" />
      ) : (
        <X size={16} className="text-gray-400 flex-shrink-0" />
      )}
      <span className={met ? 'text-green-700' : 'text-gray-600'}>{text}</span>
    </div>
  );
}

// Client-side validation (mirrors server-side logic)
function validatePasswordClient(password: string): PasswordStrengthData {
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
  if (commonPatterns.some((pattern) => password.toLowerCase().includes(pattern))) {
    feedback.push('Hindari pola umum seperti "123", "abc", "password"');
    score = Math.max(0, score - 1);
  }

  const strength: PasswordStrength = {
    score: Math.min(4, score),
    feedback,
    isValid: errors.length === 0,
  };

  return {
    isValid: errors.length === 0,
    errors,
    strength,
    label: getPasswordStrengthLabel(strength.score),
    color: getPasswordStrengthColor(strength.score),
  };
}

function getPasswordStrengthLabel(score: number): string {
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

function getPasswordStrengthColor(score: number): string {
  switch (score) {
    case 0:
    case 1:
      return 'red';
    case 2:
      return 'orange';
    case 3:
      return 'yellow';
    case 4:
      return 'kuat';
    case 5:
    case 6:
      return 'emerald';
    default:
      return 'gray';
  }
}
