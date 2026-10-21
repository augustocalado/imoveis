'use client';

import { Suspense } from 'react';
import GlobalSearch from '@/components/GlobalSearch';

export default function SearchBanner() {
    return (
        <section className="py-16 bg-[#1B263B] relative overflow-hidden">
            {/* Background glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-accent/10 rounded-full blur-[100px]" />

            <div className="max-w-5xl mx-auto px-6 relative z-10">
                <div className="text-center mb-8">
                    <p className="text-accent font-black text-[10px] uppercase tracking-[0.4em] mb-2">
                        Busca de Imóveis
                    </p>
                    <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                        Encontre o imóvel ideal em Praia Grande
                    </h2>
                </div>

                <div className="bg-[#151D2A]/90 backdrop-blur-2xl p-6 border border-white/20 rounded-[36px] shadow-2xl shadow-black/60">
                    <Suspense fallback={null}>
                        <GlobalSearch variant="card" />
                    </Suspense>
                </div>
            </div>
        </section>
    );
}
