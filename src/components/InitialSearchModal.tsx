'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, usePathname } from 'next/navigation';
import { 
    Search, MapPin, DollarSign, ChevronDown, Check, Home, Bed, Hash, 
    X, Sparkles, SlidersHorizontal, ArrowRight 
} from 'lucide-react';
import clsx from 'clsx';
import { normalizeNeighborhoodList } from '@/utils/neighborhood';

export interface PopupSearchConfig {
    enabled: boolean;
    frequency: 'once' | 'always';
    target_pages: 'all' | 'specific';
    specific_pages: string[];
    delay_seconds: number;
    title?: string;
    subtitle?: string;
}

const DEFAULT_CONFIG: PopupSearchConfig = {
    enabled: true,
    frequency: 'once',
    target_pages: 'all',
    specific_pages: ['/', '/catalogo', '/imoveis'],
    delay_seconds: 1,
    title: 'O que você procura hoje?',
    subtitle: 'Encontre os melhores imóveis em Praia Grande com busca rápida personalizada'
};

export default function InitialSearchModal() {
    const router = useRouter();
    const pathname = usePathname();

    const [isOpen, setIsOpen] = useState(false);
    const [config, setConfig] = useState<PopupSearchConfig>(DEFAULT_CONFIG);
    const [isLoaded, setIsLoaded] = useState(false);

    // Form state
    const [reference, setReference] = useState('');
    const [selectedNeighborhoods, setSelectedNeighborhoods] = useState<string[]>([]);
    const [category, setCategory] = useState<string[]>([]);
    const [rooms, setRooms] = useState<string[]>([]);
    const [selectedPrice, setSelectedPrice] = useState<string>('');

    // Dropdowns inside modal
    const [isBairroOpen, setIsBairroOpen] = useState(false);
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);
    const [isRoomsOpen, setIsRoomsOpen] = useState(false);
    const [isPriceOpen, setIsPriceOpen] = useState(false);
    const [neighborhoods, setNeighborhoods] = useState<string[]>([]);

    const categoriesList = [
        'Apartamento', 'Cobertura', 'Casa', 'Casa de Condomínio',
        'Sobrado', 'Sobrado de Condomínio', 'Kitnet', 'Terreno', 'Comercial'
    ];

    const roomsList = [
        { value: '1', label: '1 Dormitório' },
        { value: '2', label: '2 Dormitórios' },
        { value: '3', label: '3 Dormitórios' },
        { value: '4', label: '4+ Dormitórios' },
    ];

    const pricesList = [
        { value: '150000',  label: 'Até R$ 150 Mil' },
        { value: '250000',  label: 'Até R$ 250 Mil' },
        { value: '350000',  label: 'Até R$ 350 Mil' },
        { value: '500000',  label: 'Até R$ 500 Mil' },
        { value: '750000',  label: 'Até R$ 750 Mil' },
        { value: '1000000', label: 'Até R$ 1 Milhão' },
        { value: '1500000', label: 'Até R$ 1,5 Milhão' },
        { value: '2000000', label: 'Até R$ 2 Milhões' },
        { value: '3000000', label: 'Até R$ 3 Milhões' },
        { value: '5000000', label: 'Até R$ 5 Milhões' },
    ];

    // Fetch neighborhoods for select
    useEffect(() => {
        const fetchNeighborhoods = async () => {
            try {
                const { data } = await supabase
                    .from('properties')
                    .select('neighborhood')
                    .in('status', ['disponivel', 'disponível', 'Disponivel', 'Disponível', 'DISPONIVEL', 'DISPONÍVEL'])
                    .not('neighborhood', 'is', null);
                const { unique } = normalizeNeighborhoodList(data?.map((p: any) => p.neighborhood) || []);
                setNeighborhoods(unique);
            } catch (e) {
                console.error('Error fetching neighborhoods:', e);
            }
        };
        fetchNeighborhoods();
    }, []);

    // Listen to manual open trigger (e.g. preview from admin or navbar)
    useEffect(() => {
        const handleManualOpen = () => {
            setIsOpen(true);
        };
        window.addEventListener('open-search-popup', handleManualOpen);
        return () => window.removeEventListener('open-search-popup', handleManualOpen);
    }, []);

    // Load configuration & determine whether to open
    useEffect(() => {
        // Do not display on internal/auth pages
        if (!pathname || 
            pathname.startsWith('/admin') || 
            pathname.startsWith('/corretor') || 
            pathname.startsWith('/cliente') ||
            pathname.startsWith('/login') ||
            pathname.startsWith('/cadastro')) {
            return;
        }

        let isMounted = true;

        const checkAndOpen = async () => {
            try {
                const { data } = await supabase
                    .from('site_settings')
                    .select('value')
                    .eq('key', 'popup_search_config')
                    .maybeSingle();

                const activeConfig: PopupSearchConfig = data?.value 
                    ? { ...DEFAULT_CONFIG, ...data.value } 
                    : DEFAULT_CONFIG;

                if (!isMounted) return;
                setConfig(activeConfig);
                setIsLoaded(true);

                // 1. Is enabled?
                if (!activeConfig.enabled) {
                    return;
                }

                // 2. Check target pages
                if (activeConfig.target_pages === 'specific') {
                    const pages = activeConfig.specific_pages || [];
                    const isTarget = pages.some(p => {
                        if (p === '/' && pathname === '/') return true;
                        if (p !== '/' && pathname.startsWith(p)) return true;
                        return false;
                    });
                    if (!isTarget) return;
                }

                // 3. Check frequency
                if (activeConfig.frequency === 'once') {
                    const alreadySeen = sessionStorage.getItem('kf_popup_search_seen');
                    if (alreadySeen) return;
                }

                // 4. Open with configured delay
                const delayMs = (activeConfig.delay_seconds ?? 1) * 1000;
                const timer = setTimeout(() => {
                    if (isMounted) {
                        setIsOpen(true);
                        if (activeConfig.frequency === 'once') {
                            sessionStorage.setItem('kf_popup_search_seen', 'true');
                        }
                    }
                }, Math.max(delayMs, 100));

                return () => clearTimeout(timer);
            } catch (err) {
                console.error('Error loading popup config:', err);
            }
        };

        checkAndOpen();

        return () => {
            isMounted = false;
        };
    }, [pathname]);

    // Handle ESC key to close
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                closeAllDropdowns();
                setIsOpen(false);
            }
        };
        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
        }
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen]);

    const closeAllDropdowns = () => {
        setIsBairroOpen(false);
        setIsCategoryOpen(false);
        setIsRoomsOpen(false);
        setIsPriceOpen(false);
    };

    const toggle = (setter: React.Dispatch<React.SetStateAction<string[]>>, value: string) => {
        setter(prev => prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]);
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const params = new URLSearchParams();

        if (selectedNeighborhoods.length > 0) {
            params.set('neighborhood', selectedNeighborhoods.join(','));
        }
        if (selectedPrice) {
            params.set('maxPrice', selectedPrice);
        }
        if (reference.trim()) {
            params.set('ref', reference.trim());
        }
        if (category.length > 0) {
            params.set('cat', category.join(','));
        }
        if (rooms.length > 0) {
            params.set('rooms', rooms.join(','));
        }

        const targetPath = pathname === '/catalogo' ? '/catalogo' : '/imoveis';
        const queryStr = params.toString();
        router.push(queryStr ? `${targetPath}?${queryStr}` : targetPath);
        setIsOpen(false);
    };

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 bg-primary-900/80 backdrop-blur-md animate-in fade-in duration-300 overflow-y-auto"
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    closeAllDropdowns();
                    setIsOpen(false);
                }
            }}
            role="dialog"
            aria-modal="true"
            aria-label="Filtro de busca inicial de imóveis"
        >
            <div 
                className="bg-white w-full max-w-4xl rounded-[36px] sm:rounded-[44px] shadow-2xl relative animate-in zoom-in-95 duration-300 border border-slate-100 overflow-visible my-auto text-slate-800"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={() => setIsOpen(false)}
                    aria-label="Fechar busca"
                    className="absolute top-6 right-6 sm:top-8 sm:right-8 h-11 w-11 rounded-2xl bg-slate-100/80 hover:bg-red-50 text-slate-500 hover:text-red-500 transition-all flex items-center justify-center border border-slate-200 z-30 group shadow-sm active:scale-95"
                >
                    <X className="h-5 w-5 transition-transform group-hover:rotate-90" />
                </button>

                <div className="p-6 sm:p-10 md:p-12">
                    {/* Header */}
                    <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
                        <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/20 text-accent px-4 py-1.5 rounded-full font-extrabold text-[11px] uppercase tracking-[0.2em] mb-4">
                            <Sparkles className="h-3.5 w-3.5" />
                            Encontre seu Imóvel
                        </div>
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-primary-900 tracking-tight leading-tight">
                            {config.title || 'O que você procura hoje?'}
                        </h2>
                        <p className="text-slate-500 text-sm sm:text-base font-medium mt-2 leading-relaxed">
                            {config.subtitle || 'Preencha os campos abaixo para encontrarmos a melhor oportunidade para você.'}
                        </p>
                    </div>

                    {/* Search Form */}
                    <form onSubmit={handleSearch} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* Referência / Código */}
                            <div className="relative">
                                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-400 mb-1.5 ml-1">
                                    Código do Imóvel
                                </label>
                                <div className="relative">
                                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-accent pointer-events-none" />
                                    <input
                                        type="text"
                                        placeholder="Ex: AP0123"
                                        value={reference}
                                        onChange={(e) => setReference(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 focus:border-accent p-3.5 pl-11 rounded-2xl font-bold text-sm text-slate-900 outline-none focus:ring-2 focus:ring-accent/20 transition-all placeholder:text-slate-400"
                                    />
                                </div>
                            </div>

                            {/* Bairro Dropdown */}
                            <div className="relative">
                                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-400 mb-1.5 ml-1">
                                    Bairro(s)
                                </label>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsBairroOpen(!isBairroOpen);
                                        setIsCategoryOpen(false);
                                        setIsRoomsOpen(false);
                                        setIsPriceOpen(false);
                                    }}
                                    className="w-full bg-slate-50 border border-slate-200 p-3.5 pl-11 pr-10 rounded-2xl font-bold text-sm text-left flex items-center justify-between text-slate-900 focus:ring-2 focus:ring-accent/20 relative"
                                >
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-accent pointer-events-none" />
                                    <span className={clsx('truncate', selectedNeighborhoods.length === 0 && 'text-slate-400 font-normal')}>
                                        {selectedNeighborhoods.length === 0 ? 'Todos os Bairros' : `${selectedNeighborhoods.length} bairro(s)`}
                                    </span>
                                    <ChevronDown className={clsx('h-4 w-4 text-slate-400 transition-transform flex-shrink-0', isBairroOpen && 'rotate-180')} />
                                </button>

                                {isBairroOpen && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setIsBairroOpen(false)} />
                                        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 p-3 max-h-60 overflow-y-auto space-y-1">
                                            {neighborhoods.length > 0 ? (
                                                neighborhoods.map((n) => {
                                                    const checked = selectedNeighborhoods.includes(n);
                                                    return (
                                                        <label key={n} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors">
                                                            <div className={clsx('h-4 w-4 rounded border flex items-center justify-center transition-all', checked ? 'bg-accent border-accent text-white' : 'border-slate-300')}>
                                                                {checked && <Check className="h-3 w-3 stroke-[3]" />}
                                                            </div>
                                                            <input type="checkbox" className="sr-only" checked={checked} onChange={() => toggle(setSelectedNeighborhoods, n)} />
                                                            <span className={clsx('text-xs font-bold', checked ? 'text-slate-900' : 'text-slate-600')}>{n}</span>
                                                        </label>
                                                    );
                                                })
                                            ) : (
                                                <p className="text-xs text-slate-400 p-2 text-center">Nenhum bairro encontrado</p>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Tipo do Imóvel */}
                            <div className="relative">
                                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-400 mb-1.5 ml-1">
                                    Tipo do Imóvel
                                </label>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsCategoryOpen(!isCategoryOpen);
                                        setIsBairroOpen(false);
                                        setIsRoomsOpen(false);
                                        setIsPriceOpen(false);
                                    }}
                                    className="w-full bg-slate-50 border border-slate-200 p-3.5 pl-11 pr-10 rounded-2xl font-bold text-sm text-left flex items-center justify-between text-slate-900 focus:ring-2 focus:ring-accent/20 relative"
                                >
                                    <Home className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-accent pointer-events-none" />
                                    <span className={clsx('truncate', category.length === 0 && 'text-slate-400 font-normal')}>
                                        {category.length === 0 ? 'Qualquer tipo' : `${category.length} tipo(s)`}
                                    </span>
                                    <ChevronDown className={clsx('h-4 w-4 text-slate-400 transition-transform flex-shrink-0', isCategoryOpen && 'rotate-180')} />
                                </button>

                                {isCategoryOpen && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setIsCategoryOpen(false)} />
                                        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 p-3 max-h-60 overflow-y-auto space-y-1">
                                            {categoriesList.map((cat) => {
                                                const checked = category.includes(cat);
                                                return (
                                                    <label key={cat} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors">
                                                        <div className={clsx('h-4 w-4 rounded border flex items-center justify-center transition-all', checked ? 'bg-accent border-accent text-white' : 'border-slate-300')}>
                                                            {checked && <Check className="h-3 w-3 stroke-[3]" />}
                                                        </div>
                                                        <input type="checkbox" className="sr-only" checked={checked} onChange={() => toggle(setCategory, cat)} />
                                                        <span className={clsx('text-xs font-bold', checked ? 'text-slate-900' : 'text-slate-600')}>{cat}</span>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Dormitórios */}
                            <div className="relative">
                                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-400 mb-1.5 ml-1">
                                    Dormitórios
                                </label>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsRoomsOpen(!isRoomsOpen);
                                        setIsBairroOpen(false);
                                        setIsCategoryOpen(false);
                                        setIsPriceOpen(false);
                                    }}
                                    className="w-full bg-slate-50 border border-slate-200 p-3.5 pl-11 pr-10 rounded-2xl font-bold text-sm text-left flex items-center justify-between text-slate-900 focus:ring-2 focus:ring-accent/20 relative"
                                >
                                    <Bed className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-accent pointer-events-none" />
                                    <span className={clsx('truncate', rooms.length === 0 && 'text-slate-400 font-normal')}>
                                        {rooms.length === 0 ? 'Indiferente' : `${rooms.length} selecionado(s)`}
                                    </span>
                                    <ChevronDown className={clsx('h-4 w-4 text-slate-400 transition-transform flex-shrink-0', isRoomsOpen && 'rotate-180')} />
                                </button>

                                {isRoomsOpen && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setIsRoomsOpen(false)} />
                                        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 p-3 max-h-60 overflow-y-auto space-y-1">
                                            {roomsList.map(({ value, label }) => {
                                                const checked = rooms.includes(value);
                                                return (
                                                    <label key={value} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors">
                                                        <div className={clsx('h-4 w-4 rounded border flex items-center justify-center transition-all', checked ? 'bg-accent border-accent text-white' : 'border-slate-300')}>
                                                            {checked && <Check className="h-3 w-3 stroke-[3]" />}
                                                        </div>
                                                        <input type="checkbox" className="sr-only" checked={checked} onChange={() => toggle(setRooms, value)} />
                                                        <span className={clsx('text-xs font-bold', checked ? 'text-slate-900' : 'text-slate-600')}>{label}</span>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Valor Máximo */}
                            <div className="relative sm:col-span-2 lg:col-span-2">
                                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-400 mb-1.5 ml-1">
                                    Valor Máximo
                                </label>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsPriceOpen(!isPriceOpen);
                                        setIsBairroOpen(false);
                                        setIsCategoryOpen(false);
                                        setIsRoomsOpen(false);
                                    }}
                                    className="w-full bg-slate-50 border border-slate-200 p-3.5 pl-11 pr-10 rounded-2xl font-bold text-sm text-left flex items-center justify-between text-slate-900 focus:ring-2 focus:ring-accent/20 relative"
                                >
                                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-accent pointer-events-none" />
                                    <span className={clsx('truncate', !selectedPrice && 'text-slate-400 font-normal')}>
                                        {selectedPrice 
                                            ? pricesList.find(p => p.value === selectedPrice)?.label || `Até R$ ${Number(selectedPrice).toLocaleString('pt-BR')}`
                                            : 'Sem limite de valor'}
                                    </span>
                                    <ChevronDown className={clsx('h-4 w-4 text-slate-400 transition-transform flex-shrink-0', isPriceOpen && 'rotate-180')} />
                                </button>

                                {isPriceOpen && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setIsPriceOpen(false)} />
                                        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 p-3 max-h-60 overflow-y-auto space-y-1">
                                            <button
                                                type="button"
                                                onClick={() => { setSelectedPrice(''); setIsPriceOpen(false); }}
                                                className={clsx('w-full text-left p-2.5 rounded-xl text-xs font-bold transition-colors flex items-center justify-between', !selectedPrice ? 'bg-accent/10 text-accent' : 'hover:bg-slate-50 text-slate-600')}
                                            >
                                                <span>Sem limite de valor</span>
                                                {!selectedPrice && <Check className="h-3.5 w-3.5" />}
                                            </button>
                                            {pricesList.map(({ value, label }) => {
                                                const active = selectedPrice === value;
                                                return (
                                                    <button
                                                        key={value}
                                                        type="button"
                                                        onClick={() => { setSelectedPrice(value); setIsPriceOpen(false); }}
                                                        className={clsx('w-full text-left p-2.5 rounded-xl text-xs font-bold transition-colors flex items-center justify-between', active ? 'bg-accent/10 text-accent' : 'hover:bg-slate-50 text-slate-600')}
                                                    >
                                                        <span>{label}</span>
                                                        {active && <Check className="h-3.5 w-3.5" />}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* CTA Buttons */}
                        <div className="pt-4 flex flex-col sm:flex-row items-center gap-3">
                            <button
                                type="submit"
                                className="w-full sm:flex-1 py-4 px-8 bg-accent hover:bg-accent-hover text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-accent/25 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 group"
                            >
                                <Search className="h-5 w-5 transition-transform group-hover:scale-110" />
                                <span>Buscar Imóveis</span>
                                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </button>

                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="w-full sm:w-auto py-4 px-6 text-slate-400 hover:text-slate-700 font-bold text-xs uppercase tracking-wider transition-colors text-center"
                            >
                                Explorar o site livremente
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
