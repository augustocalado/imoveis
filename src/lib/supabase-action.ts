import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export const createActionClient = async () => {
    const cookieStore = await cookies();
    return createServerActionClient({ cookies: () => cookieStore });
};
