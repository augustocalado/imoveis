'use client';

import React from 'react';
import { Zap, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import clsx from 'clsx';

interface SEOTitleAssistantProps {
    title: string;
    category: string;
    neighborhood: string;
    isVisible: boolean;
}

export default function SEOTitleAssistant({ title, category, neighborhood, isVisible }: SEOTitleAssistantProps) {
    if (!isVisible) return null;

    const getAnalysis = () => {
        const t = title.trim();
        const cat = category || 'Imóvel';
        const nei = neighborhood || 'Bairro';

        if (!t) {
            return {
                message: `Dica IA: Comece com "${cat} em ${nei}". Isso ajuda o Google a te achar localmente.`,
                status: 'info',
                icon: Info
            };
        }

        if (t.length < 20) {
            return {
                message: "Título muito curto. Adicione detalhes como qts de quartos ou se tem vaga. Ex: '... com 2 Dorms e 1 Vaga'.",
                status: 'warning',
                icon: AlertCircle
            };
        }

        const hasNeighborhood = nei && t.toLowerCase().includes(nei.toLowerCase());
        if (!hasNeighborhood && nei !== 'Bairro') {
            return {
                message: `Dica de SEO: Inclua o bairro "${nei}" no título para atrair buscas locais específicas.`,
                status: 'warning',
                icon: Zap
            };
        }

        if (t.length > 70) {
            return {
                message: "Título longo demais (limite ideal: 70 caracteres). O Google pode cortar o final.",
                status: 'warning',
                icon: AlertCircle
            };
        }

        return {
            message: "Título excelente! Você usou boas palavras-chave e o tamanho está perfeito para o Google.",
            status: 'success',
            icon: CheckCircle2
        };
    };

    const analysis = getAnalysis();
    const Icon = analysis.icon;

    return (
        <div className="relative h-0 overflow-visible z-[100]">
            <div className={clsx(
                "absolute bottom-4 left-0 w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500",
                "bg-white/90 backdrop-blur-xl border p-6 rounded-[32px] shadow-2xl",
                analysis.status === 'success' ? "border-emerald-100 bg-emerald-50/50" : "border-indigo-100 bg-indigo-50/50"
            )}>
                {/* Arrow */}
                <div className="absolute -bottom-2 left-10 w-4 h-4 bg-inherit border-b border-r border-inherit rotate-45" />

                <div className="flex items-start gap-4">
                    <div className={clsx(
                        "h-10 w-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm",
                        analysis.status === 'success' ? "bg-emerald-500 text-white" : "bg-indigo-600 text-white"
                    )}>
                        <Icon className="h-5 w-5" />
                    </div>
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Assistente de SEO</span>
                            {analysis.status === 'success' && <span className="bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest">Otmizado</span>}
                        </div>
                        <p className={clsx(
                            "text-[12px] font-bold leading-relaxed",
                            analysis.status === 'success' ? "text-emerald-900" : "text-indigo-900"
                        )}>
                            {analysis.message}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
