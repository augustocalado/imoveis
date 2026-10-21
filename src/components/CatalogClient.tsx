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
import { getRawNeighborhoodVariants } from '@/utils/neighborhood';

function CatalogResults() {
    const searchParams = useSearchParams();
    const [properties, setProperties] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(false);
    const [filter, setFilter] = useState<'todos' | 'venda' | 'aluguel'>('todos');
    const [isVideoOpen, setIsVideoOpen] = useState(false);
    const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
    const [specs, setSpecs] = useState<any[]>([]);

    const PAGE_SIZE = 36;

    const buildQuery = () => {
        const neighborhood = searchParams.get('neighborhood');
        const maxPrice = searchParams.get('maxPrice');
        const ref = searchParams.get('ref');
        const cat = searchParams.get('cat');
        const rooms = searchParams.get('rooms');
        const parking = searchParams.get('parking');
        const elevator = searchParams.get('elevator');
        const furnished = searchParams.get('furnished');
        const seaView = searchParams.get('sea_view');

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
                const allVariants = getRawNeighborhoodVariants(list);
                query = query.in('neighborhood', allVariants);
            }

            if (maxPrice) {
                query = query.lte('price', parseFloat(maxPrice));
            }

            if (cat) {
                const catList = cat.split(',');
                if (catList.length === 1) {
                    query = query.eq('category', catList[0]);
                } else {
                    query = query.in('category', catList);
                }
            }

            if (rooms) {
                const roomList = rooms.split(',').map(r => parseInt(r));
                const has4Plus = roomList.includes(4);
                const exactRooms = roomList.filter(r => r < 4);

                if (has4Plus && exactRooms.length > 0) {
                    const conditions = [
                        ...exactRooms.map(r => `rooms.eq.${r}`),
                        'rooms.gte.4'
                    ].join(',');
                    query = query.or(conditions);
                } else if (has4Plus) {
                    query = query.gte('rooms', 4);
                } else if (exactRooms.length === 1) {
                    query = query.eq('rooms', exactRooms[0]);
                } else if (exactRooms.length > 1) {
                    query = query.in('rooms', exactRooms);
                }
            }

            if (parking) {
                const pList = parking.split(',').map(p => parseInt(p));
                const has5Plus = pList.includes(5);
                const exactP = pList.filter(p => p < 5);

                if (has5Plus && exactP.length > 0) {
                    const conditions = [
                        ...exactP.map(p => `parking_spaces.eq.${p}`),
                        'parking_spaces.gte.5'
                    ].join(',');
                    query = query.or(conditions);
                } else if (has5Plus) {
                    query = query.gte('parking_spaces', 5);
                } else if (exactP.length === 1) {
                    query = query.eq('parking_spaces', exactP[0]);
                } else if (exactP.length > 1) {
                    query = query.in('parking_spaces', exactP);
                }
            }

            if (elevator === 'true' || elevator === 'sim') {
                query = query.or('features.cs.{"Elevador"},features.cs.{"Elevador Social"},features.cs.{"Elevador de Serviço"},title.ilike.%elevador%,description.ilike.%elevador%');
            }

            if (furnished === 'sim') {
                query = query.or('features.cs.{"Mobiliado"},features.cs.{"Semi-Mobiliado"},features.cs.{"Móveis Planejados"},title.ilike.%mobiliado%,description.ilike.%mobiliado%');
            } else if (furnished === 'nao') {
                query = query.not('features', 'cs', '{"Mobiliado"}');
            }

            if (seaView) {
                const list = seaView.split(',');
                const conditions: string[] = [];
                if (list.includes('beira_mar')) {
                    conditions.push('features.cs.{"Frente mar"}', 'title.ilike.%beira mar%', 'title.ilike.%frente mar%', 'description.ilike.%beira mar%', 'description.ilike.%frente mar%');
                }
                if (list.includes('lateral_mar')) {
                    conditions.push('title.ilike.%lateral mar%', 'title.ilike.%lateral ao mar%', 'description.ilike.%lateral mar%', 'description.ilike.%lateral ao mar%');
                }
                if (list.includes('vista_mar')) {
                    conditions.push('features.cs.{"Vista para o mar"}', 'features.cs.{"Vista total para o mar"}', 'title.ilike.%vista mar%', 'title.ilike.%vista para o mar%', 'description.ilike.%vista para o mar%');
                }
                if (conditions.length > 0) {
                    query = query.or(conditions.join(','));
                }
            }
        }

        return query.order('created_at', { ascending: false });
    };

    const fetchProperties = async () => {
        setIsLoading(true);

        const { data, error } = await buildQuery().range(0, PAGE_SIZE - 1);
        if (error) console.error("Search Error:", error);

        const list = data || [];
        setProperties(list);
        setHasMore(list.length === PAGE_SIZE);
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

    const loadMore = async () => {
        if (isLoadingMore || !hasMore) return;
        setIsLoadingMore(true);

        const from = properties.length;
        const to = from + PAGE_SIZE - 1;

        const { data, error } = await buildQuery().range(from, to);
        if (error) {
            console.error("Load More Error:", error);
        } else {
            const nextBatch = data || [];
            setProperties(prev => [...prev, ...nextBatch]);
            setHasMore(nextBatch.length === PAGE_SIZE);
        }
        setIsLoadingMore(false);
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

                {hasMore && !isLoading && (
                    <div className="mt-16 text-center">
                        <button
                            onClick={loadMore}
                            disabled={isLoadingMore}
                            className="bg-primary-900 text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.25em] hover:bg-accent transition-all shadow-xl shadow-primary-900/10 active:scale-95 disabled:opacity-50 inline-flex items-center gap-3"
                        >
                            {isLoadingMore ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin text-accent" />
                                    <span>Carregando Mais...</span>
                                </>
                            ) : (
                                <span>Carregar Mais Imóveis</span>
                            )}
                        </button>
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
