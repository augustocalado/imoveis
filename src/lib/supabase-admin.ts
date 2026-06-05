import { createClient } from '@supabase/supabase-js';

let _admin: ReturnType<typeof createClient> | null = null;

export function getSupabaseAdmin() {
    if (_admin) return _admin;

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) {
        throw new Error(
            'SUPABASE_SERVICE_ROLE_KEY não configurada. Adicione ao .env.local ou nas Environment Variables da Vercel.'
        );
    }

    _admin = createClient(url, key, {
        auth: { autoRefreshToken: false, persistSession: false },
    });

    return _admin;
}
