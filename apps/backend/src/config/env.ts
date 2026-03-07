import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('5000'),
  
  // Database
  DATABASE_URL: z.string(),
  DB_HOST: z.string().default('localhost'),
  DB_PORT: z.string().default('5432'),
  DB_NAME: z.string().default('kth_btm'),
  DB_USER: z.string().default('postgres'),
  DB_PASSWORD: z.string().default(''),
  
  // Session
  SESSION_SECRET: z.string().min(32),
  
  // CORS
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  
  // Security
  BCRYPT_ROUNDS: z.string().default('10'),
  MAX_LOGIN_ATTEMPTS: z.string().default('5'),
  LOCKOUT_DURATION: z.string().default('900000'),
  
  // File Upload
  MAX_FILE_SIZE: z.string().default('10485760'),
  UPLOAD_DIR: z.string().default('./uploads'),
  
  // PNBP
  PNBP_TARIF_PER_HA: z.string().default('15000'),
  TAHUN_PNBP: z.string().default('2025'),
  
  // 2FA
  OTP_ISSUER: z.string().default('KTH-BTM'),
  OTP_WINDOW: z.string().default('1'),
  
  // Email Configuration (Optional)
  EMAIL_HOST: z.string().optional(),
  EMAIL_PORT: z.string().optional(),
  EMAIL_SECURE: z.string().optional(),
  EMAIL_USER: z.string().optional(),
  EMAIL_PASS: z.string().optional(),
  EMAIL_FROM: z.string().optional(),
  APP_URL: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors);
  throw new Error('Invalid environment variables');
}

export const env = parsed.data;

export const config = {
  env: env.NODE_ENV,
  port: parseInt(env.PORT),
  isDevelopment: env.NODE_ENV === 'development',
  isProduction: env.NODE_ENV === 'production',
  
  db: {
    url: env.DATABASE_URL,
    host: env.DB_HOST,
    port: parseInt(env.DB_PORT),
    name: env.DB_NAME,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
  },
  
  session: {
    secret: env.SESSION_SECRET,
    name: 'kth-btm-session',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      // 'none' required for cross-domain (Vercel frontend + Render backend)
      sameSite: env.NODE_ENV === 'production' ? ('none' as const) : ('lax' as const),
    },
  },
  
  cors: {
    origin: env.CORS_ORIGIN.split(','),
    credentials: true,
  },
  
  security: {
    bcryptRounds: parseInt(env.BCRYPT_ROUNDS),
    maxLoginAttempts: parseInt(env.MAX_LOGIN_ATTEMPTS),
    lockoutDuration: parseInt(env.LOCKOUT_DURATION),
  },
  
  upload: {
    maxFileSize: parseInt(env.MAX_FILE_SIZE),
    uploadDir: env.UPLOAD_DIR,
  },
  
  pnbp: {
    tarifPerHa: parseFloat(env.PNBP_TARIF_PER_HA),
    tahun: parseInt(env.TAHUN_PNBP),
  },
  
  otp: {
    issuer: env.OTP_ISSUER,
    window: parseInt(env.OTP_WINDOW),
  },
};
