import dotenv from 'dotenv';

dotenv.config();

export const ENV = {
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
  DATABASE_URL: process.env.DATABASE_URL || '',
  JWT_SECRET: process.env.JWT_SECRET || 'fallback_secret_change_me_unsaid',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  FB_PAGE_ID: process.env.FB_PAGE_ID || '',
  FB_PAGE_ACCESS_TOKEN: process.env.FB_PAGE_ACCESS_TOKEN || '',
  FB_API_VERSION: process.env.FB_API_VERSION || 'v19.0',
  SUPABASE_URL: process.env.SUPABASE_URL || 'https://iifwbcrugzlsxkhgmcvd.supabase.co',
  SUPABASE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '',
  SUPABASE_STORAGE_BUCKET: process.env.SUPABASE_STORAGE_BUCKET || 'unsaid-images',
};
