'use client';

import Footer from '@/components/Footer';
import { Search, MapPin, CheckCircle2, Star, ArrowRight, ShieldCheck, Shield, Phone, Mail, Loader2, MessageSquare, MessageCircle, Play, Waves, Maximize2, Bed, Car, Bath, X, ArrowUpRight, Share2, ChevronLeft, ChevronRight, Navigation } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState, useRef } from 'react';
import { db } from '@/lib/database';
import { supabase } from '@/lib/supabase';
import GlobalSearch from '@/components/GlobalSearch';
import PropertyCard from '@/components/PropertyCard';
import clsx from 'clsx';


export default function Home() {
    const [homeConfig, setHomeConfig] = useState({
        horizontal_count: 8,
        vertical_count: 6,
        show_horizontal: true,
        show_vertical: true,
        horizontal_title: 'Destaques Exclusive',
        vertical_title: 'Oportunidades em Praia Grande'
    });
    const [heroSettings, setHeroSettings] = useState({
        title: 'Encontre seu imóvel \nna Praia Grande \ncom atendimento rápido',
        subtitle: 'As melhores oportunidades no Canto do Forte, Boqueirão e toda região da Baixada Santista.',
        image_url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=1920',
        title_font_size: 72
    });
    const [properties, setProperties] = useState<any[]>([]);
    const [neighborhoods, setNeighborhoods] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isVideoOpen, setIsVideoOpen] = useState(false);
    const [selectedVideo, setSelectedVideo] = useState('');
    const [blogPosts, setBlogPosts] = useState<any[]>([]);
    const [hqSettings, setHqSettings] = useState({
        hq_title: 'Nossa Sede em Praia Grande',
        hq_description: 'Venha nos visitar e conhecer as melhores oportunidades imobiliárias pessoalmente.',
        hq_maps_url: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3648.4682014844397!2d-46.4172448!3d-24.004944!2m3!1f0!2f0!3f3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94ce1c4f00000001%3A0x0!2zMjTCsDAwJzE3LjgiUyA0NsKwMjUnMDIuMSJX!5e0!3m2!1spt-BR!2sbr!4v1714589254321!5m2!1spt-BR!2sbr'
    });
    const [siteContact, setSiteContact] = useState({
        phone: '(13) 3474-0000',
        email: 'vendas@kfimoveis.com.br',
        address: 'Canto do Forte, PG - SP'
    });
    const [specs, setSpecs] = useState<any[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);

    const getEmbedUrl = (url: string) => {
        if (!url) return undefined;
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            const id = url.includes('v=') ? url.split('v=')[1]?.split('&')[0] : url.split('/').pop();
            return `https://www.youtube.com/embed/${id}?autoplay=1`;
        }
        if (url.includes('vimeo.com')) {
            const id = url.split('/').pop();
            return `https://player.vimeo.com/video/${id}?autoplay=1`;
        }
        return url;
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const results = await Promise.all([
                    supabase.from('site_settings').select('value').eq('key', 'home_hero').single(),
                    supabase.from('site_settings').select('value').eq('key', 'home_config').single(),
                    supabase.from('properties')
                        .select('*, profiles!corretor_id(full_name)')
                        .in('status', ['disponivel', 'disponível', 'Disponivel', 'Disponível'])
                        .eq('is_featured', true)
                        .limit(100),
                    supabase.from('blog_posts').select('*').order('created_at', { ascending: false }).limit(3),
                    supabase.from('properties').select('neighborhood').not('neighborhood', 'is', null),
                    supabase.from('site_settings').select('value').eq('key', 'home_hq').single(),
                    supabase.from('site_settings').select('value').eq('key', 'site_contact').single(),
                    supabase.from('site_settings').select('value').eq('key', 'property_specs').single()
                ]);

                const [heroRes, configRes, propsRes, blogRes, neighborRes, hqRes, contactRes, specsRes] = results;

                if (heroRes.data) setHeroSettings(heroRes.data.value);
                if (configRes.data) setHomeConfig(prev => ({ ...prev, ...configRes.data.value }));
                
                if (propsRes.data) {
                    const shuffled = [...propsRes.data].sort(() => 0.5 - Math.random());
                    setProperties(shuffled);
                }

                if (blogRes.data) setBlogPosts(blogRes.data);

                if (neighborRes.data) {
                    const unique = Array.from(new Set(neighborRes.data.map((p: any) => p.neighborhood))) as string[];
                    setNeighborhoods(unique.sort());
                }

                if (hqRes.data) setHqSettings(hqRes.data.value);
                if (contactRes.data) setSiteContact(prev => ({ ...prev, ...contactRes.data.value }));
                
                if (specsRes.data) setSpecs(specsRes.data.value);
                else setSpecs([
                    { id: 'area', label: 'Área', field: 'area', icon: 'Maximize2', suffix: 'm²' },
                    { id: 'rooms', label: 'Dorm', field: 'rooms', icon: 'Bed' },
                    { id: 'suites', label: 'Suítes', field: 'suites', icon: 'BedDouble' },
                    { id: 'bathrooms', label: 'Banheiros', field: 'bathrooms', icon: 'Bath' },
                    { id: 'parking', label: 'Vagas', field: 'parking_spaces', icon: 'Car' }
                ]);

            } catch (error) {
                console.error('Erro ao buscar dados:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (!properties.length || !scrollRef.current) return;
        
        const interval = setInterval(() => {
            if (scrollRef.current) {
                const maxScroll = scrollRef.current.scrollWidth - scrollRef.current.clientWidth;
                if (scrollRef.current.scrollLeft >= maxScroll - 10) {
                    scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
                } else {
                    scrollRef.current.scrollBy({ left: 400, behavior: 'smooth' });
                }
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [properties.length]);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const amount = direction === 'left' ? -400 : 400;
            scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
        }
    };

    // Schema.org Data for Local SEO
    // Schema.org Data for Local SEO
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "RealEstateAgent",
        "name": "Kátia e Flávio Imóveis",
        "image": "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1200",
        "@id": "https://katiaeflavioimoveis.com.br",
        "url": "https://katiaeflavioimoveis.com.br",
        "telephone": "+551334740000",
        "address": {
            "@type": "PostalAddress",
            "streetAddress": "Canto do Forte",
            "addressLocality": "Praia Grande",
            "addressRegion": "SP",
            "postalCode": "11700-000",
            "addressCountry": "BR"
        },
        "geo": {
            "@type": "GeoCoordinates",
            "latitude": -24.00,
            "longitude": -46.40
        },
        "openingHoursSpecification": {
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
            "opens": "09:00",
            "closes": "18:00"
        },
        "sameAs": [
            "https://www.facebook.com/katiaeflavioimoveis",
            "https://www.instagram.com/katiaeflavioimoveis"
        ]
    };

    return (
        <main className="flex-1">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />





            {/* Hero Section - Optimized SEO H1 */}
            <section className="relative min-h-[90vh] flex items-center justify-center pt-32 md:pt-40 z-20">
                <div className="absolute inset-0">
                    <Image
                        src={heroSettings.image_url || "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=1920"}
                        fill
                        className="object-cover scale-105 animate-slow-zoom"
                        alt="Imóveis em Praia Grande"
                        priority={true}
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-primary-900/60 via-primary-900/40 to-primary-900/80" />
                    <div className="absolute inset-0 bg-black/20" />
                </div>
                
                <div className="max-w-7xl mx-auto px-4 w-full relative z-10">
                    <div className="flex flex-col items-center text-center space-y-10 animate-in fade-in slide-in-from-bottom-12 duration-1000">
                        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-white px-6 py-2.5 rounded-full font-bold text-[12px] tracking-[0.2em] shadow-2xl uppercase">
                            <ShieldCheck className="h-4 w-4 text-accent" /> A melhor imobiliária de Praia Grande
                        </div>
                        
                        <div className="space-y-6 max-w-5xl">
                            <h1 
                                className="font-black text-white leading-[0.95] tracking-tighter drop-shadow-2xl transition-all duration-700 text-[2.2rem] md:text-[3rem] lg:text-[4.5rem]"
                            >
                                {heroSettings.title.split('\n').map((line, i) => (
                                    <span key={i}>
                                        {line}
                                        {i < heroSettings.title.split('\n').length - 1 && <br className="hidden md:block" />}
                                    </span>
                                ))}
                            </h1>
                            <p className="text-white/80 text-xl md:text-2xl font-medium max-w-3xl mx-auto leading-relaxed drop-shadow-lg">
                                {heroSettings.subtitle}
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-6 w-full max-w-4xl justify-center">
                            <Link 
                                href="/catalogo" 
                                className="w-full md:w-auto bg-accent text-white px-10 py-6 rounded-[24px] font-bold text-sm tracking-[0.2em] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 shadow-2xl shadow-accent/20 group uppercase"
                            >
                                <Search className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                                Comprar
                            </Link>

                            <Link 
                                href="/imoveis?type=aluguel" 
                                className="w-full md:w-auto bg-white/10 backdrop-blur-md text-white border border-white/20 px-10 py-6 rounded-[24px] font-bold text-sm tracking-[0.2em] hover:bg-white/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 group uppercase"
                            >
                                <MapPin className="h-5 w-5 group-hover:bounce transition-transform" />
                                Alugar
                            </Link>

                            <a 
                                href="https://wa.me/5513997826694" 
                                target="_blank"
                                className="w-full md:w-auto bg-[#25d366] text-white px-10 py-6 rounded-[24px] font-bold text-sm tracking-[0.2em] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 shadow-2xl shadow-green-500/20 group uppercase"
                            >
                                <MessageCircle className="h-6 w-6 fill-current group-hover:rotate-12 transition-transform" />
                                WhatsApp 24h
                            </a>
                        </div>

                        {/* Global Search */}
                        <div className="w-full max-w-5xl mt-2 relative z-50">
                            <div className="bg-white/5 backdrop-blur-2xl p-4 border border-white/10 rounded-[40px] shadow-2xl">
                                <GlobalSearch />
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-slate-50 to-transparent z-[-1]" />
            </section>

            {/* Removed Horizontal Selection as requested */}

            <div className="h-10 bg-slate-50" />
            {homeConfig.show_vertical && (
                <section className="py-32 bg-slate-50 ">
                    <div className="max-w-7xl mx-auto px-4">
                        <header className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
                            <div>
                                <p className="text-accent font-bold text-sm uppercase tracking-[0.5em]">Oportunidades únicas</p>
                                <h2 className="text-4xl md:text-5xl font-black text-primary-900 tracking-tighter leading-none">{homeConfig.vertical_title}</h2>
                            </div>
                            <Link href="/imoveis" className="text-[12px] font-bold tracking-[0.3em] text-primary-900 border-b-2 border-accent pb-1 hover:text-accent transition-all whitespace-nowrap uppercase">
                                Ver catálogo completo
                            </Link>
                        </header>
    
                        <div className={clsx(
                            "grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10",
                            (homeConfig as any).grid_columns === 3 ? "lg:grid-cols-3" : "lg:grid-cols-4"
                        )}>
                            {isLoading ? (
                                <div className="col-span-full py-20 flex flex-col items-center justify-center gap-4">
                                    <Loader2 className="h-12 w-12 text-accent animate-spin" />
                                    <p className="text-[12px] font-bold tracking-[0.3em] text-primary-900/40 uppercase">Carregando Oportunidades</p>
                                </div>
                            ) : properties.length > 0 ? properties.slice(0, homeConfig.vertical_count).map((prop, i) => (
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
                        )) : (
                            <div className="col-span-full py-20 text-center">
                                <p className="text-sm font-bold text-slate-400 tracking-widest uppercase">Nenhum imóvel disponível no momento</p>
                            </div>
                        )}
                    </div>
                </div>
            </section>
            )}

            {/* Nova Seção: Captação de Leads */}
            <section className="py-24 bg-primary-900 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent rounded-full blur-[150px] -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-white rounded-full blur-[150px] translate-y-1/2 -translate-x-1/2" />
                </div>
                
                <div className="max-w-7xl mx-auto px-4 relative z-10">
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[60px] p-8 md:p-20 shadow-3xl">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                            <div className="space-y-8 text-center lg:text-left">
                                <div className="inline-flex items-center gap-2 bg-accent/20 border border-accent/20 text-accent px-5 py-2 rounded-full font-bold text-xs uppercase tracking-[0.3em]">
                                    Semanalmente no seu celular
                                </div>
                                <h2 className="text-4xl md:text-6xl font-black text-white leading-none tracking-tighter">
                                    Receba imóveis direto no seu <span className="text-accent italic">WhatsApp</span>
                                </h2>
                                <p className="text-white/60 text-lg font-medium max-w-xl mx-auto lg:mx-0">
                                    Seja o primeiro a saber das novas oportunidades e baixas de preço nos melhores bairros de Praia Grande.
                                </p>
                            </div>
                            
                            <form className="bg-white p-2 rounded-[40px] shadow-2xl flex flex-col md:flex-row items-center gap-2 group">
                                <div className="flex-1 w-full relative">
                                    <input 
                                        type="text" 
                                        placeholder="Seu Nome"
                                        className="w-full bg-slate-50 border-none p-6 rounded-[32px] text-primary-900 font-bold outline-none focus:ring-2 focus:ring-accent transition-all"
                                    />
                                </div>
                                <div className="flex-1 w-full relative">
                                    <input 
                                        type="tel" 
                                        placeholder="Seu WhatsApp"
                                        className="w-full bg-slate-50 border-none p-6 rounded-[32px] text-primary-900 font-bold outline-none focus:ring-2 focus:ring-accent transition-all"
                                    />
                                </div>
                                <button className="w-full md:w-auto bg-primary-900 text-white px-10 py-6 rounded-[32px] font-bold text-sm tracking-[0.2em] hover:bg-accent transition-all shadow-xl group-hover:scale-[1.02] active:scale-95 uppercase">
                                    Quero receber
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>

            {/* Best Neighborhoods & Property Carousel Section */}
            <section className="py-24 bg-white overflow-hidden">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start mb-16">
                        <div className="lg:col-span-5 space-y-8">
                            <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/20 text-accent px-4 py-1.5 rounded-full font-extrabold text-[10px] uppercase tracking-[0.3em]">
                                Onde morar bem
                            </div>
                            <h2 className="text-4xl md:text-5xl font-black text-primary-900 tracking-tighter leading-[0.95]">
                                Os Melhores Bairros de <br /> <span className="text-accent italic font-serif lowercase">Praia Grande</span>
                            </h2>
                            <p className="text-slate-500 font-medium text-base leading-relaxed">
                                Escolher o bairro certo é o primeiro passo para o seu novo estilo de vida. Conheça as regiões mais valorizadas e desejadas da nossa cidade.
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                                {[
                                    { name: 'Canto do Forte', desc: 'Nobre e Exclusivo' },
                                    { name: 'Boqueirão', desc: 'Centro e Conveniência' },
                                    { name: 'Guilhermina', desc: 'Lazer e Tradição' },
                                    { name: 'Aviação', desc: 'Moderno e em Expansão' }
                                ].map((b, i) => (
                                    <div key={i} className="flex items-center gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 group hover:bg-white hover:border-accent/30 transition-all cursor-default">
                                        <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-white transition-colors">
                                            <Navigation className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-black text-primary-900 uppercase tracking-widest">{b.name}</p>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{b.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="lg:col-span-7 relative group">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-[12px] font-black text-slate-400 uppercase tracking-[0.4em]">Destaques da Semana</h3>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => scrollRef.current?.scrollBy({ left: -400, behavior: 'smooth' })}
                                        className="h-10 w-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-primary-900 hover:text-white hover:border-primary-900 transition-all shadow-sm"
                                    >
                                        <ChevronLeft className="h-5 w-5" />
                                    </button>
                                    <button 
                                        onClick={() => scrollRef.current?.scrollBy({ left: 400, behavior: 'smooth' })}
                                        className="h-10 w-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-primary-900 hover:text-white hover:border-primary-900 transition-all shadow-sm"
                                    >
                                        <ChevronRight className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                            
                            <div 
                                ref={scrollRef}
                                className="flex gap-6 overflow-x-auto pb-8 snap-x snap-mandatory no-scrollbar scroll-smooth"
                                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                            >
                                {properties.slice(0, 5).map((prop, i) => (
                                    <div key={prop.id} className="min-w-[300px] md:min-w-[350px] snap-start">
                                        <PropertyCard prop={prop} index={i} specs={specs} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* SEO Authority Section - Why Choose Us */}
            <section className="py-20 md:py-32 bg-white">
                <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-24 items-center">
                    <div className="relative md:px-12">
                        <div className="absolute top-0 right-0 w-80 h-80 bg-accent/5 rounded-full blur-[100px]" />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 relative z-10">
                            <div className="bg-slate-50 p-6 md:p-10 rounded-[40px] md:rounded-[50px] space-y-4 md:translate-y-12 shadow-sm border border-slate-100">
                                <div className="h-12 w-12 bg-accent/10 rounded-2xl flex items-center justify-center">
                                    <Building2 className="h-6 w-6 text-accent" />
                                </div>
                                <h3 className="text-xl font-black text-primary-900 tracking-tighter leading-tight">Diversas Opções</h3>
                                <p className="text-sm text-slate-400 font-semibold leading-relaxed">Amplo catálogo de imóveis em Praia Grande SP para todos os perfis.</p>
                            </div>
                            <div className="bg-primary-900 p-6 md:p-10 rounded-[40px] md:rounded-[50px] space-y-4 text-white shadow-2xl shadow-primary-900/20">
                                <div className="h-12 w-12 bg-accent rounded-2xl flex items-center justify-center">
                                    <MapPin className="h-6 w-6 text-primary-900" />
                                </div>
                                <h3 className="text-xl font-black tracking-tighter leading-tight">Localização</h3>
                                <p className="text-sm text-primary-100/60 font-semibold leading-relaxed">Conhecemos cada bairro de Praia Grande para sugerir o melhor investimento.</p>
                            </div>
                            <div className="sm:col-span-2 bg-slate-50 p-6 md:p-10 rounded-[40px] md:rounded-[50px] flex flex-col sm:flex-row items-start sm:items-center gap-6 md:gap-8 shadow-sm border border-slate-100">
                                <div className="h-16 w-16 min-w-[64px] rounded-full bg-accent flex items-center justify-center text-white font-black text-xl shadow-lg ring-4 ring-accent/10">15+</div>
                                <div>
                                    <h3 className="text-lg md:text-xl font-black text-primary-900 tracking-tighter">Anos de Experiência</h3>
                                    <p className="text-sm text-slate-400 font-semibold uppercase tracking-widest mt-1">A imobiliária de confiança da sua família.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-8">
                        <p className="text-accent font-bold text-sm uppercase tracking-[0.5em]">Por que escolher Kátia e Flávio</p>
                        <h2 className="text-4xl md:text-5xl font-black text-primary-900 tracking-tighter leading-[0.9]">Sua jornada para o imóvel ideal em <br /> <span className="text-accent italic font-serif lowercase">Praia Grande</span> começa aqui.</h2>
                        <div className="space-y-6 pt-6">
                            {[
                                { t: 'Assessoria Jurídica Ativa', d: 'Garantimos segurança em todos os trâmites do seu novo apartamento.' },
                                { t: 'Financiamento Facilitado', d: 'Trabalhamos com os principais bancos para as melhores taxas de juros.' },
                                { t: 'Pós-Venda Diferenciado', d: 'Suporte completo após a entrega das chaves da sua nova casa na praia.' }
                            ].map((item, idx) => (
                                <div key={idx} className="flex gap-6 group">
                                    <div className="bg-slate-100 p-3 rounded-2xl group-hover:bg-primary-900 group-hover:text-white transition-all duration-500">
                                        <CheckCircle2 className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-primary-900 tracking-widest text-sm mb-1 uppercase">{item.t}</h3>
                                        <p className="text-sm text-slate-400 font-medium">{item.d}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="pt-10">
                            <button
                                className="bg-primary-900 text-white px-12 py-5 rounded-2xl font-black text-sm uppercase tracking-[0.3em] hover:bg-accent transition-all shadow-xl shadow-primary-900/20"
                            >
                                Agende sua visita agora
                            </button>
                        </div>
                    </div>
                </div>
            </section >

            {/* Blog Section - Google Loves This */}
            <section className="py-32 bg-slate-50">
                <div className="max-w-7xl mx-auto px-4">
                    <header className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
                        <div>
                            <p className="text-accent font-bold text-sm uppercase tracking-[0.5em]">Informativo Kátia e Flávio</p>
                            <h2 className="text-4xl font-black text-primary-900 tracking-tighter leading-none">Dicas de Moradia e Investimento</h2>
                        </div>
                        <Link href="/blog" className="text-[12px] font-bold tracking-[0.3em] text-primary-900 border-b-2 border-accent pb-1 hover:text-accent transition-all uppercase">Ver blog completo</Link>
                    </header>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        {blogPosts.length > 0 ? blogPosts.map((post, i) => (
                            <article key={i} className="bg-white rounded-[40px] overflow-hidden group border border-slate-100 p-2 shadow-sm hover:shadow-2xl transition-all duration-500">
                                <div className="h-56 overflow-hidden rounded-[32px] mb-6">
                                    <Link href={`/blog/${post.slug || post.id}`} className="relative block h-full">
                                        <Image
                                            src={post.image_url || 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d'}
                                            alt={post.title}
                                            fill
                                            className="object-cover group-hover:scale-110 transition-all duration-1000"
                                            sizes="(max-width: 768px) 100vw, 33vw"
                                        />
                                    </Link>
                                </div>
                                <div className="p-6 pt-0 space-y-4">
                                    <time className="text-[12px] font-bold text-accent uppercase tracking-widest leading-none">Postado em {new Date(post.created_at).toLocaleDateString()}</time>
                                    <Link href={`/blog/${post.slug || post.id}`}>
                                        <h3 className="text-lg font-black text-primary-900 leading-tight group-hover:text-accent transition-colors">{post.title}</h3>
                                    </Link>
                                    <p className="text-sm text-slate-400 font-medium line-clamp-2 leading-relaxed">{post.excerpt || post.content?.substring(0, 100)}</p>
                                    <Link href={`/blog/${post.slug || post.id}`} className="inline-flex items-center gap-2 text-[12px] font-bold uppercase tracking-widest text-primary-900 hover:text-accent transition-colors">Ler artigo <ArrowRight className="h-3.5 w-3.5" /></Link>
                                </div>
                            </article>
                        )) : (
                                [
                                    { title: 'Vale a pena comprar imóvel em Praia Grande em 2026?', img: '1502671817457-d8c828286fd7' },
                                    { title: 'Melhores bairros de Praia Grande para morar com segurança', img: '1486406146926-c627a92ad1ab' },
                                    { title: 'Como financiar um apartamento em Praia Grande: Guia Completo', img: '1448630360428-6e4020a64619' }
                                ].map((post, i) => (
                                <article key={i} className="bg-white rounded-[40px] overflow-hidden group border border-slate-100 p-2 shadow-sm hover:shadow-2xl transition-all duration-500">
                                    <div className="relative h-56 overflow-hidden rounded-[32px] mb-6">
                                        <Image
                                            src={`https://images.unsplash.com/photo-${post.img}?auto=format&fit=crop&q=80&w=800`}
                                            alt={post.title}
                                            fill
                                            className="object-cover group-hover:scale-110 transition-all duration-1000"
                                            sizes="(max-width: 768px) 100vw, 33vw"
                                        />
                                    </div>
                                    <div className="p-6 pt-0 space-y-4">
                                        <time className="text-[12px] font-bold text-accent uppercase tracking-widest leading-none">Postado em março 2026</time>
                                        <h3 className="text-lg font-black text-primary-900 leading-tight group-hover:text-accent transition-colors">{post.title}</h3>
                                        <p className="text-sm text-slate-400 font-medium line-clamp-2 leading-relaxed">Descubra as principais tendências e oportunidades para quem busca viver ou investir em um apartamento em Praia Grande SP...</p>
                                        <Link href="#" className="inline-flex items-center gap-2 text-[12px] font-bold uppercase tracking-widest text-primary-900 hover:text-accent transition-colors">Ler artigo <ArrowRight className="h-3.5 w-3.5" /></Link>
                                    </div>
                                </article>
                            ))
                        )}
                    </div>
                </div>
            </section>

            {/* Testimonials - Enhanced Social Proof */}
            <section className="py-32 bg-white overflow-hidden relative">
                <div className="absolute top-0 right-0 w-80 h-80 bg-accent/5 rounded-full blur-[100px]" />
                <div className="max-w-7xl mx-auto px-4 relative z-10">
                    <div className="text-center mb-24 space-y-4">
                        <p className="text-accent font-black text-xs uppercase tracking-[0.5em]">Experiência do Cliente</p>
                        <h2 className="text-5xl md:text-7xl font-black text-primary-900 tracking-tighter leading-none">Quem confia, <br/> <span className="text-accent underline decoration-primary-900/5">recomenda</span></h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {[
                            { n: 'Ricardo Santos', r: 'Empresário', t: 'Melhor imobiliária em Praia Grande! Atendimento rápido, transparente e com foco total na nossa necessidade.' },
                            { n: 'Ana Paula Lima', r: 'Advogada', t: 'Consegui realizar o sonho do meu apartamento no Canto do Forte com condições incríveis. Nota 10!' },
                            { n: 'Fernando Costa', r: 'Investidor', t: 'Curadoria de imóveis realmente diferenciada na Baixada Santista. Excelentes oportunidades de investimento.' }
                        ].map((item, idx) => (
                            <div key={idx} className="bg-slate-50 p-14 rounded-[60px] border border-slate-100/50 hover:bg-white hover:shadow-3xl transition-all duration-700 group relative">
                                <div className="absolute top-8 right-12 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <MessageSquare className="h-16 w-16 text-primary-900 fill-current" />
                                </div>
                                <div className="flex gap-1 mb-10 text-accent">
                                    {[1, 2, 3, 4, 5].map(s => <Star key={s} className="h-5 w-5 fill-current" />)}
                                </div>
                                <p className="text-slate-500 font-semibold italic mb-12 leading-relaxed text-xl group-hover:text-primary-900 transition-colors">"{item.t}"</p>
                                <div className="flex items-center gap-6">
                                    <div className="relative w-16 h-16 rounded-3xl bg-primary-900 overflow-hidden shadow-2xl group-hover:rotate-6 transition-all duration-500 border-4 border-white">
                                        <Image
                                            src={`https://i.pravatar.cc/100?u=${idx + 150}`}
                                            alt={item.n}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-primary-900 uppercase tracking-tighter leading-none mb-1">{item.n}</h3>
                                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{item.r}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Google Maps Embed & Footer Section */}
            <section className="py-32 bg-slate-50 px-4 border-t border-slate-100">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
                    <div className="lg:col-span-4 space-y-10">
                        <div>
                            <h2 className="text-3xl font-black text-primary-900 tracking-tighter mb-4">{hqSettings.hq_title}</h2>
                            <p className="text-slate-400 font-semibold text-sm leading-relaxed mb-6">{hqSettings.hq_description}</p>
                            <div className="space-y-4">
                                <div className="flex items-center gap-4 group">
                                    <div className="bg-white p-3 rounded-2xl shadow-sm text-accent group-hover:bg-primary-900 group-hover:text-white transition-all"><MapPin className="h-5 w-5" /></div>
                                    <div className="text-sm font-black text-primary-900 uppercase tracking-widest">{siteContact.address}</div>
                                </div>
                                <div className="flex items-center gap-4 group">
                                    <div className="bg-white p-3 rounded-2xl shadow-sm text-accent group-hover:bg-primary-900 group-hover:text-white transition-all"><Phone className="h-5 w-5" /></div>
                                    <div className="text-sm font-bold text-primary-900 tracking-widest uppercase">{siteContact.phone}</div>
                                </div>
                                <div className="flex items-center gap-4 group">
                                    <div className="bg-white p-3 rounded-2xl shadow-sm text-accent group-hover:bg-primary-900 group-hover:text-white transition-all"><Mail className="h-5 w-5" /></div>
                                    <div className="text-sm font-black text-primary-900 tracking-widest lowercase">{siteContact.email}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-8 h-[500px] rounded-[50px] overflow-hidden shadow-2xl border-4 border-white relative group">
                        {hqSettings.hq_maps_url?.includes('/embed') ? (
                            <iframe
                                src={hqSettings.hq_maps_url}
                                className="w-full h-full border-0 grayscale hover:grayscale-0 transition-all duration-1000"
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                title="Localização Kátia e Flávio Imóveis"
                            ></iframe>
                        ) : (
                            <div className="w-full h-full bg-slate-100 flex flex-col items-center justify-center p-12 text-center group">
                                <div className="bg-white p-8 rounded-full shadow-2xl mb-8 group-hover:scale-110 transition-transform duration-500">
                                    <MapPin className="h-12 w-12 text-accent" />
                                </div>
                                <h3 className="text-2xl font-black text-primary-900 uppercase tracking-tighter mb-4">Veja nossa localização</h3>
                                <p className="text-slate-400 font-bold text-sm uppercase tracking-widest mb-8 max-w-sm">Use o botão abaixo para abrir o mapa em uma nova aba e traçar sua rota.</p>
                                <a 
                                    href={hqSettings.hq_maps_url} 
                                    target="_blank" 
                                    className="bg-primary-900 text-white px-12 py-5 rounded-2xl text-[12px] font-bold tracking-[0.2em] shadow-xl shadow-primary-900/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-4 uppercase"
                                >
                                    Abrir Google Maps <ArrowUpRight className="h-4 w-4 text-accent" />
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </section >

            {/* Video Lightbox Modal */}
            {isVideoOpen && selectedVideo && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-10">
                    <div
                        className="absolute inset-0 bg-primary-900/95 backdrop-blur-2xl animate-in fade-in duration-500"
                        onClick={() => setIsVideoOpen(false)}
                    />

                    <div className="relative w-full max-w-6xl aspect-video rounded-[40px] overflow-hidden shadow-2xl border border-white/10 animate-in zoom-in-95 duration-500">
                        <button
                            onClick={() => setIsVideoOpen(false)}
                            className="absolute top-6 right-6 h-12 w-12 bg-white/10 hover:bg-white text-white hover:text-primary-900 rounded-full flex items-center justify-center backdrop-blur-md transition-all z-50 border border-white/10 active:scale-90"
                        >
                            <X className="h-6 w-6" />
                        </button>

                        <iframe
                            src={getEmbedUrl(selectedVideo)}
                            className="w-full h-full"
                            allow="autoplay; fullscreen; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                    </div>
                </div>
            )}

            <PartnersSection />
            <Footer />
        </main >
    );
}

function Building2(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
            <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
            <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
            <path d="M10 6h4" />
            <path d="M10 10h4" />
            <path d="M10 14h4" />
            <path d="M10 18h4" />
        </svg>
    )
}

function PartnersSection() {
    const [partners, setPartners] = useState<any[]>([]);

    useEffect(() => {
        const fetchPartners = async () => {
            const { data } = await supabase.from('partners').select('*').order('created_at', { ascending: false });
            if (data) setPartners(data);
        };
        fetchPartners();
    }, []);

    if (partners.length === 0) return null;

    return (
        <section className="py-24 bg-white relative overflow-hidden">
            <div className="container mx-auto px-6 lg:px-12 relative z-10">
                <div className="text-center mb-16 space-y-4">
                    <p className="text-accent text-[12px] font-black uppercase tracking-[0.4em] animate-in fade-in slide-in-from-bottom-4 duration-700">Confiabilidade e Parceria</p>
                    <h2 className="text-4xl md:text-5xl font-black text-primary-900 tracking-tighter animate-in fade-in slide-in-from-bottom-6 duration-1000">Nossos Parceiros</h2>
                    <div className="h-1.5 w-24 bg-accent mx-auto rounded-full" />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 lg:gap-12 items-center justify-items-center">
                    {partners.map((partner) => (
                        <div
                            key={partner.id}
                            className="relative w-full h-32 flex items-center justify-center p-8 bg-white rounded-[40px] border border-slate-50 hover:border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500 group animate-in zoom-in duration-700"
                        >
                            <Image
                                src={partner.logo_url}
                                alt={partner.name}
                                fill
                                className="object-contain p-8 transition-all duration-500 group-hover:scale-110 grayscale-0 opacity-100 shadow-none border-none"
                                sizes="(max-width: 768px) 50vw, 20vw"
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Background elements */}
            <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-accent/5 rounded-full blur-[100px] -z-10" />
            <div className="absolute top-1/2 right-0 -translate-y-1/2 w-96 h-96 bg-primary-900/5 rounded-full blur-[100px] -z-10" />
        </section>
    );
}

