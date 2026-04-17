'use client';

import Link from 'next/link';
import Image from 'next/image';
import { 
    MapPin, Shield, Waves, Play, Maximize2, Bed, Car, Bath, ArrowUpRight, MessageSquare,
    Star, Navigation, Building2, Home, Zap, Check, Info, LucideIcon,
    Sofa, Utensils, ChefHat, Laptop, Tv, Sun, Wind, ShieldCheck, Cctv, Bell, DoorOpen, Thermometer, Wifi, Flame, Table, Layout, Gem, Dumbbell, Bike, CarFront, ParkingCircle, Store, Building, Warehouse, Shirt, Cpu, AirVent, Fence, Trees, Flower, Component, ArrowUp, Shovel, Palmtree,
    CheckCircle2, BedDouble, Phone
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import clsx from 'clsx';

const ICON_MAP: Record<string, LucideIcon> = {
    Bed, Bath, Maximize2, Car, Star, Navigation, Building2, Home, Zap, Check, Info,
    Sofa, Utensils, ChefHat, Laptop, Tv, Waves, Sun, Wind, ShieldCheck, Cctv, Bell, DoorOpen, Thermometer, Wifi, Flame, Table, Layout, Gem, Dumbbell, Bike, CarFront, ParkingCircle, Store, Building, Warehouse, Shirt, Cpu, AirVent, Fence, Trees, Flower, Component, ArrowUp, Shovel, Palmtree,
    CheckCircle2, BedDouble,
    // Alias para garantir que o ícone de suítes apareça mesmo com variações de texto no banco
    "suites": BedDouble,
    "Suítes": BedDouble
};

const getFeatureIcon = (featureName: string) => {
    const lower = featureName.toLowerCase();
    if (lower.includes('sala')) return Sofa;
    if (lower.includes('quintal')) return Fence;
    if (lower.includes('lazer')) return Component;
    if (lower.includes('piscina')) return Waves;
    if (lower.includes('churrasqueira') || lower.includes('gourmet')) return Flame;
    if (lower.includes('academia') || lower.includes('fitness')) return Dumbbell;
    if (lower.includes('garagem') || lower.includes('vaga')) return Car;
    if (lower.includes('suíte')) return BedDouble;
    if (lower.includes('quarto') || lower.includes('dorm')) return Bed;
    if (lower.includes('banheiro') || lower.includes('wc')) return Bath;
    if (lower.includes('cozinha')) return ChefHat;
    if (lower.includes('jardim') || lower.includes('horta')) return Trees;
    if (lower.includes('varanda') || lower.includes('sacada')) return Building;
    if (lower.includes('office') || lower.includes('escritório')) return Laptop;
    if (lower.includes('ar-condicionado')) return AirVent;
    if (lower.includes('gás')) return Flame;
    if (lower.includes('elevador')) return ArrowUp;
    if (lower.includes('segurança') || lower.includes('portaria')) return ShieldCheck;
    if (lower.includes('câmera') || lower.includes('monitoramento')) return Cctv;
    if (lower.includes('alarme')) return Bell;
    if (lower.includes('interfone')) return Phone;
    if (lower.includes('wifi') || lower.includes('internet')) return Wifi;
    if (lower.includes('bicicletário')) return Bike;
    if (lower.includes('play') || lower.includes('brinquedo')) return Component;
    if (lower.includes('pet')) return Component;
    return CheckCircle2;
};

interface PropertyCardProps {
    prop: any;
    index: number;
    onVideoClick?: (url: string) => void;
    specs?: any[];
}

export default function PropertyCard({ prop, index, onVideoClick, specs: initialSpecs }: PropertyCardProps) {
    const [specs, setSpecs] = useState<any[]>(initialSpecs || []);

    const placeholderImages = [
        '1564013799919-ab600027ffc6',
        '1570129477492-45c003edd2be',
        '1512917774080-9991f1c4c750',
        '1613490493576-7fde63acd811',
        '1545324418-cc1a3fa10c00'
    ];

    useEffect(() => {
        if (!initialSpecs) {
            const fetchSpecs = async () => {
                const { data } = await supabase.from('site_settings').select('value').eq('key', 'property_specs').single();
                if (data && data.value) {
                    setSpecs(data.value);
                } else {
                    setSpecs([
                        { id: 'area', label: 'Área', field: 'area', icon: 'Maximize2', suffix: 'm²' },
                        { id: 'rooms', label: 'Dorm', field: 'rooms', icon: 'Bed' },
                        { id: 'suites', label: 'Suítes', field: 'suites', icon: 'BedDouble' },
                        { id: 'bathrooms', label: 'Banheiros', field: 'bathrooms', icon: 'Bath' },
                        { id: 'parking', label: 'Vagas', field: 'parking_spaces', icon: 'Car' }
                    ]);
                }
            };
            fetchSpecs();
        } else {
            setSpecs(initialSpecs);
        }
    }, [initialSpecs]);

    return (
        <article className="group flex flex-col bg-white rounded-[40px] overflow-hidden p-2 shadow-xl hover:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] transition-all duration-700 border border-slate-100 relative h-full">
            <Link href={`/${prop.slug}`} className="relative h-64 rounded-[32px] overflow-hidden mb-4 block group-hover:shadow-2xl transition-all duration-700">
                <Image
                    src={prop.images?.[0] || `https://images.unsplash.com/photo-${placeholderImages[index % 6]}?auto=format&fit=crop&q=80&w=800`}
                    alt={prop.title}
                    fill
                    className="object-cover transition-transform duration-1000 group-hover:scale-110"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute top-4 left-4 flex flex-col gap-1.5">
                    <div className="bg-accent backdrop-blur-xl py-1.5 px-4 rounded-full font-bold text-[9px] tracking-[0.2em] text-white shadow-2xl w-fit animate-pulse uppercase">
                        Oportunidade
                    </div>
                    <div className="bg-primary-900/90 backdrop-blur-xl py-1.5 px-4 rounded-full font-bold text-[9px] tracking-[0.2em] text-white shadow-2xl w-fit uppercase">
                        {prop.type === 'venda' ? 'À Venda' : 'Aluguel'}
                    </div>
                </div>
                
                <div className="absolute top-4 right-4">
                    <div className="bg-white/95 backdrop-blur-md py-1.5 px-3 rounded-xl font-bold text-[9px] tracking-widest text-primary-900 shadow-xl border border-white/20 uppercase">
                        REF: {prop.reference_id || prop.id.slice(0, 8).toUpperCase()}
                    </div>
                </div>

                {prop.video_url && onVideoClick && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onVideoClick(prop.video_url);
                            }}
                            aria-label="Assistir vídeo do imóvel"
                            className="h-14 w-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 scale-0 group-hover:scale-100 transition-all duration-700 shadow-2xl hover:bg-accent hover:border-accent hover:scale-110 active:scale-95 z-20"
                        >
                            <Play className="h-8 w-8 text-white fill-current translate-x-1" aria-hidden="true" />
                        </button>
                    </div>
                )}

                <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
                    <div className="flex gap-1.5">
                        <span className="bg-white/10 backdrop-blur-md text-white p-2 rounded-xl border border-white/20 shadow-2xl"><Shield className="h-4 w-4" /></span>
                        <span className="bg-white/10 backdrop-blur-md text-white p-2 rounded-xl border border-white/20 shadow-2xl"><Waves className="h-4 w-4" /></span>
                    </div>
                </div>
            </Link>

            <div className="px-4 pb-4 space-y-3 flex-1 flex flex-col">
                <div className="space-y-1">
                    <div className="flex items-center gap-1.5 opacity-60">
                        <MapPin className="h-3 w-3 text-accent" aria-hidden="true" />
                        <p className="text-[10px] font-bold text-slate-500 tracking-[0.2em] uppercase truncate">{prop.neighborhood || 'Bairro Nobre'}, Praia Grande</p>
                    </div>
                    <Link href={`/${prop.slug}`} className="block group flex-1">
                        <h3 className="text-base font-bold text-primary-900 tracking-tight group-hover:text-accent transition-colors line-clamp-2 leading-tight">
                            {prop.category || 'Apartamento'} no {prop.neighborhood || 'Praia Grande'}
                        </h3>
                    </Link>
                </div>

                <div className="grid grid-cols-5 gap-2 py-3 border-y border-slate-50 min-h-[4rem] items-center">
                    {specs.slice(0, 5).map((spec) => {
                        const IconComp = ICON_MAP[spec.icon] || Info;
                        const value = prop[spec.field] || 0;
                        return (
                            <div key={spec.id} className="flex flex-col items-center gap-1" title={spec.label}>
                                <div className="p-1.5 bg-slate-50 rounded-lg group-hover:bg-accent/5 transition-colors">
                                    <IconComp className="h-4 w-4 text-accent" aria-hidden="true" />
                                </div>
                                <span className="text-[9px] font-black text-slate-500 tracking-widest uppercase text-center truncate w-full px-1">
                                    {value}{spec.suffix || ''}
                                </span>
                            </div>
                        );
                    })}
                </div>

                {prop.features && prop.features.length > 0 && (
                    <div className="flex flex-wrap gap-2 py-1">
                        {prop.features.slice(0, 4).map((feat: string, i: number) => {
                            const FeatureIcon = getFeatureIcon(feat);
                            return (
                                <div key={i} className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-md border border-slate-100 group-hover:border-accent/30 transition-all" title={feat}>
                                    <FeatureIcon className="h-3 w-3 text-accent/70" />
                                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter truncate max-w-[60px]">{feat}</span>
                                </div>
                            );
                        })}
                    </div>
                )}

                <div className="min-h-[2.5rem] mb-2">
                    <p className="text-[10px] font-medium text-slate-400 leading-relaxed line-clamp-3 uppercase tracking-tight">
                        {prop.description || 'Imóvel exclusivo com excelente localização e acabamento diferenciado em Praia Grande. Agende sua visita agora mesmo.'}
                    </p>
                </div>

                <div className="mt-auto space-y-3">
                    <div className="flex justify-between items-end pt-2">
                        <div className="space-y-0.5">
                            <p className="text-[9px] font-bold text-slate-500 tracking-[0.2em] uppercase">Investimento</p>
                            <p className="text-2xl font-black text-primary-900 tracking-tighter leading-none">
                                {prop.price?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </p>
                        </div>
                        <Link
                            href={`/${prop.slug}`}
                            aria-label={`Ver detalhes de ${prop.category || 'Apartamento'} no ${prop.neighborhood || 'Praia Grande'}`}
                            className="bg-primary-900 text-white p-4 rounded-[20px] hover:bg-accent transition-all shadow-xl shadow-primary-900/10 active:scale-95 group/btn"
                        >
                            <ArrowUpRight className="h-5 w-5 group-hover/btn:rotate-45 transition-transform duration-500" aria-hidden="true" />
                        </Link>
                    </div>

                    <div className="pt-3 border-t border-slate-50">
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/${prop.slug}`;
                                const message = `Confira este imóvel: ${prop.title} - ${url}`;
                                window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
                            }}
                            aria-label="Compartilhar no WhatsApp"
                            className="w-full bg-[#25d366]/5 hover:bg-[#25d366] text-[#25d366] hover:text-white py-3 rounded-2xl font-black text-[9px] uppercase tracking-widest transition-all shadow-sm flex items-center justify-center gap-2 group/wpp"
                        >
                            <MessageSquare className="h-3.5 w-3.5 fill-current group-hover/wpp:rotate-12 transition-transform" aria-hidden="true" /> WhatsApp
                        </button>
                    </div>
                </div>
            </div>
        </article>
    );
}
