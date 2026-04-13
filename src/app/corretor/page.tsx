'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase, STORAGE_BUCKET } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import { 
    LayoutDashboard, Building2, Users as UsersIcon, Bell,
    Plus, Pencil, Trash2, MapPin, DollarSign, Loader2,
    LogOut, Home, Search, MessageSquare, ChevronRight,
    TrendingUp, User, ArrowUpRight, Filter, List, Calendar,
    FileText, Handshake, Mail, CheckCircle2, XCircle, Info, Menu, X, Upload, Sparkles, Copy, Instagram,
    Facebook, Bed, Bath, Maximize2, Download
} from 'lucide-react';
import Link from 'next/link';
import clsx from 'clsx';
import { useRouter } from 'next/navigation';
import { toPng } from 'html-to-image';
import VisitsManagement from '@/components/admin/VisitsManagement';
import TermoVisitaModal from '@/components/admin/TermoVisitaModal';

type Tab = 'overview' | 'my-properties' | 'my-leads' | 'social-ai' | 'settings' | 'appointments';

export default function CorretorDashboard() {
    const router = useRouter();
    const [currentTab, setCurrentTab] = useState<Tab>('overview');
    const [properties, setProperties] = useState<any[]>([]);
    const [leads, setLeads] = useState<any[]>([]);
    const [chatLeads, setChatLeads] = useState<any[]>([]);
    const [visits, setVisits] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentUserProfile, setCurrentUserProfile] = useState<any>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [editName, setEditName] = useState('');
    const [editCreci, setEditCreci] = useState('');
    const [editBio, setEditBio] = useState('');
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    const [isTermoModalOpen, setIsTermoModalOpen] = useState(false);
    const [selectedLeadForTermo, setSelectedLeadForTermo] = useState<any>(null);
    const [siteContact, setSiteContact] = useState<any>({
        phone: '(13) 3474-0000',
        email: 'vendas@kfimoveis.com.br',
        address: 'Canto do Forte, PG - SP',
        cnpj: ''
    });
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setIsLoading(true);
                const { data: { user } } = await supabase.auth.getUser();

                if (!user) {
                    router.push('/login');
                    return;
                }

                // Fetch Profile
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();
                
                if (profile) {
                    setCurrentUserProfile(profile);
                    setEditName(profile.full_name || '');
                    setEditCreci(profile.creci || '');
                    setEditBio(profile.bio || '');

                    // Sync metadata if approved
                    if (profile.is_approved && user.user_metadata?.is_approved !== true) {
                        await supabase.auth.updateUser({
                            data: { is_approved: true }
                        });
                    }
                }

                // Fetch properties (All for this corretor)
                const { data: props } = await supabase
                    .from('properties')
                    .select('*')
                    .eq('corretor_id', user.id)
                    .order('created_at', { ascending: false });

                setProperties(props || []);

                // Fetch leads
                const { data: lds } = await supabase
                    .from('leads')
                    .select('*, properties!inner(title, reference_id)')
                    .eq('properties.corretor_id', user.id)
                    .order('created_at', { ascending: false });

                setLeads(lds || []);

                // Fetch chat_leads
                const { data: clds } = await supabase
                    .from('chat_leads')
                    .select('*')
                    .order('created_at', { ascending: false });
                
                setChatLeads(clds || []);

                // Fetch visits
                const { data: vsts } = await supabase
                    .from('visits')
                    .select('*')
                    .eq('corretor_id', user.id)
                    .order('visit_date', { ascending: true });
                
                setVisits(vsts || []);

                const { data: contactData } = await supabase
                    .from('site_settings')
                    .select('value')
                    .eq('key', 'site_contact')
                    .single();
                if (contactData) setSiteContact((prev: any) => ({ ...prev, ...contactData.value }));
            } catch (err) {
                console.error('Erro no dashboard do corretor:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, [router]);

    const filteredProperties = properties.filter(p => 
        !searchTerm || 
        p.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.reference_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.neighborhood?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    };

    const handleUpdateProfile = async () => {
        if (!currentUserProfile) return;
        setIsSavingProfile(true);
        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    full_name: editName,
                    creci: editCreci,
                    bio: editBio
                })
                .eq('id', currentUserProfile.id);

            if (error) throw error;

            // Refresh local state
            setCurrentUserProfile({ ...currentUserProfile, full_name: editName, creci: editCreci, bio: editBio });
            alert('Perfil atualizado com sucesso!');
        } catch (err: any) {
            console.error('Erro ao atualizar perfil:', err);
            alert('Erro ao salvar: ' + err.message);
        } finally {
            setIsSavingProfile(false);
        }
    };

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !currentUserProfile) return;

        setIsUploadingAvatar(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${currentUserProfile.id}-${Math.random()}.${fileExt}`;
            const filePath = `avatars/${fileName}`;

            // We use the existing 'properties' bucket for simplicity, organized in an 'avatars' folder
            const { error: uploadError } = await supabase.storage
                .from(STORAGE_BUCKET)
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage
                .from(STORAGE_BUCKET)
                .getPublicUrl(filePath);

            const { error: updateError } = await supabase
                .from('profiles')
                .update({ avatar_url: data.publicUrl })
                .eq('id', currentUserProfile.id);

            if (updateError) throw updateError;

            setCurrentUserProfile({ ...currentUserProfile, avatar_url: data.publicUrl });
            alert('Foto de perfil atualizada!');
        } catch (err: any) {
            console.error(`Erro no upload de avatar [${STORAGE_BUCKET}]:`, err);
            alert(`Erro ao carregar imagem no bucket ${STORAGE_BUCKET}: ` + err.message + '. Certifique-se de que o bucket existe e é público.');
        } finally {
            setIsUploadingAvatar(false);
        }
    };

    const menuItems = [
        { id: 'overview', label: 'Visão Geral', icon: LayoutDashboard },
        { id: 'my-properties', label: 'Meus Imóveis', icon: Building2 },
        { id: 'my-leads', label: 'Meus Leads', icon: UsersIcon },
        { id: 'appointments', label: 'Agendamentos', icon: Calendar },
        { id: 'social-ai', label: 'Social IA', icon: Sparkles },
        { id: 'settings', label: 'Meu Perfil', icon: User },
    ];

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-12 w-12 text-[#1B263B] animate-spin" />
                    <p className="text-[12px] font-black uppercase tracking-[0.3em] text-[#1B263B]/40">Carregando Seu Painel</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f4f7fa] flex flex-col lg:flex-row text-[#1B263B] relative">
            <Navbar /> {/* Mantido por segurança, mas o foco é no dashboard lateral */}

            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[55] lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar Superior Mobile */}
            <header className="lg:hidden h-20 bg-[#1B263B] text-white flex items-center justify-between px-6 sticky top-0 z-[60] shadow-xl">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-[#10b981] rounded-lg flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-sm font-black tracking-tighter uppercase">Painel Corretor</span>
                </div>
                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="p-3 bg-white/5 rounded-xl border border-white/10"
                >
                    {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
            </header>

            {/* Premium Sidebar */}
            <aside className={clsx(
                "w-72 bg-[#1B263B] text-white fixed lg:sticky top-0 h-screen z-[70] flex flex-col shadow-2xl transition-transform duration-500",
                isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
            )}>
                <div className="p-8 pb-12 flex-1 overflow-y-auto custom-scrollbar">
                    {/* Premium Profile Header - Solicitado pelo Usuário */}
                    <div className="mb-10 p-6 rounded-[32px] bg-gradient-to-br from-white/10 to-transparent border border-white/5 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-[#10b981]/10 blur-[40px] group-hover:bg-[#10b981]/20 transition-all duration-700" />
                        <div className="relative z-10 flex flex-col items-center text-center">
                            <div className="h-20 w-20 rounded-[24px] bg-[#10b981] mb-4 flex items-center justify-center text-3xl font-black shadow-2xl shadow-[#10b981]/30 border-2 border-white/20 overflow-hidden">
                                {currentUserProfile?.avatar_url ? (
                                    <img src={currentUserProfile.avatar_url} className="w-full h-full object-cover" alt="" />
                                ) : (
                                    currentUserProfile?.full_name?.charAt(0) || 'C'
                                )}
                            </div>
                            <h4 className="text-sm font-black uppercase tracking-widest text-white leading-none mb-1 line-clamp-1">{currentUserProfile?.full_name || 'Corretor'}</h4>
                            <span className="text-[10px] font-black text-[#10b981] uppercase tracking-[0.3em] bg-[#10b981]/10 px-3 py-1 rounded-full">Corretor Expert</span>
                        </div>
                    </div>

                    <nav className="space-y-1">
                        <p className="text-[11px] font-black text-white/20 uppercase tracking-[0.2em] mb-4 ml-4">Comandos</p>
                        {menuItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => {
                                    setCurrentTab(item.id as Tab);
                                    setIsSidebarOpen(false);
                                }}
                                className={clsx(
                                    "w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-300 group relative overflow-hidden",
                                    currentTab === item.id
                                        ? "bg-white/10 text-white shadow-inner"
                                        : "hover:bg-white/5 text-white/40 hover:text-white/80"
                                )}
                            >
                                {currentTab === item.id && <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 bg-[#10b981] rounded-r-full" />}
                                <item.icon className={clsx("h-5 w-5 transition-transform group-hover:scale-110", currentTab === item.id ? "text-[#10b981]" : "text-white/20")} />
                                <span className={clsx("text-sm font-bold transition-all", currentTab === item.id ? "tracking-wide" : "tracking-tight")}>{item.label}</span>
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="mt-auto p-8 space-y-4 bg-black/20">
                    <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-4 p-5 rounded-2xl text-white/40 hover:text-white hover:bg-red-500/80 transition-all group shadow-lg overflow-hidden relative"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <LogOut className="h-5 w-5 text-white/10 group-hover:text-white relative z-10" />
                        <span className="text-xs font-black uppercase tracking-[0.3em] relative z-10">Sair do Painel</span>
                    </button>
                    <div className="text-[9px] font-black text-white/10 uppercase tracking-[0.5em] text-center">Broker Mode • KF Imóveis</div>
                </div>
            </aside>

            {/* Content Area */}
            <main className="flex-1 flex flex-col">
                {/* Desktop Header Profile */}
                <header className="hidden lg:flex h-24 bg-white border-b border-slate-100 items-center justify-between px-12 sticky top-0 z-40">
                    <div className="flex-1">
                        <h2 className="text-xl font-black uppercase tracking-tighter">Comando Central</h2>
                    </div>

                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-4 cursor-pointer group p-2 hover:bg-slate-50 rounded-2xl transition-all">
                            <div className="flex flex-col text-right">
                                <span className="text-sm font-black uppercase tracking-tight text-[#1B263B] group-hover:text-[#10b981] transition-colors">{currentUserProfile?.full_name || 'Usuário'}</span>
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-2">Broker Master</span>
                            </div>
                            <div className="h-12 w-12 rounded-2xl bg-[#1B263B] text-white flex items-center justify-center font-black group-hover:scale-110 group-hover:bg-[#10b981] transition-all shadow-xl shadow-[#1B263B]/10 overflow-hidden">
                                {currentUserProfile?.avatar_url ? (
                                    <img src={currentUserProfile.avatar_url} className="w-full h-full object-cover" alt="" />
                                ) : (
                                    currentUserProfile?.full_name?.charAt(0) || 'C'
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                <div className="p-8 lg:p-12 space-y-12 animate-in fade-in duration-700">
                    {currentTab === 'overview' && (
                        <div className="space-y-12 animate-in fade-in duration-700">
                            {/* Welcome Section */}
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                                <div>
                                    <p className="text-[#10b981] font-black text-[11px] uppercase tracking-[0.5em] mb-2 px-1">Seja bem-vindo de volta</p>
                                    <h1 className="text-5xl font-black text-[#1B263B] tracking-tighter leading-none uppercase">Seu Painel <span className="text-[#10b981] italic font-serif lowercase">Exclusive</span></h1>
                                </div>
                            </div>

                            {/* Stats Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                                {[
                                    { label: 'Meus Imóveis', val: properties.length, icon: Building2, color: 'emerald', tab: 'my-properties' },
                                    { label: 'Leads Ativos', val: leads.length, icon: UsersIcon, color: 'blue', tab: 'my-leads' },
                                    { label: 'Próximas Visitas', val: visits.filter(v => v.status === 'agendado').length, icon: Calendar, color: 'indigo', tab: 'appointments' },
                                    { label: 'Novos Contatos', val: leads.filter(l => l.status === 'novo').length, icon: Bell, color: 'amber', highlight: true, tab: 'my-leads' }
                                ].map((s, i) => (
                                    <div
                                        key={i}
                                        onClick={() => setCurrentTab(s.tab as Tab)}
                                        className={clsx(
                                            "p-8 rounded-[45px] border transition-all duration-500 hover:shadow-2xl group relative overflow-hidden cursor-pointer",
                                            s.highlight ? "bg-[#1B263B] border-[#1B263B] text-white shadow-xl shadow-[#1B263B]/20" : "bg-white border-slate-100 hover:border-[#10b981]/30"
                                        )}
                                    >
                                        {s.highlight && <div className="absolute top-0 right-0 w-32 h-32 bg-[#10b981]/20 blur-[60px]" />}
                                        <div className={clsx(
                                            "h-12 w-12 rounded-2xl flex items-center justify-center mb-6 shadow-inner transition-transform group-hover:scale-110",
                                            s.highlight ? "bg-[#10b981] text-white" : "bg-slate-50 text-[#1B263B]"
                                        )}>
                                            <s.icon className="h-5 w-5" />
                                        </div>
                                        <p className={clsx("text-[10px] font-black uppercase tracking-[0.3em] mb-1", s.highlight ? "text-white/40" : "text-slate-400")}>{s.label}</p>
                                        <h3 className="text-4xl font-black tracking-tighter">{s.val}</h3>
                                    </div>
                                ))}
                            </div>

                            {/* Próximas Visitas (Calendário Resumido) */}
                            {visits.filter(v => v.status === 'agendado').length > 0 && (
                                <div className="bg-[#1B263B] p-10 rounded-[50px] shadow-2xl relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-96 h-96 bg-[#10b981]/10 blur-[120px] group-hover:bg-[#10b981]/20 transition-all duration-1000" />
                                    <div className="relative z-10">
                                        <div className="flex items-center justify-between mb-8">
                                            <h3 className="text-2xl font-black text-white tracking-tighter uppercase flex items-center gap-4">
                                                <div className="h-10 w-10 rounded-xl bg-[#10b981] flex items-center justify-center">
                                                    <Calendar className="h-5 w-5 text-white" />
                                                </div>
                                                Calendário de Visitas
                                            </h3>
                                            <button 
                                                onClick={() => setCurrentTab('appointments')}
                                                className="text-[10px] font-black text-[#10b981] uppercase tracking-widest hover:translate-x-2 transition-transform flex items-center gap-2"
                                            >
                                                Ver Agenda Completa <ChevronRight className="h-4 w-4" />
                                            </button>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                            {visits.filter(v => v.status === 'agendado').slice(0, 4).map((v) => (
                                                <div key={v.id} className="bg-white/5 border border-white/10 p-6 rounded-3xl hover:bg-white/10 transition-all cursor-pointer" onClick={() => setCurrentTab('appointments')}>
                                                    <div className="flex items-center gap-3 mb-4">
                                                        <div className="h-10 w-10 rounded-xl bg-[#10b981]/20 flex flex-col items-center justify-center text-[#10b981]">
                                                            <span className="text-[10px] font-black leading-none">{new Date(v.visit_date).toLocaleDateString('pt-BR', { day: '2-digit' })}</span>
                                                            <span className="text-[8px] font-black uppercase">{new Date(v.visit_date).toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')}</span>
                                                        </div>
                                                        <div>
                                                            <p className="text-white text-sm font-black truncate">{v.client_name}</p>
                                                            <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">{v.visit_time.slice(0, 5)}h</p>
                                                        </div>
                                                    </div>
                                                    <p className="text-white/60 text-[10px] font-medium leading-relaxed line-clamp-1">
                                                        {v.property_ids?.length || 0} imóveis selecionados
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Main Content Grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                                {/* Properties Column */}
                                <div className="lg:col-span-8 space-y-8">
                                    <div className="flex flex-col md:flex-row items-center justify-between px-4 gap-6">
                                        <h3 className="text-2xl font-black tracking-tighter uppercase flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center">
                                                <Building2 className="h-5 w-5 text-slate-400" />
                                            </div>
                                            Gestão de Portfólio
                                        </h3>
                                        
                                        <div className="relative w-full md:w-80 group">
                                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-[#10b981] transition-colors" />
                                            <input 
                                                type="text"
                                                placeholder="Buscar por Ref, Título ou Bairro..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="w-full bg-white border border-slate-100 pl-12 pr-4 py-4 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-[#10b981]/10 transition-all placeholder:text-slate-300 shadow-sm"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {filteredProperties.length === 0 ? (
                                            <div className="col-span-full p-20 text-center bg-white rounded-[50px] border border-dashed border-slate-100">
                                                <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                                    <Building2 className="h-10 w-10 text-slate-200" />
                                                </div>
                                                <p className="text-[12px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">Nenhum imóvel encontrado.</p>
                                            </div>
                                        ) : (
                                            filteredProperties.slice(0, 6).map((item) => (
                                                <div key={item.id} className="bg-white rounded-[40px] overflow-hidden group border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 flex flex-col">
                                                    <div className="h-48 overflow-hidden relative">
                                                        <img src={item.images?.[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6'} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-1000" alt="" />
                                                        <div className="absolute top-4 left-4 flex flex-col gap-2">
                                                            <span className="bg-[#1B263B] text-white px-3 py-1 rounded-xl font-black text-[9px] uppercase tracking-widest leading-none shadow-xl border border-white/10">{item.reference_id}</span>
                                                            <span className={clsx(
                                                                "px-3 py-1 rounded-xl font-black text-[9px] uppercase tracking-widest leading-none border shadow-xl bg-white/90 backdrop-blur-md",
                                                                item.status === 'disponivel' ? "text-emerald-600 border-emerald-100" : "text-slate-400 border-slate-100"
                                                            )}>{item.status}</span>
                                                        </div>
                                                        <div className="absolute bottom-4 right-4 flex gap-2 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                                                            <Link href={`/admin/imoveis/editar/${item.id}`}>
                                                                <button className="h-10 w-10 rounded-xl bg-white/90 backdrop-blur-md text-[#1B263B] hover:bg-[#10b981] hover:text-white transition-all flex items-center justify-center shadow-lg">
                                                                    <Pencil className="h-4 w-4" />
                                                                </button>
                                                            </Link>
                                                        </div>
                                                    </div>
                                                    <div className="p-6 space-y-4">
                                                        <div className="space-y-1">
                                                            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest truncate">{item.neighborhood}</p>
                                                            <h4 className="text-md font-black text-[#1B263B] leading-tight group-hover:text-[#10b981] transition-colors truncate uppercase">{item.title}</h4>
                                                        </div>
                                                        <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                                                            <p className="text-lg font-black text-[#1B263B] tracking-tighter">
                                                                {item.price?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                                            </p>
                                                            <div className="flex gap-3">
                                                                <div className="flex items-center gap-1"><Bed className="h-3 w-3 text-slate-300" /><span className="text-[10px] font-bold">{item.rooms}</span></div>
                                                                <div className="flex items-center gap-1"><Maximize2 className="h-3 w-3 text-slate-300" /><span className="text-[10px] font-bold">{item.area}m²</span></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>

                                {/* Leads Column */}
                                <div className="lg:col-span-4 space-y-8">
                                    <h3 className="text-2xl font-black tracking-tighter uppercase flex items-center gap-4 px-2">
                                        <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center">
                                            <Mail className="h-5 w-5 text-blue-500" />
                                        </div>
                                        Leads Recentes
                                    </h3>

                                    <div className="space-y-4">
                                        {leads.length === 0 ? (
                                            <div className="p-10 bg-slate-100/50 rounded-[40px] text-center">
                                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Aguardando contatos...</p>
                                            </div>
                                        ) : (
                                            leads.slice(0, 5).map((lead) => (
                                                <div key={lead.id} className={clsx(
                                                    "p-8 rounded-[40px] border transition-all group relative overflow-hidden",
                                                    lead.status === 'novo' ? "bg-white border-[#10b981]/20 shadow-xl shadow-[#10b981]/5" : "bg-slate-50/50 border-transparent hover:bg-white hover:border-slate-100"
                                                )}>
                                                    {lead.status === 'novo' && <div className="absolute top-0 right-0 bg-[#10b981] text-white text-[9px] font-black uppercase tracking-widest px-4 py-1 rounded-bl-2xl">Novo</div>}

                                                    <div className="flex items-center gap-4 mb-6">
                                                        <div className="h-12 w-12 rounded-2xl bg-[#1B263B] text-white flex items-center justify-center text-lg font-black">
                                                            {lead.name?.charAt(0) || 'U'}
                                                        </div>
                                                        <div>
                                                            <p className="text-[13px] font-black uppercase tracking-tight text-[#1B263B]">{lead.name || 'Interessado'}</p>
                                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Contatou em {new Date(lead.created_at).toLocaleDateString()}</p>
                                                        </div>
                                                    </div>

                                                    <p className="text-sm font-medium text-slate-500 line-clamp-2 mb-6 italic leading-relaxed">"{lead.message || 'Interessado neste imóvel.'}"</p>

                                                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">{lead.properties?.reference_id || 'REF: N/A'}</span>
                                                        <button className="text-[10px] font-black text-[#10b981] uppercase tracking-widest hover:translate-x-1 transition-transform flex items-center gap-2">
                                                            Gerenciar <ChevronRight className="h-3 w-3" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {currentTab === 'my-properties' && (
                        <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-700">
                            <div className="flex justify-between items-center px-2">
                                <div>
                                    <h2 className="text-4xl font-black text-[#1B263B] tracking-tighter uppercase">Minha Carteira</h2>
                                    <p className="text-slate-400 font-bold text-[12px] uppercase tracking-[0.4em]">Gerencie suas exclusividades e listagens</p>
                                </div>
                                <div className="flex gap-4">
                                    <div className="bg-white border border-slate-100 rounded-3xl px-6 py-4 flex items-center gap-3 shadow-xl shadow-slate-200/50">
                                        <Search className="h-5 w-5 text-slate-300" />
                                        <input
                                            placeholder="Buscar na carteira..."
                                            className="bg-transparent outline-none text-sm font-bold text-[#1B263B] w-64"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                    <Link href="/admin/imoveis/novo">
                                        <button className="bg-[#1B263B] text-white px-10 py-4 rounded-3xl text-[12px] font-black uppercase tracking-widest shadow-2xl hover:bg-[#10b981] transition-all flex items-center gap-3">
                                            <Plus className="h-5 w-5" />
                                            Novo Imóvel
                                        </button>
                                    </Link>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                                {filteredProperties.map((item) => (
                                    <div key={item.id} className="bg-white rounded-[50px] border border-slate-100 shadow-xl overflow-hidden group hover:border-[#10b981]/50 transition-all duration-700">
                                        <div className="h-72 relative overflow-hidden">
                                            <img src={item.images?.[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt="" />
                                            <div className="absolute top-8 left-8 flex flex-col gap-3">
                                                <span className="bg-[#1B263B] text-white px-5 py-2 rounded-2xl font-black text-[10px] uppercase tracking-widest leading-none shadow-xl">{item.reference_id}</span>
                                                <span className={clsx(
                                                    "px-5 py-2 rounded-2xl font-black text-[10px] uppercase tracking-widest leading-none border shadow-xl",
                                                    item.status === 'disponivel' ? "bg-emerald-500 text-white border-emerald-500" : "bg-white text-slate-400 border-slate-100"
                                                )}>{item.status}</span>
                                            </div>
                                        </div>
                                        <div className="p-10 space-y-8">
                                            <h4 className="text-2xl font-black text-[#1B263B] tracking-tight group-hover:text-[#10b981] transition-colors truncate uppercase">{item.title}</h4>
                                            <div className="grid grid-cols-2 gap-6 border-t border-slate-50 pt-8">
                                                <div className="space-y-1">
                                                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Valor Venda</p>
                                                    <p className="text-sm font-black text-[#1B263B]">{item.price?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                                                </div>
                                                <div className="space-y-1 text-right">
                                                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Localização</p>
                                                    <p className="text-sm font-black text-[#1B263B] truncate">{item.neighborhood}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-4 pt-2">
                                                <Link href={`/admin/imoveis/editar/${item.id}`} className="flex-1">
                                                    <button className="w-full bg-[#1B263B] text-white py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-[#10b981] transition-all shadow-xl shadow-[#1B263B]/20">Editar</button>
                                                </Link>
                                                <Link href={`/imovel/${item.slug}`} className="flex-1">
                                                    <button className="w-full bg-slate-50 text-[#1B263B] py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] border border-slate-100 hover:bg-white transition-all">Ver Site</button>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {properties.length === 0 && (
                                <div className="py-32 text-center bg-white rounded-[60px] border border-dashed border-slate-200">
                                    <Building2 className="h-20 w-20 text-slate-100 mx-auto mb-6" />
                                    <p className="text-slate-400 font-bold text-sm uppercase tracking-[0.3em]">Nenhum imóvel encontrado na sua carteira.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {currentTab === 'my-leads' && (
                        <div className="space-y-12 animate-in slide-in-from-bottom-8 duration-700">
                            <div>
                                <h2 className="text-4xl font-black text-[#1B263B] tracking-tighter uppercase">Gestão de Leads</h2>
                                <p className="text-slate-400 font-bold text-[12px] uppercase tracking-[0.4em]">Acompanhe e converta seus potenciais clientes</p>
                            </div>

                            <div className="bg-white rounded-[60px] border border-slate-100 shadow-2xl overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                                <th className="px-10 py-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Interessado</th>
                                                <th className="px-10 py-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Imóvel / Ref</th>
                                                <th className="px-10 py-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Data Contato</th>
                                                <th className="px-10 py-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Status</th>
                                                <th className="px-10 py-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] text-right">Ação Direta</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {leads.map((lead) => (
                                                <tr key={lead.id} className="hover:bg-slate-50/30 transition-all group">
                                                    <td className="px-10 py-8">
                                                        <div className="flex items-center gap-5">
                                                            <div className="h-14 w-14 rounded-2xl bg-[#1B263B] text-white flex items-center justify-center text-xl font-black shadow-lg shadow-[#1B263B]/10">{lead.name?.charAt(0)}</div>
                                                            <div>
                                                                <p className="text-sm font-black text-[#1B263B] uppercase tracking-tight">{lead.name}</p>
                                                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{lead.whatsapp || lead.email}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-10 py-8">
                                                        <p className="text-sm font-black text-[#1B263B] truncate max-w-[200px]">{lead.properties?.title}</p>
                                                        <span className="inline-block mt-2 px-3 py-1 bg-emerald-50 text-[#10b981] text-[9px] font-black rounded-lg uppercase tracking-widest">{lead.properties?.reference_id}</span>
                                                    </td>
                                                    <td className="px-10 py-8">
                                                        <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">{new Date(lead.created_at).toLocaleDateString('pt-BR')}</p>
                                                        <p className="text-[9px] font-bold text-slate-300 uppercase mt-1">{new Date(lead.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                                                    </td>
                                                    <td className="px-10 py-8">
                                                        <span className={clsx(
                                                            "px-5 py-2 rounded-2xl text-[9px] font-black uppercase tracking-widest border shadow-sm",
                                                            lead.status === 'novo' ? "bg-emerald-500 text-white border-emerald-500" : "bg-slate-100 text-slate-400 border-slate-200"
                                                        )}>{lead.status}</span>
                                                    </td>
                                                    <td className="px-10 py-8 text-right">
                                                        <button className="bg-[#1B263B] text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#10b981] transition-all shadow-xl hover:shadow-[#10b981]/20">Ver Contato</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {currentTab === 'social-ai' && (
                        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-700">
                            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                                <div className="space-y-2">
                                    <div className="inline-flex items-center gap-2 bg-accent/10 px-4 py-1.5 rounded-full text-accent font-black text-[10px] uppercase tracking-widest">
                                        <Sparkles className="h-3 w-3" /> Assistente de Social Media
                                    </div>
                                    <h2 className="text-4xl font-black text-primary-900 tracking-tighter uppercase">Gerador de Copy IA</h2>
                                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Crie legendas irresistíveis para seus imóveis no Instagram em segundos.</p>
                                </div>
                            </header>

                            <SocialAISection properties={properties} />
                        </div>
                    )}

                    {currentTab === 'appointments' && (
                        <VisitsManagement 
                            properties={properties} 
                            leads={leads} 
                            chatLeads={chatLeads}
                            visits={visits} 
                            onRefresh={() => window.location.reload()}
                            currentUserProfile={currentUserProfile}
                        />
                    )}

                    {currentTab === 'settings' && (
                        <div className="max-w-4xl mx-auto space-y-12 animate-in slide-in-from-bottom-8 duration-700">
                            <div className="text-center space-y-4">
                                <h2 className="text-4xl font-black text-[#1B263B] tracking-tighter uppercase">Configurações de Perfil</h2>
                                <p className="text-slate-400 font-bold text-[12px] uppercase tracking-[0.4em]">Personalize sua identidade na plataforma</p>
                            </div>

                            <div className="bg-white rounded-[60px] border border-slate-100 shadow-2xl p-16 space-y-16 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-96 h-96 bg-[#10b981]/5 blur-[120px]" />

                                <div className="flex flex-col md:flex-row items-center gap-16 border-b border-slate-50 pb-16">
                                    <div className="relative group">
                                        <div className="h-48 w-48 rounded-[55px] bg-[#1B263B] overflow-hidden shadow-2xl border-4 border-white transition-transform group-hover:scale-105 duration-500 relative">
                                            {isUploadingAvatar && (
                                                <div className="absolute inset-0 bg-black/60 z-10 flex items-center justify-center">
                                                    <Loader2 className="h-10 w-10 text-white animate-spin" />
                                                </div>
                                            )}
                                            {currentUserProfile?.avatar_url ? (
                                                <img src={currentUserProfile.avatar_url} className="w-full h-full object-cover" alt="" />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center text-6xl font-black text-white">{currentUserProfile?.full_name?.charAt(0) || 'C'}</div>
                                            )}
                                        </div>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleAvatarUpload}
                                        />
                                        <button
                                            onClick={handleAvatarClick}
                                            disabled={isUploadingAvatar}
                                            className="absolute -bottom-4 -right-4 h-16 w-16 bg-[#10b981] text-white rounded-[24px] flex items-center justify-center shadow-2xl border-4 border-white hover:scale-110 active:scale-95 transition-all disabled:opacity-50"
                                        >
                                            {isUploadingAvatar ? <Loader2 className="h-6 w-6 animate-spin" /> : <Pencil className="h-6 w-6" />}
                                        </button>
                                    </div>
                                    <div className="flex-1 text-center md:text-left space-y-4">
                                        <h3 className="text-4xl font-black text-[#1B263B] tracking-tight truncate uppercase">{currentUserProfile?.full_name || 'Agente'}</h3>
                                        <p className="text-slate-400 font-bold text-[13px] uppercase tracking-widest">{currentUserProfile?.email || 'corretor@kfimoveis.com.br'}</p>
                                        <div className="pt-4 flex flex-wrap gap-4 justify-center md:justify-start">
                                            <span className="px-6 py-2.5 bg-emerald-50 text-emerald-600 rounded-2xl text-[11px] font-black uppercase tracking-widest border border-emerald-100">Corretor Expert</span>
                                            <span className="px-6 py-2.5 bg-blue-50 text-blue-600 rounded-2xl text-[11px] font-black uppercase tracking-widest border border-blue-100">Verificado Blue</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-4">
                                        <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest ml-2">Nome Completo (Exibição)</label>
                                        <input
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-100 p-6 rounded-3xl font-bold text-sm text-[#1B263B] outline-none focus:ring-4 focus:ring-[#10b981]/10 transition-all shadow-inner"
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest ml-2">Telefone Profissional</label>
                                        <input
                                            placeholder="(00) 00000-0000"
                                            className="w-full bg-slate-50 border border-slate-100 p-6 rounded-3xl font-bold text-sm text-[#1B263B] outline-none focus:ring-4 focus:ring-[#10b981]/10 transition-all shadow-inner"
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest ml-2">Registro CRECI Ativo</label>
                                        <input
                                            value={editCreci}
                                            onChange={(e) => setEditCreci(e.target.value)}
                                            placeholder="Ex: 123.456-F"
                                            className="w-full bg-slate-50 border border-slate-100 p-6 rounded-3xl font-bold text-sm text-[#1B263B] outline-none focus:ring-4 focus:ring-[#10b981]/10 transition-all shadow-inner"
                                        />
                                    </div>
                                    <div className="space-y-4 md:col-span-2">
                                        <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest ml-2">Sua Biografia / Slogan Profissional</label>
                                        <textarea
                                            rows={4}
                                            value={editBio}
                                            onChange={(e) => setEditBio(e.target.value)}
                                            placeholder="Especialista em alto padrão na Praia Grande..."
                                            className="w-full bg-slate-50 border border-slate-100 p-6 rounded-3xl font-bold text-sm text-[#1B263B] outline-none focus:ring-4 focus:ring-[#10b981]/10 transition-all shadow-inner resize-none"
                                        />
                                    </div>
                                </div>

                                <div className="pt-10">
                                    <button
                                        onClick={handleUpdateProfile}
                                        disabled={isSavingProfile}
                                        className="w-full bg-[#1B263B] text-white py-8 rounded-[40px] text-[15px] font-black uppercase tracking-widest shadow-2xl hover:bg-[#10b981] transition-all flex items-center justify-center gap-6 disabled:opacity-50"
                                    >
                                        {isSavingProfile ? <Loader2 className="h-6 w-6 animate-spin" /> : <CheckCircle2 className="h-6 w-6" />}
                                        {isSavingProfile ? 'Confirmando...' : 'Atualizar Credenciais'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Visual Footer Piece */}
                <div className="p-16 text-center opacity-10">
                    <p className="text-[11px] font-black uppercase tracking-[1.5em] text-slate-400">KF Imóveis Professional Network • All rights reserved</p>
                </div>

                {isTermoModalOpen && selectedLeadForTermo && (
                    <TermoVisitaModal
                        lead={selectedLeadForTermo}
                        corretor={currentUserProfile}
                        siteContact={siteContact}
                        onClose={() => {
                            setIsTermoModalOpen(false);
                            setSelectedLeadForTermo(null);
                        }}
                    />
                )}
            </main>
        </div>
    );
}

function SocialAISection({ properties }: { properties: any[] }) {
    const [selectedPropertyForAI, setSelectedPropertyForAI] = useState<any>(null);
    const [templateId, setTemplateId] = useState<'modern' | 'glass' | 'bold'>('modern');
    const [format, setFormat] = useState<'feed' | 'stories'>('feed');
    const [aiPitch, setAiPitch] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const templateRef = useRef<HTMLDivElement>(null);

    const downloadTemplate = async (platform: string) => {
        if (!templateRef.current) return;
        try {
            const width = format === 'feed' ? 1080 : 1080;
            const height = format === 'feed' ? 1350 : 1920;

            const dataUrl = await toPng(templateRef.current, { 
                cacheBust: true,
                canvasWidth: width,
                canvasHeight: height,
                pixelRatio: 2
            });
            const link = document.createElement('a');
            link.download = `${platform}-${format}-${selectedPropertyForAI?.reference_id || 'imovel'}.png`;
            link.href = dataUrl;
            link.click();
        } catch (error) {
            console.error('Error downloading image:', error);
            alert('Erro ao baixar imagem. Tente novamente.');
        }
    };

    const generateAIPitch = () => {
        if (!selectedPropertyForAI) return;
        setIsGenerating(true);
        setTimeout(() => {
            const prop = selectedPropertyForAI;
            const pitch = `✨ OPORTUNIDADE EM ${prop.neighborhood?.toUpperCase()}! ✨\n\nEste incrível imóvel de ${prop.rooms} dormitórios com ${prop.area}m² é exatamente o que você procura. Venha conferir! 🚀 #CorretorExpert #ImoveisPraiaGrande`;
            setAiPitch(pitch);
            setIsGenerating(false);
        }, 1200);
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(aiPitch);
        alert('Legenda copiada!');
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
            {/* Control Side */}
            <div className="lg:col-span-3 space-y-8 bg-white p-8 rounded-[40px] border border-slate-100 flex flex-col justify-between shadow-sm">
                <div className="space-y-8">
                    <h3 className="text-xl font-black text-[#1B263B] tracking-tighter uppercase leading-none">Configurar Card</h3>
                    
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Imóvel da Carteira</label>
                            <select 
                                className="w-full bg-slate-50 border border-slate-100 p-5 rounded-3xl text-[#1B263B] font-bold text-sm outline-none focus:ring-4 focus:ring-indigo-50 transition-all appearance-none"
                                onChange={(e) => {
                                    const prop = properties.find(p => p.id === e.target.value);
                                    setSelectedPropertyForAI(prop);
                                }}
                            >
                                <option value="">Selecionar...</option>
                                {properties.map(p => (
                                    <option key={p.id} value={p.id}>{p.title}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Estilo Visual</label>
                            <div className="grid grid-cols-3 gap-2">
                                {[
                                    {id: 'modern', label: 'Mod'},
                                    {id: 'glass', label: 'Gla'},
                                    {id: 'bold', label: 'Bld'}
                                ].map(t => (
                                    <button 
                                        key={t.id}
                                        onClick={() => setTemplateId(t.id as any)}
                                        className={clsx(
                                            "p-3 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all shadow-sm",
                                            templateId === t.id ? "bg-[#1B263B] text-white" : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                                        )}
                                    >
                                        {t.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Formato</label>
                            <div className="grid grid-cols-2 gap-2">
                                {[
                                    {id: 'feed', label: 'Feed (4:5)'},
                                    {id: 'stories', label: 'Stories (9:16)'}
                                ].map(f => (
                                    <button 
                                        key={f.id}
                                        onClick={() => setFormat(f.id as any)}
                                        className={clsx(
                                            "p-3 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all shadow-sm",
                                            format === f.id ? "bg-[#10b981] text-white" : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                                        )}
                                    >
                                        {f.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <button 
                    onClick={generateAIPitch}
                    disabled={!selectedPropertyForAI || isGenerating}
                    className="w-full py-5 bg-[#1B263B] text-white rounded-3xl font-black text-[12px] uppercase tracking-widest hover:bg-[#10b981] transition-all shadow-2xl disabled:opacity-40"
                >
                    {isGenerating ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : '🚀 Gerar Card e Texto'}
                </button>
            </div>

            {/* Preview Side */}
            <div className="lg:col-span-4 flex flex-col items-center justify-center p-8 bg-slate-900 rounded-[40px] border border-white/5 space-y-6">
                {selectedPropertyForAI ? (
                    <>
                        <div 
                            ref={templateRef}
                            style={{ 
                                aspectRatio: format === 'feed' ? '4/5' : '9/16',
                                width: '100%',
                                maxWidth: format === 'feed' ? '320px' : '280px'
                            }}
                            className={clsx(
                                "relative rounded-[40px] overflow-hidden shadow-2xl transition-all duration-700 group/card bg-white mx-auto",
                                templateId === 'glass' && "bg-white/10 backdrop-blur-xl border border-white/20",
                                templateId === 'bold' && "bg-accent"
                            )}
                        >
                            <img src={selectedPropertyForAI.images?.[0] || ''} className="absolute inset-0 w-full h-full object-cover" crossOrigin="anonymous" />
                            
                            {templateId === 'modern' && (
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent flex flex-col justify-end p-8">
                                    <div className="space-y-4">
                                        <span className="bg-[#10b981] px-4 py-2 rounded-xl text-white font-black text-[9px] uppercase tracking-[0.2em]">{selectedPropertyForAI.neighborhood}</span>
                                        <h4 className={clsx(
                                            "font-black text-white leading-tight uppercase tracking-tighter line-clamp-2",
                                            format === 'stories' ? "text-3xl" : "text-2xl"
                                        )}>{selectedPropertyForAI.title}</h4>
                                        <div className="flex items-center gap-4">
                                            <p className={clsx("font-black text-white", format === 'stories' ? "text-3xl" : "text-2xl")}>{selectedPropertyForAI.price?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {templateId === 'glass' && (
                                <div className={clsx(
                                    "absolute inset-x-4 bottom-4 p-8 rounded-[30px] bg-white/10 backdrop-blur-2xl border border-white/20 text-white shadow-2xl",
                                    format === 'stories' && "bottom-12"
                                )}>
                                    <h4 className="text-sm font-black text-white/40 uppercase tracking-widest mb-1 leading-none">{selectedPropertyForAI.neighborhood}</h4>
                                    <h4 className="text-xl font-black mb-3 uppercase leading-none">{selectedPropertyForAI.title}</h4>
                                    <p className="text-lg font-black">{selectedPropertyForAI.price?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                                </div>
                            )}

                            {templateId === 'bold' && (
                                <div className={clsx(
                                    "absolute inset-x-0 bottom-0 p-8 bg-[#1B263B] text-white",
                                    format === 'stories' && "pb-20"
                                )}>
                                    <p className="text-4xl font-black tracking-tighter leading-none mb-2">{selectedPropertyForAI.price?.toLocaleString('pt-BR', { maximumFractionDigits: 0, currency: 'BRL' }).split(',')[0]}K</p>
                                    <h4 className="text-md font-black uppercase tracking-widest leading-none mb-4">{selectedPropertyForAI.neighborhood}</h4>
                                    <div className="flex gap-4">
                                        <div className="flex gap-1.5 items-center"><Bed className="h-4 w-4" /><span className="font-bold text-xs">{selectedPropertyForAI.rooms}</span></div>
                                        <div className="flex gap-1.5 items-center"><Bath className="h-4 w-4" /><span className="font-bold text-xs">{selectedPropertyForAI.bathrooms}</span></div>
                                        <div className="flex gap-1.5 items-center"><Maximize2 className="h-4 w-4" /><span className="font-bold text-xs">{selectedPropertyForAI.area}m²</span></div>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="w-full grid grid-cols-2 gap-3">
                            <button 
                                onClick={() => downloadTemplate('instagram')}
                                className="py-4 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 text-white rounded-3xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-xl flex items-center justify-center gap-2"
                            >
                                <Instagram className="h-4 w-4" /> Instagram
                            </button>
                            <button 
                                onClick={() => downloadTemplate('facebook')}
                                className="py-4 bg-[#1877F2] text-white rounded-3xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-xl flex items-center justify-center gap-2"
                            >
                                <Facebook className="h-4 w-4" /> Facebook
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="text-center space-y-4 opacity-20">
                        <div className="h-24 w-24 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Sparkles className="h-10 w-10 text-white" />
                        </div>
                        <p className="text-[10px] font-black text-white uppercase tracking-widest underline decoration-wavy underline-offset-8">Aguardando Seleção</p>
                    </div>
                )}
            </div>

            {/* Captions Side */}
            <div className="lg:col-span-5 bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm flex flex-col min-h-[500px]">
                <header className="flex items-center justify-between mb-8 border-b border-slate-50 pb-6">
                    <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Legenda Inteligente (IA)</h3>
                    {aiPitch && (
                        <button 
                            onClick={copyToClipboard}
                            className="bg-slate-50 p-2.5 rounded-xl hover:bg-[#1B263B] hover:text-white transition-all group"
                        >
                            <Copy className="h-4 w-4" />
                        </button>
                    )}
                </header>
                
                <div className="flex-1">
                    {aiPitch ? (
                        <textarea 
                            value={aiPitch}
                            onChange={(e) => setAiPitch(e.target.value)}
                            className="w-full h-full bg-slate-50/50 p-6 rounded-3xl text-sm font-medium text-[#1B263B] leading-relaxed outline-none resize-none border border-slate-50"
                        />
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-20">
                            <div className="h-20 w-20 bg-slate-100 rounded-full flex items-center justify-center">
                                <FileText className="h-10 w-10 text-slate-400" />
                            </div>
                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest max-w-[200px]">Selecione um imóvel e gere o conteúdo.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}


