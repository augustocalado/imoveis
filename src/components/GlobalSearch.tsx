'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
    Search, 
    MapPin, 
    DollarSign, 
    ChevronDown, 
    Check, 
    Home, 
    Bed, 
    Hash, 
    Car, 
    Waves, 
    ArrowUpDown, 
    Armchair,
    SlidersHorizontal,
    Sparkles,
    X
} from 'lucide-react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import clsx from 'clsx';
import { normalizeNeighborhoodList } from '@/utils/neighborhood';

interface GlobalSearchProps {
    onClose?: () => void;
    theme?: 'dark' | 'light';
    variant?: 'card' | 'bar';
    onFilterChange?: (filters: {
        ref?: string;
        neighborhoods?: string[];
        category?: string[];
        rooms?: string[];
        maxPrice?: string;
        parking?: string[];
        elevator?: 'todos' | 'sim' | 'nao';
        furnished?: 'todos' | 'sim' | 'semi' | 'nao';
        seaView?: string[];
    }) => void;
    onResetFilters?: () => void;
}

export default function GlobalSearch({ onClose, theme = 'dark', variant = 'bar', onFilterChange, onResetFilters }: GlobalSearchProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [neighborhoods, setNeighborhoods] = useState<string[]>([]);
    const [selectedNeighborhoods, setSelectedNeighborhoods] = useState<string[]>([]);
    const [selectedPrices, setSelectedPrices] = useState<string[]>([]);
    const [reference, setReference] = useState('');
    const [category, setCategory] = useState<string[]>([]);
    const [rooms, setRooms] = useState<string[]>([]);
    const [parking, setParking] = useState<string[]>([]);
    const [elevator, setElevator] = useState<'todos' | 'sim' | 'nao'>('todos');
    const [furnished, setFurnished] = useState<'todos' | 'sim' | 'semi' | 'nao'>('todos');
    const [seaView, setSeaView] = useState<string[]>([]);

    // Dropdown states
    const [isBairroOpen, setIsBairroOpen] = useState(false);
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);
    const [isRoomsOpen, setIsRoomsOpen] = useState(false);
    const [isPriceOpen, setIsPriceOpen] = useState(false);
    const [isParkingOpen, setIsParkingOpen] = useState(false);
    const [isSeaViewOpen, setIsSeaViewOpen] = useState(false);
    const [isFurnishedOpen, setIsFurnishedOpen] = useState(false);
    const [isElevatorOpen, setIsElevatorOpen] = useState(false);
    const [showMoreFilters, setShowMoreFilters] = useState(false);

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

    const parkingList = [
        { value: '1', label: '1 Vaga' },
        { value: '2', label: '2 Vagas' },
        { value: '3', label: '3 Vagas' },
        { value: '4', label: '4 Vagas' },
        { value: '5', label: '5+ Vagas' },
    ];

    const seaViewList = [
        { value: 'vista_mar', label: 'Vista para o Mar' },
        { value: 'beira_mar', label: 'Beira Mar / Frente Mar' },
        { value: 'lateral_mar', label: 'Lateral Mar' },
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

    // Inicializa filtros a partir da URL se existirem
    useEffect(() => {
        if (!searchParams) return;
        const refParam = searchParams.get('ref');
        if (refParam) setReference(refParam);

        const neighParam = searchParams.get('neighborhood');
        if (neighParam) setSelectedNeighborhoods(neighParam.split(','));

        const catParam = searchParams.get('cat');
        if (catParam) setCategory(catParam.split(','));

        const roomsParam = searchParams.get('rooms');
        if (roomsParam) setRooms(roomsParam.split(','));

        const priceParam = searchParams.get('maxPrice');
        if (priceParam) setSelectedPrices([priceParam]);

        const parkParam = searchParams.get('parking');
        if (parkParam) setParking(parkParam.split(','));

        const elevParam = searchParams.get('elevator');
        if (elevParam === 'sim' || elevParam === 'true') setElevator('sim');
        else if (elevParam === 'nao' || elevParam === 'false') setElevator('nao');

        const furnParam = searchParams.get('furnished');
        if (furnParam === 'sim' || furnParam === 'semi' || furnParam === 'nao') setFurnished(furnParam as any);

        const seaParam = searchParams.get('sea_view');
        if (seaParam) setSeaView(seaParam.split(','));
    }, [searchParams]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const maxPrice = selectedPrices.length > 0 ? Math.max(...selectedPrices.map(Number)).toString() : '';

        if (onFilterChange) {
            onFilterChange({
                ref: reference,
                neighborhoods: selectedNeighborhoods,
                category,
                rooms,
                maxPrice,
                parking,
                elevator,
                furnished,
                seaView
            });
            if (onClose) onClose();
            return;
        }

        const params = new URLSearchParams();
        if (reference) params.set('ref', reference);
        if (selectedNeighborhoods.length > 0) params.set('neighborhood', selectedNeighborhoods.join(','));
        if (category.length > 0) params.set('cat', category.join(','));
        if (rooms.length > 0) params.set('rooms', rooms.join(','));
        if (maxPrice) {
            params.set('maxPrice', maxPrice);
        }
        if (parking.length > 0) params.set('parking', parking.join(','));
        if (elevator === 'sim' || elevator === 'nao') params.set('elevator', elevator);
        if (furnished === 'sim' || furnished === 'semi' || furnished === 'nao') params.set('furnished', furnished);
        if (seaView.length > 0) params.set('sea_view', seaView.join(','));

        const targetPath = pathname === '/catalogo' ? '/catalogo' : '/imoveis';
        router.push(`${targetPath}?${params.toString()}`);
        if (onClose) onClose();
    };

    const handleClearFilters = () => {
        setReference('');
        setSelectedNeighborhoods([]);
        setCategory([]);
        setRooms([]);
        setSelectedPrices([]);
        setParking([]);
        setElevator('todos');
        setFurnished('todos');
        setSeaView([]);
        if (onFilterChange) {
            onFilterChange({
                ref: '',
                neighborhoods: [],
                category: [],
                rooms: [],
                maxPrice: '',
                parking: [],
                elevator: 'todos',
                furnished: 'todos',
                seaView: []
            });
        }
        if (onResetFilters) onResetFilters();
    };

    const hasAnyFilter = Boolean(
        reference ||
        selectedNeighborhoods.length > 0 ||
        category.length > 0 ||
        rooms.length > 0 ||
        selectedPrices.length > 0 ||
        parking.length > 0 ||
        elevator !== 'todos' ||
        furnished !== 'todos' ||
        seaView.length > 0
    );

    const toggle = (setter: React.Dispatch<React.SetStateAction<string[]>>, value: string) => {
        setter(prev => prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]);
    };

    const closeAllDropdowns = () => {
        setIsBairroOpen(false);
        setIsCategoryOpen(false);
        setIsRoomsOpen(false);
        setIsPriceOpen(false);
        setIsParkingOpen(false);
        setIsSeaViewOpen(false);
        setIsFurnishedOpen(false);
        setIsElevatorOpen(false);
    };

    const isLight = theme === 'light';
    const isCard = variant === 'card';

    const dropdownBase = clsx(
        'absolute top-full left-0 right-0 mt-2 border rounded-2xl shadow-2xl z-[120] p-3 space-y-1 max-h-60 overflow-y-auto custom-scrollbar',
        isLight ? 'bg-white border-slate-200 shadow-slate-200/80' : 'bg-[#151D2A] border-white/15 shadow-black/80'
    );

    const btnBase = clsx(
        'w-full p-3.5 pl-11 pr-9 rounded-2xl font-bold text-xs sm:text-sm outline-none focus:ring-2 focus:ring-accent transition-all text-left flex items-center justify-between cursor-pointer select-none',
        isLight 
            ? 'bg-slate-50 border border-slate-200 text-slate-900 hover:bg-slate-100/70' 
            : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
    );

    const CheckboxItem = ({ checked, onChange, labelText }: { checked: boolean; onChange: () => void; labelText: string }) => (
        <label className={clsx(
            'flex items-center gap-3 p-2.5 rounded-xl cursor-pointer group transition-all',
            isLight ? 'hover:bg-slate-100 text-slate-800' : 'hover:bg-white/10 text-white'
        )}>
            <div className={clsx(
                'h-4.5 w-4.5 rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0',
                checked
                    ? 'bg-accent border-accent'
                    : isLight ? 'border-slate-300 group-hover:border-slate-400' : 'border-white/20 group-hover:border-white/40'
            )}>
                {checked && <Check className="h-3 w-3 text-white stroke-[3]" aria-hidden="true" />}
            </div>
            <input type="checkbox" className="sr-only" checked={checked} onChange={onChange} />
            <span className={clsx(
                'text-xs sm:text-sm font-semibold tracking-wide truncate',
                checked
                    ? isLight ? 'text-slate-900 font-bold' : 'text-white font-bold'
                    : isLight ? 'text-slate-600' : 'text-white/60'
            )}>{labelText}</span>
        </label>
    );

    // =========================================================================
    // RENDER: RETÂNGULO VERTICAL (HERO CARD NO BANNER PRINCIPAL)
    // =========================================================================
    if (isCard) {
        return (
            <form onSubmit={handleSearch} className="w-full text-left space-y-4" role="search">
                {/* Header do Card */}
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-xl bg-accent/20 flex items-center justify-center text-accent">
                            <Search className="h-4 w-4" />
                        </div>
                        <div>
                            <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-wider">
                                Encontre seu Imóvel
                            </h3>
                            <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">
                                Venda • Praia Grande
                            </p>
                        </div>
                    </div>

                </div>

                {/* Grid de Campos (2 colunas em telas médias/desktop, 1 coluna em celular pequeno) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    
                    {/* Código / Referência */}
                    <div className="relative">
                        <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-accent pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Código / Ref"
                            aria-label="Código do Imóvel"
                            value={reference}
                            onChange={(e) => setReference(e.target.value)}
                            className="w-full p-3.5 pl-11 rounded-2xl font-bold text-xs sm:text-sm outline-none focus:ring-2 focus:ring-accent transition-all bg-white/5 border border-white/10 text-white placeholder:text-white/40"
                        />
                    </div>

                    {/* Bairros */}
                    <div className="relative">
                        <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-accent pointer-events-none" />
                        <button
                            type="button"
                            onClick={() => { closeAllDropdowns(); setIsBairroOpen(!isBairroOpen); }}
                            className={btnBase}
                        >
                            <span className={clsx('truncate', selectedNeighborhoods.length === 0 && 'text-white/40')}>
                                {selectedNeighborhoods.length === 0 ? 'Bairros' : `${selectedNeighborhoods.length} bairro(s)`}
                            </span>
                            <ChevronDown className={clsx('h-4 w-4 transition-transform flex-shrink-0 text-white/40', isBairroOpen && 'rotate-180')} />
                        </button>
                        {isBairroOpen && (
                            <>
                                <div className="fixed inset-0 z-[110]" onClick={() => setIsBairroOpen(false)} />
                                <div className={dropdownBase}>
                                    {neighborhoods.map((n) => (
                                        <CheckboxItem key={n} checked={selectedNeighborhoods.includes(n)} onChange={() => toggle(setSelectedNeighborhoods, n)} labelText={n} />
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Tipo do Imóvel */}
                    <div className="relative">
                        <Home className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-accent pointer-events-none" />
                        <button
                            type="button"
                            onClick={() => { closeAllDropdowns(); setIsCategoryOpen(!isCategoryOpen); }}
                            className={btnBase}
                        >
                            <span className={clsx('truncate', category.length === 0 && 'text-white/40')}>
                                {category.length === 0 ? 'Tipo Imóvel' : `${category.length} tipo(s)`}
                            </span>
                            <ChevronDown className={clsx('h-4 w-4 transition-transform flex-shrink-0 text-white/40', isCategoryOpen && 'rotate-180')} />
                        </button>
                        {isCategoryOpen && (
                            <>
                                <div className="fixed inset-0 z-[110]" onClick={() => setIsCategoryOpen(false)} />
                                <div className={dropdownBase}>
                                    {categoriesList.map((cat) => (
                                        <CheckboxItem key={cat} checked={category.includes(cat)} onChange={() => toggle(setCategory, cat)} labelText={cat} />
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Faixa de Preço */}
                    <div className="relative">
                        <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-accent pointer-events-none" />
                        <button
                            type="button"
                            onClick={() => { closeAllDropdowns(); setIsPriceOpen(!isPriceOpen); }}
                            className={btnBase}
                        >
                            <span className={clsx('truncate', selectedPrices.length === 0 && 'text-white/40')}>
                                {selectedPrices.length === 0 ? 'Preço Máx.' : `${selectedPrices.length} faixa(s)`}
                            </span>
                            <ChevronDown className={clsx('h-4 w-4 transition-transform flex-shrink-0 text-white/40', isPriceOpen && 'rotate-180')} />
                        </button>
                        {isPriceOpen && (
                            <>
                                <div className="fixed inset-0 z-[110]" onClick={() => setIsPriceOpen(false)} />
                                <div className={dropdownBase}>
                                    {pricesList.map(({ value, label }) => (
                                        <CheckboxItem key={value} checked={selectedPrices.includes(value)} onChange={() => toggle(setSelectedPrices, value)} labelText={label} />
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Dormitórios */}
                    <div className="relative">
                        <Bed className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-accent pointer-events-none" />
                        <button
                            type="button"
                            onClick={() => { closeAllDropdowns(); setIsRoomsOpen(!isRoomsOpen); }}
                            className={btnBase}
                        >
                            <span className={clsx('truncate', rooms.length === 0 && 'text-white/40')}>
                                {rooms.length === 0 ? 'Quartos' : `${rooms.length} opção(ões)`}
                            </span>
                            <ChevronDown className={clsx('h-4 w-4 transition-transform flex-shrink-0 text-white/40', isRoomsOpen && 'rotate-180')} />
                        </button>
                        {isRoomsOpen && (
                            <>
                                <div className="fixed inset-0 z-[110]" onClick={() => setIsRoomsOpen(false)} />
                                <div className={dropdownBase}>
                                    {roomsList.map(({ value, label }) => (
                                        <CheckboxItem key={value} checked={rooms.includes(value)} onChange={() => toggle(setRooms, value)} labelText={label} />
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Vagas de Garagem (até 5) */}
                    <div className="relative">
                        <Car className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-accent pointer-events-none" />
                        <button
                            type="button"
                            onClick={() => { closeAllDropdowns(); setIsParkingOpen(!isParkingOpen); }}
                            className={btnBase}
                        >
                            <span className={clsx('truncate', parking.length === 0 && 'text-white/40')}>
                                {parking.length === 0 ? 'Vagas (até 5)' : `${parking.length} vaga(s)`}
                            </span>
                            <ChevronDown className={clsx('h-4 w-4 transition-transform flex-shrink-0 text-white/40', isParkingOpen && 'rotate-180')} />
                        </button>
                        {isParkingOpen && (
                            <>
                                <div className="fixed inset-0 z-[110]" onClick={() => setIsParkingOpen(false)} />
                                <div className={dropdownBase}>
                                    {parkingList.map(({ value, label }) => (
                                        <CheckboxItem key={value} checked={parking.includes(value)} onChange={() => toggle(setParking, value)} labelText={label} />
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Vista Mar / Beira Mar / Lateral Mar */}
                    <div className="relative">
                        <Waves className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-accent pointer-events-none" />
                        <button
                            type="button"
                            onClick={() => { closeAllDropdowns(); setIsSeaViewOpen(!isSeaViewOpen); }}
                            className={btnBase}
                        >
                            <span className={clsx('truncate', seaView.length === 0 && 'text-white/40')}>
                                {seaView.length === 0 ? 'Vista Mar' : `${seaView.length} opção(ões)`}
                            </span>
                            <ChevronDown className={clsx('h-4 w-4 transition-transform flex-shrink-0 text-white/40', isSeaViewOpen && 'rotate-180')} />
                        </button>
                        {isSeaViewOpen && (
                            <>
                                <div className="fixed inset-0 z-[110]" onClick={() => setIsSeaViewOpen(false)} />
                                <div className={dropdownBase}>
                                    {seaViewList.map(({ value, label }) => (
                                        <CheckboxItem key={value} checked={seaView.includes(value)} onChange={() => toggle(setSeaView, value)} labelText={label} />
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Mobiliado (Selecionável Sim/Não/Todos) */}
                    <div className="relative">
                        <Armchair className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-accent pointer-events-none" />
                        <button
                            type="button"
                            onClick={() => { closeAllDropdowns(); setIsFurnishedOpen(!isFurnishedOpen); }}
                            className={btnBase}
                        >
                            <span className={clsx('truncate', furnished === 'todos' && 'text-white/40')}>
                                {furnished === 'sim' ? 'Mobiliado: Sim' : furnished === 'semi' ? 'Semi Mobiliado' : furnished === 'nao' ? 'Mobiliado: Não' : 'Mobiliado?'}
                            </span>
                            <ChevronDown className={clsx('h-4 w-4 transition-transform flex-shrink-0 text-white/40', isFurnishedOpen && 'rotate-180')} />
                        </button>
                        {isFurnishedOpen && (
                            <>
                                <div className="fixed inset-0 z-[110]" onClick={() => setIsFurnishedOpen(false)} />
                                <div className={dropdownBase}>
                                    <button
                                        type="button"
                                        onClick={() => { setFurnished('todos'); setIsFurnishedOpen(false); }}
                                        className={clsx('w-full text-left p-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-between', furnished === 'todos' ? 'bg-white/10 text-white font-bold' : 'text-white/60 hover:bg-white/5')}
                                    >
                                        <span>Tanto faz (Todos)</span>
                                        {furnished === 'todos' && <Check className="h-4 w-4 text-accent" />}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => { setFurnished('nao'); setIsFurnishedOpen(false); }}
                                        className={clsx('w-full text-left p-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-between', furnished === 'nao' ? 'bg-white/10 text-white font-bold' : 'text-white/60 hover:bg-white/5')}
                                    >
                                        <span>Sem Mobília</span>
                                        {furnished === 'nao' && <Check className="h-4 w-4 text-accent" />}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => { setFurnished('semi'); setIsFurnishedOpen(false); }}
                                        className={clsx('w-full text-left p-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-between', furnished === 'semi' ? 'bg-white/10 text-white font-bold' : 'text-white/60 hover:bg-white/5')}
                                    >
                                        <span>Semi Mobiliado</span>
                                        {furnished === 'semi' && <Check className="h-4 w-4 text-accent" />}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => { setFurnished('sim'); setIsFurnishedOpen(false); }}
                                        className={clsx('w-full text-left p-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-between', furnished === 'sim' ? 'bg-white/10 text-white font-bold' : 'text-white/60 hover:bg-white/5')}
                                    >
                                        <span>Mobiliado</span>
                                        {furnished === 'sim' && <Check className="h-4 w-4 text-accent" />}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>

                </div>

                {/* Filtro Elevador (Dropdown estilizado) */}
                <div className="relative">
                    <ArrowUpDown className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-accent pointer-events-none" />
                    <button
                        type="button"
                        onClick={() => { closeAllDropdowns(); setIsElevatorOpen(!isElevatorOpen); }}
                        className={btnBase}
                    >
                        <span className={clsx('truncate', elevator === 'todos' && 'text-white/40')}>
                            {elevator === 'sim' ? 'Com Elevador' : elevator === 'nao' ? 'Sem Elevador' : 'Elevador?'}
                        </span>
                        <ChevronDown className={clsx('h-4 w-4 transition-transform flex-shrink-0 text-white/40', isElevatorOpen && 'rotate-180')} />
                    </button>
                    {isElevatorOpen && (
                        <>
                            <div className="fixed inset-0 z-[110]" onClick={() => setIsElevatorOpen(false)} />
                            <div className={dropdownBase}>
                                <button
                                    type="button"
                                    onClick={() => { setElevator('todos'); setIsElevatorOpen(false); }}
                                    className={clsx('w-full text-left p-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-between', elevator === 'todos' ? 'bg-white/10 text-white font-bold' : 'text-white/60 hover:bg-white/5')}
                                >
                                    <span>Tanto faz (Todos)</span>
                                    {elevator === 'todos' && <Check className="h-4 w-4 text-accent" />}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setElevator('nao'); setIsElevatorOpen(false); }}
                                    className={clsx('w-full text-left p-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-between', elevator === 'nao' ? 'bg-white/10 text-white font-bold' : 'text-white/60 hover:bg-white/5')}
                                >
                                    <span>Sem Elevador</span>
                                    {elevator === 'nao' && <Check className="h-4 w-4 text-accent" />}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setElevator('sim'); setIsElevatorOpen(false); }}
                                    className={clsx('w-full text-left p-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-between', elevator === 'sim' ? 'bg-white/10 text-white font-bold' : 'text-white/60 hover:bg-white/5')}
                                >
                                    <span>Com Elevador</span>
                                    {elevator === 'sim' && <Check className="h-4 w-4 text-accent" />}
                                </button>
                            </div>
                        </>
                    )}
                </div>

                {/* Botão de Busca */}
                <button
                    type="submit"
                    aria-label="Buscar imóveis"
                    className="w-full h-13 py-3.5 px-6 bg-accent hover:bg-accent/90 text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-xl shadow-accent/25"
                >
                    <Search className="h-5 w-5" aria-hidden="true" />
                    <span>Buscar Imóveis</span>
                </button>
            </form>
        );
    }

    // =========================================================================
    // RENDER: BARRA HORIZONTAL RESPONSIVA (CATÁLOGO, NAVBAR E MODAIS)
    // =========================================================================
    return (
        <form onSubmit={handleSearch} className={clsx(
            'p-3 rounded-3xl lg:rounded-[36px] w-full mx-auto relative z-[100] space-y-3',
            isLight ? 'bg-transparent' : 'bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl'
        )} role="search">
            
            {/* Linha Principal de Filtros */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 items-center gap-3">
                {/* Referência */}
                <div className="w-full relative">
                    <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-accent pointer-events-none" />
                    <input
                        type="text"
                        placeholder="Código / Ref"
                        aria-label="Código do Imóvel"
                        value={reference}
                        onChange={(e) => setReference(e.target.value)}
                        className={clsx(
                            'w-full p-3.5 pl-11 rounded-2xl font-bold text-xs sm:text-sm outline-none focus:ring-2 focus:ring-accent transition-all',
                            isLight ? 'bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400' : 'bg-white/5 border border-white/10 text-white placeholder:text-white/40'
                        )}
                    />
                </div>

                {/* Bairros */}
                <div className="w-full relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-accent pointer-events-none" />
                    <button
                        type="button"
                        onClick={() => { closeAllDropdowns(); setIsBairroOpen(!isBairroOpen); }}
                        className={btnBase}
                    >
                        <span className={clsx('truncate', selectedNeighborhoods.length === 0 && (isLight ? 'text-slate-400' : 'text-white/40'))}>
                            {selectedNeighborhoods.length === 0 ? 'Bairros' : `${selectedNeighborhoods.length} bairro(s)`}
                        </span>
                        <ChevronDown className={clsx('h-4 w-4 transition-transform flex-shrink-0', isBairroOpen && 'rotate-180', isLight ? 'text-slate-400' : 'text-white/40')} />
                    </button>
                    {isBairroOpen && (
                        <>
                            <div className="fixed inset-0 z-[110]" onClick={() => setIsBairroOpen(false)} />
                            <div className={dropdownBase}>
                                {neighborhoods.map((n) => (
                                    <CheckboxItem key={n} checked={selectedNeighborhoods.includes(n)} onChange={() => toggle(setSelectedNeighborhoods, n)} labelText={n} />
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* Tipo do Imóvel */}
                <div className="w-full relative">
                    <Home className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-accent pointer-events-none" />
                    <button
                        type="button"
                        onClick={() => { closeAllDropdowns(); setIsCategoryOpen(!isCategoryOpen); }}
                        className={btnBase}
                    >
                        <span className={clsx('truncate', category.length === 0 && (isLight ? 'text-slate-400' : 'text-white/40'))}>
                            {category.length === 0 ? 'Tipo do Imóvel' : `${category.length} tipo(s)`}
                        </span>
                        <ChevronDown className={clsx('h-4 w-4 transition-transform flex-shrink-0', isCategoryOpen && 'rotate-180', isLight ? 'text-slate-400' : 'text-white/40')} />
                    </button>
                    {isCategoryOpen && (
                        <>
                            <div className="fixed inset-0 z-[110]" onClick={() => setIsCategoryOpen(false)} />
                            <div className={dropdownBase}>
                                {categoriesList.map((cat) => (
                                    <CheckboxItem key={cat} checked={category.includes(cat)} onChange={() => toggle(setCategory, cat)} labelText={cat} />
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* Dormitórios */}
                <div className="w-full relative">
                    <Bed className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-accent pointer-events-none" />
                    <button
                        type="button"
                        onClick={() => { closeAllDropdowns(); setIsRoomsOpen(!isRoomsOpen); }}
                        className={btnBase}
                    >
                        <span className={clsx('truncate', rooms.length === 0 && (isLight ? 'text-slate-400' : 'text-white/40'))}>
                            {rooms.length === 0 ? 'Dormitórios' : `${rooms.length} opção(ões)`}
                        </span>
                        <ChevronDown className={clsx('h-4 w-4 transition-transform flex-shrink-0', isRoomsOpen && 'rotate-180', isLight ? 'text-slate-400' : 'text-white/40')} />
                    </button>
                    {isRoomsOpen && (
                        <>
                            <div className="fixed inset-0 z-[110]" onClick={() => setIsRoomsOpen(false)} />
                            <div className={dropdownBase}>
                                {roomsList.map(({ value, label }) => (
                                    <CheckboxItem key={value} checked={rooms.includes(value)} onChange={() => toggle(setRooms, value)} labelText={label} />
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* Faixa de Preço */}
                <div className="w-full relative">
                    <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-accent pointer-events-none" />
                    <button
                        type="button"
                        onClick={() => { closeAllDropdowns(); setIsPriceOpen(!isPriceOpen); }}
                        className={btnBase}
                    >
                        <span className={clsx('truncate', selectedPrices.length === 0 && (isLight ? 'text-slate-400' : 'text-white/40'))}>
                            {selectedPrices.length === 0 ? 'Até valor' : `${selectedPrices.length} faixa(s)`}
                        </span>
                        <ChevronDown className={clsx('h-4 w-4 transition-transform flex-shrink-0', isPriceOpen && 'rotate-180', isLight ? 'text-slate-400' : 'text-white/40')} />
                    </button>
                    {isPriceOpen && (
                        <>
                            <div className="fixed inset-0 z-[110]" onClick={() => setIsPriceOpen(false)} />
                            <div className={dropdownBase}>
                                {pricesList.map(({ value, label }) => (
                                    <CheckboxItem key={value} checked={selectedPrices.includes(value)} onChange={() => toggle(setSelectedPrices, value)} labelText={label} />
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* Botão Buscar */}
                <button
                    type="submit"
                    aria-label="Buscar imóveis"
                    className="w-full h-[52px] px-6 bg-accent text-white rounded-2xl font-black text-xs sm:text-sm uppercase tracking-widest hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2.5 shadow-xl shadow-accent/20"
                >
                    <Search className="h-4.5 w-4.5" />
                    <span>Buscar</span>
                </button>
            </div>

            {/* Linha de Filtros Avançados: Vagas, Elevador, Mobiliado, Vista Mar */}
            <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-white/5">
                {/* Vagas de Garagem */}
                <div className="relative min-w-[140px] flex-1 sm:flex-initial">
                    <button
                        type="button"
                        onClick={() => { closeAllDropdowns(); setIsParkingOpen(!isParkingOpen); }}
                        className={clsx(
                            btnBase,
                            parking.length > 0 && (isLight ? 'border-accent bg-accent/5' : 'border-accent/40 bg-accent/10')
                        )}
                    >
                        <div className="flex items-center gap-2 truncate">
                            <Car className="h-4 w-4 text-accent" />
                            <span className={clsx('truncate', parking.length === 0 && (isLight ? 'text-slate-500' : 'text-white/50'))}>
                                {parking.length === 0 ? 'Vagas' : `${parking.length} vaga(s)`}
                            </span>
                        </div>
                        <ChevronDown className={clsx('h-4 w-4 transition-transform flex-shrink-0', isParkingOpen && 'rotate-180')} />
                    </button>
                    {isParkingOpen && (
                        <>
                            <div className="fixed inset-0 z-[110]" onClick={() => setIsParkingOpen(false)} />
                            <div className={dropdownBase}>
                                {parkingList.map(({ value, label }) => (
                                    <CheckboxItem key={value} checked={parking.includes(value)} onChange={() => toggle(setParking, value)} labelText={label} />
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* Vista para o Mar */}
                <div className="relative min-w-[150px] flex-1 sm:flex-initial">
                    <button
                        type="button"
                        onClick={() => { closeAllDropdowns(); setIsSeaViewOpen(!isSeaViewOpen); }}
                        className={clsx(
                            btnBase,
                            seaView.length > 0 && (isLight ? 'border-accent bg-accent/5' : 'border-accent/40 bg-accent/10')
                        )}
                    >
                        <div className="flex items-center gap-2 truncate">
                            <Waves className="h-4 w-4 text-accent" />
                            <span className={clsx('truncate', seaView.length === 0 && (isLight ? 'text-slate-500' : 'text-white/50'))}>
                                {seaView.length === 0 ? 'Vista Mar' : `${seaView.length} tipo(s)`}
                            </span>
                        </div>
                        <ChevronDown className={clsx('h-4 w-4 transition-transform flex-shrink-0', isSeaViewOpen && 'rotate-180')} />
                    </button>
                    {isSeaViewOpen && (
                        <>
                            <div className="fixed inset-0 z-[110]" onClick={() => setIsSeaViewOpen(false)} />
                            <div className={dropdownBase}>
                                {seaViewList.map(({ value, label }) => (
                                    <CheckboxItem key={value} checked={seaView.includes(value)} onChange={() => toggle(setSeaView, value)} labelText={label} />
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* Mobiliado */}
                <div className="relative min-w-[140px] flex-1 sm:flex-initial">
                    <button
                        type="button"
                        onClick={() => { closeAllDropdowns(); setIsFurnishedOpen(!isFurnishedOpen); }}
                        className={clsx(
                            btnBase,
                            furnished !== 'todos' && (isLight ? 'border-accent bg-accent/5' : 'border-accent/40 bg-accent/10')
                        )}
                    >
                        <div className="flex items-center gap-2 truncate">
                            <Armchair className="h-4 w-4 text-accent" />
                            <span className={clsx('truncate', furnished === 'todos' && (isLight ? 'text-slate-500' : 'text-white/50'))}>
                                {furnished === 'sim' ? 'Mobiliado' : furnished === 'semi' ? 'Semi Mob.' : furnished === 'nao' ? 'Sem Mobília' : 'Mobiliado?'}
                            </span>
                        </div>
                        <ChevronDown className={clsx('h-4 w-4 transition-transform flex-shrink-0', isFurnishedOpen && 'rotate-180')} />
                    </button>
                    {isFurnishedOpen && (
                        <>
                            <div className="fixed inset-0 z-[110]" onClick={() => setIsFurnishedOpen(false)} />
                            <div className={dropdownBase}>
                                <button
                                    type="button"
                                    onClick={() => { setFurnished('todos'); setIsFurnishedOpen(false); }}
                                    className={clsx('w-full text-left p-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-between', furnished === 'todos' ? (isLight ? 'bg-slate-100 font-bold' : 'bg-white/10 text-white font-bold') : (isLight ? 'text-slate-600 hover:bg-slate-50' : 'text-white/60 hover:bg-white/5'))}
                                >
                                    <span>Tanto faz (Todos)</span>
                                    {furnished === 'todos' && <Check className="h-4 w-4 text-accent" />}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setFurnished('nao'); setIsFurnishedOpen(false); }}
                                    className={clsx('w-full text-left p-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-between', furnished === 'nao' ? (isLight ? 'bg-slate-100 font-bold' : 'bg-white/10 text-white font-bold') : (isLight ? 'text-slate-600 hover:bg-slate-50' : 'text-white/60 hover:bg-white/5'))}
                                >
                                    <span>Sem Mobília</span>
                                    {furnished === 'nao' && <Check className="h-4 w-4 text-accent" />}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setFurnished('semi'); setIsFurnishedOpen(false); }}
                                    className={clsx('w-full text-left p-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-between', furnished === 'semi' ? (isLight ? 'bg-slate-100 font-bold' : 'bg-white/10 text-white font-bold') : (isLight ? 'text-slate-600 hover:bg-slate-50' : 'text-white/60 hover:bg-white/5'))}
                                >
                                    <span>Semi Mobiliado</span>
                                    {furnished === 'semi' && <Check className="h-4 w-4 text-accent" />}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setFurnished('sim'); setIsFurnishedOpen(false); }}
                                    className={clsx('w-full text-left p-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-between', furnished === 'sim' ? (isLight ? 'bg-slate-100 font-bold' : 'bg-white/10 text-white font-bold') : (isLight ? 'text-slate-600 hover:bg-slate-50' : 'text-white/60 hover:bg-white/5'))}
                                >
                                    <span>Mobiliado</span>
                                    {furnished === 'sim' && <Check className="h-4 w-4 text-accent" />}
                                </button>
                            </div>
                        </>
                    )}
                </div>

                {/* Elevador Dropdown */}
                <div className="relative min-w-[140px] flex-1 sm:flex-initial">
                    <button
                        type="button"
                        onClick={() => { closeAllDropdowns(); setIsElevatorOpen(!isElevatorOpen); }}
                        className={clsx(
                            btnBase,
                            elevator !== 'todos' && (isLight ? 'border-accent bg-accent/5' : 'border-accent/40 bg-accent/10')
                        )}
                    >
                        <div className="flex items-center gap-2 truncate">
                            <ArrowUpDown className="h-4 w-4 text-accent" />
                            <span className={clsx('truncate', elevator === 'todos' && (isLight ? 'text-slate-500' : 'text-white/50'))}>
                                {elevator === 'sim' ? 'Com Elevador' : elevator === 'nao' ? 'Sem Elevador' : 'Elevador?'}
                            </span>
                        </div>
                        <ChevronDown className={clsx('h-4 w-4 transition-transform flex-shrink-0', isElevatorOpen && 'rotate-180')} />
                    </button>
                    {isElevatorOpen && (
                        <>
                            <div className="fixed inset-0 z-[110]" onClick={() => setIsElevatorOpen(false)} />
                            <div className={dropdownBase}>
                                <button
                                    type="button"
                                    onClick={() => { setElevator('todos'); setIsElevatorOpen(false); }}
                                    className={clsx('w-full text-left p-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-between', elevator === 'todos' ? (isLight ? 'bg-slate-100 font-bold' : 'bg-white/10 text-white font-bold') : (isLight ? 'text-slate-600 hover:bg-slate-50' : 'text-white/60 hover:bg-white/5'))}
                                >
                                    <span>Tanto faz (Todos)</span>
                                    {elevator === 'todos' && <Check className="h-4 w-4 text-accent" />}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setElevator('nao'); setIsElevatorOpen(false); }}
                                    className={clsx('w-full text-left p-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-between', elevator === 'nao' ? (isLight ? 'bg-slate-100 font-bold' : 'bg-white/10 text-white font-bold') : (isLight ? 'text-slate-600 hover:bg-slate-50' : 'text-white/60 hover:bg-white/5'))}
                                >
                                    <span>Sem Elevador</span>
                                    {elevator === 'nao' && <Check className="h-4 w-4 text-accent" />}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setElevator('sim'); setIsElevatorOpen(false); }}
                                    className={clsx('w-full text-left p-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-between', elevator === 'sim' ? (isLight ? 'bg-slate-100 font-bold' : 'bg-white/10 text-white font-bold') : (isLight ? 'text-slate-600 hover:bg-slate-50' : 'text-white/60 hover:bg-white/5'))}
                                >
                                    <span>Com Elevador</span>
                                    {elevator === 'sim' && <Check className="h-4 w-4 text-accent" />}
                                </button>
                            </div>
                        </>
                    )}
                </div>

                {/* Botão Limpar Filtros quando houver filtros ativos */}
                {hasAnyFilter && (
                    <button
                        type="button"
                        onClick={handleClearFilters}
                        className={clsx(
                            "px-4 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all flex items-center gap-1.5 cursor-pointer border select-none",
                            isLight 
                                ? "bg-red-50 border-red-200 text-red-500 hover:bg-red-100" 
                                : "bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20"
                        )}
                    >
                        <X className="h-3.5 w-3.5" />
                        <span>Limpar</span>
                    </button>
                )}
            </div>
        </form>
    );
}
