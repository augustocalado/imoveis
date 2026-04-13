'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, ArrowRight, Loader2, House } from 'lucide-react';
import Link from 'next/link';

export default function RegisterSuccessPage() {
    const router = useRouter();
    const [countdown, setCountdown] = useState(5);

    useEffect(() => {
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
        <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-bl from-accent/10 to-transparent opacity-40 -z-10" />

            <div className="max-w-md w-full mx-auto px-4 z-10 text-center">
                <div className="bg-white p-12 rounded-[40px] shadow-2xl border border-slate-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 blur-3xl rounded-full" />

                    <div className="h-24 w-24 bg-emerald-50 text-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-8 animate-bounce transition-all">
                        <CheckCircle2 className="h-12 w-12" />
                    </div>

                    <h1 className="text-3xl font-black text-primary-900 uppercase tracking-tighter mb-4">
                        Cadastro Realizado!
                    </h1>

                    <p className="text-slate-500 font-medium mb-10">
                        Bem-vindo à nossa plataforma. Sua conta foi criada com sucesso e você será redirecionado em instantes.
                    </p>

                    <div className="space-y-6">
                        <div className="flex items-center justify-center gap-3 text-slate-400 font-bold text-sm uppercase tracking-widest">
                            <Loader2 className="h-4 w-4 animate-spin text-accent" />
                            Redirecionando em {countdown}s...
                        </div>

                        <Link
                            href="/login"
                            className="bg-primary-900 text-white w-full py-5 rounded-2xl font-black text-[12px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-accent transition-all active:scale-95 shadow-xl shadow-primary-900/10"
                        >
                            Ir para Login <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </div>

                <Link href="/" className="inline-flex items-center gap-2 mt-10 text-slate-400 hover:text-primary-900 transition-colors font-bold text-sm uppercase tracking-widest">
                    <House className="h-4 w-4" /> Voltar ao Início
                </Link>
            </div>
        </div>
    );
}
