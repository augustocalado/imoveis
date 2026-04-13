'use client';

import React from 'react';
import { Zap, CheckCircle2, AlertCircle, Info, Sparkles } from 'lucide-react';
import clsx from 'clsx';

interface SEODescriptionAssistantProps {
    description: string;
    neighborhood: string;
    city: string;
    category: string;
    isVisible: boolean;
}

export default function SEODescriptionAssistant({ description, neighborhood, city, category, isVisible }: SEODescriptionAssistantProps) {
    if (!isVisible) return null;

    const getAnalysis = () => {
        const d = description.trim();
        const cat = category || 'Imóvel';
        const nei = neighborhood || 'Bairro';
        const cit = city || 'Praia Grande';

        let score = 0;
        const tips: string[] = [];

        // Length Analysis
        const len = d.length;
        if (len < 100) {
            score += 10;
            tips.push("Descrição muito curta. Escreva pelo menos 300 caracteres para indexar bem no Google.");
        } else if (len < 300) {
            score += 40;
            tips.push("Boa base, mas tente detalhar mais os diferenciais e o acabamento do imóvel.");
        } else if (len <= 1200) {
            score += 70;
        } else {
            score += 65;
            tips.push("Descrição longa demais (SEO aceita, mas tente ser mais direto para o leitor).");
        }

        // Keywords Analysis
        const hasNeighborhood = nei && d.toLowerCase().includes(nei.toLowerCase());
        const hasCity = cit && d.toLowerCase().includes(cit.toLowerCase());
        const hasCategory = cat && d.toLowerCase().includes(cat.toLowerCase());

        if (hasNeighborhood) score += 10;
        else if (nei !== 'Bairro' && nei !== '') tips.push(`Dica: Mencione o bairro "${nei}" no texto para buscas locais.`);

        if (hasCity) score += 5;
        else tips.push(`Dica: Cite a cidade "${cit}" para reforçar a localização.`);

        if (hasCategory) score += 5;
        
        // Formatting Analysis
        const hasBulletPoints = /[*•\-\d\.]/.test(d);
        if (hasBulletPoints) score += 5;
        else tips.push("Use tópicos (• ou -) para destacar os itens do imóvel. Facilita a leitura.");

        // CTA Analysis
        const hasCTA = /(agende|visita|contato|whatsapp|ligue|conhecer|reservar|informação)/i.test(d);
        if (hasCTA) score += 5;
        else tips.push("Adicione uma chamada para ação no final. Ex: 'Agende sua visita hoje mesmo!'");

        let status: 'info' | 'warning' | 'success' = 'info';
        if (score >= 90) status = 'success';
        else if (score >= 50) status = 'warning';

        return { score, tips, status };
    };

    const analysis = getAnalysis();

    return (
        <div className="relative h-0 overflow-visible z-[100]">
            <div className={clsx(
                "absolute bottom-4 left-0 w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500",
                "bg-white/95 backdrop-blur-xl border p-6 rounded-[32px] shadow-2xl",
                analysis.status === 'success' ? "border-emerald-100 bg-emerald-50/50" : 
                analysis.status === 'warning' ? "border-amber-100 bg-amber-50/50" : "border-slate-100 bg-white"
            )}>
                 {/* Arrow */}
                 <div className="absolute -bottom-2 left-10 w-4 h-4 bg-inherit border-b border-r border-inherit rotate-45" />

                 <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={clsx(
                                "h-10 w-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm",
                                analysis.status === 'success' ? "bg-emerald-500 text-white" : 
                                analysis.status === 'warning' ? "bg-amber-500 text-white" : "bg-slate-500 text-white"
                            )}>
                                <Sparkles className="h-5 w-5" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Análise de SEO KF-IA</span>
                                <span className={clsx(
                                    "text-lg font-black tracking-tighter",
                                    analysis.status === 'success' ? "text-emerald-900" : 
                                    analysis.status === 'warning' ? "text-amber-900" : "text-slate-900"
                                )}>
                                    {analysis.score}% de Relevância
                                </span>
                            </div>
                        </div>
                        {analysis.status === 'success' && (
                             <div className="bg-emerald-100 text-emerald-600 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">
                                Otimizado
                             </div>
                        )}
                    </div>

                    {analysis.tips.length > 0 && (
                        <div className="space-y-2 border-t border-slate-100 pt-4">
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-300">Dicas para otimizar</span>
                            <ul className="space-y-1.5">
                                {analysis.tips.map((tip, idx) => (
                                    <li key={idx} className="flex items-start gap-2 text-[11px] font-bold text-slate-600 leading-tight">
                                        <div className="h-1.5 w-1.5 rounded-full bg-slate-400 mt-1 shrink-0" />
                                        {tip}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {analysis.status === 'success' && (
                        <div className="bg-emerald-500/10 p-4 rounded-2xl">
                             <p className="text-[11px] font-bold text-emerald-800 leading-tight">
                                ✨ Excelente trabalho! Sua descrição está perfeitamente otimizada para buscadores e para converter visitantes em leads.
                            </p>
                        </div>
                    )}
                 </div>
            </div>
        </div>
    );
}
