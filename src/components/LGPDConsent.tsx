"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Shield, X, Check, ArrowRight } from 'lucide-react';
import clsx from 'clsx';

export default function LGPDConsent() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('lgpd-consent-v1');
        if (!consent) {
            const timer = setTimeout(() => {
                setIsVisible(true);
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('lgpd-consent-v1', 'accepted');
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-4 md:bottom-6 left-4 md:left-6 right-4 md:right-6 z-[9999] animate-in slide-in-from-bottom-10 fade-in duration-700">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white/80 backdrop-blur-2xl border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-[32px] p-5 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative group">
                    {/* Decorative Elements */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#10b981]/5 blur-3xl -z-10 group-hover:bg-[#10b981]/10 transition-all duration-1000" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/5 blur-3xl -z-10" />

                    <div className="flex items-center gap-4 md:gap-5 flex-1">
                        <div className="h-12 w-12 md:h-14 md:w-14 min-w-[48px] md:min-w-[56px] rounded-2xl bg-[#1B263B] text-white flex items-center justify-center shadow-xl shadow-[#1B263B]/20">
                            <Shield className="h-6 w-6 md:h-7 md:w-7 text-[#10b981]" />
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-[11px] md:text-sm font-black text-[#1B263B] uppercase tracking-widest flex items-center gap-2">
                                Privacidade & Segurança
                                <span className="bg-[#10b981]/10 text-[#10b981] px-2 py-0.5 rounded-full text-[8px] md:text-[9px] font-black tracking-[0.2em]">LGPD</span>
                            </h4>
                            <p className="text-slate-500 text-[11px] md:text-[13px] font-medium leading-relaxed max-w-2xl">
                                Valorizamos sua privacidade! Utilizamos cookies para personalizar conteúdo. Ao clicar em "Aceitar Tudo", você concorda com nossa <Link href="/politica-de-privacidade" className="text-indigo-600 font-bold hover:underline">Política de Privacidade</Link>.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                        <Link href="/politica-de-privacidade" className="flex-1 md:flex-none">
                            <button className="w-full px-4 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl text-[10px] md:text-[11px] font-black uppercase tracking-widest text-[#1B263B] hover:bg-slate-50 transition-all border border-slate-100 flex items-center justify-center gap-2">
                                Configurações
                            </button>
                        </Link>
                        <button
                            onClick={handleAccept}
                            className="flex-[2] md:flex-none px-6 md:px-10 py-3 md:py-4 bg-[#1B263B] text-white rounded-xl md:rounded-2xl text-[10px] md:text-[11px] font-black uppercase tracking-widest shadow-xl shadow-[#1B263B]/20 hover:scale-[1.03] active:scale-95 transition-all flex items-center justify-center gap-3 group/btn whitespace-nowrap"
                        >
                            Aceitar Tudo
                            <Check className="h-4 w-4 text-[#10b981] group-hover/btn:scale-125 transition-transform" />
                        </button>
                        <button 
                            onClick={handleAccept}
                            className="h-9 w-9 md:h-10 md:w-10 min-w-[36px] md:min-w-[40px] rounded-xl bg-slate-50 text-slate-400 hover:text-red-500 transition-all flex items-center justify-center md:hidden"
                        >
                            <X className="h-4 w-4 md:h-5 md:w-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
