
import * as React from 'react';
import { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CatalogClient from '@/components/CatalogClient';
import { Waves, Star, ShieldCheck } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Apartamento Frente Mar em Praia Grande | Melhores Opções com Vista',
    description: 'Os melhores apartamentos frente ao mar em Praia Grande estão aqui. Viva com o pé na areia nos bairros mais nobres da cidade. Confira as ofertas.',
    openGraph: {
        title: 'Apartamento Frente Mar em Praia Grande | Vista Privilegiada',
        description: 'Catálogo exclusivo de imóveis pé na areia em Praia Grande SP.',
    },
};

export default function FrenteMarPage() {
    return (
        <main className="min-h-screen bg-white">
            <Navbar />
            <section className="pt-40 pb-20 bg-primary-900 overflow-hidden relative">
                 <div className="absolute inset-0 opacity-20">
                    <img src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1920" className="w-full h-full object-cover" alt="Frente Mar" />
                </div>
                <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 bg-accent/20 border border-white/10 text-white px-6 py-2 rounded-full font-bold text-[10px] uppercase tracking-widest mb-6">
                        <Waves className="h-4 w-4 text-accent" /> Exclusividade Pé na Areia
                    </div>
                    <h1 className="text-4xl md:text-7xl font-black text-white leading-none tracking-tighter uppercase mb-6">
                        Apartamentos <span className="text-accent italic">Frente Mar</span>
                    </h1>
                    <p className="text-xl text-white/60 max-w-3xl mx-auto font-medium">
                        O privilégio de acordar todos os dias com a brisa do mar. Selecionamos as melhores unidades com vista total para o oceano.
                    </p>
                </div>
            </section>
            
            <section className="py-24">
                <div className="max-w-7xl mx-auto px-6">
                     {/* Aqui passaremos filtros para o CatalogClient futuramente se necessário, 
                         por enquanto ele usa os searchParams da URL */}
                     <CatalogClient />
                </div>
            </section>
            
            <Footer />
        </main>
    );
}
