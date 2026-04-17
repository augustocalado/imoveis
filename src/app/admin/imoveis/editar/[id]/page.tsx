'use client';

import { useState, useEffect } from 'react';
import { supabase, STORAGE_BUCKET } from '@/lib/supabase';
import {
    Building2, MapPin, DollarSign, Home, Maximize,
    BedDouble, Bath, Car, ArrowLeft, Loader2,
    CheckCircle2, XCircle, Info, Image as ImageIcon,
    LayoutDashboard, Users, Settings, LogOut, Play, Menu, X, Upload, Star, Zap, Calendar, FileText, Handshake,
    ChevronDown, ChevronRight, CreditCard, ShieldCheck, Hash, Layers,
    Bed, Maximize2, Navigation, Check, Shield, MessageSquare, Phone, User,
    Sofa, Utensils, ChefHat, Laptop, Tv, Waves, Sun, Wind, Cctv, Bell, DoorOpen, Thermometer, Wifi, Flame, Table, Layout, Gem, Dumbbell, Bike, CarFront, ParkingCircle, Store, Building, Warehouse, Shirt, Cpu, AirVent, Fence, Trees, Flower, Component, ArrowUp, Shovel, Palmtree
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import clsx from 'clsx';
import { generatePropertyFriendlySlug } from '@/utils/slug';
import Toast, { ToastType } from '@/components/Toast';
import SEOTitleAssistant from '@/components/admin/SEOTitleAssistant';
import SEODescriptionAssistant from '@/components/admin/SEODescriptionAssistant';
import AdminSearchBar from '@/components/admin/AdminSearchBar';

const ICON_MAP: Record<string, any> = {
    Bed, Bath, Maximize2, Car, Star, Navigation, Building2, Home, Zap, Check, Info, Shield, Layers, MessageSquare, Phone, FileText, User, BedDouble, Hash, Maximize,
    Sofa, Utensils, ChefHat, Laptop, Tv, Waves, Sun, Wind, ShieldCheck, Cctv, Bell, DoorOpen, Thermometer, Wifi, Flame, Table, Layout, Gem, Dumbbell, Bike, CarFront, ParkingCircle, Store, Building, Warehouse, Shirt, Cpu, AirVent, Fence, Trees, Flower, Component, ArrowUp, Shovel, Palmtree,
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

// Removido allFeatures estático - agora buscamos do banco de dados na inicialização do componente


export default function EditarImovel() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [userId, setUserId] = useState<string | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
     const [isTitleFocused, setIsTitleFocused] = useState(false);
    const [isDescriptionFocused, setIsDescriptionFocused] = useState(false);
    const [openSections, setOpenSections] = useState<string[]>(['basic']);
    const [isAIModalOpen, setIsAIModalOpen] = useState(false);
    const [aiInput, setAiInput] = useState('');
    const [brokers, setBrokers] = useState<any[]>([]);
    const [currentUserProfile, setCurrentUserProfile] = useState<any>(null);
    const [auditData, setAuditData] = useState<{ name: string; date: string } | null>(null);

    const [allFeatures, setAllFeatures] = useState<any[]>([]);
    const [specs, setSpecs] = useState<any[]>([]);
    const [toast, setToast] = useState<{ message: string, type: ToastType } | null>(null);


    const showToast = (message: string, type: ToastType = 'success') => {
        setToast({ message, type });
    };

    const parseCurrency = (val: string | number) => {
        if (!val) return 0;
        if (typeof val === 'number') return val;
        let str = val.toString().trim();
        const commaIndex = str.lastIndexOf(',');
        const dotIndex = str.lastIndexOf('.');
        if (commaIndex > dotIndex) return Number(str.replace(/\./g, '').replace(',', '.')) || 0;
        if (dotIndex > commaIndex && commaIndex !== -1) return Number(str.replace(/,/g, '')) || 0;
        if (dotIndex !== -1 && commaIndex === -1) {
             if (str.split('.').length > 2) return Number(str.replace(/\./g, '')) || 0;
             if (/^\d+\.\d{3}$/.test(str)) return Number(str.replace(/\./g, '')) || 0;
             return Number(str) || 0; 
        }
        if (commaIndex !== -1 && dotIndex === -1) return Number(str.replace(',', '.')) || 0;
        return Number(str) || 0;
    };


    const extractDataFromText = (text: string) => {
        const data: any = {};

        // Preço
        const priceMatch = text.match(/(?:R\$|valor|venda)\s*([\d.,]+)/i);
        if (priceMatch) data.price = priceMatch[1].replace(/\D/g, '');

        // Área Útil
        const areaMatch = text.match(/(?:util|útil|privativa)\D*([\d.,]+)\s*(?:m2|m²|metros)/i) || text.match(/([\d.,]+)\s*(?:m2|m²|metros)/i);
        if (areaMatch) data.area = areaMatch[1].replace(',', '.');

        // Área Total
        const areaTotalMatch = text.match(/(?:total|terreno|construída)\D*([\d.,]+)\s*(?:m2|m²|metros)/i);
        if (areaTotalMatch) data.area_total = areaTotalMatch[1].replace(',', '.');

        // Quartos
        const roomsMatch = text.match(/(\d+)\s*(?:dorm|quarto|quartos)/i);
        if (roomsMatch) data.rooms = parseInt(roomsMatch[1]);

        // Suítes
        const suitesMatch = text.match(/(\d+)\s*(?:suíte|suite|suites)/i);
        if (suitesMatch) data.suites = parseInt(suitesMatch[1]);

        // Banheiros
        const bathMatch = text.match(/(\d+)\s*(?:banheiro|bh|wc)/i);
        if (bathMatch) data.bathrooms = parseInt(bathMatch[1]);

        // Vagas
        const parkingMatch = text.match(/(\d+)\s*(?:vaga|garagem|auto)/i);
        if (parkingMatch) data.parking_spaces = parseInt(parkingMatch[1]);

        // Condomínio
        const condoMatch = text.match(/(?:condo|condomínio|condominio|cond)\s*([\d.,]+)/i);
        if (condoMatch) data.condo_fee = condoMatch[1].replace(/\D/g, '');

        // IPTU
        const iptuMatch = text.match(/iptu\s*([\d.,]+)/i);
        if (iptuMatch) data.iptu = iptuMatch[1].replace(/\D/g, '');

        // CEP
        const cepMatch = text.match(/(\d{5}-?\d{3})/);
        if (cepMatch) data.cep = cepMatch[1];

        // Título (tenta pegar a primeira linha curta)
        const lines = text.split('\n').filter(l => l.trim().length > 0);
        if (lines.length > 0 && lines[0].length < 100) data.title = lines[0].trim();

        // Descrição Completa (se for longa)
        if (text.length > 10) {
            // "Melhoria" Heurística Simples: Limpeza e Capitalização
            let improved = text.trim()
                .replace(/\s+/g, ' ') // Remove espaços duplos
                .replace(/^\w/, c => c.toUpperCase()); // Capitaliza primeira letra

            data.description = improved;
        }

        return data;
    };

    const handleAIFill = () => {
        const extracted = extractDataFromText(aiInput);
        setFormData(prev => ({ ...prev, ...extracted } as any));
        setIsAIModalOpen(false);
        setAiInput('');
        setMessage({ type: 'success', text: 'Dados extraídos com Inteligência KF IMOVEIS!' });
        setTimeout(() => setMessage(null), 3000);
    };

    const toggleSection = (section: string) => {
        setOpenSections(prev =>
            prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
        );
    };

    const handleCEPChange = async (cep: string) => {
        const cleanCep = cep.replace(/\D/g, '');
        setFormData(prev => ({ ...prev, cep: cleanCep }));

        if (cleanCep.length === 8) {
            try {
                const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
                const data = await response.json();
                if (!data.erro) {
                    setFormData(prev => ({
                        ...prev,
                        address: data.logradouro,
                        neighborhood: data.bairro,
                        city: data.localidade,
                        state: data.uf
                    }));
                }
            } catch (error) {
                console.error('Erro ao buscar CEP:', error);
            }
        }
    };

    const [formData, setFormData] = useState({
        title: '',
        status: 'disponivel',
        description: '',
        type: 'venda',
        price: '',
        address: '',
        city: 'Praia Grande',
        neighborhood: '',
        rooms: 1,
        suites: 0,
        bathrooms: 1,
        parking_spaces: 0,
        area: '',
        area_total: '',
        features: [] as string[],
        images: [] as string[],
        video_url: '',
        owner_name: '',
        owner_address: '',
        owner_contact: '',
        owner_document: '',
        reference_id: '',
        address_number: '',
        is_featured: false,
        condo_fee: '',
        iptu: '',
        accepts_financing: true,
        accepts_exchange: false,
        keys_location: '',
        capturer: '',
        observations: '',
        subtype: '',
        category: '',
        down_payment: '',
        monthly_payment: '',
        keys_payment: '',
        quarterly_payment: '',
        semi_annual_payment: '',
        annual_payment: '',
        financing_balance: '',
        adjustment_index: '',
        accepts_mcmv: false,
        accepts_direct_financing: false,
        cep: '',
        complement: '',
        state: 'SP',
        condo_name: '',
        block: '',
        unit: '',
        year_built: '',
        region: '',
        floor: '',
        marketing_source: '',
        is_launch: false,
        corretor_id: ''
    });


    useEffect(() => {
        const getSessionAndData = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (session) {
                    setUserId(session.user.id);
                    // Fetch Current Profile
                    const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
                    setCurrentUserProfile(profile);
                } else {
                    router.push('/login');
                    return;
                }

                // Fetch Brokers with error handling
                const { data: brokersList, error: brokersError } = await supabase.from('profiles').select('id, full_name').in('role', ['corretor', 'admin']);
                if (brokersError) console.error('Erro ao buscar corretores:', brokersError);
                setBrokers(brokersList || []);

                // Fetch Features from DB
                const { data: featuresData } = await supabase
                    .from('property_features')
                    .select('*')
                    .order('category', { ascending: true })
                    .order('name', { ascending: true });
                
                if (featuresData) {
                    const grouped = featuresData.reduce((acc: any[], item: any) => {
                        const existing = acc.find(g => g.category === item.category);
                        if (existing) {
                            existing.items.push(item.name);
                        } else {
                            acc.push({ category: item.category, items: [item.name] });
                        }
                        return acc;
                    }, []);
                    setAllFeatures(grouped);
                }

                // Busca as especificações configuradas
                const { data: specsData } = await supabase.from('site_settings').select('value').eq('key', 'property_specs').single();
                if (specsData) setSpecs(specsData.value);
                else setSpecs([
                    { id: 'area', label: 'Área Útil', field: 'area', icon: 'Maximize2', suffix: 'm²' },
                    { id: 'rooms', label: 'Dormitórios', field: 'rooms', icon: 'Bed' },
                    { id: 'parking', label: 'Vagas', field: 'parking_spaces', icon: 'Car' },
                    { id: 'bathrooms', label: 'WC / Banheiros', field: 'bathrooms', icon: 'Bath' }
                ]);

                if (id) {

                    const { data: prop, error } = await supabase
                        .from('properties')
                        .select('*')
                        .eq('id', id)
                        .single();

                    if (error) {
                        console.error('Erro ao carregar imóvel:', error);
                        setMessage({ type: 'error', text: 'Erro ao carregar imóvel.' });
                    } else if (prop) {
                        if (prop.last_edited_by) {
                             const { data: editorData } = await supabase.from('profiles').select('full_name').eq('id', prop.last_edited_by).single();
                             const dateFormatted = prop.last_edited_at ? new Date(prop.last_edited_at).toLocaleString('pt-BR') : '';
                             setAuditData({ name: editorData?.full_name || 'Usuário Desconhecido', date: dateFormatted });
                        }

                        const formatBRL = (val: any) => val ? Number(val).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '';
                        const formatArea = (val: any) => val ? Number(val).toLocaleString('pt-BR') : '';

                        setFormData({
                            title: prop.title || '',
                            description: prop.description || '',
                            type: prop.type || 'venda',
                            price: formatBRL(prop.price),
                            address: prop.address || '',
                            city: prop.city || '',
                            neighborhood: prop.neighborhood || '',
                            rooms: Number(prop.rooms) || 0,
                            suites: Number(prop.suites) || 0,
                            bathrooms: Number(prop.bathrooms) || 0,
                            parking_spaces: Number(prop.parking_spaces) || 0,
                            area: formatArea(prop.area),
                            area_total: formatArea(prop.area_total),
                            features: prop.features || [],
                            images: prop.images || [],
                            video_url: prop.video_url || '',
                            corretor_id: prop.corretor_id || '',
                            owner_name: prop.owner_name || '',
                            owner_address: prop.owner_address || '',
                            owner_contact: prop.owner_contact || '',
                            owner_document: prop.owner_document || '',
                            reference_id: prop.reference_id || '',
                            status: prop.status || 'disponivel',
                            address_number: prop.address_number || '',
                            is_featured: prop.is_featured || false,
                            condo_fee: formatBRL(prop.condo_fee),
                            iptu: formatBRL(prop.iptu),
                            accepts_financing: prop.accepts_financing ?? true,
                            accepts_exchange: prop.accepts_exchange ?? false,
                            keys_location: prop.keys_location || '',
                            capturer: prop.capturer || '',
                            observations: prop.observations || '',
                            subtype: prop.subtype || '',
                            category: prop.category || '',
                            down_payment: formatBRL(prop.down_payment),
                            monthly_payment: formatBRL(prop.monthly_payment),
                            keys_payment: formatBRL(prop.keys_payment),
                            quarterly_payment: formatBRL(prop.quarterly_payment),
                            semi_annual_payment: formatBRL(prop.semi_annual_payment),
                            annual_payment: formatBRL(prop.annual_payment),
                            financing_balance: formatBRL(prop.financing_balance),
                            adjustment_index: prop.adjustment_index || '',
                            accepts_mcmv: prop.accepts_mcmv ?? false,
                            accepts_direct_financing: prop.accepts_direct_financing ?? false,
                            cep: prop.cep || '',
                            complement: prop.complement || '',
                            state: prop.state || 'SP',
                            condo_name: prop.condo_name || '',
                            block: prop.block || '',
                            unit: prop.unit || '',
                            year_built: prop.year_built?.toString() || '',
                            region: prop.region || '',
                            floor: prop.floor || '',
                            marketing_source: prop.marketing_source || '',
                            is_launch: prop.is_launch ?? false
                        } as any);
                    }
                }
            } catch (err) {
                console.error('Erro crítico no carregamento:', err);
            } finally {
                setIsFetching(false);
            }
        };
        getSessionAndData();
    }, [id, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userId) {
            setMessage({ type: 'error', text: 'Você precisa estar logado para editar.' });
            return;
        }

        // Validação de segurança conforme solicitado pelo usuário
        if (formData.suites === null || formData.suites === undefined) {
             showToast('O número de suítes é obrigatório para salvar.', 'error');
             return;
        }

        // Verificação de Unicidade da Referência
        const { data: existingRef } = await supabase
            .from('properties')
            .select('id')
            .eq('reference_id', formData.reference_id.toUpperCase().trim())
            .neq('id', id)
            .maybeSingle();
        
        if (existingRef) {
            showToast('Este Código de Referência já está em uso por outro imóvel.', 'error');
            return;
        }

        setIsLoading(true);
        setMessage(null);

        const slugBase = generatePropertyFriendlySlug(
            formData.title,
            formData.neighborhood,
            formData.city,
            formData.rooms
        );


        try {
            // Uniqueness check: se o slug já existe, tentamos variações numéricas até encontrar um livre
            let finalSlug = slugBase;
            let counter = 1;
            let isUnique = false;

            while (!isUnique) {
                const { data: existing, error: checkError } = await supabase
                    .from('properties')
                    .select('id')
                    .eq('slug', finalSlug)
                    .neq('id', id)
                    .maybeSingle();
                
                if (checkError) throw checkError;

                if (existing) {
                    finalSlug = `${slugBase}-${counter}`;
                    counter++;
                } else {
                    isUnique = true;
                }
            }
            const { data, error } = await supabase
                .from('properties')
                .update({
                    slug: finalSlug,
                    reference_id: formData.reference_id,
                    title: formData.title,
                    description: formData.description,
                    price: parseCurrency(formData.price),
                    type: formData.type,
                    address: formData.address,
                    city: formData.city,
                    neighborhood: formData.neighborhood,
                    rooms: Number(formData.rooms) || 0,
                    suites: Number(formData.suites) || 0,
                    bathrooms: Number(formData.bathrooms) || 0,
                    parking_spaces: Number(formData.parking_spaces) || 0,
                    area: parseCurrency(formData.area),
                    area_total: parseCurrency(formData.area_total),
                    features: formData.features,
                    address_number: formData.address_number,
                    images: formData.images,
                    video_url: formData.video_url,
                    owner_name: formData.owner_name,
                    owner_address: formData.owner_address,
                    owner_contact: formData.owner_contact,
                    owner_document: formData.owner_document,
                    is_featured: formData.is_featured,
                    condo_fee: parseCurrency(formData.condo_fee) || 0,
                    iptu: parseCurrency(formData.iptu) || 0,
                    accepts_financing: formData.accepts_financing,
                    accepts_exchange: formData.accepts_exchange,
                    keys_location: formData.keys_location,
                    capturer: formData.capturer,
                    observations: formData.observations,
                    subtype: formData.subtype,
                    category: formData.category,
                    down_payment: parseCurrency(formData.down_payment) || 0,
                    monthly_payment: parseCurrency(formData.monthly_payment) || 0,
                    keys_payment: parseCurrency(formData.keys_payment) || 0,
                    quarterly_payment: parseCurrency(formData.quarterly_payment) || 0,
                    semi_annual_payment: parseCurrency(formData.semi_annual_payment) || 0,
                    annual_payment: parseCurrency(formData.annual_payment) || 0,
                    financing_balance: parseCurrency(formData.financing_balance) || 0,
                    adjustment_index: formData.adjustment_index,
                    accepts_mcmv: formData.accepts_mcmv,
                    accepts_direct_financing: formData.accepts_direct_financing,
                    cep: formData.cep,
                    complement: formData.complement,
                    state: formData.state,
                    condo_name: formData.condo_name,
                    block: formData.block,
                    unit: formData.unit,
                    year_built: Number(formData.year_built) || null,
                    region: formData.region,
                    floor: formData.floor,
                    marketing_source: formData.marketing_source,
                    is_launch: formData.is_launch,
                    status: formData.status,
                    corretor_id: formData.corretor_id
                })
                .eq('id', id)
                .select();

            if (error) throw error;
            if (!data || data.length === 0) {
                throw new Error('Nenhuma linha foi alterada. Verifique as permissões de acesso ou se o imóvel ainda existe.');
            }

            showToast('Imóvel atualizado com sucesso!');
            // Mantém na mesma página para permitir continuar editando conforme solicitado
            setTimeout(() => setMessage(null), 3000);
        } catch (err: any) {
            console.error('Erro ao atualizar imóvel:', err);
            showToast(`Erro ao atualizar: ${err.message}`, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    if (isFetching) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-white gap-8">
                <Loader2 className="h-12 w-12 text-[#1B263B] animate-spin" />
                <p className="text-[12px] font-black uppercase tracking-[0.4em] text-slate-300">Carregando Dados do Imóvel</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f4f7fa] flex flex-col lg:flex-row  text-[#1B263B] relative">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[55] lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Mobile Header */}
            <header className="lg:hidden h-20 bg-[#1B263B] text-white flex items-center justify-between px-6 sticky top-0 z-[60] shadow-xl">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-[#10b981] rounded-lg flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-sm font-black tracking-tighter uppercase">Kátia e Flávio Admin</span>
                </div>
                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="p-3 bg-white/5 rounded-xl border border-white/10"
                >
                    {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
            </header>

            {/* Sidebar */}
            <aside className={clsx(
                "w-72 bg-[#1B263B] text-white fixed lg:sticky top-0 h-screen z-[58] flex flex-col shadow-2xl transition-transform duration-500",
                isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
            )}>
                <div className="p-8 pb-12 flex-1 overflow-y-auto custom-scrollbar">
                    {/* Premium Profile Header */}
                    <div className="mb-10 p-6 rounded-[32px] bg-gradient-to-br from-white/10 to-transparent border border-white/5 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-[#10b981]/10 blur-[40px] group-hover:bg-[#10b981]/20 transition-all duration-700" />
                        <div className="relative z-10 flex flex-col items-center text-center">
                            <div className="h-20 w-20 rounded-[24px] bg-[#10b981] mb-4 flex items-center justify-center text-3xl font-black shadow-2xl shadow-[#10b981]/30 border-2 border-white/20 overflow-hidden">
                                {currentUserProfile?.avatar_url ? (
                                    <img src={currentUserProfile.avatar_url} className="w-full h-full object-cover" alt="" />
                                ) : (
                                    currentUserProfile?.full_name?.charAt(0) || 'U'
                                )}
                            </div>
                            <h4 className="text-sm font-black uppercase tracking-widest text-white leading-none mb-1 line-clamp-1">{currentUserProfile?.full_name || 'Usuário'}</h4>
                            <span className="text-[10px] font-black text-[#10b981] uppercase tracking-[0.3em] bg-[#10b981]/10 px-3 py-1 rounded-full">{currentUserProfile?.role || 'Acesso'}</span>
                        </div>
                    </div>

                    <Link href="/" className="flex items-center gap-3 mb-10 group px-4" onClick={() => setIsSidebarOpen(false)}>
                        <div className="h-8 w-8 bg-white/5 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Building2 className="h-4 w-4 text-[#10b981]" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-black tracking-tighter leading-none uppercase text-white/40 group-hover:text-white transition-colors">Voltar ao <span className="text-[#10b981]">Site Público</span></span>
                        </div>
                    </Link>

                    <nav className="space-y-1">
                        <p className="text-[11px] font-black text-white/20 uppercase tracking-[0.2em] mb-4 ml-4">Navegação Principal</p>

                        <Link href="/admin" onClick={() => setIsSidebarOpen(false)}>
                            <button className="w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-300 group hover:bg-white/5 text-white/40 hover:text-white/80">
                                <LayoutDashboard className="h-5 w-5 text-white/20 group-hover:text-white/40" />
                                <span className="text-sm font-bold">Visão Geral</span>
                            </button>
                        </Link>

                        <Link href="/admin/imoveis/novo" onClick={() => setIsSidebarOpen(false)}>
                            <button className="w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-300 group hover:bg-white/5 text-white/40 hover:text-white/80">
                                <Building2 className="h-5 w-5 text-white/20 group-hover:text-white/40" />
                                <span className="text-sm font-bold">Novo Imóvel</span>
                            </button>
                        </Link>

                        <Link href="/admin?tab=crm" onClick={() => setIsSidebarOpen(false)}>
                            <button className="w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-300 group hover:bg-white/5 text-white/40 hover:text-white/80">
                                <Users className="h-5 w-5 text-white/20 group-hover:text-white/40" />
                                <span className="text-sm font-bold">CRM de Clientes</span>
                            </button>
                        </Link>

                        <Link href="/admin/caracteristicas" onClick={() => setIsSidebarOpen(false)}>
                            <button className="w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-300 group hover:bg-white/5 text-white/40 hover:text-white/80">
                                <Zap className="h-5 w-5 text-white/20 group-hover:text-white/40" />
                                <span className="text-sm font-bold">Características</span>
                            </button>
                        </Link>


                        <Link href="/admin?tab=financeiro" onClick={() => setIsSidebarOpen(false)}>
                            <button className="w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-300 group hover:bg-white/5 text-white/40 hover:text-white/80">
                                <DollarSign className="h-5 w-5 text-white/20 group-hover:text-white/40" />
                                <span className="text-sm font-bold">Financeiro</span>
                            </button>
                        </Link>

                        <Link href="/admin?tab=agenda" onClick={() => setIsSidebarOpen(false)}>
                            <button className="w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-300 group hover:bg-white/5 text-white/40 hover:text-white/80">
                                <Calendar className="h-5 w-5 text-white/20 group-hover:text-white/40" />
                                <span className="text-sm font-bold">Agenda de Visitas</span>
                            </button>
                        </Link>

                        <Link href="/admin?tab=documentos" onClick={() => setIsSidebarOpen(false)}>
                            <button className="w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-300 group hover:bg-white/5 text-white/40 hover:text-white/80">
                                <FileText className="h-5 w-5 text-white/20 group-hover:text-white/40" />
                                <span className="text-sm font-bold">Documentos</span>
                            </button>
                        </Link>

                        <Link href="/admin?tab=parceiros" onClick={() => setIsSidebarOpen(false)}>
                            <button className="w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-300 group hover:bg-white/5 text-white/40 hover:text-white/80">
                                <Handshake className="h-5 w-5 text-white/20 group-hover:text-white/40" />
                                <span className="text-sm font-bold">Nossos Parceiros</span>
                            </button>
                        </Link>

                        <Link href="/admin?tab=config" onClick={() => setIsSidebarOpen(false)}>
                            <button className="w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-300 group hover:bg-white/5 text-white/40 hover:text-white/80">
                                <Settings className="h-5 w-5 text-white/20 group-hover:text-white/40" />
                                <span className="text-sm font-bold">Configurações</span>
                            </button>
                        </Link>
                    </nav>
                </div>

                <div className="mt-auto p-8 space-y-4 bg-black/20">
                    <button
                        onClick={async () => {
                            await supabase.auth.signOut();
                            router.push('/login');
                        }}
                        className="w-full flex items-center gap-4 p-5 rounded-2xl text-white/40 hover:text-white hover:bg-red-500/80 transition-all group shadow-lg overflow-hidden relative"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <LogOut className="h-5 w-5 text-white/10 group-hover:text-white relative z-10" />
                        <span className="text-xs font-black uppercase tracking-[0.3em] relative z-10">Encerrar Sessão</span>
                    </button>
                    <div className="text-[9px] font-black text-white/10 uppercase tracking-[0.5em] text-center">Version 4.2.0 • Premium</div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-h-[calc(100vh-80px)] lg:min-h-screen">
                <header className="h-auto py-6 lg:h-24 bg-white border-b border-slate-100 flex items-center justify-between px-6 lg:px-12 sticky top-0 lg:top-0 z-40">
                    <div className="flex items-center gap-4">
                        <Link href="/admin" className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-[#1B263B] hover:bg-slate-100 transition-all group">
                            <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                        </Link>
                        <h1 className="text-xl font-black tracking-tighter uppercase">Editar Imóvel: <span className="text-[#10b981]">{formData.reference_id}</span></h1>
                    </div>

                    <div className="flex-1 flex items-center gap-8">
                        <div className="hidden xl:block flex-1 max-w-md">
                            <AdminSearchBar />
                        </div>
                        
                        <div className="flex items-center gap-4 ml-auto">
                            <button
                                type="button"
                                onClick={() => setIsAIModalOpen(true)}
                                className="hidden md:flex items-center gap-3 bg-[#1B263B] text-white px-6 py-3 rounded-2xl text-[12px] font-black uppercase tracking-widest hover:bg-[#10b981] transition-all shadow-xl shadow-[#10b981]/10 group"
                            >
                                <Zap className="h-4 w-4 fill-[#10b981] text-[#10b981] group-hover:fill-white group-hover:text-white transition-colors" />
                                Importar com IA
                            </button>
                            <div className="h-8 w-px bg-slate-100 hidden md:block" />
                            <div className="flex items-center gap-4 cursor-pointer group p-2 hover:bg-slate-50 rounded-2xl transition-all">
                                <div className="flex flex-col text-right">
                                    <span className="text-sm font-black uppercase tracking-tight text-[#1B263B] group-hover:text-[#10b981] transition-colors">{currentUserProfile?.full_name || 'Usuário'}</span>
                                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{currentUserProfile?.role || 'Acesso'} Master</span>
                                </div>
                                <div className="h-12 w-12 rounded-2xl bg-[#1B263B] text-white flex items-center justify-center font-black group-hover:scale-110 group-hover:bg-[#10b981] transition-all shadow-xl shadow-[#1B263B]/10 overflow-hidden">
                                    {currentUserProfile?.avatar_url ? (
                                        <img src={currentUserProfile.avatar_url} className="w-full h-full object-cover" alt="" />
                                    ) : (
                                        currentUserProfile?.full_name?.charAt(0) || 'U'
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    </div>
                </header>

                <div className="p-8 lg:p-12 max-w-5xl mx-auto w-full">
                    {message && (
                        <div className={clsx(
                            "mb-8 p-6 rounded-[30px] border flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-500",
                            message.type === 'success' ? "bg-emerald-50 border-emerald-100 text-emerald-800" : "bg-red-50 border-red-100 text-red-800"
                        )}>
                            {message.type === 'success' ? <CheckCircle2 className="h-6 w-6" /> : <XCircle className="h-6 w-6" />}
                            <p className="font-bold text-sm uppercase tracking-widest">{message.text}</p>
                        </div>
                    )}
                    
                    {auditData && (
                        <div className="mb-8 p-4 bg-[#1B263B]/5 border border-[#1B263B]/10 rounded-2xl flex items-center gap-3">
                            <ShieldCheck className="h-5 w-5 text-[#1B263B]" />
                            <p className="text-sm font-bold text-[#1B263B]">
                                Última Modificação efetuada por <span className="text-[#10b981]">{auditData.name}</span> em <span className="font-black">{auditData.date}</span>
                            </p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        {/* 1. Informações Básicas */}
                        <div className="bg-white rounded-[35px] border border-slate-100 overflow-hidden shadow-sm transition-all">
                            <button
                                type="button"
                                onClick={() => toggleSection('basic')}
                                className="w-full flex items-center justify-between p-8 hover:bg-slate-50 transition-all group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all ${openSections.includes('basic') ? 'bg-[#10b981] text-white' : 'bg-slate-100 text-slate-400'}`}>
                                        <Info className="h-5 w-5" />
                                    </div>
                                    <h3 className="text-lg font-black tracking-tighter uppercase">1. Informações Básicas</h3>
                                </div>
                                {openSections.includes('basic') ? <ChevronDown className="h-5 w-5 text-slate-300" /> : <ChevronRight className="h-5 w-5 text-slate-300" />}
                            </button>

                            {openSections.includes('basic') && (
                                <div className="p-10 pt-0 space-y-8 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                                        <div className="space-y-2">
                                            <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest ml-2">Código de Referência <span className="text-red-500">*</span></label>
                                            <input
                                                required
                                                type="text"
                                                placeholder="Ex: RF123"
                                                className="w-full bg-slate-50 border border-slate-100 p-5 rounded-2xl font-black text-sm text-[#1B263B] shadow-sm outline-none focus:ring-2 focus:ring-[#10b981]/20 transition-all uppercase"
                                                value={formData.reference_id}
                                                onChange={e => setFormData({ ...formData, reference_id: e.target.value.toUpperCase() })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest ml-2">Status do Imóvel</label>
                                            <select
                                                className="w-full bg-slate-50 border border-slate-100 p-5 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-[#10b981]/20 transition-all appearance-none"
                                                value={formData.status}
                                                onChange={e => setFormData({ ...formData, status: e.target.value })}
                                            >
                                                <option value="disponivel">Disponível</option>
                                                <option value="vendido">Vendido</option>
                                                <option value="pausado">Pausado</option>
                                            </select>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest ml-2">Destaque na Home</label>
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, is_featured: !formData.is_featured })}
                                                className={clsx(
                                                    "w-full flex items-center justify-between p-5 rounded-2xl font-bold text-sm transition-all h-[62px]",
                                                    formData.is_featured ? "bg-[#10b981] text-white shadow-lg shadow-[#10b981]/20" : "bg-slate-50 border border-slate-100 text-slate-400 hover:bg-slate-100"
                                                )}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Star className={clsx("h-4 w-4", formData.is_featured ? "text-yellow-300 fill-yellow-300" : "text-slate-300")} />
                                                    <span className="text-[12px] uppercase">Destaque</span>
                                                </div>
                                                {formData.is_featured && <CheckCircle2 className="h-4 w-4 text-white" />}
                                            </button>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest ml-2">É um Lançamento?</label>
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, is_launch: !formData.is_launch })}
                                                className={clsx(
                                                    "w-full flex items-center justify-between p-5 rounded-2xl font-bold text-sm transition-all h-[62px]",
                                                    formData.is_launch ? "bg-accent text-white shadow-lg shadow-accent/20" : "bg-slate-50 border border-slate-100 text-slate-400 hover:bg-slate-100"
                                                )}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Zap className={clsx("h-4 w-4", formData.is_launch ? "text-white fill-white" : "text-slate-300")} />
                                                    <span className="text-[12px] uppercase">Lançamento</span>
                                                </div>
                                                {formData.is_launch && <CheckCircle2 className="h-4 w-4 text-white" />}
                                            </button>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest ml-2">Tipo de Negócio</label>
                                            <select
                                                className="w-full bg-slate-50 border border-slate-100 p-5 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-[#10b981]/20 transition-all appearance-none"
                                                value={formData.type}
                                                onChange={e => setFormData({ ...formData, type: e.target.value })}
                                            >
                                                <option value="venda">Venda</option>
                                                <option value="aluguel">Aluguel</option>
                                            </select>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest ml-2">Categoria do Imóvel</label>
                                            <select
                                                required
                                                className="w-full bg-slate-50 border border-slate-100 p-5 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-[#10b981]/20 transition-all appearance-none"
                                                value={formData.category}
                                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                                            >
                                                <option value="">Selecione a Categoria</option>
                                                <option value="Apartamento">Apartamento</option>
                                                <option value="Casa">Casa</option>
                                                <option value="Casa de Condomínio">Casa de Condomínio</option>
                                                <option value="Sobrado">Sobrado</option>
                                                <option value="Sobrado de Condomínio">Sobrado de Condomínio</option>
                                                <option value="Kitnet">Kitnet</option>
                                                <option value="Terreno">Terreno</option>
                                                <option value="Comercial">Comercial</option>
                                            </select>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest ml-2">Subtipo do Imóvel</label>
                                            <select
                                                className="w-full bg-slate-50 border border-slate-100 p-5 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-[#10b981]/20 transition-all appearance-none"
                                                value={formData.subtype}
                                                onChange={e => setFormData({ ...formData, subtype: e.target.value })}
                                            >
                                                <option value="">Selecione o Subtipo</option>
                                                <option value="isolada">Isolada</option>
                                                <option value="condominio_fechado">Condomínio Fechado</option>
                                                <option value="loteamento_fechado">Loteamento Fechado</option>
                                                <option value="esquina">Esquina</option>
                                                <option value="sobrado">Sobrado</option>
                                                <option value="semi_isolada">Semi Isolada</option>
                                                <option value="sobreposta_alta">Sobreposta Alta</option>
                                                <option value="sobreposta_baixa">Sobreposta Baixa</option>
                                                <option value="edicula">Edícula</option>
                                                <option value="vila">Vila</option>
                                                <option value="condominio">Condomínio</option>
                                                <option value="villagio">Villagio</option>
                                            </select>
                                        </div>

                                        {/* Novos Campos na Primeira Seção */}
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 ml-2">
                                                <Maximize2 className="h-3.5 w-3.5 text-slate-400" />
                                                <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest">Área Útil (m²)</label>
                                            </div>
                                            <input
                                                type="text"
                                                placeholder="Ex: 85"
                                                className="w-full bg-slate-50 border border-slate-100 p-5 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-[#10b981]/20 transition-all"
                                                value={formData.area}
                                                onChange={e => setFormData({ ...formData, area: e.target.value })}
                                            />
                                        </div>



                                        <div className="space-y-2 md:col-span-2 lg:col-span-4 relative">
                                            <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest ml-2">Título do Anúncio (Nome do Imóvel) <span className="text-red-500">*</span></label>
                                            
                                            <SEOTitleAssistant 
                                                title={formData.title} 
                                                category={formData.category} 
                                                neighborhood={formData.neighborhood} 
                                                isVisible={isTitleFocused} 
                                            />

                                            <input
                                                required
                                                type="text"
                                                onFocus={() => setIsTitleFocused(true)}
                                                onBlur={() => setIsTitleFocused(false)}
                                                placeholder="Ex: Apartamento de Luxo com Vista para o Mar"
                                                className="w-full bg-slate-50 border border-slate-100 p-5 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-[#10b981]/20 transition-all text-[#1B263B]"
                                                value={formData.title}
                                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                            />
                                        </div>

                                         <div className="space-y-2 md:col-span-2 lg:col-span-4 relative">
                                            <div className="flex justify-between items-center mb-2 ml-2">
                                                <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest">Descrição Detalhada do Imóvel</label>
                                            </div>
                                            
                                            <SEODescriptionAssistant 
                                                description={formData.description}
                                                neighborhood={formData.neighborhood}
                                                city={formData.city}
                                                category={formData.category}
                                                isVisible={isDescriptionFocused}
                                            />

                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setAiInput(formData.description);
                                                    setIsAIModalOpen(true);
                                                }}
                                                className="absolute top-2 right-2 flex items-center bg-[#10b981]/10 text-[#10b981] px-3 py-1.5 rounded-lg border border-[#10b981]/20 hover:bg-[#10b981] hover:text-white transition-all text-[12px] font-black uppercase tracking-widest group shadow-sm z-10"
                                            >
                                                <Zap className="h-3 w-3 mr-2 group-hover:fill-white" />
                                                Melhorar com IA
                                            </button>
                                            <textarea
                                                rows={4}
                                                onFocus={() => setIsDescriptionFocused(true)}
                                                onBlur={() => setIsDescriptionFocused(false)}
                                                placeholder="Descreva as principais características, acabamentos e diferenciais do imóvel..."
                                                className="w-full bg-slate-50 border border-slate-100 p-5 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-[#10b981]/20 transition-all resize-none text-[#1B263B]"
                                                value={formData.description}
                                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 2. Fotos e Vídeo */}
                        <div className="bg-white rounded-[35px] border border-slate-100 overflow-hidden shadow-sm transition-all">
                            <button
                                type="button"
                                onClick={() => toggleSection('media')}
                                className="w-full flex items-center justify-between p-8 hover:bg-slate-50 transition-all group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all ${openSections.includes('media') ? 'bg-[#10b981] text-white' : 'bg-slate-100 text-slate-400'}`}>
                                        <ImageIcon className="h-5 w-5" />
                                    </div>
                                    <h3 className="text-lg font-black tracking-tighter uppercase">2. Fotos e Vídeo</h3>
                                </div>
                                {openSections.includes('media') ? <ChevronDown className="h-5 w-5 text-slate-300" /> : <ChevronRight className="h-5 w-5 text-slate-300" />}
                            </button>

                            {openSections.includes('media') && (
                                <div className="p-10 pt-0 space-y-10 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <div className="space-y-8">
                                        {/* Fotos */}
                                        <div className="space-y-4">
                                            <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest ml-2">Galeria de Fotos (Upload e Ordenação)</label>
                                            <div className="flex gap-4">
                                                <input
                                                    type="file"
                                                    multiple
                                                    accept="image/*"
                                                    onChange={async (e) => {
                                                        const files = e.target.files;
                                                        if (!files || files.length === 0) return;

                                                        setIsLoading(true);
                                                        const uploadedUrls = [];

                                                        const watermarkImg = new Image();
                                                        watermarkImg.src = '/logo.png';
                                                        await new Promise((resolve) => {
                                                            watermarkImg.onload = resolve;
                                                            watermarkImg.onerror = resolve;
                                                        });

                                                        for (const file of Array.from(files)) {
                                                            try {
                                                                const imgUrl = URL.createObjectURL(file);
                                                                const img = new Image();
                                                                img.src = imgUrl;
                                                                await new Promise((resolve, reject) => {
                                                                    img.onload = resolve;
                                                                    img.onerror = reject;
                                                                });
                                                                URL.revokeObjectURL(imgUrl);

                                                                const canvas = document.createElement('canvas');
                                                                canvas.width = img.width;
                                                                canvas.height = img.height;
                                                                const ctx = canvas.getContext('2d');

                                                                if (ctx) {
                                                                    ctx.drawImage(img, 0, 0);
                                                                    if (watermarkImg.width > 0) {
                                                                        const wmWidth = img.width * 0.4;
                                                                        const wmHeight = (watermarkImg.height / watermarkImg.width) * wmWidth;
                                                                        const wmX = (img.width - wmWidth) / 2;
                                                                        const wmY = (img.height - wmHeight) / 2;
                                                                        ctx.globalAlpha = 0.4;
                                                                        ctx.drawImage(watermarkImg, wmX, wmY, wmWidth, wmHeight);
                                                                        ctx.globalAlpha = 1.0;
                                                                    }
                                                                    const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.85));
                                                                    if (blob) {
                                                                        const fileName = `prop_${Math.random()}.jpg`;
                                                                        const filePath = `properties/${fileName}`;
                                                                        const { error: uploadError } = await supabase.storage.from(STORAGE_BUCKET).upload(filePath, blob);
                                                                        if (!uploadError) {
                                                                            const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(filePath);
                                                                            uploadedUrls.push(data.publicUrl);
                                                                        } else {
                                                                            alert('Erro ao enviar: ' + uploadError.message);
                                                                        }
                                                                    }
                                                                }
                                                            } catch (err) {
                                                                console.error('Erro processando imagem', err);
                                                            }
                                                        }

                                                        setFormData({ ...formData, images: [...formData.images, ...uploadedUrls] });
                                                        setIsLoading(false);
                                                    }}
                                                    className="hidden"
                                                    id="property-upload"
                                                />
                                                <label
                                                    htmlFor="property-upload"
                                                    className="flex-1 bg-slate-50 border-2 border-dashed border-slate-100 p-8 rounded-3xl font-black text-sm text-slate-400 uppercase tracking-widest cursor-pointer hover:bg-[#10b981]/5 hover:border-[#10b981]/30 hover:text-[#10b981] transition-all flex flex-col items-center justify-center gap-4"
                                                >
                                                    <div className="h-12 w-12 rounded-2xl bg-[#10b981]/10 flex items-center justify-center">
                                                        <Upload className="h-6 w-6 text-[#10b981]" />
                                                    </div>
                                                    {isLoading ? 'Enviando Arquivos...' : 'Clique para selecionar fotos ou arraste aqui'}
                                                </label>
                                            </div>

                                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                                                {formData.images.map((url, index) => (
                                                    <div key={url}
                                                        draggable
                                                        onDragStart={(e) => {
                                                            e.dataTransfer.effectAllowed = 'move';
                                                            e.dataTransfer.setData('text/plain', index.toString());
                                                        }}
                                                        onDragOver={(e) => {
                                                            e.preventDefault();
                                                            e.dataTransfer.dropEffect = 'move';
                                                        }}
                                                        onDrop={(e) => {
                                                            e.preventDefault();
                                                            const draggedIdxStr = e.dataTransfer.getData('text/plain');
                                                            if (!draggedIdxStr) return;
                                                            const draggedIdx = parseInt(draggedIdxStr, 10);
                                                            if (draggedIdx === index) return;
                                                            const newImages = [...formData.images];
                                                            const draggedImg = newImages[draggedIdx];
                                                            newImages.splice(draggedIdx, 1);
                                                            newImages.splice(index, 0, draggedImg);
                                                            setFormData({ ...formData, images: newImages });
                                                        }}
                                                        className={clsx(
                                                            "relative group rounded-[25px] overflow-hidden aspect-video shadow-sm border-4 transition-all cursor-move",
                                                            index === 0 ? "border-[#10b981]" : "border-slate-50"
                                                        )}
                                                    >
                                                        <img src={url} alt={`Preview ${index}`} className="w-full h-full object-cover pointer-events-none" />
                                                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    const newImages = formData.images.filter(img => img !== url);
                                                                    setFormData({ ...formData, images: newImages });
                                                                }}
                                                                className="h-8 w-8 rounded-xl bg-red-500 text-white flex items-center justify-center hover:scale-110 transition-transform shadow-xl"
                                                            >
                                                                <XCircle className="h-4 w-4" />
                                                            </button>
                                                            {index === 0 && <span className="text-[10px] font-black text-white uppercase tracking-widest bg-[#10b981] px-2 py-1 rounded-lg">Capa</span>}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Vídeo */}
                                        <div className="space-y-4 pt-6 border-t border-slate-50">
                                            <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest ml-2">Vídeo do Imóvel (Link YouTube/Vimeo)</label>
                                            <div className="relative">
                                                <Play className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                                                <input
                                                    type="url"
                                                    placeholder="https://youtube.com/watch?v=..."
                                                    className="w-full bg-slate-50 border border-slate-100 p-5 pl-12 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-[#10b981]/20 transition-all"
                                                    value={formData.video_url}
                                                    onChange={e => setFormData({ ...formData, video_url: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 3. Localização Detalhada */}
                        <div className="bg-white rounded-[35px] border border-slate-100 overflow-hidden shadow-sm transition-all">
                            <button
                                type="button"
                                onClick={() => toggleSection('location')}
                                className="w-full flex items-center justify-between p-8 hover:bg-slate-50 transition-all group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all ${openSections.includes('location') ? 'bg-[#10b981] text-white' : 'bg-slate-100 text-slate-400'}`}>
                                        <MapPin className="h-5 w-5" />
                                    </div>
                                    <h3 className="text-lg font-black tracking-tighter uppercase">3. Localização Detalhada</h3>
                                </div>
                                {openSections.includes('location') ? <ChevronDown className="h-5 w-5 text-slate-300" /> : <ChevronRight className="h-5 w-5 text-slate-300" />}
                            </button>

                            {openSections.includes('location') && (
                                <div className="p-10 pt-0 space-y-8 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                                        <div className="space-y-2 lg:col-span-1">
                                            <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest ml-2">CEP</label>
                                            <input
                                                type="text"
                                                placeholder="00000-000"
                                                className="w-full bg-slate-50 border border-slate-100 p-5 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-[#10b981]/20 transition-all font-mono"
                                                value={formData.cep}
                                                onChange={e => handleCEPChange(e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2 lg:col-span-2">
                                            <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest ml-2">Endereço (Rua/Av)</label>
                                            <input
                                                type="text"
                                                placeholder="Nome da rua ou avenida"
                                                className="w-full bg-slate-50 border border-slate-100 p-5 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-[#10b981]/20 transition-all"
                                                value={formData.address}
                                                onChange={e => setFormData({ ...formData, address: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest ml-2">Número</label>
                                            <input
                                                type="text"
                                                placeholder="123"
                                                className="w-full bg-slate-50 border border-slate-100 p-5 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-[#10b981]/20 transition-all"
                                                value={formData.address_number}
                                                onChange={e => setFormData({ ...formData, address_number: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest ml-2">Complemento</label>
                                            <input
                                                type="text"
                                                placeholder="Apto, Sala, etc"
                                                className="w-full bg-slate-50 border border-slate-100 p-5 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-[#10b981]/20 transition-all"
                                                value={formData.complement}
                                                onChange={e => setFormData({ ...formData, complement: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest ml-2">Bairro</label>
                                            <input
                                                type="text"
                                                placeholder="Bairro"
                                                className="w-full bg-slate-50 border border-slate-100 p-5 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-[#10b981]/20 transition-all"
                                                value={formData.neighborhood}
                                                onChange={e => setFormData({ ...formData, neighborhood: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest ml-2">Cidade</label>
                                            <input
                                                type="text"
                                                placeholder="Cidade"
                                                className="w-full bg-slate-50 border border-slate-100 p-5 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-[#10b981]/20 transition-all"
                                                value={formData.city}
                                                onChange={e => setFormData({ ...formData, city: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest ml-2">Estado</label>
                                            <input
                                                type="text"
                                                placeholder="UF"
                                                className="w-full bg-slate-50 border border-slate-100 p-5 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-[#10b981]/20 transition-all"
                                                value={formData.state}
                                                onChange={e => setFormData({ ...formData, state: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2 lg:col-span-2">
                                            <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest ml-2">Nome do Condomínio</label>
                                            <input
                                                type="text"
                                                placeholder="Edifício / Condomínio"
                                                className="w-full bg-slate-50 border border-slate-100 p-5 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-[#10b981]/20 transition-all"
                                                value={formData.condo_name}
                                                onChange={e => setFormData({ ...formData, condo_name: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest ml-2">Bloco</label>
                                            <input
                                                type="text"
                                                placeholder="Bloco"
                                                className="w-full bg-slate-50 border border-slate-100 p-5 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-[#10b981]/20 transition-all"
                                                value={formData.block}
                                                onChange={e => setFormData({ ...formData, block: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest ml-2">Unidade/AP</label>
                                            <input
                                                type="text"
                                                placeholder="Nº Unidade"
                                                className="w-full bg-slate-50 border border-slate-100 p-5 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-[#10b981]/20 transition-all"
                                                value={formData.unit}
                                                onChange={e => setFormData({ ...formData, unit: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 4. Características Técnicas */}
                        <div className="bg-white rounded-[35px] border border-slate-100 overflow-hidden shadow-sm transition-all">
                            <button
                                type="button"
                                onClick={() => toggleSection('technical')}
                                className="w-full flex items-center justify-between p-8 hover:bg-slate-50 transition-all group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all ${openSections.includes('technical') ? 'bg-[#10b981] text-white' : 'bg-slate-100 text-slate-400'}`}>
                                        <Layers className="h-5 w-5" />
                                    </div>
                                    <h3 className="text-lg font-black tracking-tighter uppercase">4. Características Técnicas</h3>
                                </div>
                                {openSections.includes('technical') ? <ChevronDown className="h-5 w-5 text-slate-300" /> : <ChevronRight className="h-5 w-5 text-slate-300" />}
                            </button>

                            {openSections.includes('technical') && (
                                <div className="p-10 pt-0 space-y-8 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                                        <div className="space-y-2">
                                            <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest ml-2">Ano de Construção</label>
                                            <input
                                                type="text"
                                                placeholder="Ex: 2020"
                                                className="w-full bg-slate-50 border border-slate-100 p-5 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-[#10b981]/20 transition-all"
                                                value={formData.year_built}
                                                onChange={e => setFormData({ ...formData, year_built: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest ml-2">Região</label>
                                            <input
                                                type="text"
                                                placeholder="Ex: Zona Norte"
                                                className="w-full bg-slate-50 border border-slate-100 p-5 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-[#10b981]/20 transition-all"
                                                value={formData.region}
                                                onChange={e => setFormData({ ...formData, region: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest ml-2">Andar</label>
                                            <input
                                                type="text"
                                                placeholder="Ex: 5º"
                                                className="w-full bg-slate-50 border border-slate-100 p-5 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-[#10b981]/20 transition-all"
                                                value={formData.floor}
                                                onChange={e => setFormData({ ...formData, floor: e.target.value })}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 ml-2">
                                                <Bed className="h-3.5 w-3.5 text-slate-400" />
                                                <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest">Dormitórios</label>
                                            </div>
                                            <input
                                                type="number"
                                                min="0"
                                                className="w-full bg-slate-50 border border-slate-100 p-5 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-[#10b981]/20 transition-all"
                                                value={formData.rooms}
                                                onChange={e => setFormData({ ...formData, rooms: Number(e.target.value) })}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 ml-2">
                                                <BedDouble className="h-3.5 w-3.5 text-slate-400" />
                                                <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest">Suítes <span className="text-red-500">*</span></label>
                                            </div>
                                            <input
                                                type="number"
                                                min="0"
                                                required
                                                className="w-full bg-slate-50 border border-slate-100 p-5 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-[#10b981]/20 transition-all"
                                                value={formData.suites}
                                                onChange={e => setFormData({ ...formData, suites: Number(e.target.value) })}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 ml-2">
                                                <Bath className="h-3.5 w-3.5 text-slate-400" />
                                                <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest">Banheiros (Total)</label>
                                            </div>
                                            <input
                                                type="number"
                                                min="0"
                                                className="w-full bg-slate-50 border border-slate-100 p-5 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-[#10b981]/20 transition-all"
                                                value={formData.bathrooms}
                                                onChange={e => setFormData({ ...formData, bathrooms: Number(e.target.value) })}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 ml-2">
                                                <Car className="h-3.5 w-3.5 text-slate-400" />
                                                <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest">Vagas de Garagem</label>
                                            </div>
                                            <input
                                                type="number"
                                                min="0"
                                                className="w-full bg-slate-50 border border-slate-100 p-5 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-[#10b981]/20 transition-all"
                                                value={formData.parking_spaces}
                                                onChange={e => setFormData({ ...formData, parking_spaces: Number(e.target.value) })}
                                            />
                                        </div>

                                        {specs.map((spec) => {
                                            const IconComp = ICON_MAP[spec.icon] || Info;
                                            const isNumeric = ['rooms', 'bathrooms', 'parking_spaces', 'area', 'area_total', 'suites'].includes(spec.field);
                                            
                                            // Pula suítes e campos que movemos para a seção 1 para evitar duplicidade
                                            if (['suites', 'rooms', 'bathrooms', 'parking_spaces', 'area'].includes(spec.field)) return null;

                                            return (
                                                <div key={spec.id} className="space-y-4">
                                                    <div className="flex items-center justify-between px-2">
                                                        <div className="flex items-center gap-2">
                                                            <IconComp className="h-3.5 w-3.5 text-slate-400" />
                                                            <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest">{spec.label}</label>
                                                        </div>
                                                    </div>
                                                    <input
                                                        type={isNumeric ? "number" : "text"}
                                                        min={isNumeric ? "0" : undefined}
                                                        step={isNumeric ? "any" : undefined}
                                                        required
                                                        className="w-full bg-slate-50 border border-slate-100 p-5 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-[#10b981]/20 transition-all"
                                                        value={(formData[spec.field as keyof typeof formData] as string | number) || ''}
                                                        onChange={e => {
                                                            const val = isNumeric ? (e.target.value === '' ? '' : Number(e.target.value)) : e.target.value;
                                                            setFormData((prev: any) => ({ ...prev, [spec.field]: val }));
                                                        }}
                                                    />
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 5. Condições de Pagamento */}
                        <div className="bg-white rounded-[35px] border border-slate-100 overflow-hidden shadow-sm transition-all">
                            <button
                                type="button"
                                onClick={() => toggleSection('payment')}
                                className="w-full flex items-center justify-between p-8 hover:bg-slate-50 transition-all group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all ${openSections.includes('payment') ? 'bg-[#10b981] text-white' : 'bg-slate-100 text-slate-400'}`}>
                                        <CreditCard className="h-5 w-5" />
                                    </div>
                                    <h3 className="text-lg font-black tracking-tighter uppercase">5. Financiamento e Valores</h3>
                                </div>
                                {openSections.includes('payment') ? <ChevronDown className="h-5 w-5 text-slate-300" /> : <ChevronRight className="h-5 w-5 text-slate-300" />}
                            </button>

                            {openSections.includes('payment') && (
                                <div className="p-10 pt-0 space-y-8 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                                        <div className="space-y-2">
                                            <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest ml-2">Preço de Venda (R$)</label>
                                            <input
                                                type="text"
                                                className="w-full bg-slate-50 border border-slate-100 p-5 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-[#10b981]/20 transition-all"
                                                value={formData.price}
                                                onChange={e => setFormData({ ...formData, price: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest ml-2">Condomínio (R$)</label>
                                            <input
                                                type="text"
                                                className="w-full bg-slate-50 border border-slate-100 p-5 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-[#10b981]/20 transition-all"
                                                value={formData.condo_fee}
                                                onChange={e => setFormData({ ...formData, condo_fee: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest ml-2">IPTU (R$)</label>
                                            <input
                                                type="text"
                                                className="w-full bg-slate-50 border border-slate-100 p-5 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-[#10b981]/20 transition-all"
                                                value={formData.iptu}
                                                onChange={e => setFormData({ ...formData, iptu: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest ml-2">Entrada (R$)</label>
                                            <input
                                                type="text"
                                                className="w-full bg-slate-50 border border-slate-100 p-5 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-[#10b981]/20 transition-all"
                                                value={formData.down_payment}
                                                onChange={e => setFormData({ ...formData, down_payment: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest ml-2">Parcela Mensal</label>
                                            <input
                                                type="text"
                                                className="w-full bg-slate-50 border border-slate-100 p-5 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-[#10b981]/20 transition-all"
                                                value={formData.monthly_payment}
                                                onChange={e => setFormData({ ...formData, monthly_payment: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest ml-2">Balão/Chaves</label>
                                            <input
                                                type="text"
                                                className="w-full bg-slate-50 border border-slate-100 p-5 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-[#10b981]/20 transition-all"
                                                value={formData.keys_payment}
                                                onChange={e => setFormData({ ...formData, keys_payment: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest ml-2">Saldo Devedor</label>
                                            <input
                                                type="text"
                                                className="w-full bg-slate-50 border border-slate-100 p-5 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-[#10b981]/20 transition-all"
                                                value={formData.financing_balance}
                                                onChange={e => setFormData({ ...formData, financing_balance: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest ml-2">Índice Correção</label>
                                            <input
                                                type="text"
                                                placeholder="INCC / IGPM"
                                                className="w-full bg-slate-50 border border-slate-100 p-5 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-[#10b981]/20 transition-all"
                                                value={formData.adjustment_index}
                                                onChange={e => setFormData({ ...formData, adjustment_index: e.target.value })}
                                            />
                                        </div>

                                        <div className="lg:col-span-2 flex items-center gap-4">
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, accepts_financing: !formData.accepts_financing })}
                                                className={clsx(
                                                    "flex-1 flex items-center justify-between p-5 rounded-2xl font-bold text-sm transition-all",
                                                    formData.accepts_financing ? "bg-blue-500 text-white shadow-lg" : "bg-slate-50 text-slate-400"
                                                )}
                                            >
                                                <span className="uppercase tracking-widest text-[11px]">Financiamento</span>
                                                <span>{formData.accepts_financing ? 'SIM' : 'NÃO'}</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, accepts_exchange: !formData.accepts_exchange })}
                                                className={clsx(
                                                    "flex-1 flex items-center justify-between p-5 rounded-2xl font-bold text-sm transition-all",
                                                    formData.accepts_exchange ? "bg-purple-500 text-white shadow-lg" : "bg-slate-50 text-slate-400"
                                                )}
                                            >
                                                <span className="uppercase tracking-widest text-[11px]">Permuta</span>
                                                <span>{formData.accepts_exchange ? 'SIM' : 'NÃO'}</span>
                                            </button>
                                        </div>

                                        <div className="lg:col-span-2 flex items-center gap-4">
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, accepts_mcmv: !formData.accepts_mcmv })}
                                                className={clsx(
                                                    "flex-1 flex items-center justify-between p-5 rounded-2xl font-bold text-sm transition-all",
                                                    formData.accepts_mcmv ? "bg-emerald-500 text-white shadow-lg" : "bg-slate-50 text-slate-400"
                                                )}
                                            >
                                                <span className="uppercase tracking-widest text-[11px]">MCMV</span>
                                                <span>{formData.accepts_mcmv ? 'SIM' : 'NÃO'}</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, accepts_direct_financing: !formData.accepts_direct_financing })}
                                                className={clsx(
                                                    "flex-1 flex items-center justify-between p-5 rounded-2xl font-bold text-sm transition-all",
                                                    formData.accepts_direct_financing ? "bg-orange-500 text-white shadow-lg" : "bg-slate-50 text-slate-400"
                                                )}
                                            >
                                                <span className="uppercase tracking-widest text-[11px]">Direto Const.</span>
                                                <span>{formData.accepts_direct_financing ? 'SIM' : 'NÃO'}</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 6. Comodidades e Diferenciais */}
                        <div className="bg-white rounded-[35px] border border-slate-100 overflow-hidden shadow-sm transition-all">
                            <button
                                type="button"
                                onClick={() => toggleSection('features')}
                                className="w-full flex items-center justify-between p-8 hover:bg-slate-50 transition-all group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all ${openSections.includes('features') ? 'bg-[#10b981] text-white' : 'bg-slate-100 text-slate-400'}`}>
                                        <Zap className="h-5 w-5" />
                                    </div>
                                    <h3 className="text-lg font-black tracking-tighter uppercase">6. Comodidades e Diferenciais</h3>
                                </div>
                                {openSections.includes('features') ? <ChevronDown className="h-5 w-5 text-slate-300" /> : <ChevronRight className="h-5 w-5 text-slate-300" />}
                            </button>

                            {openSections.includes('features') && (
                                <div className="p-10 pt-0 space-y-8 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <div className="space-y-10">
                                        {allFeatures.map((cat) => (
                                            <div key={cat.category} className="space-y-4">
                                                <h4 className="text-[12px] font-black text-slate-400 uppercase tracking-widest ml-2 border-l-2 border-[#10b981] pl-3">{cat.category}</h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                                    {cat.items.map((feature: string) => (
                                                        <button
                                                            key={feature}
                                                            type="button"
                                                            onClick={() => {
                                                                const newFeatures = (formData.features as string[]).includes(feature)
                                                                    ? (formData.features as string[]).filter(f => f !== feature)
                                                                    : [...(formData.features as string[]), feature];
                                                                setFormData({ ...formData, features: newFeatures });
                                                            }}
                                                            className={clsx(
                                                                "flex items-center justify-between p-5 rounded-2xl border transition-all font-bold text-[12px] uppercase tracking-widest text-left",
                                                                (formData.features as string[]).includes(feature)
                                                                    ? "bg-[#10b981] border-[#10b981] text-white shadow-lg"
                                                                    : "bg-slate-50 border-slate-100 text-slate-400 hover:bg-slate-100"
                                                            )}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className={clsx(
                                                                    "h-6 w-6 rounded-lg flex items-center justify-center transition-all",
                                                                    (formData.features as string[]).includes(feature) ? "bg-white/20 text-white" : "bg-white text-slate-300"
                                                                )}>
                                                                    {(() => {
                                                                        const Icon = getFeatureIcon(feature);
                                                                        return <Icon className="h-3.5 w-3.5" />;
                                                                    })()}
                                                                </div>
                                                                <span className="leading-tight">{feature}</span>
                                                            </div>
                                                            {(formData.features as string[]).includes(feature) && <CheckCircle2 className="h-4 w-4 shrink-0 ml-2" />}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 7. Controle Interno (CRM) */}
                        <div className="bg-[#1B263B] rounded-[35px] border border-white/5 overflow-hidden shadow-2xl transition-all">
                            <button
                                type="button"
                                onClick={() => toggleSection('crm')}
                                className="w-full flex items-center justify-between p-8 hover:bg-white/5 transition-all group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all ${openSections.includes('crm') ? 'bg-[#10b981] text-white' : 'bg-white/10 text-white/40'}`}>
                                        <ShieldCheck className="h-5 w-5" />
                                    </div>
                                    <h3 className="text-lg font-black tracking-tighter uppercase text-white">7. Controle Interno / CRM</h3>
                                </div>
                                {openSections.includes('crm') ? <ChevronDown className="h-5 w-5 text-white/20" /> : <ChevronRight className="h-5 w-5 text-white/20" />}
                            </button>

                            {openSections.includes('crm') && (
                                <div className="p-10 pt-0 space-y-8 animate-in fade-in slide-in-from-top-2 duration-300 text-white">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                                        <div className="space-y-2">
                                            <label className="text-[12px] font-black text-white/40 uppercase tracking-widest ml-2">Origem da Captação</label>
                                            <select
                                                className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-[#10b981]/40 transition-all appearance-none"
                                                value={formData.marketing_source}
                                                onChange={e => setFormData({ ...formData, marketing_source: e.target.value })}
                                            >
                                                <option value="" className="bg-[#1B263B]">Selecione a Origem</option>
                                                <option value="site" className="bg-[#1B263B]">Site</option>
                                                <option value="instagram" className="bg-[#1B263B]">Instagram</option>
                                                <option value="placa" className="bg-[#1B263B]">Placa no Local</option>
                                                <option value="indicacao" className="bg-[#1B263B]">Indicação</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[12px] font-black text-white/40 uppercase tracking-widest ml-2">Transferir para Corretor</label>
                                            <select
                                                className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-[#10b981]/40 transition-all appearance-none text-white"
                                                value={formData.corretor_id}
                                                onChange={e => setFormData({ ...formData, corretor_id: e.target.value })}
                                            >
                                                <option value="" className="bg-[#1B263B]">Selecione um Corretor</option>
                                                {brokers.map(b => (
                                                    <option key={b.id} value={b.id} className="bg-[#1B263B]">{b.full_name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[12px] font-black text-white/40 uppercase tracking-widest ml-2">Captador</label>
                                            <input
                                                type="text"
                                                placeholder="Nome do corretor"
                                                className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-[#10b981]/40 transition-all"
                                                value={formData.capturer}
                                                onChange={e => setFormData({ ...formData, capturer: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[12px] font-black text-white/40 uppercase tracking-widest ml-2">Local das Chaves</label>
                                            <input
                                                type="text"
                                                placeholder="Ex: No escritório"
                                                className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-[#10b981]/40 transition-all"
                                                value={formData.keys_location}
                                                onChange={e => setFormData({ ...formData, keys_location: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2 lg:col-span-4">
                                            <label className="text-[12px] font-black text-white/40 uppercase tracking-widest ml-2">Observações Internas (Privado)</label>
                                            <textarea
                                                rows={3}
                                                className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-[#10b981]/40 transition-all resize-none"
                                                value={formData.observations}
                                                onChange={e => setFormData({ ...formData, observations: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 8. Dados do Proprietário */}
                        <div className="bg-white rounded-[35px] border border-slate-100 overflow-hidden shadow-sm transition-all">
                            <button
                                type="button"
                                onClick={() => toggleSection('owner')}
                                className="w-full flex items-center justify-between p-8 hover:bg-slate-50 transition-all group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all ${openSections.includes('owner') ? 'bg-[#10b981] text-white' : 'bg-slate-100 text-slate-400'}`}>
                                        <Users className="h-5 w-5" />
                                    </div>
                                    <h3 className="text-lg font-black tracking-tighter uppercase">8. Dados do Proprietário</h3>
                                </div>
                                {openSections.includes('owner') ? <ChevronDown className="h-5 w-5 text-slate-300" /> : <ChevronRight className="h-5 w-5 text-slate-300" />}
                            </button>

                            {openSections.includes('owner') && (
                                <div className="p-10 pt-0 space-y-8 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                                        <div className="space-y-2 lg:col-span-2">
                                            <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest ml-2">Nome do Dono</label>
                                            <input
                                                type="text"
                                                className="w-full bg-slate-50 border border-slate-100 p-5 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-[#10b981]/20 transition-all"
                                                value={formData.owner_name}
                                                onChange={e => setFormData({ ...formData, owner_name: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2 lg:col-span-2">
                                            <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest ml-2">Contato</label>
                                            <input
                                                type="text"
                                                className="w-full bg-slate-50 border border-slate-100 p-5 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-[#10b981]/20 transition-all"
                                                value={formData.owner_contact}
                                                onChange={e => setFormData({ ...formData, owner_contact: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Botões de Ação */}
                        <div className="flex items-center justify-end gap-6 pt-10 pb-20">
                            <Link href="/admin">
                                <button type="button" className="px-10 py-5 rounded-2xl text-[12px] font-black uppercase tracking-[0.2em] text-slate-400 hover:bg-white transition-all">Descartar</button>
                            </Link>
                            <button
                                disabled={isLoading}
                                type="submit"
                                className="bg-[#1B263B] text-white px-12 py-5 rounded-2xl text-[12px] font-black uppercase tracking-[0.2em] shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-4 disabled:opacity-50"
                            >
                                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4 text-[#10b981]" />}
                                {isLoading ? 'SALVANDO...' : 'SALVAR ALTERAÇÕES'}
                            </button>
                        </div>
                    </form>
                </div>
            </main>

            {/* AI Magic Modal */}
            {isAIModalOpen && (
                <div className="fixed inset-0 bg-[#1B263B]/80 backdrop-blur-md z-[150] flex items-center justify-center p-6 animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-2xl rounded-[40px] overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-500">
                        <div className="p-10 space-y-8">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-[#10b981] flex items-center justify-center shadow-lg shadow-[#10b981]/20">
                                    <Zap className="h-6 w-6 text-white fill-white" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-[#1B263B] tracking-tighter uppercase">Inteligência KF IMOVEIS</h3>
                                    <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">Extração automática de dados via texto</p>
                                </div>
                                <button
                                    onClick={() => setIsAIModalOpen(false)}
                                    className="ml-auto h-10 w-10 rounded-xl hover:bg-slate-50 flex items-center justify-center text-slate-400 transition-colors"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest ml-2">Cole aqui o texto do anúncio ou descrição</label>
                                <textarea
                                    value={aiInput}
                                    onChange={(e) => setAiInput(e.target.value)}
                                    placeholder="Ex: Apartamento na Guilhermina com 2 dormitórios, sendo 1 suíte, 1 vaga, 65m2. Valor: R$ 450.000, Condomínio R$ 500."
                                    rows={10}
                                    className="w-full bg-slate-50 border border-slate-100 p-6 rounded-3xl font-bold text-sm outline-none focus:ring-2 focus:ring-[#10b981]/20 transition-all resize-none"
                                />
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => setIsAIModalOpen(false)}
                                    className="flex-1 py-5 rounded-2xl text-[12px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleAIFill}
                                    className="flex-[2] bg-[#1B263B] text-white py-5 rounded-2xl text-[12px] font-black uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
                                >
                                    <Zap className="h-4 w-4 fill-[#10b981] text-[#10b981]" />
                                    Processar com IA
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {toast && (
                <Toast 
                    message={toast.message} 
                    type={toast.type} 
                    onClose={() => setToast(null)} 
                />
            )}
        </div>
    );
}
