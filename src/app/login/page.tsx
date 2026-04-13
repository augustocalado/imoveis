'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { LogIn, User, Lock, Mail, Loader2, House, Sparkles, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const { data, error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (signInError) throw signInError;

            if (data.user) {
                // Try to get profile with a small delay if not found immediately (trigger sync)
                let role = data.user.user_metadata?.role;
                
                const fetchProfile = async () => {
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('role')
                        .eq('id', data.user.id)
                        .single();
                    return profile?.role;
                };

                let dbRole = await fetchProfile();
                
                // Fallback to metadata if DB role is not found or is default but metadata says otherwise
                const finalRole = dbRole || role || 'cliente';

                // Sync role to metadata if it's missing or different to ensure middleware works correctly
                if (finalRole !== role) {
                    await supabase.auth.updateUser({
                        data: { role: finalRole }
                    });
                }

                console.log('Login successful. Role detected:', finalRole);

                if (finalRole === 'admin') router.push('/admin');
                else if (finalRole === 'corretor') router.push('/corretor');
                else router.push('/cliente');
            }
        } catch (err: any) {
            setError(err.message === 'Invalid login credentials' ? 'E-mail ou senha incorretos.' : err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#FDFDFF] relative overflow-hidden text-[#1B263B] selection:bg-indigo-100">
            {/* Premium Background */}
            <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-indigo-50/50 blur-[150px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-50/50 blur-[150px] rounded-full pointer-events-none" />

            <div className="max-w-md w-full mx-auto px-6 z-10 transition-all duration-1000 animate-in fade-in slide-in-from-bottom-12">
                
                <Link href="/" className="flex flex-col items-center justify-center mb-16 group">
                    <div className="relative flex flex-col items-center">
                        <div className="flex gap-1.5 items-end mb-[-4px]">
                            <div className="w-2 h-5 bg-[#1B263B]/20 rounded-t-sm" />
                            <div className="w-2.5 h-8 bg-[#1B263B]/40 rounded-t-sm" />
                            <div className="w-3.5 h-12 bg-[#1B263B] rounded-t-sm shadow-2xl shadow-indigo-900/20" />
                            <div className="w-2.5 h-7 bg-[#1B263B]/40 rounded-t-sm" />
                            <div className="w-2 h-4 bg-[#1B263B]/20 rounded-t-sm" />
                        </div>
                        <div className="w-full h-1 bg-[#1B263B] relative z-20 skew-y-[15deg] origin-left rounded-full" />
                        <div className="w-full h-1 bg-[#1B263B] relative z-20 -translate-y-1 -skew-y-[15deg] origin-right rounded-full" />
                        <div className="flex flex-col items-center -mt-2 leading-none relative z-30">
                            <span className="text-6xl font-black tracking-tighter text-[#1B263B] font-serif italic">KF</span>
                            <span className="text-[12px] font-black tracking-[0.6em] text-[#1B263B]/40 uppercase mt-2 ml-1">Imóveis</span>
                        </div>
                    </div>
                </Link>

                <div className="bg-white/80 backdrop-blur-3xl p-12 rounded-[50px] shadow-2xl shadow-indigo-100/50 border border-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <Sparkles className="h-20 w-20" />
                    </div>

                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-black text-[#1B263B] tracking-tighter uppercase mb-3">Bem-vindo à KF</h2>
                        <div className="flex items-center justify-center gap-2 bg-indigo-50 py-1.5 px-4 rounded-full w-fit mx-auto">
                            <ShieldCheck className="h-3 w-3 text-indigo-600" />
                            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest leading-none">Acesso Exclusivo</p>
                        </div>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-8">
                        {error && (
                            <div className="bg-red-50 text-red-600 p-5 rounded-3xl text-[11px] font-black uppercase tracking-widest border border-red-100 flex items-center justify-center animate-bounce">
                                {error}
                            </div>
                        )}

                        <div className="space-y-3">
                            <label className="text-[11px] font-black text-[#1B263B]/40 uppercase tracking-widest ml-4">E-mail Profissional</label>
                            <div className="relative group">
                                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-[#1B263B] transition-colors" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="seu@email.com"
                                    className="w-full bg-slate-50 border border-slate-100 p-6 pl-16 rounded-[28px] text-sm font-bold text-[#1B263B] outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-100 focus:bg-white transition-all shadow-inner"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center px-4">
                                <label className="text-[11px] font-black text-[#1B263B]/40 uppercase tracking-widest">Sua Senha</label>
                                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline cursor-pointer">Esqueceu?</span>
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-[#1B263B] transition-colors" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-slate-50 border border-slate-100 p-6 pl-16 rounded-[28px] text-sm font-bold text-[#1B263B] outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-100 focus:bg-white transition-all shadow-inner"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 hover:text-[#1B263B] transition-colors p-2"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-20 bg-[#1B263B] text-white rounded-[28px] font-black text-[13px] uppercase tracking-widest flex items-center justify-center space-x-4 hover:bg-indigo-600 transition-all shadow-2xl shadow-indigo-200 active:scale-95 disabled:opacity-50 disabled:scale-100 group overflow-hidden relative"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                            {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : (
                                <>
                                    <span>Entrar no Painel</span>
                                    <LogIn className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-12 text-center">
                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">Novo na KF Imóveis?</p>
                        <Link href="/cadastro" className="inline-flex h-14 items-center bg-slate-50 border border-slate-100 px-10 rounded-2xl text-[11px] font-black text-[#1B263B] uppercase tracking-widest hover:bg-white hover:border-[#1B263B] transition-all active:scale-95">
                            Criar Conta Gratuita
                        </Link>
                    </div>
                </div>

                <div className="mt-12 text-center opacity-20">
                    <p className="text-[10px] font-black uppercase tracking-[0.5em]">Real Estate Excellence • {new Date().getFullYear()}</p>
                </div>
            </div>
        </div>
    );
}
