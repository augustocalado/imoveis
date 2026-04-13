'use client';

import { useEffect, useState, Suspense } from 'react';
import { supabase } from '@/lib/supabase';
import Footer from '@/components/Footer';
import {
    MapPin, Bed, Maximize2, Loader2, Building2, LayoutGrid, List, X
} from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import clsx from 'clsx';
import GlobalSearch from './GlobalSearch';
import PropertyCard from '@/components/PropertyCard';

function CatalogResults() {
    const searchParams = useSearchParams();
    const [properties, setProperties] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<'todos' | 'venda' | 'aluguel'>('todos');
    const [isVideoOpen, setIsVideoOpen] = useState(false);
    const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
    const [specs, setSpecs] = useState<any[]>([]);

    const fetchProperties = async () => {
        setIsLoading(true);
        
        // Get filters from URL
        const neighborhood = searchParams.get('neighborhood');
        const maxPrice = searchParams.get('maxPrice');
        const ref = searchParams.get('ref');
        const cat = searchParams.get('cat');

        let query = supabase
            .from('properties')
            .select('*, profiles!corretor_id(full_name)')
            .in('status', ['disponivel', 'disponível', 'Disponivel', 'Disponível', 'DISPONIVEL', 'DISPONÍVEL']);

        if (filter !== 'todos') {
            query = query.eq('type', filter);
        }

        if (ref) {
            const cleanRef = ref.trim().toUpperCase();
            const searchTerms = [
                `reference_id.ilike.%${cleanRef}%`,
                `title.ilike.%${cleanRef}%`
            ];
            if (/^\d+$/.test(cleanRef)) {
                searchTerms.push(`reference_id.ilike.%KF%${cleanRef}%`);
            }
            query = query.or(searchTerms.join(','));
        } else {
            if (neighborhood) {
                const list = neighborhood.split(',');
                query = query.in('neighborhood', list);
            }

            if (maxPrice) {
                query = query.lte('price', parseFloat(maxPrice));
            }

            if (cat) {
                query = query.ilike('category', `%${cat}%`);
            }
        }

        const { data, error } = await query.order('created_at', { ascending: false });
        if (error) console.error("Search Error:", error);
        
        setProperties(data || []);
        setIsLoading(false);

        // Fetch specs once per search
        const { data: specsData } = await supabase.from('site_settings').select('value').eq('key', 'property_specs').single();
        if (specsData && specsData.value) setSpecs(specsData.value);
        else setSpecs([
            { id: 'area', label: 'Área', field: 'area', icon: 'Maximize2', suffix: 'm²' },
            { id: 'rooms', label: 'Dorm', field: 'rooms', icon: 'Bed' },
            { id: 'suites', label: 'Suítes', field: 'suites', icon: 'BedDouble' },
            { id: 'bathrooms', label: 'Banheiros', field: 'bathrooms', icon: 'Bath' },
            { id: 'parking', label: 'Vagas', field: 'parking_spaces', icon: 'Car' }
        ]);
    };

    useEffect(() => {
        fetchProperties();
    }, [filter, searchParams]);

    return (
        <main className="min-h-screen bg-slate-50">
            {/* Hero Minimalist */}
            <div className="bg-[#1B263B] text-white pt-40 pb-32 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/20 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/2" />
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <nav className="flex items-center gap-2 text-[10px] font-bold tracking-[0.3em] text-white/40 mb-8 uppercase">
                        <Link href="/" className="hover:text-accent transition-colors">Home</Link>
                        <span>/</span>
                        <span className="text-accent">Nosso Catálogo</span>
                    </nav>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-end">
                        <div className="space-y-6">
                            <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.85] animate-in fade-in slide-in-from-bottom-8 duration-1000">
                                {searchParams.toString() ? 'Resultados da' : 'Portfólio de'} <br /> 
                                <span className="text-accent underline decoration-white/10">{searchParams.toString() ? 'Busca' : 'Imóveis'}</span>
                            </h1>
                            <p className="text-white/60 text-lg md:text-xl font-medium max-w-xl leading-relaxed">
                                {searchParams.toString() 
                                    ? 'Encontramos as melhores opções com base nos seus critérios de seleção.' 
                                    : 'Curadoria exclusiva das melhores oportunidades na Praia Grande. Onde o luxo encontra o seu novo endereço.'}
                            </p>
                        </div>
                        
                        <div className="flex flex-wrap gap-4 lg:justify-end">
                            {['todos', 'venda', 'aluguel'].map((t) => (
                                <button
                                    key={t}
                                    onClick={() => setFilter(t as any)}
                                    className={clsx(
                                        "px-8 py-4 rounded-2xl font-black text-[12px] uppercase tracking-[0.2em] transition-all border",
                                        filter === t 
                                            ? "bg-accent border-accent text-white shadow-2xl shadow-accent/20 scale-105" 
                                            : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white"
                                    )}
                                >
                                    {t === 'todos' ? 'Ver Tudo' : t === 'venda' ? 'Comprar' : 'Alugar'}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Search */}
            <div className="max-w-4xl mx-auto -mt-10 px-6 relative z-20">
                <div className="bg-white p-4 rounded-[40px] shadow-2xl border border-slate-100">
                    <GlobalSearch theme="light" />
                </div>
            </div>

            {/* Results Grid */}
            <section className="max-w-7xl mx-auto px-6 py-24">
                <div className="flex flex-col md:flex-row items-end justify-between gap-8 mb-16 px-4">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="h-2 w-10 bg-accent rounded-full" />
                            <span className="text-[10px] md:text-[12px] font-black text-slate-400 tracking-[0.4em] uppercase">
                                {properties.length} Imóveis Encontrados
                            </span>
                        </div>
                        <h2 className="text-4xl md:text-6xl font-black text-primary-900 leading-none tracking-tighter uppercase">
                            Catálogo de <span className="text-accent italic">Elite</span>
                        </h2>
                    </div>
                    <div className="hidden md:flex items-center gap-4 text-slate-300 bg-white p-3 rounded-2xl shadow-sm border border-slate-50">
                         <LayoutGrid className="h-5 w-5 text-accent" />
                         <div className="w-px h-4 bg-slate-100" />
                         <List className="h-5 w-5 hover:text-accent transition-colors cursor-pointer" />
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-40 gap-8">
                        <Loader2 className="h-16 w-16 text-accent animate-spin" />
                        <p className="text-slate-400 font-bold tracking-[0.4em] text-[10px] uppercase">Organizando o Catálogo...</p>
                    </div>
                ) : properties.length === 0 ? (
                    <div className="text-center py-40 space-y-6">
                        <Building2 className="h-20 w-20 text-slate-200 mx-auto" />
                        <h3 className="text-2xl font-black text-primary-900 tracking-tighter">Nenhum imóvel disponível para esta categoria</h3>
                        <p className="text-slate-400 font-bold text-sm uppercase">Tente alterar o filtro ou veja todos os imóveis.</p>
                        <button onClick={() => setFilter('todos')} className="text-accent font-black text-[12px] uppercase tracking-widest border-b-2 border-accent pb-1">Ver tudo</button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {properties.map((prop, i) => (
                            <PropertyCard 
                                key={prop.id} 
                                prop={prop} 
                                index={i} 
                                specs={specs}
                                onVideoClick={(url) => {
                                    setSelectedVideo(url);
                                    setIsVideoOpen(true);
                                }} 
                            />
                        ))}
                    </div>
                )}
            </section>

            {/* Video Modal */}
            {isVideoOpen && selectedVideo && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-primary-900/95 backdrop-blur-2xl" onClick={() => setIsVideoOpen(false)} />
                    <div className="relative w-full max-w-5xl aspect-video bg-black rounded-[40px] overflow-hidden shadow-3xl border border-white/10">
                        <button 
                            onClick={() => setIsVideoOpen(false)}
                            className="absolute top-6 right-6 h-12 w-12 bg-white/10 hover:bg-white text-white hover:text-primary-900 rounded-full flex items-center justify-center backdrop-blur-md transition-all z-10 border border-white/20"
                        >
                            <X className="h-6 w-6" />
                        </button>
                        <iframe
                            src={selectedVideo.includes('youtube.com') || selectedVideo.includes('youtu.be') 
                                ? `https://www.youtube.com/embed/${selectedVideo.split('v=')[1]?.split('&')[0] || selectedVideo.split('/').pop()}?autoplay=1`
                                : selectedVideo}
                            className="w-full h-full"
                            allow="autoplay; fullscreen"
                        />
                    </div>
                </div>
            )}

            {/* Video Modal */}
            {isVideoOpen && selectedVideo && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-primary-900/95 backdrop-blur-2xl" onClick={() => setIsVideoOpen(false)} />
                    <div className="relative w-full max-w-5xl aspect-video bg-black rounded-[40px] overflow-hidden shadow-3xl border border-white/10">
                        <button 
                            onClick={() => setIsVideoOpen(false)}
                            className="absolute top-6 right-6 h-12 w-12 bg-white/10 hover:bg-white text-white hover:text-primary-900 rounded-full flex items-center justify-center backdrop-blur-md transition-all z-10 border border-white/20"
                        >
                            <X className="h-6 w-6" />
                        </button>
                        <iframe
                            src={selectedVideo.includes('youtube.com') || selectedVideo.includes('youtu.be') 
                                ? `https://www.youtube.com/embed/${selectedVideo.split('v=')[1]?.split('&')[0] || selectedVideo.split('/').pop()}?autoplay=1`
                                : selectedVideo}
                            className="w-full h-full"
                            allow="autoplay; fullscreen"
                        />
                    </div>
                </div>
            )}

            <Footer />
        </main>
    );
}

export default function CatalogClient() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="h-12 w-12 text-accent animate-spin" />
            </div>
        }>
            <CatalogResults />
        </Suspense>
    );
}
