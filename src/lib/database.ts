import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';

// Database configuration singleton
const dbUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const dbAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const globalForDb = global as unknown as { db: any };

export const db = globalForDb.db || createClientComponentClient();

if (process.env.NODE_ENV !== 'production') globalForDb.db = db;

export const dbAdmin = createClient(dbUrl, dbAnonKey);
