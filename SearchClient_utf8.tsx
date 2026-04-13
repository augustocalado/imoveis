'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Footer from '@/components/Footer';
import {
    Search, SlidersHorizontal, MapPin,
    Bed, Bath, DollarSign, Loader2, ArrowRight, Maximize2, X, ChevronDown, Check, Share2, MessageSquare
} from 'lucide-react';
import Link from 'next/link';
import clsx from 'clsx';

function SearchResults() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [properties, setProperties] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [neighborhoods, setNeighborhoods] = useState<string[]>([]);
    const [isBairroOpen, setIsBairroOpen] = useState(false);

    // Initial state from URL
    const urlNeighborhoods = searchParams.get('neighborhood')?.split(',').filter(Boolean) || [];
    const [selectedBairros, setSelectedBairros] = useState<string[]>(urlNeighborhoods);
    const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
    const [type, setType] = useState(searchParams.get('type') || '');
    const [selectedCity, setSelectedCity] = useState(searchParams.get('city') || '');
    const [reference, setReference] = useState(searchParams.get('ref') || '');
    const [category, setCategory] = useState(searchParams.get('cat') || '');

    useEffect(() => {
        const fetchNeighborhoods = async () => {
            const { data } = await supabase
                .from('properties')
                .select('neighborhood')
                .not('neighborhood', 'is', null);
            const unique = Array.from(new Set(data?.map((p: any) => p.neighborhood))) as string[];
            setNeighborhoods(unique.sort());
        };
        fetchNeighborhoods();
    }, []);

    const fetchProperties = async () => {
        setIsLoading(true);
        
        let query = supabase
            .from('properties')
            .select('*, profiles!corretor_id(full_name)')
            .in('status', ['disponivel', 'dispon├¡vel', 'Disponivel', 'Dispon├¡vel', 'DISPONIVEL', 'DISPON├ìVEL']);

        // Clean up reference input
        const cleanRef = reference.trim().toUpperCase();

        if (cleanRef) {
            // When searching by reference, we often want to find that specific property
            // We'll search in reference_id, and also title/description for flexibility
            // We search for the literal string AND the string without 'KF' if they included it, 
            // or with 'KF' if they didn't.
            const searchTerms = [
                `reference_id.ilike.%${cleanRef}%`,
                `title.ilike.%${cleanRef}%`
            ];
            
            // If it's a number, also try with KF prefix
            if (/^\d+$/.test(cleanRef)) {
                searchTerms.push(`reference_id.ilike.%KF%${cleanRef}%`);
            }

            query = query.or(searchTerms.join(','));
        } else {
            // Only apply other filters if NO reference is provided
            // This makes the reference search work as an "ID lookup" which is what users expect
            if (selectedBairros.length > 0) {
                query = query.in('neighborhood', selectedBairros);
            }
            if (type) query = query.eq('type', type);
            if (maxPrice) query = query.lte('price', parseFloat(maxPrice));
            if (selectedCity) query = query.ilike('city', `%${selectedCity}%`);
            if (category) query = query.eq('category', category);
        }

        const { data } = await query.order('created_at', { ascending: false });
        setProperties(data || []);
        setIsLoading(false);
    };

    useEffect(() => {
        const urlNeighborhoods = searchParams.get('neighborhood')?.split(',').filter(Boolean) || [];
        if (JSON.stringify(selectedBairros) !== JSON.stringify(urlNeighborhoods)) {
            setSelectedBairros(urlNeighborhoods);
        }
        
        const urlMaxPrice = searchParams.get('maxPrice') || '';
        if (maxPrice !== urlMaxPrice) setMaxPrice(urlMaxPrice);
        
        const urlType = searchParams.get('type') || '';
        if (type !== urlType) setType(urlType);
        
        const urlCity = searchParams.get('city') || '';
        if (selectedCity !== urlCity) setSelectedCity(urlCity);
        
        const urlRef = searchParams.get('ref') || '';
        if (reference !== urlRef) setReference(urlRef);

        const urlCat = searchParams.get('cat') || '';
        if (category !== urlCat) setCategory(urlCat);
    }, [searchParams]);

    useEffect(() => {
        fetchProperties();
        // Update URL
        const params = new URLSearchParams(searchParams.toString());
        if (selectedBairros.length > 0) params.set('neighborhood', selectedBairros.join(','));
        else params.delete('neighborhood');

        if (maxPrice) params.set('maxPrice', maxPrice);
        else params.delete('maxPrice');

        if (type) params.set('type', type);
        else params.delete('type');

        if (selectedCity) params.set('city', selectedCity);
        else params.delete('city');

        if (reference) params.set('ref', reference);
        else params.delete('ref');

        if (category) params.set('cat', category);
        else params.delete('cat');

        router.replace(`/imoveis?${params.toString()}`, { scroll: false });
    }, [selectedBairros, maxPrice, type, selectedCity, reference, category]);

    const toggleBairro = (n: string) => {
        setSelectedBairros(prev =>
            prev.includes(n) ? prev.filter(b => b !== n) : [...prev, n]
        );
    };

    const clearFilters = () => {
        setSelectedBairros([]);
        setMaxPrice('');
        setType('');
        setCategory('');
    };

    return (
        <main className="max-w-7xl mx-auto px-6 py-32 lg:py-40">
            {/* Header Section */}
            <div className="mb-20 space-y-4">
                <nav className="flex items-center gap-2 text-[10px] font-bold tracking-[0.3em] text-slate-300 mb-6 uppercase">
                    <Link href="/" className="hover:text-accent transition-colors">Home</Link>
                    <span>/</span>
                    <span className="text-accent">Busca de Im├│veis</span>
                </nav>
                <h1 className="text-5xl md:text-7xl font-black text-[#1B263B] tracking-tighter leading-[0.9]">
                    Resultados da <br /> <span className="text-accent">Sua busca</span>
                </h1>
                <p className="text-slate-400 font-bold text-sm tracking-widest uppercase">
                    {properties.length} {properties.length === 1 ? 'im├│vel encontrado' : 'im├│veis encontrados'}
                </p>
            </div>

            {/* Filter Bar */}
            <div className="bg-[#1B263B] p-8 rounded-[40px] shadow-2xl relative mb-24 group border border-white/5">
                <div className="absolute top-0 right-0 w-80 h-80 bg-[#10b981]/10 blur-[100px] pointer-events-none group-hover:bg-[#10b981]/20 transition-all duration-1000" />

                <div className="relative z-50 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 items-end">
                    <div className="space-y-2 relative">
                        <label className="text-[10px] font-bold text-white/30 tracking-widest ml-1 uppercase">Refer├¬ncia</label>
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#10b981]" />
                            <input
                                type="text"
                                value={reference}
                                onChange={(e) => setReference(e.target.value)}
                                placeholder="C├│d. Im├│vel"
                                className="w-full bg-white/5 border border-white/10 p-4 pl-12 rounded-2xl text-white font-bold text-sm outline-none focus:ring-2 focus:ring-[#10b981]/50 transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-2 relative">
                        <label className="text-[10px] font-bold text-white/30 tracking-widest ml-1 uppercase">Bairros</label>
                        <div className="relative">
                            <button
                                onClick={() => setIsBairroOpen(!isBairroOpen)}
                                className="w-full bg-white/5 border border-white/10 p-4 pl-12 pr-10 rounded-2xl text-white font-bold text-sm outline-none focus:ring-2 focus:ring-[#10b981]/50 transition-all text-left flex items-center justify-between"
                            >
                                <span className="truncate">
                                    {selectedBairros.length === 0 ? 'Todos os Bairros' : `${selectedBairros.length} Selecionados`}
                                </span>
                                <ChevronDown className={clsx("h-4 w-4 transition-transform", isBairroOpen && "rotate-180")} />
                            </button>
                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#10b981]" />

                            {isBairroOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setIsBairroOpen(false)} />
                                    <div className="absolute top-full left-0 right-0 mt-3 bg-[#1B263B] border border-white/10 rounded-2xl shadow-2xl z-50 max-h-64 overflow-y-auto p-4 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200 custom-scrollbar">
                                        {neighborhoods.map((n) => (
                                            <label key={n} className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl cursor-pointer group transition-all">
                                                <div className={clsx(
                                                    "h-5 w-5 rounded-md border-2 flex items-center justify-center transition-all",
                                                    selectedBairros.includes(n) ? "bg-[#10b981] border-[#10b981]" : "border-white/10 group-hover:border-white/30"
                                                )}>
                                                    {selectedBairros.includes(n) && <Check className="h-3 w-3 text-white" />}
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    className="hidden"
                                                    checked={selectedBairros.includes(n)}
                                                    onChange={() => toggleBairro(n)}
                                                />
                                                <span className={clsx("text-sm font-bold tracking-widest uppercase", selectedBairros.includes(n) ? "text-white" : "text-white/40")}>{n}</span>
                                            </label>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-white/30 tracking-widest ml-1 uppercase">Valor M├íximo</label>
                        <div className="relative">
                            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#10b981]" />
                            <select
                                value={maxPrice}
                                onChange={(e) => setMaxPrice(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 p-4 pl-12 rounded-2xl text-white font-bold text-sm outline-none focus:ring-2 focus:ring-[#10b981]/50 transition-all appearance-none cursor-pointer"
                            >
                                <option value="" className="bg-[#1B263B]">Qualquer Valor</option>
                                <option value="100000" className="bg-[#1B263B]">At├® R$ 100 Mil</option>
                                <option value="300000" className="bg-[#1B263B]">At├® R$ 300 Mil</option>
                                <option value="500000" className="bg-[#1B263B]">At├® R$ 500 Mil</option>
                                <option value="750000" className="bg-[#1B263B]">At├® R$ 750 Mil</option>
                                <option value="1000000" className="bg-[#1B263B]">At├® R$ 1 Milh├úo</option>
                                <option value="2000000" className="bg-[#1B263B]">At├® R$ 2 Milh├Áes</option>
                                <option value="5000000" className="bg-[#1B263B]">At├® R$ 5 Milh├Áes</option>
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 pointer-events-none" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-white/30 tracking-widest ml-1 uppercase">Tipo de Im├│vel</label>
                        <div className="relative">
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 p-4 pl-4 rounded-2xl text-white font-bold text-sm outline-none focus:ring-2 focus:ring-[#10b981]/50 transition-all appearance-none cursor-pointer"
                            >
                                <option value="" className="bg-[#1B263B]">Todos os Tipos</option>
                                <option value="Casa" className="bg-[#1B263B]">Casa</option>
                                <option value="Apartamento" className="bg-[#1B263B]">Apartamento</option>
                                <option value="Kitnet" className="bg-[#1B263B]">Kitnet</option>
                                <option value="Terreno" className="bg-[#1B263B]">Terreno</option>
                                <option value="Comercial" className="bg-[#1B263B]">Comercial</option>
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 pointer-events-none" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-white/30 tracking-widest ml-1 uppercase">Finalidade</label>
                        <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 h-[58px]">
                            {['', 'venda', 'aluguel'].map((t) => (
                                <button
                                    key={t}
                                    onClick={() => setType(t)}
                                    className={clsx(
                                        "flex-1 rounded-xl text-[10px] font-bold tracking-widest transition-all uppercase",
                                        type === t ? "bg-[#10b981] text-white shadow-lg shadow-[#10b981]/20" : "text-white/40 hover:text-white"
                                    )}
                                >
                                    {t === '' ? 'Todos' : t === 'venda' ? 'Comprar' : 'Alugar'}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={clearFilters}
                        className="h-[58px] bg-white/5 hover:bg-red-500/10 hover:text-red-500 text-white/40 border border-white/10 rounded-2xl text-[10px] font-bold tracking-widest transition-all flex items-center justify-center gap-3 group uppercase"
                    >
                        <X className="h-4 w-4 group-hover:rotate-90 transition-transform" />
                        Limpar Filtros
                    </button>
                </div>
            </div>

            {/* Content Section */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-40 gap-8">
                    <div className="relative">
                        <div className="h-20 w-20 border-4 border-slate-50 border-t-[#10b981] rounded-full animate-spin" />
                        <div className="h-20 w-20 border-4 border-[#10b981]/10 rounded-full absolute inset-0" />
                    </div>
                    <p className="text-slate-300 font-bold tracking-[0.4em] text-[10px] animate-pulse uppercase">Buscando melhores op├º├Áes...</p>
                </div>
            ) : properties.length === 0 ? (
                <div className="bg-[#f8fafc] p-24 rounded-[60px] text-center space-y-8 border border-slate-100">
                    <div className="h-20 w-20 bg-white rounded-full flex items-center justify-center mx-auto shadow-xl">
                        <Search className="h-8 w-8 text-slate-200" />
                    </div>
                    <h3 className="text-3xl font-black tracking-tighter text-[#1B263B]">Nenhum im├│vel encontrado</h3>
                    <p className="text-slate-400 font-bold text-sm max-w-sm mx-auto uppercase">Ajuste os filtros de bairro ou valor para ver mais resultados.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {properties.map((prop, i) => (
                        <Link key={prop.id} href={`/imovel/${prop.slug || prop.id}`} className="group relative block animate-in fade-in slide-in-from-bottom-5 duration-700" style={{ animationDelay: `${i * 100}ms` }}>
                            <div className="space-y-6">
                                <div className="relative aspect-[4/5] rounded-[50px] overflow-hidden shadow-2xl transition-transform duration-700 group-hover:-translate-y-4">
                                    <img
                                        src={prop.images?.[0] || 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&q=80&w=800'}
                                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                                        alt={prop.title}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#1B263B]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-10 flex items-end">
                                        <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-3xl w-full flex justify-between items-center text-white">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[10px] font-bold tracking-widest text-[#10b981] uppercase">Valor do Ativo</span>
                                                <span className="text-xl font-black tracking-tighter">{prop.price?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                                            </div>
                                            <div className="h-10 w-10 rounded-xl bg-accent flex items-center justify-center">
                                                <ArrowRight className="h-5 w-5" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="absolute top-8 left-8 flex flex-col gap-3">
                                        <span className="bg-white px-4 py-2 rounded-xl text-[#1B263B] text-[10px] font-bold tracking-widest shadow-xl uppercase">
                                            {prop.type === 'venda' ? 'Compra' : 'Aluguel'}
                                        </span>
                                        {prop.is_featured && (
                                            <span className="bg-accent text-white px-4 py-2 rounded-xl text-[10px] font-bold tracking-widest shadow-xl uppercase">Exclusivo</span>
                                        )}
                                    </div>

                                    {/* Action Buttons Overlay */}
                                </div>

                                <div className="px-4 space-y-4">
                                    <h3 className="text-xl md:text-2xl font-bold tracking-tight text-[#1B263B] group-hover:text-accent transition-colors truncate">
                                        {prop.category || 'Apartamento'} no {prop.neighborhood || 'Praia Grande'}
                                    </h3>
                                    <div className="flex items-center justify-between text-slate-400 font-bold text-xs tracking-widest whitespace-nowrap overflow-hidden uppercase">
                                        <div className="flex items-center gap-2">
                                            <MapPin className="h-4 w-4 text-accent" />
                                            <span className="truncate max-w-[150px]">{prop.neighborhood}, {prop.city}</span>
                                        </div>
                                        <span className="text-slate-400 font-bold shrink-0">Ref: {prop.reference_id}</span>
                                    </div>

                                    <div className="flex items-center gap-6 pt-4 border-t border-slate-100">
                                        <div className="flex items-center gap-2">
                                            <Bed className="h-4 w-4 text-slate-200" />
                                            <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">{prop.rooms} Dorms</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Maximize2 className="h-4 w-4 text-slate-200" />
                                            <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">{prop.area}m┬▓</span>
                                        </div>
                                    </div>
                                    <div className="pt-6 mt-2">
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                const url = `${window.location.origin}/imovel/${prop.slug}`;
                                                const message = `Confira este im├│vel: ${prop.title} - ${url}`;
                                                window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
                                            }}
                                            className="w-full flex items-center justify-center gap-2 bg-[#F2FBF9] text-[#10b981] py-4 rounded-[24px] font-black text-[10px] uppercase tracking-widest hover:bg-[#10b981] hover:text-white transition-all shadow-sm group/share"
                                        >
                                            <MessageSquare className="h-4 w-4 fill-current group-hover/share:rotate-12 transition-transform" /> Compartilhe no WhatsApp
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </main>
    );
}

export default function SearchClient() {
    return (
        <div className="min-h-screen bg-white">
            <Suspense fallback={
                <div className="min-h-screen flex items-center justify-center">
                    <Loader2 className="h-12 w-12 text-accent animate-spin" />
                </div>
            }>
                <SearchResults />
            </Suspense>
            <Footer />
        </div>
    );
}
