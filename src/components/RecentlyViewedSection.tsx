'use client';

import { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, ChevronLeft, ChevronRight, X, MapPin, Bed, Car, Maximize2, Trash2 } from 'lucide-react';
import { useRecentlyViewed, RecentlyViewedItem } from '@/hooks/useRecentlyViewed';

interface RecentlyViewedSectionProps {
    /** ID do imóvel atual (excluído da listagem, ex: na página de detalhes) */
    excludeId?: string;
    /** Máximo de itens a exibir */
    maxItems?: number;
}

export default function RecentlyViewedSection({ excludeId, maxItems = 8 }: RecentlyViewedSectionProps) {
    const { items, clear } = useRecentlyViewed(excludeId);
    const scrollRef = useRef<HTMLDivElement>(null);

    if (items.length === 0) return null;

    const visible = items.slice(0, maxItems);

    const scroll = (dir: 'left' | 'right') => {
        if (!scrollRef.current) return;
        scrollRef.current.scrollBy({ left: dir === 'left' ? -340 : 340, behavior: 'smooth' });
    };

    return (
        <section className="py-16 bg-slate-50/80">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-[#1B263B] flex items-center justify-center shadow-lg">
                            <Clock className="h-6 w-6 text-[#10b981]" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-[#1B263B] tracking-tighter uppercase">
                                Vistos Recentemente
                            </h2>
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-0.5">
                                {visible.length} imóvel{visible.length !== 1 ? 's' : ''} que você visualizou
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Scroll Arrows */}
                        <button
                            onClick={() => scroll('left')}
                            className="h-10 w-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center hover:bg-[#1B263B] hover:text-white hover:border-[#1B263B] transition-all shadow-sm"
                            aria-label="Anterior"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => scroll('right')}
                            className="h-10 w-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center hover:bg-[#1B263B] hover:text-white hover:border-[#1B263B] transition-all shadow-sm"
                            aria-label="Próximo"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                        {/* Limpar histórico */}
                        <button
                            onClick={clear}
                            className="flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-red-500 border border-slate-200 hover:border-red-200 rounded-xl transition-all bg-white shadow-sm"
                            aria-label="Limpar histórico"
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Limpar</span>
                        </button>
                    </div>
                </div>

                {/* Carousel */}
                <div
                    ref={scrollRef}
                    className="flex gap-4 overflow-x-auto pb-4 scroll-smooth hide-scrollbar"
                    style={{ scrollbarWidth: 'none' }}
                >
                    {visible.map((item) => (
                        <RecentlyViewedCard key={item.id} item={item} />
                    ))}
                </div>
            </div>
        </section>
    );
}

function RecentlyViewedCard({ item }: { item: RecentlyViewedItem }) {
    const mainImage = item.images?.[0];
    const formattedPrice = item.price
        ? item.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
        : 'Consulte';

    return (
        <Link
            href={`/${item.slug}`}
            className="group flex-shrink-0 w-[280px] sm:w-[300px] bg-white rounded-[28px] overflow-hidden shadow-md hover:shadow-xl transition-all duration-500 border border-slate-100 hover:border-[#10b981]/30 flex flex-col"
        >
            {/* Imagem */}
            <div className="relative h-44 overflow-hidden">
                {mainImage ? (
                    <Image
                        src={mainImage}
                        alt={item.title || 'Imóvel'}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        sizes="300px"
                    />
                ) : (
                    <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                        <MapPin className="h-10 w-10 text-slate-300" />
                    </div>
                )}
                {/* Badge */}
                <div className="absolute top-3 left-3">
                    <span className="bg-[#1B263B]/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">
                        {item.category || 'Imóvel'}
                    </span>
                </div>
                {/* Relógio - ícone "visto recentemente" */}
                <div className="absolute top-3 right-3 h-7 w-7 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow">
                    <Clock className="h-3.5 w-3.5 text-[#10b981]" />
                </div>
            </div>

            {/* Conteúdo */}
            <div className="p-4 flex flex-col flex-1">
                <div className="flex items-start gap-1 mb-2">
                    <MapPin className="h-3 w-3 text-[#10b981] mt-0.5 flex-shrink-0" />
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest truncate">
                        {item.neighborhood}, {item.city}
                    </p>
                </div>

                <h3 className="text-sm font-bold text-[#1B263B] line-clamp-2 leading-tight mb-3 group-hover:text-[#10b981] transition-colors">
                    {item.title || `${item.category} em ${item.neighborhood}`}
                </h3>

                {/* Specs */}
                <div className="flex items-center gap-3 mb-3">
                    {item.rooms > 0 && (
                        <div className="flex items-center gap-1">
                            <Bed className="h-3 w-3 text-slate-400" />
                            <span className="text-[10px] font-bold text-slate-500">{item.rooms}</span>
                        </div>
                    )}
                    {item.parking_spaces > 0 && (
                        <div className="flex items-center gap-1">
                            <Car className="h-3 w-3 text-slate-400" />
                            <span className="text-[10px] font-bold text-slate-500">{item.parking_spaces}</span>
                        </div>
                    )}
                    {item.area > 0 && (
                        <div className="flex items-center gap-1">
                            <Maximize2 className="h-3 w-3 text-slate-400" />
                            <span className="text-[10px] font-bold text-slate-500">{item.area}m²</span>
                        </div>
                    )}
                </div>

                {/* Preço */}
                <div className="mt-auto">
                    <p className="text-lg font-black text-[#1B263B] tracking-tighter">
                        {formattedPrice}
                    </p>
                    <p className="text-[9px] font-bold text-[#10b981] uppercase tracking-widest mt-0.5 group-hover:underline">
                        Ver imóvel →
                    </p>
                </div>
            </div>
        </Link>
    );
}

