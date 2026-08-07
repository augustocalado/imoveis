'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Search, MapPin, DollarSign, ChevronDown, Check, Home, Bed } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import clsx from 'clsx';
import { normalizeNeighborhoodList } from '@/utils/neighborhood';

export default function GlobalSearch({ onClose, theme = 'dark' }: { onClose?: () => void, theme?: 'dark' | 'light' }) {
    const router = useRouter();
    const [neighborhoods, setNeighborhoods] = useState<string[]>([]);
    const [selectedNeighborhoods, setSelectedNeighborhoods] = useState<string[]>([]);
    const [selectedPrices, setSelectedPrices] = useState<string[]>([]);
    const [reference, setReference] = useState('');
    const [category, setCategory] = useState<string[]>([]);
    const [rooms, setRooms] = useState<string[]>([]);
    const [isBairroOpen, setIsBairroOpen] = useState(false);
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);
    const [isRoomsOpen, setIsRoomsOpen] = useState(false);
    const [isPriceOpen, setIsPriceOpen] = useState(false);

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
        { value: '100000',  label: 'Até R$ 100 Mil' },
        { value: '200000',  label: 'Até R$ 200 Mil' },
        { value: '300000',  label: 'Até R$ 300 Mil' },
        { value: '400000',  label: 'Até R$ 400 Mil' },
        { value: '500000',  label: 'Até R$ 500 Mil' },
        { value: '600000',  label: 'Até R$ 600 Mil' },
        { value: '700000',  label: 'Até R$ 700 Mil' },
        { value: '800000',  label: 'Até R$ 800 Mil' },
        { value: '900000',  label: 'Até R$ 900 Mil' },
        { value: '1000000', label: 'Até R$ 1 Milhão' },
        { value: '1500000', label: 'Até R$ 1,5 Milhão' },
        { value: '2000000', label: 'Até R$ 2 Milhões' },
        { value: '2500000', label: 'Até R$ 2,5 Milhões' },
        { value: '3000000', label: 'Até R$ 3 Milhões' },
        { value: '5000000', label: 'Até R$ 5 Milhões' },
        { value: '10000000',label: 'Até R$ 10 Milhões' },
    ];

    useEffect(() => {
        const fetchNeighborhoods = async () => {
            const { data } = await supabase
                .from('properties')
                .select('neighborhood')
                .in('status', ['disponivel', 'disponível', 'Disponivel', 'Disponível', 'DISPONIVEL', 'DISPONÍVEL'])
                .not('neighborhood', 'is', null);
            const { unique } = normalizeNeighborhoodList(data?.map((p: any) => p.neighborhood) || []);
            setNeighborhoods(unique);
        };
        fetchNeighborhoods();
    }, []);

    const pathname = usePathname();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const params = new URLSearchParams();
        if (selectedNeighborhoods.length > 0) params.set('neighborhood', selectedNeighborhoods.join(','));
        if (selectedPrices.length > 0) {
            const maxPrice = Math.max(...selectedPrices.map(Number)).toString();
            params.set('maxPrice', maxPrice);
        }
        if (reference) params.set('ref', reference);
        if (category.length > 0) params.set('cat', category.join(','));
        if (rooms.length > 0) params.set('rooms', rooms.join(','));

        const targetPath = pathname === '/catalogo' ? '/catalogo' : '/imoveis';
        router.push(`${targetPath}?${params.toString()}`);
        if (onClose) onClose();
    };

    const toggle = (setter: React.Dispatch<React.SetStateAction<string[]>>, value: string) => {
        setter(prev => prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]);
    };

    const isLight = theme === 'light';

    const dropdownBase = clsx(
        'absolute top-full left-0 right-0 mt-3 border rounded-2xl shadow-2xl z-[110] max-h-64 overflow-y-auto p-4 space-y-2 custom-scrollbar',
        isLight ? 'bg-white border-slate-100' : 'bg-primary-900 border-white/10'
    );

    const btnBase = clsx(
        'w-full p-4 pl-12 pr-10 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-accent transition-all text-left flex items-center justify-between cursor-pointer',
        isLight ? 'bg-slate-50 border border-slate-200 text-slate-900' : 'bg-white/5 border border-white/10 text-white'
    );

    const CheckboxItem = ({ checked, onChange, labelText }: { checked: boolean; onChange: () => void; labelText: string }) => (
        <label className={clsx(
            'flex items-center gap-3 p-3 rounded-xl cursor-pointer group transition-all',
            isLight ? 'hover:bg-slate-50 text-slate-900' : 'hover:bg-white/5 text-white'
        )}>
            <div className={clsx(
                'h-5 w-5 rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0',
                checked
                    ? 'bg-accent border-accent'
                    : isLight ? 'border-slate-200 group-hover:border-slate-300' : 'border-white/10 group-hover:border-white/30'
            )}>
                {checked && <Check className="h-3 w-3 text-white" aria-hidden="true" />}
            </div>
            <input type="checkbox" className="sr-only" checked={checked} onChange={onChange} />
            <span className={clsx(
                'text-sm font-bold tracking-wide',
                checked
                    ? isLight ? 'text-slate-900' : 'text-white'
                    : isLight ? 'text-slate-500' : 'text-white/40'
            )}>{labelText}</span>
        </label>
    );

    return (
        <form onSubmit={handleSearch} className={clsx(
            'flex flex-col md:flex-row items-center gap-4 p-2 rounded-[30px] w-full max-w-4xl mx-auto relative z-[100]',
            isLight ? 'bg-transparent' : 'bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl'
        )} role="search">

            {/* Referência */}
            <div className="flex-1 w-full relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-accent z-20" aria-hidden="true" />
                <input
                    type="text"
                    placeholder="Ref. do Imóvel"
                    aria-label="Referência do Imóvel"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    className={clsx(
                        'w-full p-4 pl-12 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-accent transition-all',
                        isLight ? 'bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400' : 'bg-white/5 border border-white/10 text-white placeholder:text-white/40'
                    )}
                />
            </div>

            {/* Bairros */}
            <div className="flex-1 w-full relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-accent z-20" aria-hidden="true" />
                <button
                    type="button"
                    aria-expanded={isBairroOpen}
                    onClick={() => { setIsBairroOpen(!isBairroOpen); setIsCategoryOpen(false); setIsRoomsOpen(false); setIsPriceOpen(false); }}
                    className={btnBase}
                >
                    <span className={clsx('truncate', selectedNeighborhoods.length === 0 && (isLight ? 'text-slate-400' : 'text-white/40'))}>
                        {selectedNeighborhoods.length === 0 ? 'Todos os Bairros' : `${selectedNeighborhoods.length} bairro(s)`}
                    </span>
                    <ChevronDown className={clsx('h-4 w-4 transition-transform flex-shrink-0', isBairroOpen && 'rotate-180', isLight ? 'text-slate-400' : 'text-white/40')} aria-hidden="true" />
                </button>
                {isBairroOpen && (
                    <>
                        <div className="fixed inset-0 z-[100]" onClick={() => setIsBairroOpen(false)} />
                        <div className={dropdownBase}>
                            {neighborhoods.map((n) => (
                                <CheckboxItem key={n} checked={selectedNeighborhoods.includes(n)} onChange={() => toggle(setSelectedNeighborhoods, n)} labelText={n} />
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Tipo do Imóvel */}
            <div className="flex-1 w-full relative">
                <Home className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-accent z-20" aria-hidden="true" />
                <button
                    type="button"
                    aria-expanded={isCategoryOpen}
                    onClick={() => { setIsCategoryOpen(!isCategoryOpen); setIsBairroOpen(false); setIsRoomsOpen(false); setIsPriceOpen(false); }}
                    className={btnBase}
                >
                    <span className={clsx('truncate', category.length === 0 && (isLight ? 'text-slate-400' : 'text-white/40'))}>
                        {category.length === 0 ? 'Tipo do Imóvel' : `${category.length} tipo(s)`}
                    </span>
                    <ChevronDown className={clsx('h-4 w-4 transition-transform flex-shrink-0', isCategoryOpen && 'rotate-180', isLight ? 'text-slate-400' : 'text-white/40')} aria-hidden="true" />
                </button>
                {isCategoryOpen && (
                    <>
                        <div className="fixed inset-0 z-[100]" onClick={() => setIsCategoryOpen(false)} />
                        <div className={dropdownBase}>
                            {categoriesList.map((cat) => (
                                <CheckboxItem key={cat} checked={category.includes(cat)} onChange={() => toggle(setCategory, cat)} labelText={cat} />
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Dormitórios */}
            <div className="flex-1 w-full relative">
                <Bed className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-accent z-20" aria-hidden="true" />
                <button
                    type="button"
                    aria-expanded={isRoomsOpen}
                    onClick={() => { setIsRoomsOpen(!isRoomsOpen); setIsBairroOpen(false); setIsCategoryOpen(false); setIsPriceOpen(false); }}
                    className={btnBase}
                >
                    <span className={clsx('truncate', rooms.length === 0 && (isLight ? 'text-slate-400' : 'text-white/40'))}>
                        {rooms.length === 0 ? 'Dormitórios' : `${rooms.length} opção(ões)`}
                    </span>
                    <ChevronDown className={clsx('h-4 w-4 transition-transform flex-shrink-0', isRoomsOpen && 'rotate-180', isLight ? 'text-slate-400' : 'text-white/40')} aria-hidden="true" />
                </button>
                {isRoomsOpen && (
                    <>
                        <div className="fixed inset-0 z-[100]" onClick={() => setIsRoomsOpen(false)} />
                        <div className={dropdownBase}>
                            {roomsList.map(({ value, label }) => (
                                <CheckboxItem key={value} checked={rooms.includes(value)} onChange={() => toggle(setRooms, value)} labelText={label} />
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Faixa de Preço */}
            <div className="flex-1 w-full relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-accent z-20" aria-hidden="true" />
                <button
                    type="button"
                    aria-expanded={isPriceOpen}
                    onClick={() => { setIsPriceOpen(!isPriceOpen); setIsBairroOpen(false); setIsCategoryOpen(false); setIsRoomsOpen(false); }}
                    className={btnBase}
                >
                    <span className={clsx('truncate', selectedPrices.length === 0 && (isLight ? 'text-slate-400' : 'text-white/40'))}>
                        {selectedPrices.length === 0 ? 'Até valor' : `${selectedPrices.length} faixa(s)`}
                    </span>
                    <ChevronDown className={clsx('h-4 w-4 transition-transform flex-shrink-0', isPriceOpen && 'rotate-180', isLight ? 'text-slate-400' : 'text-white/40')} aria-hidden="true" />
                </button>
                {isPriceOpen && (
                    <>
                        <div className="fixed inset-0 z-[100]" onClick={() => setIsPriceOpen(false)} />
                        <div className={dropdownBase}>
                            {pricesList.map(({ value, label }) => (
                                <CheckboxItem key={value} checked={selectedPrices.includes(value)} onChange={() => toggle(setSelectedPrices, value)} labelText={label} />
                            ))}
                        </div>
                    </>
                )}
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
