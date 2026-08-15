const dotenv = require('dotenv');
const path = require('path');
const { z } = require('zod');

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(5000),
  CLIENT_ORIGIN: z.string().default('http://localhost:5173'),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters long'),
  JWT_EXPIRES_IN: z.string().default('15m'),
  REFRESH_TOKEN_SECRET: z.string().min(32, 'REFRESH_TOKEN_SECRET must be at least 32 characters long'),
  REFRESH_TOKEN_EXPIRES_IN: z.string().default('7d'),
  PASSWORD_RESET_TOKEN_EXPIRES_IN: z.string().default('15m'),
  EMAIL_VERIFICATION_TOKEN_EXPIRES_IN: z.string().default('24h'),
  MFA_ENCRYPTION_KEY: z.string().min(16, 'MFA_ENCRYPTION_KEY must be at least 16 characters long').default('development_mfa_aes_encryption_key_32_bytes!!'),
  ML_SERVICE_URL: z.string().url().default('http://localhost:8000'),
  ML_SERVICE_SECRET: z.string().min(16, 'ML_SERVICE_SECRET must be at least 16 characters long').default('development_internal_ml_service_shared_secret_12345'),
  UPLOAD_STORAGE_PATH: z.string().default('./uploads'),
  MAX_FILE_SIZE_BYTES: z.coerce.number().default(10485760),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  EMAIL_FROM: z.string().default('SentiTicket Support <support@sentiticket.local>')
});

let validatedEnv;

try {
  validatedEnv = envSchema.parse(process.env);
} catch (error) {
  if (error instanceof z.ZodError) {
    const errorDetails = error.issues.map((err) => `${err.path.join('.')}: ${err.message}`).join(', ');
    console.error(`[FATAL] Environment Configuration Error: ${errorDetails}`);
  } else {
    console.error('[FATAL] Failed to parse environment variables:', error);
  }
  if (process.env.NODE_ENV !== 'test') {
    process.exit(1);
  }
  validatedEnv = {
    NODE_ENV: 'test',
    PORT: 5001,
    CLIENT_ORIGIN: 'http://localhost:5173',
    MONGODB_URI: 'mongodb://localhost:27017/sentiticket_test',
    JWT_SECRET: 'test_secret_key_minimum_32_chars_long_123456789',
    JWT_EXPIRES_IN: '15m',
    REFRESH_TOKEN_SECRET: 'test_refresh_secret_key_minimum_32_chars_long_987654321',
    REFRESH_TOKEN_EXPIRES_IN: '7d',
    PASSWORD_RESET_TOKEN_EXPIRES_IN: '15m',
    EMAIL_VERIFICATION_TOKEN_EXPIRES_IN: '24h',
    MFA_ENCRYPTION_KEY: 'test_mfa_key_16_bytes_long',
    ML_SERVICE_URL: 'http://localhost:8000',
    ML_SERVICE_SECRET: 'test_ml_shared_secret_16_bytes',
    UPLOAD_STORAGE_PATH: './uploads_test',
    MAX_FILE_SIZE_BYTES: 10485760,
    EMAIL_FROM: 'SentiTicket Test <test@sentiticket.local>'
  };
}

module.exports = validatedEnv;
