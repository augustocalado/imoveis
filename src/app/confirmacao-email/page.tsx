'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Loader2, ArrowRight, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function EmailConfirmationPage() {
    const router = useRouter();
    const [countdown, setCountdown] = useState(5);
    const [message, setMessage] = useState('Verificando seu e-mail...');

    useEffect(() => {
        const verifyEmail = async () => {
            if (typeof window !== 'undefined') {
                const url = new URL(window.location.href);
                const code = url.searchParams.get('code');
                
                // Se a URL contém o código PKCE, vamos trocá-lo pela sessão para oficializar a validação no Supabase
                if (code) {
                    const { error } = await supabase.auth.exchangeCodeForSession(code);
                    if (error) {
                        console.error('Erro ao verificar email:', error.message);
                        setMessage('Ocorreu um erro ou o link expirou.');
                    } else {
                        setMessage('E-mail Verificado!');
                    }
                } else {
                    // O cliente do Supabase já é inicializado para ler Implicit Flow hashes (access_token)
                    setMessage('E-mail Verificado!');
                }
            }
        };

        verifyEmail();

        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    router.push('/login');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-white relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-emerald-50 via-white to-blue-50 opacity-60 -z-10" />
            <div className="absolute top-20 right-20 w-[600px] h-[600px] bg-emerald-100/30 blur-[120px] rounded-full -z-10" />
            <div className="absolute -bottom-20 -left-20 w-[500px] h-[500px] bg-blue-100/20 blur-[100px] rounded-full -z-10" />

            <div className="max-w-md w-full px-8 text-center">
                <div className="relative inline-block mb-12">
                    <div className="h-32 w-32 bg-emerald-50 rounded-[40px] flex items-center justify-center shadow-xl shadow-emerald-900/10 border border-emerald-100 animate-in zoom-in duration-700">
                        <CheckCircle2 className="h-16 w-16 text-emerald-500" />
                    </div>
                    <div className="absolute -top-4 -right-4 h-12 w-12 bg-white rounded-2xl flex items-center justify-center shadow-lg border border-slate-50 animate-bounce">
                        <ShieldCheck className="h-6 w-6 text-primary-900" />
                    </div>
                </div>

                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                    <div className="space-y-2">
                        <p className="text-emerald-500 font-black text-[12px] uppercase tracking-[0.4em]">E-mail Verificado</p>
                        <h1 className="text-5xl font-black text-primary-900 tracking-tighter uppercase leading-none">
                            Tudo pronto, <br /> <span className="text-emerald-500 underline decoration-emerald-200">Corretor!</span>
                        </h1>
                    </div>

                    <p className="text-slate-400 font-bold text-sm leading-relaxed uppercase tracking-wide">
                        Sua conta foi validada com sucesso. Nosso time administrativo fará a revisão final do seu perfil em breve.
                    </p>

                    <div className="bg-slate-50 p-6 rounded-[30px] border border-slate-100 flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-100">
                                <Loader2 className="h-5 w-5 text-emerald-500 animate-spin" />
                            </div>
                            <div className="text-left">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Redirecionando em</p>
                                <p className="text-lg font-black text-primary-900 tracking-tighter">{countdown} segundos</p>
                            </div>
                        </div>
                        <Link
                            href="/login"
                            className="h-12 w-12 bg-primary-900 text-white rounded-2xl flex items-center justify-center hover:bg-emerald-500 transition-all active:scale-90 shadow-xl shadow-primary-900/20 group-hover:translate-x-1"
                        >
                            <ArrowRight className="h-5 w-5" />
                        </Link>
                    </div>

                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] pt-8">
                        KF Imóveis &bull; Signature Platform
                    </p>
                </div>
            </div>
        </div>
    );
}
