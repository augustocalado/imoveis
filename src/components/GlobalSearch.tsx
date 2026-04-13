'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Search, MapPin, DollarSign, ChevronDown, Check, Home } from 'lucide-react';

import { useRouter, usePathname } from 'next/navigation';
import clsx from 'clsx';

export default function GlobalSearch({ onClose, theme = 'dark' }: { onClose?: () => void, theme?: 'dark' | 'light' }) {
    const router = useRouter();
    const [neighborhoods, setNeighborhoods] = useState<string[]>([]);
    const [selectedNeighborhoods, setSelectedNeighborhoods] = useState<string[]>([]);
    const [price, setPrice] = useState('');
    const [reference, setReference] = useState('');
    const [category, setCategory] = useState('');
    const [isBairroOpen, setIsBairroOpen] = useState(false);

    useEffect(() => {
        const fetchNeighborhoods = async () => {
            // First try to get from settings for a complete list
            const { data: settingsData } = await supabase
                .from('site_settings')
                .select('value')
                .eq('key', 'site_locations')
                .single();

            if (settingsData?.value) {
                const allNeighborhoods = settingsData.value.flatMap((city: any) => city.neighborhoods || []);
                const unique = Array.from(new Set(allNeighborhoods)) as string[];
                setNeighborhoods(unique.sort());
            } else {
                // Fallback to existing properties
                const { data } = await supabase
                    .from('properties')
                    .select('neighborhood')
                    .not('neighborhood', 'is', null);
                const unique = Array.from(new Set(data?.map((p: any) => p.neighborhood))) as string[];
                setNeighborhoods(unique.sort());
            }
        };
        fetchNeighborhoods();
    }, []);

    const pathname = usePathname();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const params = new URLSearchParams();
        if (selectedNeighborhoods.length > 0) params.set('neighborhood', selectedNeighborhoods.join(','));
        if (price) params.set('maxPrice', price);
        if (reference) params.set('ref', reference);
        if (category) params.set('cat', category);
        
        const targetPath = pathname === '/catalogo' ? '/catalogo' : '/imoveis';
        router.push(`${targetPath}?${params.toString()}`);
        if (onClose) onClose();
    };

    const toggleNeighborhood = (n: string) => {
        setSelectedNeighborhoods(prev =>
            prev.includes(n) ? prev.filter(item => item !== n) : [...prev, n]
        );
    };

    const isLight = theme === 'light';

    return (
        <form onSubmit={handleSearch} className={clsx(
            "flex flex-col md:flex-row items-center gap-4 p-2 rounded-[30px] w-full max-w-4xl mx-auto relative z-[100]",
            isLight ? "bg-transparent" : "bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl"
        )} role="search">
            <div className="flex-1 w-full relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-accent z-20" aria-hidden="true" />
                <input
                    type="text"
                    placeholder="Ref. do Imóvel"
                    aria-label="Referência do Imóvel"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    className={clsx(
                        "w-full p-4 pl-12 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-accent transition-all",
                        isLight ? "bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400" : "bg-white/5 border border-white/10 text-white placeholder:text-white/40"
                    )}
                />
            </div>

            <div className="flex-1 w-full relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-accent z-20" aria-hidden="true" />
                <button
                    type="button"
                    aria-label={`Selecionar bairros. ${selectedNeighborhoods.length === 0 ? 'Nenhum selecionado' : `${selectedNeighborhoods.length} selecionados`}`}
                    aria-expanded={isBairroOpen}
                    onClick={() => setIsBairroOpen(!isBairroOpen)}
                    className={clsx(
                        "w-full p-4 pl-12 pr-10 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-accent transition-all text-left flex items-center justify-between",
                        isLight ? "bg-slate-50 border border-slate-200 text-slate-900" : "bg-white/5 border border-white/10 text-white"
                    )}
                >
                    <span className={clsx("truncate", selectedNeighborhoods.length === 0 && isLight && "text-slate-400", selectedNeighborhoods.length === 0 && !isLight && "text-white/40")}>
                        {selectedNeighborhoods.length === 0 ? 'Todos os Bairros' : `${selectedNeighborhoods.length} selecionados`}
                    </span>
                    <ChevronDown className={clsx("h-4 w-4 transition-transform", isBairroOpen && "rotate-180", isLight ? "text-slate-400" : "text-white/40")} aria-hidden="true" />
                </button>

                {isBairroOpen && (
                    <>
                        <div className="fixed inset-0 z-[100]" onClick={() => setIsBairroOpen(false)} />
                        <div className={clsx(
                            "absolute top-full left-0 right-0 mt-3 border rounded-2xl shadow-2xl z-[110] max-h-64 overflow-y-auto p-4 space-y-2 custom-scrollbar animate-in fade-in slide-in-from-top-2",
                            isLight ? "bg-white border-slate-100" : "bg-primary-900 border-white/10"
                        )} role="group" aria-label="Lista de Bairros">
                            {neighborhoods.map((n) => (
                                <label key={n} className={clsx(
                                    "flex items-center gap-3 p-3 rounded-xl cursor-pointer group transition-all",
                                    isLight ? "hover:bg-slate-50 text-slate-900" : "hover:bg-white/5 text-white"
                                )}>
                                    <div className={clsx(
                                        "h-5 w-5 rounded-md border-2 flex items-center justify-center transition-all",
                                        selectedNeighborhoods.includes(n) 
                                            ? "bg-accent border-accent" 
                                            : (isLight ? "border-slate-200 group-hover:border-slate-300" : "border-white/10 group-hover:border-white/30")
                                    )}>
                                        {selectedNeighborhoods.includes(n) && <Check className="h-3 w-3 text-white" aria-hidden="true" />}
                                    </div>
                                    <input
                                        type="checkbox"
                                        className="sr-only"
                                        checked={selectedNeighborhoods.includes(n)}
                                        onChange={() => toggleNeighborhood(n)}
                                    />
                                    <span className={clsx(
                                        "text-sm font-bold uppercase tracking-widest", 
                                        selectedNeighborhoods.includes(n) 
                                            ? (isLight ? "text-slate-900" : "text-white") 
                                            : (isLight ? "text-slate-500" : "text-white/40")
                                    )}>{n}</span>
                                </label>
                            ))}
                        </div>
                    </>
                )}
            </div>

            <div className="flex-1 w-full relative">
                <Home className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-accent z-20" aria-hidden="true" />
                <select
                    value={category}
                    aria-label="Tipo do Imóvel"
                    onChange={(e) => setCategory(e.target.value)}
                    className={clsx(
                        "w-full p-4 pl-12 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-accent transition-all appearance-none cursor-pointer",
                        isLight ? "bg-slate-50 border border-slate-200 text-slate-900" : "bg-white/5 border border-white/10 text-white",
                        !category && isLight && "text-slate-400",
                        !category && !isLight && "text-white/40"
                    )}
                >
                    <option value="" className={isLight ? "bg-white text-slate-400" : "bg-primary-900"}>Tipo do Imóvel</option>
                    <option value="Apartamento" className={isLight ? "bg-white text-slate-900" : "bg-primary-900"}>Apartamento</option>
                    <option value="Casa" className={isLight ? "bg-white text-slate-900" : "bg-primary-900"}>Casa</option>
                    <option value="Casa de Condomínio" className={isLight ? "bg-white text-slate-900" : "bg-primary-900"}>Casa de Condomínio</option>
                    <option value="Sobrado" className={isLight ? "bg-white text-slate-900" : "bg-primary-900"}>Sobrado</option>
                    <option value="Sobrado de Condomínio" className={isLight ? "bg-white text-slate-900" : "bg-primary-900"}>Sobrado de Condomínio</option>
                    <option value="Kitnet" className={isLight ? "bg-white text-slate-900" : "bg-primary-900"}>Kitnet</option>
                    <option value="Terreno" className={isLight ? "bg-white text-slate-900" : "bg-primary-900"}>Terreno</option>
                    <option value="Comercial" className={isLight ? "bg-white text-slate-900" : "bg-primary-900"}>Comercial</option>
                </select>
                <ChevronDown className={clsx("absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none", isLight ? "text-slate-400" : "text-white/20")} aria-hidden="true" />
            </div>

            <div className="flex-1 w-full relative group">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-accent z-20" aria-hidden="true" />
                <select
                    value={price}
                    aria-label="Até valor máximo"
                    onChange={(e) => setPrice(e.target.value)}
                    className={clsx(
                        "w-full p-4 pl-12 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-accent transition-all appearance-none cursor-pointer",
                        isLight ? "bg-slate-50 border border-slate-200 text-slate-900" : "bg-white/5 border border-white/10 text-white",
                        !price && isLight && "text-slate-400",
                        !price && !isLight && "text-white/40"
                    )}
                >
                    <option value="" className={isLight ? "bg-white text-slate-400" : "bg-primary-900"}>Até valor</option>
                    <option value="100000" className={isLight ? "bg-white text-slate-900" : "bg-primary-900"}>Até R$ 100 Mil</option>
                    <option value="300000" className={isLight ? "bg-white text-slate-900" : "bg-primary-900"}>Até R$ 300 Mil</option>
                    <option value="500000" className={isLight ? "bg-white text-slate-900" : "bg-primary-900"}>Até R$ 500 Mil</option>
                    <option value="750000" className={isLight ? "bg-white text-slate-900" : "bg-primary-900"}>Até R$ 750 Mil</option>
                    <option value="1000000" className={isLight ? "bg-white text-slate-900" : "bg-primary-900"}>Até R$ 1 Milhão</option>
                    <option value="2000000" className={isLight ? "bg-white text-slate-900" : "bg-primary-900"}>Até R$ 2 Milhões</option>
                </select>
                <ChevronDown className={clsx("absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none", isLight ? "text-slate-400" : "text-white/20")} aria-hidden="true" />
            </div>

            <button 
                type="submit" 
                aria-label="Buscar imóveis"
                className="w-full md:w-auto h-[58px] px-8 bg-accent text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 shadow-xl shadow-accent/20"
            >
                <Search className="h-5 w-5" aria-hidden="true" />
                <span>Buscar</span>
            </button>
        </form>
    );
}
