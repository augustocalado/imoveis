'use client';

import { useState, useEffect } from 'react';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { MapPin, ChevronRight, Building2, Search, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import clsx from 'clsx';

const DEFAULT_CITIES = [
    {
        name: 'Praia Grande',
        slug: 'praia-grande',
        neighborhoods: [
            'Canto do Forte', 'Boqueirão', 'Guilhermina', 'Aviação', 'Tupi',
            'Ocian', 'Mirim', 'Maracanã', 'Caiçara', 'Real', 'Flórida', 'Solemar'
        ]
    },
    {
        name: 'Santos',
        slug: 'santos',
        neighborhoods: ['Gonzaga', 'Ponta da Praia', 'Boqueirão', 'Embaré']
    }
];

export default function BairrosClient() {
    const [cities, setCities] = useState<any[]>(DEFAULT_CITIES);
    const [neighborhoodMap, setNeighborhoodMap] = useState<Record<string, { count: number, originalName: string }>>({});
    const [extraBairrosByCity, setExtraBairrosByCity] = useState<Record<string, string[]>>({});

    useEffect(() => {
        const fetchAll = async () => {
            // 1. Fetch Dynamic Cities
            const { data: settings } = await supabase.from('site_settings').select('value').eq('key', 'site_locations').single();
            const currentCities = settings?.value || DEFAULT_CITIES;
            setCities(currentCities);

            // 2. Fetch Property Counts
            const { data } = await supabase.from('properties').select('neighborhood, city');
            if (data) {
                const newMap: Record<string, { count: number, originalName: string }> = {};
                const extras: Record<string, string[]> = {};

                data.forEach(p => {
                    const cityClean = (p.city || 'Praia Grande').trim();
                    const nebClean = (p.neighborhood || '').trim();

                    if (nebClean) {
                        const key = `${cityClean.toLowerCase()}-${nebClean.toLowerCase()}`;
                        if (!newMap[key]) {
                            newMap[key] = { count: 0, originalName: nebClean };
                        }
                        newMap[key].count++;

                        // Check if it's an extra (not in dynamic list)
                        const cityMatch = currentCities.find((c: any) => c.name.toLowerCase() === cityClean.toLowerCase());
                        if (cityMatch) {
                            const isPredefined = cityMatch.neighborhoods.some((n: any) => n.toLowerCase() === nebClean.toLowerCase());
                            if (!isPredefined) {
                                if (!extras[cityMatch.slug]) extras[cityMatch.slug] = [];
                                if (!extras[cityMatch.slug].some(n => n.toLowerCase() === nebClean.toLowerCase())) {
                                    extras[cityMatch.slug].push(nebClean);
                                }
                            }
                        }
                    }
                });
                setNeighborhoodMap(newMap);
                setExtraBairrosByCity(extras);
            }
        };
        fetchAll();
    }, []);

    return (
        <main className="min-h-screen bg-slate-50 flex flex-col pt-20">
            {/* Hero Section Page */}
            <section className="bg-primary-900 pt-32 pb-20 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <img
                        src="https://images.unsplash.com/photo-1449824913935-59a10b8d2000?q=80&w=1920"
                        className="w-full h-full object-cover"
                        alt="Background"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-primary-900 to-transparent" />
                </div>

                <div className="max-w-7xl mx-auto px-4 relative z-10">
                    <div className="inline-flex items-center gap-2 bg-accent/20 border border-white/10 text-white px-4 py-1.5 rounded-full font-bold text-[10px] uppercase tracking-widest mb-6">
                        <MapPin className="h-3.5 w-3.5 text-accent" /> Navegue pela Baixada Santista
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase mb-6">Bairros e Cidades</h1>
                    <p className="text-primary-100/60 max-w-xl text-lg font-medium leading-relaxed">
                        Explore nosso catálogo de imóveis selecionados por localização. Encontre as melhores oportunidades nas principais cidades do litoral paulista.
                    </p>
                </div>
            </section>

            {/* Cities & Neighborhoods Grid */}
            <section className="py-24">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="space-y-32">
                        {cities.map((city) => (
                            <div key={city.slug} className="group">
                                <div className="flex items-center gap-4 mb-12">
                                    <div className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center shadow-lg text-accent group-hover:bg-accent group-hover:text-white transition-all transform group-hover:rotate-6">
                                        <Building2 className="h-6 w-6" />
                                    </div>
                                    <h2 className="text-3xl font-black text-primary-900 tracking-tighter uppercase">{city.name}</h2>
                                    <div className="h-[2px] flex-1 bg-gradient-to-r from-slate-200 to-transparent ml-4" />
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                    {[...city.neighborhoods, ...(extraBairrosByCity[city.slug] || [])].map((neb) => {
                                        const key = `${city.name.toLowerCase()}-${neb.toLowerCase()}`;
                                        const node = neighborhoodMap[key];
                                        const count = node?.count || 0;
                                        const displayName = node?.originalName || neb;

                                        return (
                                            <Link
                                                key={neb}
                                                href={`/imoveis?city=${city.name}&neighborhood=${encodeURIComponent(displayName)}`}
                                                className="group/box bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-accent/30 transition-all transform hover:-translate-y-1 relative overflow-hidden"
                                            >
                                                <div className="relative z-10">
                                                    <h3 className="text-[13px] font-black text-primary-900 uppercase tracking-tight mb-1 group-hover/box:text-accent transition-colors">
                                                        {displayName}
                                                    </h3>
                                                    <div className="flex items-center justify-between">
                                                        <span className={clsx(
                                                            "text-[10px] font-bold uppercase tracking-widest",
                                                            count > 0 ? "text-[#10b981]" : "text-slate-400"
                                                        )}>
                                                            {count} {count === 1 ? 'imóvel' : 'imóveis'}
                                                        </span>
                                                        <ChevronRight className="h-3 w-3 text-accent opacity-0 group-hover/box:opacity-100 -translate-x-2 group-hover/box:translate-x-0 transition-all" />
                                                    </div>
                                                </div>
                                                {count > 0 && (
                                                    <div className="absolute top-0 right-0 h-1 w-full bg-gradient-to-r from-transparent via-[#10b981]/20 to-transparent" />
                                                )}
                                                <div className="absolute -right-2 -bottom-2 opacity-[0.03] group-hover/box:opacity-[0.08] transition-opacity">
                                                    <Search className="h-12 w-12 text-primary-900" />
                                                </div>
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Call to Action */}
            <section className="pb-32 px-4">
                <div className="max-w-4xl mx-auto bg-accent p-12 rounded-[40px] relative overflow-hidden shadow-2xl shadow-accent/20">
                    <div className="absolute right-0 top-0 h-full w-1/3 bg-white/10 skew-x-[-20deg] translate-x-10" />
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10 text-white">
                        <div className="space-y-4 text-center md:text-left">
                            <h2 className="text-3xl font-black tracking-tighter uppercase">Não encontrou o que procurava?</h2>
                            <p className="font-bold text-white/80">Nossa equipe de especialistas está pronta para ajudar você a encontrar o imóvel ideal no bairro desejado.</p>
                        </div>
                        <Link
                            href="/contato"
                            className="bg-primary-900 text-white px-10 py-5 rounded-2xl font-black text-[12px] uppercase tracking-widest hover:bg-white hover:text-primary-900 transition-all flex items-center gap-3 shadow-2xl active:scale-95 whitespace-nowrap"
                        >
                            Falar com Especialista <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
