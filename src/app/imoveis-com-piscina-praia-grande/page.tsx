
import * as React from 'react';
import { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CatalogClient from '@/components/CatalogClient';
import { Star, ShieldCheck } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Imóveis com Piscina em Praia Grande | Lazer e Conforto',
    description: 'Procurando casa ou apartamento com piscina em Praia Grande? Temos as melhores opções em condomínios com lazer completo ou casas isoladas.',
    openGraph: {
        title: 'Imóveis com Piscina em Praia Grande | Diversão Garantida',
        description: 'Encontre o imóvel ideal com área de lazer exclusiva ou compartilhada.',
    },
};

export default function PiscinaPage() {
    return (
        <main className="min-h-screen bg-white">
            <Navbar />
            <section className="pt-40 pb-20 bg-[#1B263B] overflow-hidden relative">
                 <div className="absolute inset-0 opacity-20">
                    <img src="https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?q=80&w=1920" className="w-full h-full object-cover" alt="Piscina" />
                </div>
                <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 bg-accent/20 border border-white/10 text-white px-6 py-2 rounded-full font-bold text-[10px] uppercase tracking-widest mb-6">
                        <Star className="h-4 w-4 text-accent" /> Lazer em Casa
                    </div>
                    <h1 className="text-4xl md:text-7xl font-black text-white leading-none tracking-tighter uppercase mb-6">
                        Imóveis com <span className="text-accent italic">Piscina</span>
                    </h1>
                    <p className="text-xl text-white/60 max-w-3xl mx-auto font-medium">
                        O conforto que sua família merece. Confira nossa seleção de imóveis com piscinas privativas ou áreas de lazer de resort.
                    </p>
                </div>
            </section>
            
            <section className="py-24">
                <div className="max-w-7xl mx-auto px-6">
                     <CatalogClient />
                </div>
            </section>
            
            <Footer />
        </main>
    );
}
