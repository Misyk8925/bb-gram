import * as dotenv from 'dotenv';
dotenv.config();

// Set default environment variables for tests
process.env.SUPABASE_URL = process.env.SUPABASE_URL || 'https://example.supabase.co';
process.env.SUPABASE_KEY = process.env.SUPABASE_KEY || 'mock-supabase-key';