'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
    MapPin, Bed, Bath, Hash, CheckCircle,
    Share2, Heart, MessageSquare, Loader2, ArrowLeft,
    DollarSign, Briefcase, Zap, Maximize2, Car, ArrowRight, Waves, Shield, Play, Info, CheckCircle2, X, Phone, FileText, User, Layers,
    ChevronLeft, ChevronRight, Navigation, Star, Building2, Home, Check,
    Sofa, Utensils, ChefHat, Laptop, Tv, Sun, Wind, ShieldCheck, Cctv, Bell, DoorOpen, Thermometer, Wifi, Flame, Table, Layout, Gem, Dumbbell, Bike, CarFront, ParkingCircle, Store, Building, Warehouse, Shirt, Cpu, AirVent, Fence, Trees, Flower, Component, ArrowUp, Shovel, Palmtree, BedDouble
} from 'lucide-react';
import clsx from 'clsx';

const ICON_MAP: Record<string, any> = {
    Bed, Bath, Maximize2, Car, Star, Navigation, Building2, Home, Zap, Check, Info, Shield, Layers, MessageSquare, Phone, FileText, User,
    Sofa, Utensils, ChefHat, Laptop, Tv, Waves, Sun, Wind, ShieldCheck, Cctv, Bell, DoorOpen, Thermometer, Wifi, Flame, Table, Layout, Gem, Dumbbell, Bike, CarFront, ParkingCircle, Store, Building, Warehouse, Shirt, Cpu, AirVent, Fence, Trees, Flower, Component, ArrowUp, Shovel, Palmtree, BedDouble,
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

interface PropertyDetailsClientProps {
    initialProperty: any;
    slug: string;
}

export default function PropertyDetailsClient({ initialProperty, slug }: PropertyDetailsClientProps) {
    const router = useRouter();

    const [property, setProperty] = useState<any>(initialProperty);
    const [activeImage, setActiveImage] = useState(0);
    const [corretor, setCorretor] = useState<any>(initialProperty?.corretor);
    const [isLoading, setIsLoading] = useState(!initialProperty);
    const [isSending, setIsSending] = useState(false);
    const [messageSent, setMessageSent] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [userProfile, setUserProfile] = useState<any>(null);
    const [customerWhatsapp, setCustomerWhatsapp] = useState('');
    const [customerName, setCustomerName] = useState('');
    const [isVideoOpen, setIsVideoOpen] = useState(false);
    const [isGalleryOpen, setIsGalleryOpen] = useState(false);
    const [currentGalleryIndex, setCurrentGalleryIndex] = useState(0);
    const [relatedProperties, setRelatedProperties] = useState<any[]>([]);
    const [specs, setSpecs] = useState<any[]>([]);
    const [showLeadModal, setShowLeadModal] = useState(false);
    const [redirectAfterLead, setRedirectAfterLead] = useState(false);

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
        const fetchUserDataAndRelated = async () => {
            const { data: { user: currentUser } } = await supabase.auth.getUser();
            setUser(currentUser);

            if (currentUser) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', currentUser.id)
                    .single();
                setUserProfile(profile);
            }

            // Se não veio dado do servidor, busca agora (fallback)
            let currentProp = property;
            if (!currentProp) {
                const { data: prop } = await supabase
                    .from('properties')
                    .select('*, corretor:profiles!corretor_id(*)')
                    .eq('slug', slug)
                    .single();
                
                if (prop) {
                    setProperty(prop);
                    setCorretor(prop.corretor);
                    currentProp = prop;
                }
            }

            if (currentProp) {
                // Busca imóveis relacionados (mesmo bairro ou mesma cidade)
                const { data: related } = await supabase
                    .from('properties')
                    .select('*')
                    .or(`neighborhood.eq."${currentProp.neighborhood}",city.eq."${currentProp.city}"`)
                    .neq('id', currentProp.id)
                    .limit(4);
                
                if (related) setRelatedProperties(related);

                // Busca as especificações configuradas
                const { data: specsData } = await supabase.from('site_settings').select('value').eq('key', 'property_specs').single();
                if (specsData) setSpecs(specsData.value);
                else setSpecs([
                    { id: 'area', label: 'Área', field: 'area', icon: 'Maximize2', suffix: 'm²' },
                    { id: 'rooms', label: 'Dorm', field: 'rooms', icon: 'Bed' },
                    { id: 'suites', label: 'Suítes', field: 'suites', icon: 'BedDouble' },
                    { id: 'parking', label: 'Vagas', field: 'parking_spaces', icon: 'Car' },
                    { id: 'bathrooms', label: 'WC', field: 'bathrooms', icon: 'Bath' }
                ]);
            }
            setIsLoading(false);
        };

        fetchUserDataAndRelated();
    }, [slug, property]);

    const isAuthorizedToSeeAddress = userProfile?.role === 'corretor' || userProfile?.role === 'admin';

    const handleInterest = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        // Validation
        if (!customerWhatsapp || customerWhatsapp.length < 10) {
            alert('Por favor, informe um WhatsApp válido.');
            return;
        }

        setIsSending(true);

        const { error: leadError } = await supabase
            .from('leads')
            .insert({
                property_id: property.id,
                cliente_id: user?.id || null,
                name: customerName || userProfile?.full_name || 'Interessado Anônimo',
                customer_whatsapp: customerWhatsapp,
                message: `Interesse no imóvel: ${property.title} (Ref: ${property.reference_id})`,
                status: 'novo',
                source: 'WhatsApp Link'
            });

        if (!leadError) {
            await supabase
                .from('notifications')
                .insert({
                    message: `Novo lead para: ${property.title}`,
                    type: 'lead_received'
                });
            setMessageSent(true);
            
            if (redirectAfterLead) {
                const text = `Olá! Gostaria de mais informações sobre o imóvel: ${property.title} (Ref: ${property.reference_id})`;
                window.open(`https://wa.me/5513997826694?text=${encodeURIComponent(text)}`, '_blank');
                setShowLeadModal(false);
            }
        } else {
            console.error('Lead error:', leadError);
            alert('Ocorreu um erro ao registrar seu interesse. Tente novamente.');
        }
        setIsSending(false);
    };

    const handleWhatsAppClick = () => {
        if (userProfile?.full_name && userProfile?.phone) {
            // Already logged in with profile
            setCustomerName(userProfile.full_name);
            setCustomerWhatsapp(userProfile.phone);
            setRedirectAfterLead(true);
            handleInterest();
        } else if (customerName && customerWhatsapp) {
            // Already filled form
            setRedirectAfterLead(true);
            handleInterest();
        } else {
            // Show modal
            setShowLeadModal(true);
            setRedirectAfterLead(true);
        }
    };

    useEffect(() => {
        if (isVideoOpen || isGalleryOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [isVideoOpen, isGalleryOpen]);

    if (isLoading && !property) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-white gap-8">
                <div className="relative h-20 w-20">
                    <div className="absolute inset-0 border-4 border-slate-100 rounded-full" />
                    <div className="absolute inset-0 border-4 border-[#10b981] rounded-full border-t-transparent animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 className="h-8 w-8 text-[#1B263B] animate-pulse" />
                    </div>
                </div>
                <p className="text-[12px] font-bold tracking-[0.4em] text-slate-300 animate-pulse uppercase">Carregando Seu Sistema</p>
            </div>
        );
    }

    if (!property) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6 text-center">
                <h2 className="text-4xl font-black text-slate-800 mb-4 tracking-tighter">Imóvel Não Encontrado</h2>
                <p className="text-slate-400 font-bold mb-8">O link pode estar quebrado ou o imóvel foi removido.</p>
                <Link href="/">
                    <button className="bg-[#1B263B] text-white px-10 py-5 rounded-3xl text-[12px] font-black uppercase tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-4">
                        <ArrowLeft className="h-4 w-4" /> Voltar ao Início
                    </button>
                </Link>
            </div>
        );
    }

    const images = property.images && property.images.length > 0 ? property.images : ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1200'];

    return (
        <div className="min-h-screen bg-white text-primary-900 selection:bg-accent/30 pt-20 lg:pt-28">
            <Navbar />

            {/* Mobile Actions Overlay */}
            <div className="md:hidden fixed bottom-6 left-6 right-6 z-[100] flex gap-3 animate-in fade-in slide-in-from-bottom-5 duration-700">
                <button
                    onClick={handleWhatsAppClick}
                    disabled={isSending}
                    className="flex-1 bg-primary-900 text-white py-5 rounded-2xl font-black text-[12px] uppercase tracking-widest shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-all"
                >
                    <MessageSquare className="h-4 w-4" /> Tenho Interesse
                </button>
            </div>

            <main className="max-w-7xl mx-auto px-6 py-12 lg:py-16">
                
                {/* 1. TOPO: Título e Galeria Mosaico */}
                <div className="space-y-8 mb-16">
                    <header className="flex flex-col md:flex-row justify-between items-start gap-8">
                        <div className="space-y-4 max-w-4xl">
                            <div className="flex flex-wrap items-center gap-3">
                                <Link href="/comprar" aria-label="Voltar para a lista de imóveis" className="h-10 w-10 rounded-full border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-primary-900 transition-all">
                                    <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                                </Link>
                                <span className="bg-accent/10 px-4 py-1.5 rounded-lg text-accent text-[11px] font-black uppercase tracking-widest">
                                    {property.type === 'venda' ? 'Oportunidade de Venda' : 'Aluguel Disponível'}
                                </span>
                                <span className="bg-slate-50 border border-slate-100 px-4 py-2 rounded-lg text-xs font-bold text-slate-500 tracking-[0.2em]">REF: {property.reference_id}</span>
                            </div>
                            <h1 className="text-4xl md:text-7xl font-black tracking-tighter leading-[0.95] text-primary-900">
                                {property.title}
                            </h1>
                            <div className="flex items-center gap-3 text-slate-400 font-bold text-lg">
                                <MapPin className="h-6 w-6 text-accent" />
                                <span>{property.neighborhood}, {property.city}</span>
                            </div>
                        </div>
                        <div className="bg-slate-50 p-8 rounded-[40px] border border-slate-100 min-w-fit text-right">
                            <p className="text-[11px] font-bold text-slate-300 tracking-[0.4em] mb-2 uppercase">Valor de Investimento</p>
                            <div className="text-4xl md:text-6xl font-black text-primary-900 tracking-tighter leading-none">
                                {property.price?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </div>
                            {(property.condo_fee > 0 || property.iptu > 0) && (
                                <div className="mt-4 flex flex-col items-end gap-1">
                                    {property.condo_fee > 0 && (
                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            Condomínio: <span className="text-primary-900">{property.condo_fee.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                                        </div>
                                    )}
                                    {property.iptu > 0 && (
                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            IPTU: <span className="text-primary-900">{property.iptu.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                                        </div>
                                    )}
                                </div>
                            )}
                            <button 
                                onClick={handleWhatsAppClick}
                                className="mt-6 w-full bg-[#25D366] text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-green-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                            >
                                <MessageSquare className="h-4 w-4 fill-current" /> Falar no WhatsApp agora
                            </button>
                             <button 
                                onClick={() => {
                                    const url = typeof window !== 'undefined' ? window.location.origin + window.location.pathname : '';
                                    const message = `Confira este imóvel: ${property.title} - ${url}`;
                                    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
                                }}
                                className="mt-3 w-full bg-[#F2FBF9] text-[#10b981] py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-sm hover:bg-[#10b981] hover:text-white transition-all flex items-center justify-center gap-2 group/share"
                            >
                                <MessageSquare className="h-4 w-4 fill-current group-hover/share:rotate-12 transition-transform" /> Compartilhar no WhatsApp
                            </button>
                        </div>
                    </header>

                    {/* Galeria: 1 Grande + 4 Pequenas */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
                        {/* Imagem Grande - Esquerda */}
                        <div 
                            onClick={() => {
                                setCurrentGalleryIndex(0);
                                setIsGalleryOpen(true);
                            }}
                            className="md:col-span-2 md:row-span-2 relative rounded-[32px] overflow-hidden group shadow-xl border border-slate-100 cursor-pointer h-[300px] md:h-[480px]"
                        >
                            <img src={images[0]} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" alt="Principal" />
                            {property.video_url && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsVideoOpen(true);
                                    }}
                                    aria-label="Assistir vídeo do imóvel"
                                    className="absolute inset-0 flex items-center justify-center group/play bg-black/10 hover:bg-black/20 transition-all"
                                >
                                    <div className="h-16 w-16 bg-accent/90 backdrop-blur-md text-white rounded-full flex items-center justify-center shadow-2xl transition-all group/play:scale-110" aria-hidden="true">
                                        <Play className="h-7 w-7 fill-current translate-x-0.5" />
                                    </div>
                                </button>
                            )}
                        </div>
                        
                        {/* Grid 2x2 - Direita */}
                        <div className="grid grid-cols-2 gap-3 md:col-span-1 md:row-span-2">
                            <div 
                                onClick={() => {
                                    setCurrentGalleryIndex(1);
                                    setIsGalleryOpen(true);
                                }}
                                className="relative rounded-[22px] overflow-hidden group shadow-lg border border-slate-100 cursor-pointer h-[140px] md:h-[220px]"
                            >
                                <img src={images[1] || images[0]} className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110" alt="Galeria 1" />
                            </div>
                            <div 
                                onClick={() => {
                                    setCurrentGalleryIndex(2);
                                    setIsGalleryOpen(true);
                                }}
                                className="relative rounded-[22px] overflow-hidden group shadow-lg border border-slate-100 cursor-pointer h-[140px] md:h-[220px]"
                            >
                                <img src={images[2] || images[0]} className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110" alt="Galeria 2" />
                            </div>
                            <div
                                onClick={() => {
                                    setCurrentGalleryIndex(3);
                                    setIsGalleryOpen(true);
                                }}
                                className="relative rounded-[22px] overflow-hidden group shadow-lg border border-slate-100 cursor-pointer h-[140px] md:h-[220px]"
                            >
                                <img src={images[3] || images[0]} className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110" alt="Galeria 3" />
                            </div>
                            <button 
                                onClick={() => {
                                    setCurrentGalleryIndex(4);
                                    setIsGalleryOpen(true);
                                }}
                                aria-label={`Ver todas as ${images.length} fotos do imóvel`}
                                className="relative rounded-[22px] overflow-hidden group shadow-lg border border-slate-100 h-[140px] md:h-[220px] text-center"
                            >
                                <img src={images[4] || images[0]} className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110" alt="Galeria 4" />
                                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity gap-2">
                                    <span className="text-white font-black text-xs tracking-widest uppercase">Ver +</span>
                                    <span className="bg-white/20 backdrop-blur-sm text-white font-bold text-xs px-3 py-1 rounded-full border border-white/30">{images.length}</span>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
                    
                    {/* Left Column: Infos & Descrição */}
                    <div className="lg:col-span-8 space-y-16">
                        
                        {/* 3. INFORMAÇÕES: Atributos com Ícones Dinâmicos */}
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4 relative z-10">
                            {specs.map((spec: any, i: number) => {
                                const IconComp = ICON_MAP[spec.icon] || Info;
                                const value = property[spec.field] || 0;
                                return (
                                    <div key={i} className="bg-slate-50 p-8 rounded-[40px] flex flex-col items-center text-center gap-3 border border-slate-100 hover:bg-white hover:shadow-2xl transition-all duration-500">
                                        <IconComp className={clsx("h-8 w-8 mb-2", spec.color || "text-accent")} />
                                        <div>
                                            <p className="text-[11px] font-bold text-slate-300 tracking-[0.3em] mb-1 uppercase">{spec.label}</p>
                                            <p className="text-2xl font-black text-primary-900">{value}{spec.suffix || ''}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* 4. DESCRIÇÃO: Layout Limpo */}
                        <div className="space-y-8">
                            <header className="flex items-center gap-4">
                                <div className="h-1 bg-accent w-12 rounded-full" />
                                <h2 className="text-2xl font-black tracking-tighter text-primary-900">Sobre este imóvel</h2>
                            </header>
                            <div className="bg-slate-50 p-10 md:p-16 rounded-[60px] border border-slate-100">
                                <p className="text-xl font-medium text-slate-500 leading-relaxed whitespace-pre-line opacity-90 italic">
                                    {property.description}
                                </p>
                            </div>
                        </div>

                        {/* Características extras */}
                        {property.features && property.features.length > 0 && (
                            <div className="space-y-8">
                                <h3 className="text-xl font-black tracking-tighter text-slate-300">Infraestrutura e Lazer</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {property.features.map((feat: string, i: number) => {
                                        const FeatureIcon = getFeatureIcon(feat);
                                        return (
                                            <div key={i} className="bg-white px-6 py-5 rounded-3xl border border-slate-100 flex items-center gap-4 hover:border-accent transition-all shadow-sm group">
                                                <div className="h-8 w-8 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-accent/10 transition-colors">
                                                    <FeatureIcon className="h-4 w-4 text-accent opacity-40 group-hover:opacity-100 transition-opacity" />
                                                </div>
                                                <span className="text-[11px] font-black text-slate-500 tracking-widest uppercase">{feat}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* 5. LOCALIZAÇÃO: Mapa e Bairro */}
                        <div className="space-y-8 pt-12">
                            <header className="flex items-center justify-between">
                                <h2 className="text-2xl font-black tracking-tighter text-primary-900">Onde fica</h2>
                                <div className="bg-accent/10 px-4 py-2 rounded-xl text-accent font-black text-xs uppercase tracking-widest">
                                    {property.neighborhood}, Praia Grande
                                </div>
                            </header>
                            <div className="h-[400px] rounded-[50px] overflow-hidden border border-slate-100 shadow-2xl">
                                <iframe
                                    width="100%" height="100%" style={{ border: 0 }} loading="lazy" allowFullScreen referrerPolicy="no-referrer-when-downgrade"
                                    src={`https://www.google.com/maps?q=${encodeURIComponent(`${property.neighborhood}, ${property.city}, SP - Brasil`)}&output=embed`}
                                    className="grayscale contrast-125 hover:grayscale-0 transition-all duration-1000"
                                ></iframe>
                            </div>
                        </div>

                        {/* 6. CAPTAÇÃO: Novo formulário */}
                        <div className="bg-primary-900 p-12 md:p-20 rounded-[80px] text-white relative overflow-hidden" id="lead-form">
                             <div className="absolute top-0 right-0 w-80 h-80 bg-accent/20 blur-[120px] rounded-full" />
                             <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                                <div className="space-y-6">
                                    <h2 className="text-4xl md:text-5xl font-black tracking-tighter leading-none">Receba imóveis <br/> parecidos no <span className="text-accent underline">WhatsApp</span></h2>
                                    <p className="text-white/50 font-medium text-lg">Não perca nenhuma oportunidade em {property.neighborhood}. Enviamos curadorias exclusivas semanalmente.</p>
                                </div>
                                <form onSubmit={handleInterest} className="space-y-4">
                                    <input 
                                        type="text" placeholder="Seu Nome" required
                                        value={customerName}
                                        onChange={(e) => setCustomerName(e.target.value)}
                                        className="w-full bg-white/10 border border-white/10 p-6 rounded-3xl font-bold text-white outline-none focus:ring-2 focus:ring-accent transition-all"
                                    />
                                    <input 
                                        type="tel" placeholder="Seu WhatsApp" required
                                        value={customerWhatsapp}
                                        onChange={(e) => setCustomerWhatsapp(e.target.value)}
                                        className="w-full bg-white/10 border border-white/10 p-6 rounded-3xl font-bold text-white outline-none focus:ring-2 focus:ring-accent transition-all"
                                    />
                                    <button disabled={isSending} className="w-full bg-accent text-white py-6 rounded-3xl font-black text-xs uppercase tracking-[0.3em] shadow-2xl hover:bg-white hover:text-primary-900 transition-all active:scale-95 disabled:opacity-50">
                                        {isSending ? 'Enviando...' : 'Quero Receber'}
                                    </button>
                                    {messageSent && <p className="text-accent text-[12px] font-black uppercase text-center animate-bounce">Recebemos seu contato!</p>}
                                </form>
                             </div>
                        </div>
                    </div>

                    {/* 2. LATERAL (FIXO): Sidebar de Conversão */}
                    <aside className="lg:col-span-4 lg:sticky lg:top-32 space-y-8">
                        <div className="bg-slate-50 p-10 rounded-[60px] border border-slate-100 space-y-10 shadow-xl relative overflow-hidden">
                             <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 blur-[50px] rounded-full" />
                             
                             <div className="space-y-2">
                                <p className="text-[11px] font-bold text-slate-300 tracking-[0.4em] uppercase">Sobre o anúncio</p>
                                <div className="flex items-center gap-3">
                                    <div className="h-12 w-12 rounded-2xl bg-primary-900 flex items-center justify-center text-accent">
                                        <Shield className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-primary-900 text-xs tracking-widest">Anúncio Verificado</p>
                                        <p className="text-[10px] font-bold text-slate-400 tracking-widest">Kátia e Flávio Imóveis</p>
                                    </div>
                                </div>
                             </div>

                             <div className="space-y-4">
                                <button 
                                    onClick={() => handleInterest()}
                                    className="w-full bg-primary-900 text-white py-6 rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-3xl hover:bg-accent transition-all flex items-center justify-center gap-4 group active:scale-95 text-center px-4"
                                >
                                    <Phone className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                                    Agendar visita
                                </button>
                                
                                {!(userProfile?.full_name && userProfile?.phone) && !(customerName && customerWhatsapp) ? (
                                    <div className="bg-white/50 backdrop-blur-sm p-6 rounded-[32px] border border-slate-200 mt-4 space-y-4 shadow-inner">
                                        <div className="text-center space-y-1">
                                            <p className="text-[10px] font-black text-primary-900 uppercase tracking-widest">Atendimento WhatsApp</p>
                                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Identifique-se para falar com corretor</p>
                                        </div>
                                        <div className="space-y-2">
                                            <input 
                                                type="text" 
                                                placeholder="Seu Nome"
                                                value={customerName}
                                                onChange={(e) => setCustomerName(e.target.value)}
                                                className="w-full bg-white border border-slate-100 p-4 rounded-2xl text-[12px] font-bold outline-none focus:ring-2 focus:ring-accent transition-all"
                                            />
                                            <input 
                                                type="tel" 
                                                placeholder="Seu WhatsApp"
                                                value={customerWhatsapp}
                                                onChange={(e) => setCustomerWhatsapp(e.target.value)}
                                                className="w-full bg-white border border-slate-100 p-4 rounded-2xl text-[12px] font-bold outline-none focus:ring-2 focus:ring-accent transition-all"
                                            />
                                            <button 
                                                onClick={handleWhatsAppClick}
                                                disabled={isSending}
                                                className="w-full bg-[#25D366] text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                                            >
                                                {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageSquare className="h-4 w-4 fill-current" />}
                                                {isSending ? 'Aguarde...' : 'Chamar no WhatsApp'}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <button 
                                        onClick={handleWhatsAppClick}
                                        className="w-full bg-[#25D366] text-white py-8 rounded-3xl font-black text-sm uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-4 active:scale-95 text-center px-4"
                                    >
                                        <MessageSquare className="h-6 w-6 fill-current" />
                                        WhatsApp Direto
                                    </button>
                                )}
                             </div>

                             <div className="pt-6 border-t border-slate-200">
                                <div className="flex items-center gap-4">
                                    <div className="h-14 w-14 rounded-2xl bg-slate-200 overflow-hidden">
                                        <img src={corretor?.avatar_url || 'https://i.pravatar.cc/150'} className="w-full h-full object-cover" alt="Corretor" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-primary-900 tracking-widest">{corretor?.full_name || 'Kátia e Flávio'}</p>
                                        <p className="text-[10px] font-bold text-slate-400 tracking-widest leading-none mt-1">CRECI: {corretor?.creci || 'Em Consulta'}</p>
                                    </div>
                                </div>
                             </div>
                        </div>

                    </aside>
                </div>

                {/* 7. IMÓVEIS RELACIONADOS */}
                {relatedProperties.length > 0 && (
                    <section className="mt-32 pt-32 border-t border-slate-100">
                        <header className="mb-16">
                            <p className="text-accent font-bold text-xs tracking-[0.5em] mb-4 uppercase">Veja Também</p>
                            <h2 className="text-4xl md:text-5xl font-black text-primary-900 tracking-tighter leading-none">Oportunidades parecidas</h2>
                        </header>
                        
                        <div className="relative">
                            <div className="flex overflow-x-auto snap-x snap-mandatory gap-8 no-scrollbar pb-8 -mx-4 px-4 md:mx-0 md:px-0">
                                {relatedProperties.map((prop, i) => (
                                    <Link 
                                        key={i} 
                                        href={`/imovel/${prop.slug}`} 
                                        className="min-w-[85%] md:min-w-[calc(50%-1rem)] lg:min-w-[calc(25%-1.5rem)] snap-start group space-y-4"
                                    >
                                        <div className="aspect-[4/3] rounded-[40px] overflow-hidden shadow-xl border border-slate-100">
                                            <img src={prop.images?.[0] || images[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={prop.title} />
                                        </div>
                                        <div className="px-4">
                                            <p className="text-[10px] font-bold text-accent tracking-widest">{prop.neighborhood}</p>
                                            <h3 className="text-lg font-black text-primary-900 mt-1 leading-tight line-clamp-1 group-hover:text-accent transition-colors">{prop.title}</h3>
                                            <p className="text-xl font-black text-primary-900 mt-2">{prop.price?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </section>
                )}
            </main>

            <Footer />

            {/* Video Lightbox Modal */}
            {isVideoOpen && property.video_url && (
                <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4 md:p-10">
                    <div
                        className="absolute inset-0 bg-primary-900/95 backdrop-blur-2xl animate-in fade-in duration-500"
                        onClick={() => setIsVideoOpen(false)}
                    />

                    <div className="relative w-full max-w-6xl aspect-video rounded-[40px] overflow-hidden shadow-2xl border border-white/10 animate-in zoom-in-95 duration-500">
                        <button
                            onClick={() => setIsVideoOpen(false)}
                            aria-label="Fechar vídeo"
                            className="absolute top-6 right-6 h-12 w-12 bg-white/10 hover:bg-white text-white hover:text-primary-900 rounded-full flex items-center justify-center backdrop-blur-md transition-all z-50 border border-white/10 active:scale-90"
                        >
                            <X className="h-6 w-6" aria-hidden="true" />
                        </button>

                        <iframe
                            src={getEmbedUrl(property.video_url)}
                            className="w-full h-full"
                            allow="autoplay; fullscreen; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                    </div>
                </div>
            )}

            {/* Gallery Lightbox Modal - Redesigned */}
            {isGalleryOpen && (
                <div className="fixed inset-0 z-[10002] flex items-center justify-center animate-in fade-in duration-500 overflow-hidden">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/80 backdrop-blur-xl"
                        onClick={() => setIsGalleryOpen(false)}
                    />
                    
                    {/* Close Button */}
                    <button
                        onClick={() => setIsGalleryOpen(false)}
                        aria-label="Fechar galeria"
                        className="absolute top-6 right-6 h-14 w-14 bg-white/10 hover:bg-white text-white hover:text-black rounded-full flex items-center justify-center backdrop-blur-md transition-all z-[10004] border border-white/10 active:scale-90"
                    >
                        <X className="h-8 w-8" aria-hidden="true" />
                    </button>

                    {/* Navigation Arrows (Desktop Only) */}
                    <div className="hidden md:flex absolute inset-x-8 top-1/2 -translate-y-1/2 justify-between items-center z-[10003] pointer-events-none" aria-hidden="true">
                        <button
                            onClick={() => setCurrentGalleryIndex(prev => (prev > 0 ? prev - 1 : images.length - 1))}
                            aria-label="Imagem anterior"
                            className="h-20 w-20 bg-white/5 hover:bg-white text-white hover:text-black rounded-full flex items-center justify-center backdrop-blur-md transition-all border border-white/10 active:scale-90 pointer-events-auto"
                        >
                            <ChevronLeft className="h-10 w-10" />
                        </button>
                        <button
                            onClick={() => setCurrentGalleryIndex(prev => (prev < images.length - 1 ? prev + 1 : 0))}
                            aria-label="Próxima imagem"
                            className="h-20 w-20 bg-white/5 hover:bg-white text-white hover:text-black rounded-full flex items-center justify-center backdrop-blur-md transition-all border border-white/10 active:scale-90 pointer-events-auto"
                        >
                            <ChevronRight className="h-10 w-10" />
                        </button>
                    </div>

                    {/* Image Container / Mobile Swipeable Grid */}
                    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                        {/* Desktop: One image at a time */}
                        <div className="hidden md:flex items-center justify-center w-full h-full p-10">
                            <img 
                                src={images[currentGalleryIndex]} 
                                className="max-w-[85vw] max-h-[85vh] object-contain shadow-2xl rounded-sm animate-in zoom-in-95 duration-500" 
                                alt={`Foto ${currentGalleryIndex + 1}`} 
                            />
                        </div>

                        {/* Mobile: Horizontal Snap Scroll */}
                        <div className="md:hidden flex overflow-x-auto snap-x snap-mandatory w-full h-full no-scrollbar">
                            {images.map((img: string, i: number) => (
                                <div key={i} className="min-w-full h-full snap-start flex items-center justify-center p-4">
                                    <img 
                                        src={img} 
                                        className="max-w-full max-h-full object-contain shadow-2xl" 
                                        alt={`Foto ${i + 1}`} 
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Image Counter Indicator */}
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-md px-6 py-2 rounded-full border border-white/10 z-[10003]">
                        <span className="text-white font-black text-xs uppercase tracking-widest">
                            {currentGalleryIndex + 1} / {images.length}
                        </span>
                    </div>
                </div>
            )}
            {/* Lead Capture Modal */}
            {showLeadModal && (
                <div className="fixed inset-0 z-[10005] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-primary-900/80 backdrop-blur-md" onClick={() => setShowLeadModal(false)} />
                    <div className="relative bg-white w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-8 border-b border-slate-100 flex justify-between items-center text-primary-900">
                            <div>
                                <h3 className="text-xl font-black tracking-tighter uppercase">Falar com Corretor</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Identifique-se para começar</p>
                            </div>
                            <button onClick={() => setShowLeadModal(false)} className="h-10 w-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 transition-all">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Seu Nome</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                                        <input
                                            value={customerName}
                                            onChange={(e) => setCustomerName(e.target.value)}
                                            placeholder="Ex: João Silva"
                                            className="w-full bg-slate-50 border border-slate-100 p-4 pl-12 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-accent text-primary-900"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Seu WhatsApp</label>
                                    <div className="relative">
                                        <MessageSquare className="h-4 w-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                                        <input
                                            value={customerWhatsapp}
                                            onChange={(e) => setCustomerWhatsapp(e.target.value)}
                                            placeholder="(13) 99999-9999"
                                            className="w-full bg-slate-50 border border-slate-100 p-4 pl-12 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-accent text-primary-900"
                                        />
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => handleInterest()}
                                disabled={isSending}
                                className="w-full bg-primary-900 text-white py-5 rounded-2xl font-black text-[12px] uppercase tracking-widest hover:bg-accent transition-all shadow-xl flex items-center justify-center gap-3 disabled:opacity-50"
                            >
                                {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                                {isSending ? 'Processando...' : 'Iniciar Conversa'}
                            </button>
                            <p className="text-[9px] text-center text-slate-300 font-bold uppercase tracking-widest">
                                Ao prosseguir, você aceita nossa <Link href="/privacidade" className="underline hover:text-accent">Política de Privacidade</Link>
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
