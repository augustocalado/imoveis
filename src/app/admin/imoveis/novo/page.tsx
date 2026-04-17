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
import { useRouter } from 'next/navigation';
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


export default function NovoImovel() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isAIModalOpen, setIsAIModalOpen] = useState(false);
    const [aiInput, setAiInput] = useState('');
    const [isTitleFocused, setIsTitleFocused] = useState(false);
    const [isDescriptionFocused, setIsDescriptionFocused] = useState(false);

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
        setFormData(prev => ({ ...prev, ...extracted }));
        setIsAIModalOpen(false);
        setAiInput('');
        setMessage({ type: 'success', text: 'Dados extraídos com Inteligência KF IMOVEIS!' });
        setTimeout(() => setMessage(null), 3000);
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
        category: ''
    });

    const [allFeatures, setAllFeatures] = useState<any[]>([]);
    const [specs, setSpecs] = useState<any[]>([]);
    const [toast, setToast] = useState<{ message: string, type: ToastType } | null>(null);
    const [draftId, setDraftId] = useState<string | null>(null);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [isSavingDraft, setIsSavingDraft] = useState(false);
    const [showResumeModal, setShowResumeModal] = useState(false);
    const [pendingDraft, setPendingDraft] = useState<any>(null);


    const showToast = (message: string, type: ToastType = 'success') => {
        setToast({ message, type });
    };

    const [openSections, setOpenSections] = useState<string[]>(['basic']);

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
    useEffect(() => {
        const getInitialData = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                setUserId(session.user.id);
            } else {
                router.push('/login');
                return;
            }

            // Busca as características do banco de dados
            const { data: featuresData } = await supabase
                .from('property_features')
                .select('*')
                .order('category', { ascending: true })
                .order('name', { ascending: true });
            
            if (featuresData) {
                // Agrupa por categoria para manter a interface atual
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

            // Verifica rascunhos pendentes
            if (userId) {
                const { data: draftData } = await supabase
                    .from('properties')
                    .select('*')
                    .eq('corretor_id', userId)
                    .eq('status', 'draft')
                    .order('updated_at', { ascending: false })
                    .limit(1)
                    .maybeSingle();

                if (draftData) {
                    setPendingDraft(draftData);
                    setShowResumeModal(true);
                }
            }

            // Busca o último Código de Referência para sugerir o próximo
            const { data: latestRefs } = await supabase
                .from('properties')
                .select('reference_id')
                .ilike('reference_id', 'KF%')
                .not('reference_id', 'is', null);

            if (latestRefs && latestRefs.length > 0) {
                const numbers = latestRefs
                    .map(r => {
                        const match = r.reference_id.match(/KF(\d+)/i);
                        return match ? parseInt(match[1]) : 0;
                    })
                    .filter(n => !isNaN(n));
                
                if (numbers.length > 0) {
                    const maxNum = Math.max(...numbers);
                    const nextNum = maxNum + 1;
                    const nextRef = `KF${nextNum.toString().padStart(3, '0')}`;
                    setFormData(prev => ({ ...prev, reference_id: nextRef }));
                } else {
                    setFormData(prev => ({ ...prev, reference_id: 'KF001' }));
                }
            } else {
                setFormData(prev => ({ ...prev, reference_id: 'KF001' }));
            }
        };
        getInitialData();
    }, [router, userId]);

    // Função de Salvamento Automático (Debounced)
    useEffect(() => {
        if (!userId || isLoading) return;

        // Não salva rascunho se não houver pelo menos um título ou referência básica para identificação inicial
        // Mas o usuário pediu "ao iniciar", então vamos permitir salvar mesmo que esteja vazio, pois ele vai preenchendo
        
        const saveDraftTimer = setTimeout(async () => {
            setIsSavingDraft(true);
            try {
                const draftData: any = {
                    ...formData,
                    corretor_id: userId,
                    status: 'draft',
                    price: parseCurrency(formData.price),
                    condo_fee: parseCurrency(formData.condo_fee) || 0,
                    iptu: parseCurrency(formData.iptu) || 0,
                    down_payment: parseCurrency(formData.down_payment) || 0,
                    monthly_payment: parseCurrency(formData.monthly_payment) || 0,
                    keys_payment: parseCurrency(formData.keys_payment) || 0,
                    financing_balance: parseCurrency(formData.financing_balance) || 0,
                    area: parseCurrency(formData.area),
                    area_total: parseCurrency(formData.area_total)
                };

                if (draftId) {
                    draftData.id = draftId;
                }

                const { data, error } = await supabase
                    .from('properties')
                    .upsert(draftData)
                    .select('id')
                    .single();

                if (error) throw error;
                if (data) {
                    setDraftId(data.id);
                    setLastSaved(new Date());
                }
            } catch (err) {
                console.error('Erro ao salvar rascunho:', err);
            } finally {
                setIsSavingDraft(false);
            }
        }, 3000); // 3 segundos de debounce

        return () => clearTimeout(saveDraftTimer);
    }, [formData, userId, draftId, isLoading]);

    const handleResumeDraft = () => {
        if (pendingDraft) {
            setFormData({
                ...formData,
                ...pendingDraft,
                price: pendingDraft.price?.toLocaleString('pt-BR') || '',
                condo_fee: pendingDraft.condo_fee?.toLocaleString('pt-BR') || '',
                iptu: pendingDraft.iptu?.toLocaleString('pt-BR') || '',
                down_payment: pendingDraft.down_payment?.toLocaleString('pt-BR') || '',
                monthly_payment: pendingDraft.monthly_payment?.toLocaleString('pt-BR') || '',
                keys_payment: pendingDraft.keys_payment?.toLocaleString('pt-BR') || '',
                financing_balance: pendingDraft.financing_balance?.toLocaleString('pt-BR') || '',
            } as any);
            setDraftId(pendingDraft.id);
            showToast('Rascunho recuperado com sucesso!');
        }
        setShowResumeModal(false);
    };

    const handleDiscardDraft = async () => {
        if (pendingDraft) {
            await supabase.from('properties').delete().eq('id', pendingDraft.id);
        }
        setShowResumeModal(false);
        setPendingDraft(null);
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);
        if (!userId) {
            setMessage({ type: 'error', text: 'Você precisa estar logado para cadastrar um imóvel.' });
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
                    .maybeSingle();
                
                if (checkError) throw checkError;

                if (existing) {
                    finalSlug = `${slugBase}-${counter}`;
                    counter++;
                } else {
                    isUnique = true;
                }
            }

            setMessage(null);

            // Se já temos um draftId, usamos ele para o salvamento final em vez de criar um novo
            const finalData: any = {
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
                reference_id: formData.reference_id,
                slug: finalSlug,
                corretor_id: userId,
                status: 'disponivel' // Agora torna oficial
            };

            let finalId = draftId;
            if (draftId) {
                const { error } = await supabase
                    .from('properties')
                    .update(finalData)
                    .eq('id', draftId);
                if (error) throw error;
            } else {
                const { data, error } = await supabase
                    .from('properties')
                    .insert([finalData])
                    .select('id')
                    .single();
                if (error) throw error;
                if (data) finalId = data.id;
            }

            // Notifica
            showToast('Imóvel cadastrado com sucesso!');
            
            // Redireciona para a listagem geral de imóveis conforme solicitado
            setTimeout(() => router.push('/admin?tab=imoveis'), 1500);
        } catch (err: any) {
            console.error('Erro no Catch:', err);
            setMessage({ type: 'error', text: `Erro ao cadastrar: ${err.message}` });
        } finally {
            setIsLoading(false);
        }
    };

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
                    <Link href="/" className="flex items-center gap-3 mb-10 group" onClick={() => setIsSidebarOpen(false)}>
                        <div className="h-10 w-10 bg-[#10b981] rounded-xl flex items-center justify-center shadow-lg shadow-[#10b981]/20 group-hover:rotate-12 transition-transform">
                            <Building2 className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-lg font-black tracking-tight leading-none uppercase">K. & <span className="text-[#10b981]">F. Imóveis</span></span>
                            <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.4em]">SaaS Solution</span>
                        </div>
                    </Link>

                    <nav className="space-y-1">
                        <p className="text-[11px] font-black text-white/20 uppercase tracking-[0.2em] mb-4 ml-4">Navegação Principal</p>

                        <Link href="/admin">
                            <button className="w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-300 group hover:bg-white/5 text-white/40 hover:text-white/80">
                                <LayoutDashboard className="h-5 w-5 text-white/20 group-hover:text-white/40" />
                                <span className="text-sm font-bold">Visão Geral</span>
                            </button>
                        </Link>

                        <button className="w-full flex items-center gap-4 p-4 rounded-xl bg-white/10 text-white shadow-inner relative overflow-hidden">
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 bg-[#10b981] rounded-r-full" />
                            <Building2 className="h-5 w-5 text-[#10b981]" />
                            <span className="text-sm font-bold tracking-wide">Novo Imóvel</span>
                        </button>

                        <Link href="/admin?tab=crm">
                            <button className="w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-300 group hover:bg-white/5 text-white/40 hover:text-white/80">
                                <Users className="h-5 w-5 text-white/20 group-hover:text-white/40" />
                                <span className="text-sm font-bold">CRM de Clientes</span>
                            </button>
                        </Link>

                        <Link href="/admin/caracteristicas">
                            <button className="w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-300 group hover:bg-white/5 text-white/40 hover:text-white/80">
                                <Zap className="h-5 w-5 text-white/20 group-hover:text-white/40" />
                                <span className="text-sm font-bold">Características</span>
                            </button>
                        </Link>


                        <Link href="/admin?tab=financeiro">
                            <button className="w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-300 group hover:bg-white/5 text-white/40 hover:text-white/80">
                                <DollarSign className="h-5 w-5 text-white/20 group-hover:text-white/40" />
                                <span className="text-sm font-bold">Financeiro</span>
                            </button>
                        </Link>

                        <Link href="/admin?tab=agenda">
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
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-h-[calc(100vh-80px)] lg:min-h-screen">
                <header className="h-auto py-6 lg:h-24 bg-white border-b border-slate-100 flex items-center justify-between px-6 lg:px-12 sticky top-0 lg:top-0 z-40">
                    <div className="flex items-center gap-4">
                        <Link href="/admin" className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-[#1B263B] hover:bg-slate-100 transition-all group">
                            <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                        </Link>
                        <h1 className="text-xl font-black tracking-tighter uppercase">Novo Imóvel</h1>
                    </div>

                    <div className="flex items-center gap-6">
                        {/* Indicador de Salvamento Automático */}
                        <div className="hidden lg:flex items-center gap-3 px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl transition-all">
                            {isSavingDraft ? (
                                <Loader2 className="h-4 w-4 text-[#10b981] animate-spin" />
                            ) : (
                                <CheckCircle2 className="h-4 w-4 text-slate-300" />
                            )}
                            <div className="flex flex-col">
                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 leading-tight">Salvamento Automático</span>
                                <span className="text-[10px] font-bold text-slate-500 lowercase leading-tight">
                                    {isSavingDraft ? 'Processando...' : lastSaved ? `Salvo às ${lastSaved.toLocaleTimeString()}` : 'Aguardando inserção...'}
                                </span>
                            </div>
                        </div>

                        <div className="hidden xl:block flex-1 max-w-md mx-4">
                            <AdminSearchBar />
                        </div>

                        <div className="flex items-center gap-4">
                            <button
                                type="button"
                                onClick={() => setIsAIModalOpen(true)}
                                className="flex items-center gap-3 bg-[#1B263B] text-white px-6 py-3 rounded-2xl text-[12px] font-black uppercase tracking-widest hover:bg-[#10b981] transition-all shadow-xl shadow-[#10b981]/10 group"
                            >
                                <Zap className="h-4 w-4 fill-[#10b981] text-[#10b981] group-hover:fill-white group-hover:text-white transition-colors" />
                                Importar com IA
                            </button>
                        </div>
                    </div>
                </header>

                <div className="p-12 max-w-5xl mx-auto w-full">
                    {message && (
                        <div className={clsx(
                            "mb-8 p-6 rounded-[30px] border flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-500",
                            message.type === 'success' ? "bg-emerald-50 border-emerald-100 text-emerald-800" : "bg-red-50 border-red-100 text-red-800"
                        )}>
                            {message.type === 'success' ? <CheckCircle2 className="h-6 w-6" /> : <XCircle className="h-6 w-6" />}
                            <p className="font-bold text-sm uppercase tracking-widest">{message.text}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        {/* 1. Dados Básicos */}
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
                                                                    "h-6 w-6 rounded-lg flex items-center justify-center transition-colors",
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
                            <Link href="/admin/imoveis">
                                <button type="button" className="px-10 py-5 rounded-2xl text-[12px] font-black uppercase tracking-[0.2em] text-slate-400 hover:bg-white transition-all">Descartar</button>
                            </Link>
                            <button
                                disabled={isLoading}
                                type="submit"
                                className="bg-[#1B263B] text-white px-12 py-5 rounded-2xl text-[12px] font-black uppercase tracking-[0.2em] shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-4 disabled:opacity-50"
                            >
                                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4 text-[#10b981]" />}
                                {isLoading ? 'SALVANDO...' : 'CADASTRAR IMÓVEL'}
                            </button>
                        </div>
                    </form>
                </div>
            </main >

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

            {/* Resume Draft Modal */}
            {showResumeModal && (
                <div className="fixed inset-0 bg-[#1B263B]/80 backdrop-blur-md z-[200] flex items-center justify-center p-6 animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-lg rounded-[40px] overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-500">
                        <div className="p-10 space-y-8 text-center">
                            <div className="h-20 w-20 rounded-3xl bg-[#10b981]/10 flex items-center justify-center mx-auto mb-6">
                                <Zap className="h-10 w-10 text-[#10b981] fill-[#10b981]" />
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-2xl font-black text-[#1B263B] tracking-tighter uppercase leading-tight">Continuar de onde parou?</h3>
                                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                                    Detectamos um cadastro que não foi finalizado. <br />
                                    Deseja recuperar os dados e continuar?
                                </p>
                            </div>

                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={handleResumeDraft}
                                    className="w-full bg-[#1B263B] text-white py-5 rounded-2xl text-[12px] font-black uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
                                >
                                    <CheckCircle2 className="h-4 w-4 text-[#10b981]" />
                                    Sim, Restaurar Rascunho
                                </button>
                                <button
                                    onClick={handleDiscardDraft}
                                    className="w-full py-5 rounded-2xl text-[12px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 transition-all"
                                >
                                    Não, descartar e começar novo
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div >
    );
}

