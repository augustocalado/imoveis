'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import {
    Search, SlidersHorizontal, MapPin,
    Bed, Bath, DollarSign, Loader2, ArrowRight, Play, Maximize2, Share2, MessageCircle
} from 'lucide-react';
import Link from 'next/link';
import clsx from 'clsx';

export default function PropertiesListPage() {
    const [properties, setProperties] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Filter States
    const [search, setSearch] = useState('');
    const [type, setType] = useState('');
    const [city, setCity] = useState('');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');

    const fetchProperties = async () => {
        setIsLoading(true);
        let query = supabase
            .from('properties')
            .select('*, corretor:profiles!corretor_id(full_name)')
            .in('status', ['disponivel', 'disponível', 'Disponivel', 'Disponível']);

        if (search) query = query.ilike('title', `%${search}%`);
        if (type) query = query.eq('type', type);
        if (city) query = query.ilike('city', `%${city}%`);
        if (minPrice) query = query.gte('price', parseFloat(minPrice));
        if (maxPrice) query = query.lte('price', parseFloat(maxPrice));

        const { data } = await query.order('created_at', { ascending: false });
        setProperties(data || []);
        setIsLoading(false);
    };

    useEffect(() => {
        fetchProperties();
    }, []);

    return (
        <div className="min-h-screen bg-white  text-primary-900 selection:bg-accent/30 lowercase">
            <Navbar />

            {/* Hero Section Simplificado */}
            <main className="max-w-7xl mx-auto px-6 py-32 lg:py-48">
                <div className="mb-24 space-y-6">
                    <p className="text-accent font-black text-[12px] uppercase tracking-[0.5em] animate-in slide-in-from-left duration-500">Catálogo Signature</p>
                    <h1 className="text-5xl md:text-8xl font-black text-primary-900 tracking-tighter leading-[0.9] uppercase animate-in slide-in-from-bottom duration-700">
                        Onde seu novo <br /> <span className="text-accent underline decoration-accent/20">capítulo começa</span>.
                    </h1>
                    <p className="text-slate-400 font-bold text-sm max-w-xl animate-in fade-in duration-1000 uppercase">
                        Curadoria exclusiva de imóveis de alto padrão em Praia Grande, selecionados para quem busca o extraordinário.
                    </p>
                </div>

                {/* Glass Filter Section */}
                <div className="bg-primary-900 p-10 rounded-[50px] shadow-2xl relative overflow-hidden mb-24 group border border-white/5">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-accent/20 blur-[150px] pointer-events-none group-hover:bg-accent/30 transition-all duration-1000" />

                    <div className="relative z-10 grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-8 items-end">
                        <div className="space-y-3">
                            <label className="text-[11px] font-black text-white/30 uppercase tracking-widest ml-1">O que você busca?</label>
                            <div className="bg-white/5 border border-white/10 p-5 rounded-2xl flex items-center gap-4 focus-within:bg-white/10 focus-within:border-accent transition-all">
                                <Search className="h-4 w-4 text-accent" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Ex: Apartamento, Casa..."
                                    className="bg-transparent border-none outline-none text-white text-sm font-bold w-full placeholder:text-white/20 uppercase"
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[11px] font-black text-white/30 uppercase tracking-widest ml-1">Modalidade</label>
                            <select
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-white text-sm font-bold outline-none focus:border-accent transition-all appearance-none cursor-pointer uppercase"
                            >
                                <option value="" className="bg-primary-900 text-white">Todos</option>
                                <option value="venda" className="bg-primary-900 text-white">Comprar</option>
                                <option value="aluguel" className="bg-primary-900 text-white">Alugar</option>
                            </select>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[11px] font-black text-white/30 uppercase tracking-widest ml-1">Cidade</label>
                            <div className="bg-white/5 border border-white/10 p-5 rounded-2xl flex items-center gap-4 focus-within:bg-white/10 focus-within:border-accent transition-all">
                                <MapPin className="h-4 w-4 text-accent" />
                                <input
                                    type="text"
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                    placeholder="Cidade..."
                                    className="bg-transparent border-none outline-none text-white text-sm font-bold w-full placeholder:text-white/20 uppercase"
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[11px] font-black text-white/30 uppercase tracking-widest ml-1">Valor Máximo</label>
                            <div className="bg-white/5 border border-white/10 p-5 rounded-2xl flex items-center gap-4 focus-within:bg-white/10 focus-within:border-accent transition-all">
                                <DollarSign className="h-4 w-4 text-accent" />
                                <input
                                    type="number"
                                    value={maxPrice}
                                    onChange={(e) => setMaxPrice(e.target.value)}
                                    placeholder="R$ Infinito..."
                                    className="bg-transparent border-none outline-none text-white text-sm font-bold w-full placeholder:text-white/20 uppercase"
                                />
                            </div>
                        </div>

                        <button
                            onClick={fetchProperties}
                            className="bg-accent text-white h-[66px] rounded-2xl font-black text-[12px] uppercase tracking-widest hover:bg-white hover:text-primary-900 transition-all active:scale-95 shadow-2xl shadow-accent/20 flex items-center justify-center gap-3"
                        >
                            <SlidersHorizontal className="h-4 w-4" /> Personalizar
                        </button>
                    </div>
                </div>

                {/* Results List */}
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-40 gap-8">
                        <div className="relative">
                            <div className="h-20 w-20 border-4 border-slate-50 border-t-accent rounded-full animate-spin" />
                            <div className="h-20 w-20 border-4 border-accent/20 rounded-full absolute inset-0" />
                        </div>
                        <p className="text-slate-300 font-black uppercase tracking-[0.4em] text-[12px] animate-pulse">Sincronizando Ativos...</p>
                    </div>
                ) : properties.length === 0 ? (
                    <div className="bg-[#f8fafc] p-32 rounded-[60px] text-center space-y-8 border border-slate-100">
                        <div className="h-20 w-20 bg-white rounded-full flex items-center justify-center mx-auto shadow-xl">
                            <Search className="h-8 w-8 text-slate-200" />
                        </div>
                        <h3 className="text-3xl font-black tracking-tighter uppercase">Nenhum imóvel disponível no momento</h3>
                        <p className="text-slate-400 font-bold text-sm max-w-sm mx-auto uppercase">Tente ajustar seus critérios de busca para encontrar novas oportunidades exclusivas.</p>
                        <button
                            onClick={() => {
                                setSearch(''); setType(''); setCity(''); setMinPrice(''); setMaxPrice('');
                                fetchProperties();
                            }}
                            className="bg-primary-900 text-white px-10 py-5 rounded-2xl font-black text-[12px] uppercase tracking-widest hover:bg-accent transition-all"
                        >
                            Resetar Filtros
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-24">
                        {properties.map((prop, i) => (
                            <Link key={prop.id} href={`/imovel/${prop.slug || prop.id}`} className="group relative block animate-in fade-in slide-in-from-bottom-5 duration-700" style={{ animationDelay: `${i * 100}ms` }}>
                                <div className="space-y-6">
                                    <div className="relative aspect-[4/5] rounded-[50px] overflow-hidden shadow-2xl transition-transform duration-700 group-hover:-translate-y-4">
                                        <img
                                            src={prop.images?.[0] || 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&q=80&w=800'}
                                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                                            alt={prop.title}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-primary-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-10 flex items-end">
                                            <div className="bg-white/10 backdrop-blur-3xl border border-white/20 p-6 rounded-3xl w-full flex justify-between items-center text-white">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-[12px] font-black uppercase tracking-widest text-[#10b981]">Investimento</span>
                                                    <span className="text-xl font-black tracking-tighter">{prop.price?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                                                </div>
                                                <div className="h-10 w-10 rounded-xl bg-accent flex items-center justify-center">
                                                    <ArrowRight className="h-5 w-5" />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="absolute top-8 left-8 flex flex-col gap-3">
                                            <span className="bg-white px-4 py-2 rounded-xl text-primary-900 text-[11px] font-black uppercase tracking-widest shadow-xl">
                                                {prop.type === 'venda' ? 'Compra' : 'Aluguel'}
                                            </span>
                                            {prop.is_featured && (
                                                <span className="bg-accent text-white px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest shadow-xl">Destaque</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="px-4 space-y-4">
                                        <div className="flex justify-between items-start">
                                            <h3 className="text-2xl font-black tracking-tighter uppercase leading-[0.95] group-hover:text-accent transition-colors truncate">
                                                {prop.title}
                                            </h3>
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-300 font-bold text-sm uppercase">
                                            <MapPin className="h-3.5 w-3.5 text-accent" />
                                            {prop.neighborhood}, {prop.city}
                                        </div>

                                        <div className="flex items-center gap-6 pt-4 border-t border-slate-50">
                                            <div className="flex items-center gap-2">
                                                <Bed className="h-4 w-4 text-slate-200" />
                                                <span className="text-[12px] font-black text-slate-400 uppercase tracking-widest">{prop.rooms} Dorms</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Maximize2 className="h-4 w-4 text-slate-200" />
                                                <span className="text-[12px] font-black text-slate-400 uppercase tracking-widest">{prop.area}m²</span>
                                            </div>
                                        </div>
                                        <div className="pt-6 mt-2">
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    const url = `${window.location.origin}/imovel/${prop.slug}`;
                                                    const message = `Confira este imóvel: ${prop.title} - ${url}`;
                                                    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
                                                }}
                                                className="w-full flex items-center justify-center gap-3 bg-[#F2FBF9] text-[#10b981] py-4 rounded-[30px] font-black text-[10px] uppercase tracking-[0.2em] hover:bg-[#10b981] hover:text-white transition-all shadow-sm group/share"
                                            >
                                                <MessageCircle className="h-4 w-4 fill-current group-hover/share:rotate-12 transition-transform" /> Compartilhe no WhatsApp
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
