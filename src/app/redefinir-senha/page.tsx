'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Lock, Loader2, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function ResetPasswordPage() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('As senhas não coincidem.');
            return;
        }

        setIsLoading(true);
        setError(null);

        const { error: resetError } = await supabase.auth.updateUser({
            password: password
        });

        if (resetError) {
            setError(resetError.message);
            setIsLoading(false);
        } else {
            setStatus('success');
            setTimeout(() => {
                router.push('/login');
            }, 3000);
        }
    };

    if (status === 'success') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white p-6">
                <div className="max-w-md w-full text-center space-y-8 animate-in zoom-in duration-500">
                    <div className="h-24 w-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto border border-emerald-100 shadow-xl">
                        <CheckCircle2 className="h-12 w-12 text-emerald-500" />
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-3xl font-black text-primary-900 uppercase tracking-tighter">Senha Redefinida!</h1>
                        <p className="text-slate-400 font-bold text-sm uppercase">Sua nova senha foi salva. Redirecionando para o login...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden p-6">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/5 blur-[120px] rounded-full -z-10" />

            <div className="max-w-md w-full bg-white p-10 rounded-[40px] shadow-2xl border border-slate-100">
                <header className="text-center mb-10 space-y-4">
                    <div className="h-16 w-16 bg-primary-900 rounded-2xl flex items-center justify-center mx-auto shadow-xl">
                        <Lock className="h-8 w-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-primary-900 uppercase tracking-tighter">Nova Senha</h1>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Crie uma senha forte e segura</p>
                    </div>
                </header>

                <form onSubmit={handleReset} className="space-y-6">
                    {error && (
                        <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-[12px] font-bold text-center">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Nova Senha</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-100 p-4 pl-12 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-accent/20"
                                placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Confirme a Senha</label>
                        <div className="relative">
                            <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                            <input
                                type="password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-100 p-4 pl-12 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-accent/20"
                                placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                            />
                        </div>
                    </div>

                    <button
                        disabled={isLoading}
                        className="w-full bg-primary-900 text-white py-5 rounded-2xl font-black text-[12px] uppercase tracking-widest hover:bg-accent transition-all shadow-xl shadow-primary-900/20 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                    >
                        {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Atualizar Senha'}
                    </button>
                </form>
            </div>
        </div>
    );
}
