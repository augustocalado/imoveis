'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { MapPin, ArrowRight, Home, Loader2, Maximize2, Bed, Bath, Calendar } from 'lucide-react';
import Link from 'next/link';
import clsx from 'clsx';

export default function LancamentosPage() {
    const [properties, setProperties] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchLancamentos = async () => {
            setIsLoading(true);
            const { data, error } = await supabase
                .from('properties')
                .select('*')
                .eq('is_launch', true)
                .eq('status', 'disponivel')
                .order('created_at', { ascending: false });

            if (!error) {
                setProperties(data || []);
            }
            setIsLoading(false);
        };
        fetchLancamentos();
    }, []);

    return (
        <div className="min-h-screen bg-white">
            <Navbar />

            <main className="pt-32 pb-40">
                <div className="max-w-7xl mx-auto px-6">
                    <nav className="flex items-center gap-2 text-[10px] font-bold tracking-[0.3em] text-slate-300 mb-8 uppercase">
                        <Link href="/" className="hover:text-accent transition-colors">Home</Link>
                        <span>/</span>
                        <span className="text-accent">Lançamentos Exclusivos</span>
                    </nav>

                    <header className="max-w-4xl space-y-6 mb-24">
                        <h1 className="text-6xl md:text-8xl font-black text-[#1B263B] tracking-tighter leading-[0.9]">
                            Futuro e <br /> <span className="text-accent">Exclusividade</span>
                        </h1>
                        <p className="text-slate-400 font-bold text-sm md:text-lg max-w-2xl tracking-wide uppercase">
                            Antecipe-se às tendências com as melhores oportunidades em empreendimentos na planta e obras avançadas na Praia Grande.
                        </p>
                    </header>

                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-40 gap-8">
                            <div className="relative">
                                <div className="h-20 w-20 border-4 border-slate-50 border-t-accent rounded-full animate-spin" />
                                <div className="h-20 w-20 border-4 border-accent/10 rounded-full absolute inset-0" />
                            </div>
                            <p className="text-slate-300 font-bold tracking-[0.4em] text-[10px] animate-pulse uppercase">Carregando Oportunidades...</p>
                        </div>
                    ) : properties.length === 0 ? (
                        <div className="bg-[#f8fafc] p-32 rounded-[60px] text-center space-y-8 border border-slate-100">
                            <div className="h-20 w-20 bg-white rounded-full flex items-center justify-center mx-auto shadow-xl">
                                <Calendar className="h-8 w-8 text-slate-200" />
                            </div>
                            <h3 className="text-3xl font-black tracking-tighter text-[#1B263B]">Em breve novos lançamentos</h3>
                            <p className="text-slate-400 font-bold text-sm max-w-sm mx-auto uppercase">Estamos selecionando os melhores ativos para você. Entre em contato para saber das novidades em primeira mão.</p>
                            <Link
                                href="/contato"
                                className="inline-block bg-[#1B263B] text-white px-10 py-5 rounded-3xl font-bold text-[10px] tracking-widest hover:bg-accent transition-all shadow-2xl uppercase"
                            >
                                Ser Notificado
                            </Link>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-24">
                            {properties.map((prop, i) => (
                                <article
                                    key={prop.id}
                                    className="group relative flex flex-col lg:flex-row gap-16 items-center animate-in fade-in slide-in-from-bottom-10 duration-1000"
                                    style={{ animationDelay: `${i * 200}ms` }}
                                >
                                    <div className="lg:w-1/2 relative aspect-[16/10] lg:aspect-square w-full rounded-[60px] overflow-hidden shadow-2xl transition-transform duration-700 group-hover:-translate-y-2">
                                        <img
                                            src={prop.images?.[0] || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=1200'}
                                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                            alt={prop.title}
                                        />
                                        <div className="absolute top-10 left-10 bg-white/10 backdrop-blur-md border border-white/20 px-6 py-2 rounded-full text-white text-[10px] font-bold tracking-widest uppercase">
                                            Lançamento
                                        </div>
                                    </div>

                                    <div className="lg:w-1/2 space-y-10">
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3 text-accent font-bold text-[12px] tracking-widest uppercase">
                                                <Home className="h-4 w-4" />
                                                <span>{prop.condo_name || 'Residencial Signature'}</span>
                                            </div>
                                            <h2 className="text-4xl md:text-6xl font-black text-[#1B263B] tracking-tighter leading-[0.95] group-hover:text-accent transition-colors">
                                                {prop.title}
                                            </h2>
                                            <div className="flex items-center gap-2 text-slate-400 font-bold text-sm tracking-wider uppercase">
                                                <MapPin className="h-4 w-4 text-accent" />
                                                {prop.neighborhood}, {prop.city}
                                            </div>
                                        </div>

                                        <p className="text-slate-400 font-medium text-lg line-clamp-3">
                                            {prop.description}
                                        </p>

                                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-10 py-10 border-y border-slate-50">
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-300 tracking-widest mb-2 uppercase">Suítes</p>
                                                <p className="text-xl font-black text-[#1B263B]">{prop.suites || prop.rooms} Suítes</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-300 tracking-widest mb-2 uppercase">Área Flex</p>
                                                <p className="text-xl font-black text-[#1B263B]">{prop.area} a {prop.area_total || prop.area}m²</p>
                                            </div>
                                            <div className="hidden lg:block">
                                                <p className="text-[10px] font-bold text-accent tracking-widest mb-2 uppercase">Ano Entrega</p>
                                                <p className="text-xl font-black text-[#1B263B]">{prop.year_built || '--'}</p>
                                            </div>
                                        </div>

                                        <div className="flex flex-col md:flex-row gap-8 items-center justify-between pt-4">
                                            <div className="text-center md:text-left">
                                                <p className="text-[10px] font-bold text-slate-300 tracking-widest mb-2 uppercase">Fluxo de Pagamento</p>
                                                <p className="text-4xl font-black text-accent tracking-tighter">
                                                    {prop.price > 0 ? prop.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'Sob consulta'}
                                                </p>
                                            </div>
                                            <Link
                                                href={`/imovel/${prop.slug || prop.id}`}
                                                className="bg-[#1B263B] text-white px-12 py-6 rounded-3xl font-bold text-[11px] tracking-[0.2em] hover:bg-black transition-all flex items-center gap-4 shadow-2xl active:scale-95 group uppercase"
                                            >
                                                Ver Detalhes
                                                <ArrowRight className="h-5 w-5 group-hover:translate-x-2 transition-all" />
                                            </Link>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )
                    }
                </div>
            </main>

            <Footer />
        </div>
    );
}
