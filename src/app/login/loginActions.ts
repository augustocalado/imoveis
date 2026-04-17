'use server';

import { createActionClient } from '@/lib/supabase-action';
import { headers } from 'next/headers';

export type LoginResponse = {
    success: boolean;
    error?: string;
    locked?: boolean;
    secondsRemaining?: number;
    role?: string;
};

export async function signInAction(prevState: any, formData: FormData): Promise<LoginResponse> {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    
    if (!email || !password) {
        return { success: false, error: 'E-mail e senha são obrigatórios.' };
    }

    const supabase = await createActionClient();
    const headersList = await headers();
    const ip = headersList.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';

    try {
        // 1. Verificar se está bloqueado (RPC)
        const { data: lockoutData, error: lockoutError } = await supabase.rpc('check_login_lockout', {
            p_email: email,
            p_ip: ip
        });

        if (lockoutError) {
            console.error('Erro ao verificar bloqueio:', lockoutError);
        } else if (lockoutData && lockoutData.length > 0 && lockoutData[0].is_locked) {
            const mins = Math.ceil(lockoutData[0].seconds_remaining / 60);
            return { 
                success: false, 
                error: `Muitas tentativas falhas. Bloqueado por mais ${mins} minutos.`,
                locked: true,
                secondsRemaining: lockoutData[0].seconds_remaining
            };
        }

        // 2. Tentar login
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (signInError) {
            // Registrar falha (RPC)
            await supabase.rpc('record_login_failure', {
                p_email: email,
                p_ip: ip
            });

            return { 
                success: false, 
                error: signInError.message === 'Invalid login credentials' 
                    ? 'E-mail ou senha incorretos.' 
                    : signInError.message 
            };
        }

        if (data.user) {
            // Resetar tentativas (RPC)
            await supabase.rpc('reset_login_attempts', {
                p_email: email,
                p_ip: ip
            });

            // Determinar o papel do usuário
            let role = data.user.user_metadata?.role;
            
            if (!role) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', data.user.id)
                    .single();
                role = profile?.role || 'cliente';
            }

            return { success: true, role };
        }

        return { success: false, error: 'Erro inesperado ao realizar login.' };

    } catch (err: any) {
        console.error('Login action error:', err);
        return { success: false, error: 'Erro interno no servidor.' };
    }
}
