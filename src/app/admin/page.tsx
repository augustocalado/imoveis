'use client';

import { useEffect, useState, Suspense } from 'react';
import { supabase, STORAGE_BUCKET } from '@/lib/supabase';
import {
    Users, Building2, BarChart3, Settings, ShieldCheck, Mail, Loader2, PieChart,
    TrendingUp, Search, LogOut, Home, Check, X, Bell, LayoutDashboard, Flag,
    Globe, Phone, MessageSquare, Plus, Edit2, Trash2, Image as ImageIcon,
    ChevronRight, ArrowUpRight, Filter, List, Calendar, DollarSign, FileText,
    Download, UserPlus, Handshake, Briefcase, TrendingDown, MoreHorizontal, MapPin, Upload, Menu,
    Bed, Bath, Maximize2, XCircle, Star, Info, Newspaper, Link2, Zap, Instagram, Facebook, Rocket, Share2, Save, Layout, Camera, CheckCircle2, User, Palette, Car, Navigation,
    Sofa, Utensils, ChefHat, Laptop, Tv, Waves, Sun, Wind, Cctv, DoorOpen, Thermometer, Wifi, Flame, Table, Gem, Dumbbell, Bike, CarFront, ParkingCircle, Store, Building, Warehouse, Shirt, Cpu, AirVent, Fence, Trees, Flower, Component, ArrowUp, Shovel, Palmtree, BedDouble,
    Volleyball, Goal, Trophy, Gamepad2, Dog, PartyPopper, Coffee, TreePine, Shield,
    Anchor, Award, Battery, BookOpen, BriefcaseBusiness, Calculator, CircleDollarSign, ClipboardList, Clock, Cloud, Code, Compass, Copy, Database, Disc, Droplets, Ear, Eye, Fingerprint, Focus, Folder, Gauge, Gift, Glasses, GraduationCap, Heart, HelpCircle, Highlighter, History, Hourglass, Inbox, Key, Landmark, Layers, Lightbulb, Lock, Map, Mic, Monitor, Moon, Music, Package, Paperclip, PenTool, Percent, Pin, Play, Power, Printer, QrCode, Radio, RefreshCw, Repeat, RotateCcw, Rss, Scale, Scissors, Send, Server, Settings2, ShieldAlert, ShoppingBag, Shuffle, Signal, SkipForward, Smile, Snowflake, Sparkles, Speaker, Square, Stamp, StickyNote, StopCircle, Target, Terminal, Ticket, Timer, ToggleLeft, Trash, Triangle, Truck, Umbrella, Unlock, UserCheck, Video, Volume2, Wallet, Watch, Wrench
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import clsx from 'clsx';
import { generatePropertyFriendlySlug } from '@/utils/slug';
import { toPng } from 'html-to-image';
import { useRef } from 'react';
import SmartLeadsSection from '@/components/admin/SmartLeadsSection';
import ChatAIConfigSection from '@/components/admin/ChatAIConfigSection';
import SystemToolsSection from '@/components/admin/SystemToolsSection';
import Toast, { ToastType } from '@/components/Toast';
import VisitsManagement from '@/components/admin/VisitsManagement';
import AdminSearchBar from '@/components/admin/AdminSearchBar';

type Tab = 'overview' | 'imoveis' | 'blog' | 'crm' | 'financeiro' | 'agenda' | 'documentos' | 'parceiros' | 'config' | 'marketing' | 'integracao' | 'smart-leads' | 'perfil';
type ConfigTab = 'visual' | 'contatos' | 'home' | 'sobre' | 'master' | 'sede' | 'bairros' | 'chat_ai' | 'features' | 'specs';

const ICON_MAP: Record<string, any> = {
    Bed, Bath, Maximize2, Car, Star, Navigation, MapPin, Zap, Info, Check, X, Building2, Home, Search, LayoutDashboard, Flag, Globe, Phone, Mail, MessageSquare, Plus, Edit2, Trash2, ChevronRight, ArrowUpRight, Filter, List, Calendar, DollarSign, FileText, Download, UserPlus, Handshake, Briefcase, TrendingDown, TrendingUp, MoreHorizontal, User, Palette, Camera, CheckCircle2, ShieldCheck, PieChart, BarChart3, Rocket, Image: ImageIcon, Share2, Save, Layout, Newspaper, Link2, Upload, Menu, XCircle, Instagram, Facebook,
    Sofa, Utensils, ChefHat, Laptop, Tv, Waves, Sun, Wind, Cctv, Bell, DoorOpen, Thermometer, Wifi, Flame, Table, Gem, Dumbbell, Bike, CarFront, ParkingCircle, Store, Building, Warehouse, Shirt, Cpu, AirVent, Fence, Trees, Flower, Component, ArrowUp, Shovel, Palmtree, BedDouble,
    Volleyball, Goal, Trophy, Gamepad2, Dog, PartyPopper, Coffee, TreePine, Shield,
    Anchor, Award, Battery, BookOpen, BriefcaseBusiness, Calculator, CircleDollarSign, ClipboardList, Clock, Cloud, Code, Compass, Copy, Database, Disc, Droplets, Ear, Eye, Fingerprint, Focus, Folder, Gauge, Gift, Glasses, GraduationCap, Heart, HelpCircle, Highlighter, History, Hourglass, Inbox, Key, Landmark, Layers, Lightbulb, Lock, Map, Mic, Monitor, Moon, Music, Package, Paperclip, PenTool, Percent, Pin, Play, Power, Printer, QrCode, Radio, RefreshCw, Repeat, RotateCcw, Rss, Scale, Scissors, Send, Server, Settings2, ShieldAlert, ShoppingBag, Forbidden: XCircle, Shuffle, Signal, SkipForward, Smile, Snowflake, Sparkles, Speaker, Square, Stamp, StickyNote, StopCircle, Target, Terminal, Ticket, Timer, ToggleLeft, Trash, Triangle, Truck, Umbrella, Unlock, UserCheck, Video, Volume2, Wallet, Watch, Wrench,
    // Alias para garantir que o ícone de suítes apareça mesmo com variações de texto no banco
    "suites": BedDouble,
    "Suítes": BedDouble
};

const fireToast = (message: string, type: ToastType = 'success') => {
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('show-toast', { detail: { message, type } }));
    }
};

function AdminDashboardContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialTab = (searchParams.get('tab') as Tab) || 'overview';
    
    const [currentTab, setCurrentTab] = useState<Tab>(initialTab);
    const [configTab, setConfigTab] = useState<ConfigTab>('visual');
    const [selectedProperty, setSelectedProperty] = useState<any>(null);
    const [editingUser, setEditingUser] = useState<any>(null);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [isTermoModalOpen, setIsTermoModalOpen] = useState(false);
    const [selectedLeadForTermo, setSelectedLeadForTermo] = useState<any>(null);
    const [siteContact, setSiteContact] = useState<any>({
        phone: '',
        email: '',
        address: '',
        cnpj: '' // Will allow manual input if not found
    });
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState({
        totalProperties: 0,
        totalLeads: 0,
        monthlyRevenue: 0,
        occupancyRate: 0,
        conversionRate: 0
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [properties, setProperties] = useState<any[]>([]);
    const [leads, setLeads] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [documents, setDocuments] = useState<any[]>([]);
    const [posts, setPosts] = useState<any[]>([]);
    const [pendingRequests, setPendingRequests] = useState<any[]>([]);
    const [activities, setActivities] = useState<any[]>([]);
    const [currentUserProfile, setCurrentUserProfile] = useState<any>(null);
    const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [visits, setVisits] = useState<any[]>([]);
    const [chatLeads, setChatLeads] = useState<any[]>([]);
    const [toast, setToast] = useState<{ message: string, type: ToastType } | null>(null);

    useEffect(() => {
        const savedTheme = localStorage.getItem('kf_admin_theme');
        if (savedTheme === 'dark') setIsDarkMode(true);
    }, []);

    useEffect(() => {
        localStorage.setItem('kf_admin_theme', isDarkMode ? 'dark' : 'light');
    }, [isDarkMode]);

    useEffect(() => {
        const handleToast = (e: any) => {
            setToast(e.detail);
        };
        window.addEventListener('show-toast', handleToast);
        return () => window.removeEventListener('show-toast', handleToast);
    }, []);

    const showToast = (message: string, type: ToastType = 'success') => {
        setToast({ message, type });
    };

    const fetchProperties = async (search?: string) => {
        try {
            let query = supabase
                .from('properties')
                .select('*, profiles!corretor_id(full_name)')
                .order('created_at', { ascending: false });

            if (search) {
                const s = search.trim();
                query = query.or(`title.ilike.%${s}%,reference_id.ilike.%${s}%,neighborhood.ilike.%${s}%`);
            } else {
                query = query.limit(50); // Show more by default
            }

            const { data } = await query;
            setProperties(data || []);
        } catch (err) {
            console.error('Erro ao buscar imóveis:', err);
        }
    };

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchProperties(searchTerm);
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                // Stats and other data...
                const { count: propsCount } = await supabase.from('properties').select('*', { count: 'exact', head: true });
                const { count: leadsCount } = await supabase.from('leads').select('*', { count: 'exact', head: true });

                const { data: revenueData } = await supabase.from('financial_records').select('amount').eq('status', 'paid');
                const monthlyRevenue = revenueData?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0;

                const { count: activeProps } = await supabase.from('properties').select('*', { count: 'exact', head: true }).neq('status', 'Vendido');

                setStats({
                    totalProperties: propsCount || 0,
                    totalLeads: leadsCount || 0,
                    monthlyRevenue,
                    occupancyRate: propsCount ? Math.round((activeProps! / propsCount) * 100) : 0,
                    conversionRate: 28
                });

                // Get auth user and profile
                const { data: { user: currentUser } } = await supabase.auth.getUser();
                let currentProfile = null;
                if (currentUser) {
                    setCurrentUserEmail(currentUser.email || null);
                    const { data: profile } = await supabase.from('profiles').select('*').eq('id', currentUser.id).single();
                    currentProfile = profile;
                    setCurrentUserProfile(profile);

                    if (profile?.role === 'admin') {
                        const { data: allUsers } = await supabase.from('profiles').select('*');
                        setUsers(allUsers || []);
                    }
                }

                // Initial properties fetch
                await fetchProperties();

                // Fetch leads...
                const { data: allLeads } = await supabase
                    .from('leads')
                    .select('*, properties(title, reference_id), profiles(full_name)')
                    .neq('status', 'arquivado') // Não mostra arquivados no CRM por padrão
                    .order('created_at', { ascending: false });

                setLeads(allLeads || []);

                const { data: recentLeads } = await supabase.from('leads').select('*, properties(title)').order('created_at', { ascending: false }).limit(3);
                const transformedActivities = recentLeads?.map(l => ({
                    type: l.status === 'proposta' ? 'Proposta' : 'Lead',
                    msg: `Interesse em ${l.properties?.title || 'Imóvel'}`,
                    time: new Date(l.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    icon: l.status === 'proposta' ? FileText : Mail
                })) || [];
                setActivities(transformedActivities);

                const { data: requests } = await supabase.from('profiles').select('*').eq('role', 'corretor').eq('is_approved', false);
                setPendingRequests(requests || []);

                const { data: docsList } = await supabase.from('documents').select('*');
                setDocuments(docsList || []);

                const { data: blogPosts } = await supabase.from('blog_posts').select('*').order('created_at', { ascending: false });
                setPosts(blogPosts || []);

                const { data: chatLds } = await supabase.from('chat_leads').select('*').order('created_at', { ascending: false });
                setChatLeads(chatLds || []);

                const { data: vsts } = await supabase.from('visits').select('*').order('visit_date', { ascending: true });
                setVisits(vsts || []);

                const { data: contactData } = await supabase.from('site_settings').select('value').eq('key', 'site_contact').single();
                if (contactData && contactData.value) setSiteContact(contactData.value);
            } catch (err) {
                console.error('Erro ao buscar dados do dashboard:', err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        window.location.href = '/login';
    };

    // Client-side filtering as fallback/additional refinement
    const filteredProperties = properties;

    const menuItems = [
        { id: 'overview', label: 'Visão Geral', icon: LayoutDashboard },
        { id: 'imoveis', label: 'Gestão de Imóveis', icon: Building2 },
        { id: 'blog', label: 'Blog e Conteúdo', icon: Newspaper, roles: ['admin'] },
        { id: 'crm', label: 'CRM de Clientes', icon: Users },
        { id: 'financeiro', label: 'Financeiro', icon: DollarSign },
        { id: 'agenda', label: 'Agenda de Visitas', icon: Calendar },
        { id: 'documentos', label: 'Documentos', icon: FileText },
        { id: 'parceiros', label: 'Nossos Parceiros', icon: Handshake },
        { id: 'marketing', label: 'Marketing IA', icon: Zap },
        { id: 'integracao', label: 'Integrações Portais', icon: Globe, roles: ['admin'] },
        { id: 'config', label: 'Configurações', icon: Settings, roles: ['admin'] },
        { id: 'smart-leads', label: 'Leads IA (Chat)', icon: MessageSquare },
    ];


    const dynamicMenuItems = menuItems.filter(item => {
        if (!item.roles) return true;
        return item.roles.includes(currentUserProfile?.role);
    });

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Notification counts
    const newLeadsCount = leads.filter(l => l.status === 'Novo').length;
    const newChatLeadsCount = chatLeads.filter(l => l.status === 'Novo' || l.status === 'Pendente').length;

    const handleDeleteProperty = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir este imóvel permanentemente? Esta ação não pode ser desfeita.')) return;

        setIsDeleting(id);
        const { error } = await supabase.from('properties').delete().eq('id', id);

        if (error) {
            alert('Erro ao excluir imóvel: ' + error.message);
        } else {
            setProperties(properties.filter(p => p.id !== id));
        }
        setIsDeleting(null);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-12 w-12 text-[#1B263B] animate-spin" />
                    <p className="text-[12px] font-black uppercase tracking-[0.3em] text-[#1B263B]/40">Carregando Seu Sistema</p>
                </div>
            </div>
        );
    }

    return (
        <div className={clsx(
            "min-h-screen flex flex-col lg:flex-row relative transition-colors duration-500",
            isDarkMode ? "bg-[#0b1120] text-slate-100 dark-theme" : "bg-[#f4f7fa] text-[#1B263B]"
        )}>
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
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => setIsDarkMode(!isDarkMode)}
                        className="p-3 bg-white/5 rounded-xl border border-white/10"
                    >
                        {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                    </button>
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-3 bg-white/5 rounded-xl border border-white/10"
                    >
                        {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>
            </header>

            {/* Sidebar */}
            <aside className={clsx(
                "w-72 border-r fixed lg:sticky top-0 h-screen z-[70] flex flex-col transition-transform duration-500",
                isDarkMode ? "bg-[#0b1120] text-slate-100 border-slate-800" : "bg-white text-slate-700 border-slate-100",
                isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
            )}>
                <div className="p-8 pb-12 flex-1 overflow-y-auto custom-scrollbar">
                    {/* Premium Profile Header */}
                    <div className="mb-8 p-6 rounded-2xl bg-slate-50 border border-slate-100 relative overflow-hidden group">
                        <div className="relative z-10 flex flex-col items-center text-center">
                            <div className="h-20 w-20 rounded-full bg-[#1B263B] text-white mb-4 flex items-center justify-center text-3xl font-bold shadow-sm overflow-hidden">
                                {currentUserProfile?.avatar_url ? (
                                    <img src={currentUserProfile.avatar_url} className="w-full h-full object-cover" alt="" />
                                ) : (
                                    currentUserProfile?.full_name?.charAt(0) || 'U'
                                )}
                            </div>
                            <h4 className="text-sm font-bold text-[#1B263B] line-clamp-1">{currentUserProfile?.full_name || 'Usuário'}</h4>
                            <span className="text-[10px] font-medium text-slate-500 uppercase tracking-widest mt-1">{currentUserProfile?.role || 'Acesso'}</span>
                        </div>
                    </div>

                    <Link href="/" className="flex items-center gap-3 mb-8 group px-4">
                        <div className="h-8 w-8 bg-slate-100 rounded-lg flex items-center justify-center group-hover:bg-[#10b981]/10 transition-colors">
                            <Building2 className="h-4 w-4 text-slate-500 group-hover:text-[#10b981]" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400 group-hover:text-[#1B263B] transition-colors">Acessar Site Principal</span>
                        </div>
                    </Link>

                    <nav className="space-y-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 ml-4">Menu Principal</p>
                        {dynamicMenuItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => {
                                    setCurrentTab(item.id as Tab);
                                    setIsSidebarOpen(false);
                                    router.push(`/admin?tab=${item.id}`, { scroll: false });
                                }}

                                className={clsx(
                                    "w-full flex items-center gap-4 p-3 rounded-xl transition-all duration-300 group",
                                    currentTab === item.id
                                        ? "bg-emerald-50 text-emerald-700 font-bold"
                                        : "hover:bg-slate-50 text-slate-500 hover:text-slate-800"
                                )}
                            >
                                <item.icon className={clsx("h-5 w-5", currentTab === item.id ? "text-emerald-600" : "text-slate-400 group-hover:text-slate-600")} />
                                <span className={clsx("text-sm", currentTab === item.id ? "font-bold" : "font-medium")}>{item.label}</span>
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="mt-auto p-6 space-y-2 border-t border-slate-100">
                    <button
                        onClick={() => {
                            setCurrentTab('perfil');
                            setIsSidebarOpen(false);
                            router.push(`/admin?tab=perfil`, { scroll: false });
                        }}
                        className={clsx(
                            "w-full flex items-center gap-4 p-3 rounded-xl transition-all group",
                            currentTab === 'perfil' ? "bg-slate-100 text-[#1B263B] font-bold" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                        )}
                    >
                        <User className="h-5 w-5" />
                        <span className="text-sm font-medium">Meu Perfil</span>
                    </button>

                    <button
                        onClick={() => {
                            handleSignOut();
                            setIsSidebarOpen(false);
                        }}
                        className="w-full flex items-center gap-4 p-3 rounded-xl text-red-500 hover:bg-red-50 transition-all group"
                    >
                        <LogOut className="h-5 w-5 border-transparent" />
                        <span className="text-sm font-medium">Encerrar Sessão</span>
                    </button>
                </div>
            </aside>

            {/* Content Area */}
            <main className="flex-1 flex flex-col min-h-[calc(100vh-80px)] lg:min-h-screen">
                {/* Header Desktop */}
                <header className={clsx(
                    "hidden lg:flex h-24 border-b items-center justify-between px-12 sticky top-0 z-40 transition-all",
                    isDarkMode ? "bg-[#0b1120]/80 backdrop-blur-xl border-slate-800" : "bg-white border-slate-100"
                )}>
                    <div className="flex-1 max-w-xl">
                        <AdminSearchBar />
                    </div>

                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-4">
                            <button 
                                onClick={() => setIsDarkMode(!isDarkMode)}
                                className={clsx(
                                    "h-12 w-12 rounded-2xl flex items-center justify-center transition-all group",
                                    isDarkMode ? "bg-slate-800 text-yellow-400" : "bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-indigo-600"
                                )}
                                title={isDarkMode ? "Modo Claro" : "Modo Escuro"}
                            >
                                {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                            </button>
                            <button 
                                onClick={() => setCurrentTab('crm')}
                                className={clsx(
                                    "h-12 w-12 rounded-2xl flex items-center justify-center relative transition-colors group",
                                    isDarkMode ? "bg-slate-800 text-slate-300" : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                                )}
                            >
                                <Bell className="h-5 w-5 group-hover:text-[#1B263B]" />
                                {newLeadsCount > 0 && (
                                    <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 border-2 border-white rounded-full flex items-center justify-center text-[10px] text-white font-black animate-in zoom-in duration-300">
                                        {newLeadsCount}
                                    </span>
                                )}
                            </button>
                            <button 
                                onClick={() => setCurrentTab('smart-leads')}
                                className={clsx(
                                    "h-12 w-12 rounded-2xl flex items-center justify-center relative transition-colors group",
                                    isDarkMode ? "bg-slate-800 text-slate-300" : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                                )}
                            >
                                <MessageSquare className="h-5 w-5 group-hover:text-[#1B263B]" />
                                {newChatLeadsCount > 0 && (
                                    <span className="absolute -top-1 -right-1 h-5 w-5 bg-[#10b981] border-2 border-white rounded-full flex items-center justify-center text-[10px] text-white font-black animate-in zoom-in duration-300">
                                        {newChatLeadsCount}
                                    </span>
                                )}
                            </button>
                        </div>
                        <div className="h-8 w-px bg-slate-100" />
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
                </header>

                <div className="p-8 md:p-12 space-y-8">
                    {/* Welcome Section */}
                    <div className="flex justify-between items-end">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight capitalize text-slate-800">{currentTab.replace('overview', 'Dashboard').replace('-', ' ')}</h1>
                            <p className="text-slate-500 font-medium text-sm mt-1">Central de Operações K&F Administradora</p>
                        </div>
                        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
                        </div>
                    </div>

                    {currentTab === 'overview' && (
                        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
                            {/* KPI Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {[
                                    { label: 'Receita Mensal', value: `R$ ${stats.monthlyRevenue.toLocaleString('pt-BR')}`, sub: '+12.5% vs. mês passado', icon: DollarSign },
                                    { label: 'Total de Leads', value: stats.totalLeads.toString(), sub: '+5 novos hoje', icon: UserPlus },
                                    { label: 'Imóveis Ativos', value: stats.totalProperties.toString(), sub: 'No banco de dados', icon: Building2 },
                                    { label: 'Conversão', value: `${stats.conversionRate}%`, sub: '-2% vs. semana passada', icon: TrendingUp },
                                ].map((stat, i) => (
                                    <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-emerald-50 transition-colors">
                                                <stat.icon className="h-5 w-5 text-slate-400 group-hover:text-emerald-500" />
                                            </div>
                                            <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                                        </div>
                                        <h4 className="text-2xl font-bold tracking-tight text-slate-800 mb-2">{stat.value}</h4>
                                        <p className="text-xs font-medium text-emerald-600 flex items-center gap-1">
                                            {stat.sub.includes('+') ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3 text-red-500" />}
                                            <span className={stat.sub.includes('-') ? 'text-red-500' : ''}>{stat.sub}</span>
                                        </p>
                                    </div>
                                ))}
                            </div>

                            {/* Main Grid: Performance & Real-time Active */}
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                                <div className="lg:col-span-8 bg-white p-10 rounded-[50px] border border-slate-100 shadow-sm space-y-10">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-xl font-black tracking-tighter uppercase flex items-center gap-3">
                                            <BarChart3 className="h-5 w-5 text-[#10b981]" /> Performance de Vendas & Locação
                                        </h3>
                                        <div className="flex gap-2">
                                            {['6M', '3M', '1M'].map(t => (
                                                <button key={t} className="px-3 py-1 text-[11px] font-black uppercase rounded-lg bg-slate-50 text-slate-400 hover:bg-[#1B263B] hover:text-white transition-all">{t}</button>
                                            ))}
                                        </div>
                                    </div>
                                    {/* SVG Area Chart Placeholder */}
                                    <div className="h-80 w-full bg-slate-50 rounded-[35px] relative overflow-hidden group">
                                        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#10b981]/5 to-transparent" />
                                    </div>
                                </div>

                                <div className="lg:col-span-4 space-y-10">
                                    {/* Agenda de Visitas Card */}
                                    {visits.filter(v => v.status === 'agendado').length > 0 && (
                                        <div className="bg-[#1B263B] p-10 rounded-[50px] shadow-2xl relative overflow-hidden group min-h-[400px]">
                                            <div className="absolute top-0 right-0 w-64 h-64 bg-[#10b981]/10 blur-[80px] group-hover:bg-[#10b981]/20 transition-all duration-1000" />
                                            <div className="relative z-10 space-y-8">
                                                <div className="flex items-center justify-between">
                                                    <h3 className="text-xl font-black text-white tracking-tighter uppercase flex items-center gap-3">
                                                        <Calendar className="h-5 w-5 text-[#10b981]" /> Agenda de Hoje
                                                    </h3>
                                                    <span className="bg-[#10b981] text-white text-[9px] font-black px-3 py-1 rounded-lg uppercase">{visits.filter(v => v.status === 'agendado').length} Visitas</span>
                                                </div>
                                                <div className="space-y-4">
                                                    {visits.filter(v => v.status === 'agendado').slice(0, 3).map((v, i) => (
                                                        <div key={i} onClick={() => setCurrentTab('agenda')} className="bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-white/10 hover:bg-white/10 transition-all cursor-pointer">
                                                            <div className="flex justify-between items-start mb-2">
                                                                <p className="text-sm font-black text-white uppercase tracking-tight">{v.client_name}</p>
                                                                <span className="text-[10px] font-black text-[#10b981]">{v.visit_time.slice(0, 5)}h</span>
                                                            </div>
                                                            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest leading-relaxed">
                                                                {v.property_ids?.length || 0} Imóveis selecionados
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                                <button 
                                                    onClick={() => setCurrentTab('agenda')}
                                                    className="w-full py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/10 transition-all"
                                                >
                                                    Ver Agenda Completa
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    <h3 className="text-xl font-black tracking-tighter uppercase">Atividades Recentes</h3>
                                    <div className="space-y-6">
                                        {activities.map((activity, i) => (
                                            <div key={i} onClick={() => setCurrentTab('crm')} className="flex gap-5 group cursor-pointer hover:bg-slate-50 p-2 rounded-2xl transition-all">
                                                <div className="h-10 w-10 min-w-[40px] rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 group-hover:border-[#10b981] group-hover:text-[#10b981] transition-all shadow-sm">
                                                    <activity.icon className="h-4 w-4" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[12px] font-black uppercase tracking-widest text-[#1B263B] group-hover:text-[#10b981] transition-colors">{activity.type}</span>
                                                    <p className="text-sm font-bold text-slate-500 line-clamp-1 group-hover:text-slate-700">{activity.msg}</p>
                                                    <span className="text-[11px] font-bold text-slate-300 italic">{activity.time}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="bg-[#1B263B] p-10 rounded-[45px] shadow-2xl relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#10b981]/20 blur-[60px]" />
                                        <PieChart className="h-8 w-8 text-[#10b981] mb-6" />
                                        <h4 className="text-white text-lg font-black leading-tight mb-4">Seu portfólio cresceu 40% este ano.</h4>
                                        <button className="text-[12px] font-black text-[#10b981] uppercase tracking-[0.2em] flex items-center gap-2 hover:translate-x-2 transition-transform">Ver Relatório Anual <ArrowUpRight className="h-4 w-4" /></button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {currentTab === 'imoveis' && (
                        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
                            {/* Header do Tab de Imóveis */}
                            <div className="flex flex-col md:flex-row justify-between items-center md:items-end gap-6 pb-6 border-b border-slate-100 mb-8">
                                <div>
                                    <h3 className="text-3xl font-black tracking-tighter uppercase flex items-center gap-4 text-[#1B263B]">
                                        <div className="h-12 w-12 rounded-2xl bg-[#10b981]/10 flex items-center justify-center">
                                            <Building2 className="h-6 w-6 text-[#10b981]" />
                                        </div>
                                        Gestão de Catálogo
                                    </h3>
                                    <p className="text-[12px] font-bold text-slate-400 uppercase tracking-[0.4em] mt-3 ml-16">Gerenciamento completo de imóveis ativos</p>
                                </div>
                                
                                <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
                                    <div className="relative w-full md:w-80 group">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-[#10b981] transition-colors" />
                                        <input 
                                            type="text"
                                            placeholder="Buscar por Ref, Título ou Bairro..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full bg-white border border-slate-100 pl-12 pr-4 py-4 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-[#10b981]/10 transition-all placeholder:text-slate-300"
                                        />
                                    </div>
                                    <Link href="/admin/imoveis/novo" className="w-full md:w-auto">
                                        <button className="w-full bg-[#1B263B] text-white px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-[#1B263B]/20 hover:bg-[#10b981] hover:scale-105 transition-all flex items-center justify-center gap-3">
                                            <Plus className="h-4 w-4" /> Cadastrar Imóvel
                                        </button>
                                    </Link>
                                </div>
                            </div>

                            {/* Property Grid (Boxes) */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                                {filteredProperties.length > 0 ? filteredProperties.map((item, i) => (
                                    <div key={i} className="bg-white rounded-[40px] overflow-hidden group border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 flex flex-col">
                                        <div className="h-56 overflow-hidden relative">
                                            <img src={item.images?.[0] || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa'} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-1000" alt="" />
                                            <div className="absolute top-4 left-4 flex flex-col gap-2">
                                                <span className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl font-black text-[10px] uppercase tracking-widest text-[#1B263B] shadow-sm border border-white/20">Ref: {item.reference_id}</span>
                                                <span className={clsx(
                                                    "px-3 py-1.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-sm border border-white/20",
                                                    item.status === 'disponivel' ? "bg-emerald-500 text-white" : "bg-slate-500 text-white"
                                                )}>{item.status}</span>
                                            </div>
                                            <div className="absolute bottom-4 right-4 flex gap-2">
                                                {/* Removed action buttons from here to place them outside */}
                                            </div>
                                        </div>
                                        <div className="p-6 flex-1 flex flex-col">
                                            <div className="flex-1 space-y-3">
                                                <div className="flex items-center gap-1 text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">
                                                    <MapPin className="h-3 w-3 text-[#10b981]" /> {item.neighborhood}
                                                </div>
                                                <h4 className="text-lg font-black text-[#1B263B] leading-tight group-hover:text-[#10b981] transition-colors">{item.title}</h4>
                                                <p className="text-2xl font-black text-[#1B263B] tracking-tighter">
                                                    {item.price?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                                </p>
                                                           <div className="pt-6 mt-6 border-t border-slate-50 grid grid-cols-2 gap-2">
                                                <div className="flex flex-col items-center gap-1 bg-slate-50/50 p-2 rounded-2xl">
                                                    <Bed className="h-4 w-4 text-slate-300" />
                                                    <span className="text-[10px] font-black text-[#1B263B]">{item.rooms} Dorm</span>
                                                </div>
                                                <div className="flex flex-col items-center gap-1 bg-slate-50/50 p-2 rounded-2xl">
                                                    <BedDouble className="h-4 w-4 text-slate-300" />
                                                    <span className="text-[10px] font-black text-[#1B263B]">{item.suites} Suíte</span>
                                                </div>
                                                <div className="flex flex-col items-center gap-1 bg-slate-50/50 p-2 rounded-2xl">
                                                    <Bath className="h-4 w-4 text-slate-300" />
                                                    <span className="text-[10px] font-black text-[#1B263B]">{item.bathrooms} WC</span>
                                                </div>
                                                <div className="flex flex-col items-center gap-1 bg-slate-50/50 p-2 rounded-2xl">
                                                    <Maximize2 className="h-4 w-4 text-slate-300" />
                                                    <span className="text-[10px] font-black text-[#1B263B]">{item.area}m²</span>
                                                </div>
                                            </div>
                               </div>
                                            <div className="pt-4 mt-4 border-t border-slate-50 flex items-center gap-2">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => setSelectedProperty(item)}
                                                        className="h-10 w-10 rounded-xl bg-slate-50 text-[#1B263B] hover:bg-[#10b981] hover:text-white transition-all flex items-center justify-center border border-slate-100"
                                                        title="Visualizar"
                                                    >
                                                        <Search className="h-4 w-4" />
                                                    </button>
                                                    <Link href={`/admin/imoveis/editar/${item.id}`}>
                                                        <button className="h-10 w-10 rounded-xl bg-slate-50 text-[#1B263B] hover:bg-[#10b981] hover:text-white transition-all flex items-center justify-center border border-slate-100" title="Editar">
                                                            <Edit2 className="h-4 w-4" />
                                                        </button>
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDeleteProperty(item.id)}
                                                        disabled={isDeleting === item.id}
                                                        className="h-10 w-10 rounded-xl bg-slate-50 text-[#1B263B] hover:bg-red-500 hover:text-white transition-all flex items-center justify-center border border-slate-100 disabled:opacity-50"
                                                        title="Excluir"
                                                    >
                                                        {isDeleting === item.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                                    </button>
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        const url = `${window.location.origin}/imovel/${item.slug}`;
                                                        const message = `Confira este imóvel: ${item.title} - ${url}`;
                                                        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
                                                    }}
                                                    className="flex-1 flex items-center justify-center gap-2 bg-[#F2FBF9] text-[#10b981] h-10 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-[#10b981] hover:text-white transition-all border border-[#10b981]/10 group/share"
                                                >
                                                    <MessageSquare className="h-3.5 w-3.5 fill-current" /> Compartilhar
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="col-span-full py-20 text-center bg-white rounded-[50px] border border-dashed border-slate-100">
                                        <Building2 className="h-16 w-16 text-slate-100 mx-auto mb-6" />
                                        <p className="text-sm font-black text-slate-300 uppercase tracking-widest">Nenhum imóvel encontrado</p>
                                        <button onClick={() => setSearchTerm('')} className="mt-4 text-[#10b981] font-black text-[10px] uppercase tracking-widest">Limpar busca</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {currentTab === 'agenda' && (
                        <VisitsManagement 
                            properties={properties}
                            leads={leads}
                            chatLeads={chatLeads}
                            visits={visits}
                            onRefresh={() => window.location.reload()}
                            currentUserProfile={currentUserProfile}
                        />
                    )}

                    {currentTab === 'blog' && <BlogSection posts={posts} setPosts={setPosts} />}
                    {currentTab === 'marketing' && <MarketingSection properties={properties} />}
                    {currentTab === 'integracao' && <IntegracaoSection properties={properties} />}
                    {currentTab === 'smart-leads' && <SmartLeadsSection />}

                    {currentTab === 'documentos' && (
                        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-2 space-y-8">
                                    <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
                                        <h3 className="text-xl font-black tracking-tighter uppercase mb-8">Arquivos Recentes</h3>
                                        <div className="space-y-4">
                                            {documents.length > 0 ? documents.map((doc, i) => (
                                                <div key={i} className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 group">
                                                    <div className="flex items-center gap-4">
                                                        <div className="h-12 w-12 rounded-xl bg-[#10b981]/10 flex items-center justify-center">
                                                            <FileText className="h-6 w-6 text-[#10b981]" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-black text-[#1B263B]">{doc.file_name}</p>
                                                            <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">{doc.file_type || 'Geral'}</p>
                                                        </div>
                                                    </div>
                                                    <button className="h-10 w-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-[#10b981] shadow-sm transform group-hover:scale-110 transition-all">
                                                        <Download className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            )) : (
                                                <div className="py-12 text-center">
                                                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Nenhum documento encontrado</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    <div className="bg-[#1B263B] p-10 rounded-[50px] shadow-2xl space-y-8">
                                        <div className="h-16 w-16 rounded-2xl bg-[#10b981]/20 flex items-center justify-center">
                                            <Plus className="h-8 w-8 text-[#10b981]" />
                                        </div>
                                        <div>
                                            <h4 className="text-white text-xl font-black tracking-tighter uppercase mb-2">Upload de Arquivos</h4>
                                            <p className="text-white/40 text-[12px] font-bold uppercase tracking-widest leading-relaxed">Arraste contratos, certidões ou documentos dos proprietários para arquivamento digital seguro.</p>
                                        </div>
                                        <div className="p-8 border-2 border-dashed border-white/10 rounded-3xl text-center hover:border-[#10b981]/40 transition-colors cursor-pointer group">
                                            <Download className="h-8 w-8 text-white/10 mx-auto mb-4 group-hover:text-[#10b981] transition-all" />
                                            <p className="text-[11px] font-black text-white/40 uppercase tracking-widest">Clique ou arraste aqui</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {currentTab === 'config' && currentUserProfile?.role === 'admin' && (
                        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
                             {/* Sub-tabs de Configuração */}
                             <div className="flex flex-wrap gap-4 border-b border-slate-100 pb-8">
                                {[
                                    { id: 'visual', label: 'Marca e Estilo', icon: Palette },
                                    { id: 'home', label: 'Layout da Home', icon: Layout },
                                    { id: 'contatos', label: 'Canais de Contato', icon: MessageSquare },
                                    { id: 'sobre', label: 'Sobre Nós', icon: Info },
                                    { id: 'features', label: 'Características', icon: List },
                                    { id: 'specs', label: 'Atributos principais', icon: Star },
                                    { id: 'chat_ai', label: 'Config. Chat IA', icon: Zap },
                                    { id: 'master', label: 'Gestão de Acesso', icon: ShieldCheck },
                                    { id: 'sede', label: 'Sede e Mapas', icon: MapPin },
                                    { id: 'bairros', label: 'Cidades e Bairros', icon: MapPin }
                                ].map(st => (
                                    <button
                                        key={st.id}
                                        onClick={() => setConfigTab(st.id as any)}
                                        className={clsx(
                                            "flex items-center gap-3 px-6 py-3 rounded-2xl font-bold text-[12px] uppercase tracking-widest transition-all",
                                            configTab === st.id ? "bg-[#1B263B] text-white shadow-xl" : "bg-white text-slate-400 border border-slate-100 hover:border-[#1B263B] hover:text-[#1B263B]"
                                        )}
                                    >
                                        <st.icon className="h-4 w-4" />
                                        {st.label}
                                    </button>
                                ))}
                            </div>

                            <div className="mt-8">
                                {configTab === 'visual' && <ThemeConfigSection />}
                                {configTab === 'home' && (
                                    <div className="space-y-12">
                                        <HomeConfigSection />
                                        <HomeSettingsSection />
                                    </div>
                                )}
                                {configTab === 'contatos' && <ContactSettingsSection />}
                                {configTab === 'features' && <FeaturesConfigSection />}
                                {configTab === 'specs' && <SpecsConfigSection />}
                                {configTab === 'sede' && <HQConfigSection />}
                                {configTab === 'sobre' && <AboutConfigSection />}
                                {configTab === 'bairros' && <LocationsConfigSection />}
                                {configTab === 'chat_ai' && <ChatAIConfigSection />}
                                {configTab === 'master' && (
                                    <div className="space-y-12">
                                        <div className="bg-white p-12 rounded-[50px] border border-slate-100 shadow-sm">
                                            <header className="flex justify-between items-center mb-12">
                                                <div>
                                                    <h3 className="text-3xl font-black text-[#1B263B] tracking-tighter uppercase mb-2">Gestão de Acesso</h3>
                                                    <p className="text-slate-400 font-bold text-[12px] uppercase tracking-widest">Controle total sobre corretores e permissões do sistema</p>
                                                </div>
                                                <div className="h-14 w-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                                                    <ShieldCheck className="h-6 w-6 text-[#10b981]" />
                                                </div>
                                            </header>

                                            <div className="space-y-4">
                                                <div className="grid grid-cols-12 px-8 py-4 bg-slate-50 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6">
                                                    <div className="col-span-4">Usuário / Corretor</div>
                                                    <div className="col-span-3 text-center">Nível de Acesso</div>
                                                    <div className="col-span-2 text-center">Status</div>
                                                    <div className="col-span-3 text-right">Ações Rápidas</div>
                                                </div>

                                                {users.map((u, i) => (
                                                    <div key={i} className="grid grid-cols-12 items-center px-8 py-6 rounded-3xl border border-transparent hover:border-slate-100 hover:bg-slate-50/50 transition-all group">
                                                        <div className="col-span-4 flex items-center gap-4">
                                                            <div className="h-12 w-12 rounded-2xl bg-[#1B263B] text-white flex items-center justify-center font-black group-hover:scale-110 transition-transform overflow-hidden">
                                                                {u.avatar_url ? (
                                                                    <img src={u.avatar_url} className="h-full w-full object-cover" alt="" />
                                                                ) : (
                                                                    u.full_name?.charAt(0) || 'U'
                                                                )}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-black text-[#1B263B] flex items-center gap-2">
                                                                    {u.full_name}
                                                                    {u.role === 'corretor' && <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" title="Corretor Ativo" />}
                                                                    {u.email === 'augustocalado@hotmail.com' && <span title="Master Admin"><ShieldCheck className="h-4 w-4 text-amber-500" /></span>}
                                                                </p>
                                                                <p className="text-[12px] font-bold text-slate-400 lowercase">{u.email}</p>
                                                            </div>
                                                        </div>

                                                        <div className="col-span-3 flex justify-center">
                                                            <select
                                                                disabled={u.email === 'augustocalado@hotmail.com' || (u.role === 'admin' && currentUserProfile?.id !== u.id)}
                                                                value={u.role}
                                                                onChange={async (e) => {
                                                                    const { error } = await supabase.from('profiles').update({ role: e.target.value }).eq('id', u.id);
                                                                    if (!error) {
                                                                        const newUsers = users.map(user => user.id === u.id ? { ...user, role: e.target.value } : user);
                                                                        setUsers(newUsers);
                                                                    }
                                                                }}
                                                                className="bg-white border border-slate-100 px-4 py-2 rounded-xl font-bold text-[12px] uppercase tracking-widest text-[#1B263B] outline-none focus:ring-2 focus:ring-[#10b981]/20 appearance-none cursor-pointer disabled:opacity-50"
                                                            >
                                                                <option value="cliente">Cliente</option>
                                                                <option value="corretor">Corretor</option>
                                                                <option value="admin">Administrador</option>
                                                            </select>
                                                        </div>

                                                        <div className="col-span-2 flex justify-center">
                                                            <div className={clsx(
                                                                "px-4 py-1.5 rounded-full text-[12px] font-black uppercase tracking-widest",
                                                                u.is_approved ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-red-50 text-red-600 border border-red-100"
                                                            )}>
                                                                {u.is_approved ? 'Ativo' : 'Pendente'}
                                                            </div>
                                                        </div>

                                                        <div className="col-span-3 flex justify-end gap-2 px-4 transition-opacity">
                                                            <button
                                                                onClick={() => setEditingUser(u)}
                                                                className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all shadow-sm border border-indigo-100"
                                                                title="Editar Usuário"
                                                            >
                                                                <Edit2 className="h-4 w-4" />
                                                            </button>
                                                            {!u.is_approved && (
                                                                <button
                                                                    onClick={async () => {
                                                                        const { error } = await supabase.from('profiles').update({ is_approved: true }).eq('id', u.id);
                                                                        if (!error) setUsers(users.map(user => user.id === u.id ? { ...user, is_approved: true } : user));
                                                                    }}
                                                                    className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all shadow-sm border border-emerald-100"
                                                                    title="Aprovar Usuário"
                                                                >
                                                                    <ShieldCheck className="h-4 w-4" />
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={async () => {
                                                                    if (u.id === currentUserProfile?.id) {
                                                                        alert('Você não pode excluir seu próprio perfil administrativo!');
                                                                        return;
                                                                    }
                                                                    if (u.email === 'augustocalado@hotmail.com') {
                                                                        alert('Este usuário é o Master Supremo e não pode ser excluído do sistema.');
                                                                        return;
                                                                    }
                                                                    if (confirm(`Deseja realmente excluir permanentemente o perfil de ${u.full_name}?`)) {
                                                                        const { error } = await supabase.from('profiles').delete().eq('id', u.id);
                                                                        if (!error) {
                                                                            setUsers(users.filter(user => user.id !== u.id));
                                                                        } else {
                                                                            alert('Erro ao excluir: ' + error.message);
                                                                        }
                                                                    }
                                                                }}
                                                                className={clsx(
                                                                    "h-10 w-10 rounded-xl flex items-center justify-center transition-all border shadow-sm",
                                                                    u.email === 'augustocalado@hotmail.com'
                                                                        ? "bg-slate-50 text-slate-200 border-slate-100 cursor-not-allowed"
                                                                        : "bg-red-50 text-red-600 border-red-100 hover:bg-red-600 hover:text-white"
                                                                )}
                                                                title={u.email === 'augustocalado@hotmail.com' ? "Proibido excluir master" : "Excluir Usuário"}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="bg-primary-900 p-12 rounded-[50px] border border-white/5 shadow-2xl relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 w-80 h-80 bg-accent/20 blur-[120px] -z-10 group-hover:bg-accent/30 transition-all duration-1000" />
                                            <header className="flex justify-between items-center mb-8 relative z-10">
                                                <div className="space-y-2">
                                                    <div className="inline-flex items-center gap-2 bg-accent/20 border border-white/10 text-white px-4 py-1.5 rounded-full font-bold text-[10px] uppercase tracking-widest mb-2">
                                                        <Info className="h-3.5 w-3.5 text-accent" /> Gestão de Acesso
                                                    </div>
                                                    <h3 className="text-3xl font-black text-white tracking-tighter uppercase mb-1">Como adicionar um Corretor?</h3>
                                                    <p className="text-primary-200 font-bold text-sm max-w-xl">
                                                        Para garantir a segurança e vinculação correta ao sistema, os corretores devem realizar o cadastro por conta própria utilizando a página pública.
                                                    </p>
                                                </div>
                                                <div className="h-16 w-16 rounded-[28px] bg-white/5 flex items-center justify-center border border-white/10 shadow-inner">
                                                    <UserPlus className="h-7 w-7 text-accent" />
                                                </div>
                                            </header>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10 pt-4 border-t border-white/5 mt-4">
                                                <div className="space-y-4">
                                                    <div className="h-10 w-10 rounded-2xl bg-accent text-white flex items-center justify-center font-black text-sm">01</div>
                                                    <p className="text-white font-black text-[12px] uppercase tracking-widest">Link de Cadastro</p>
                                                    <p className="text-primary-300/60 text-[12px] font-bold leading-relaxed">Envie o link do site: <br /><span className="text-accent underline text-left">/cadastro</span> para o seu corretor.</p>
                                                </div>
                                                <div className="space-y-4">
                                                    <div className="h-10 w-10 rounded-2xl bg-accent text-white flex items-center justify-center font-black text-sm">02</div>
                                                    <p className="text-white font-black text-[12px] uppercase tracking-widest">Preenchimento</p>
                                                    <p className="text-primary-300/60 text-[12px] font-bold leading-relaxed">O corretor preenche os dados e anexa sua foto profissional obrigatória.</p>
                                                </div>
                                                <div className="space-y-4">
                                                    <div className="h-10 w-10 rounded-2xl bg-accent text-white flex items-center justify-center font-black text-sm">03</div>
                                                    <p className="text-white font-black text-[12px] uppercase tracking-widest">Aprovação</p>
                                                    <p className="text-primary-300/60 text-[12px] font-bold leading-relaxed">Você receberá a solicitação aqui e poderá aprová-la clicando em "Aprovar".</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <SystemToolsSection />
                        </div>
                    )}

                    {currentTab === 'crm' && (
                        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
                            {/* CRM Imobisis Value Proposition */}
                            <div className="bg-[#1B263B] p-12 rounded-[50px] shadow-2xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-80 h-80 bg-[#10b981]/20 blur-[120px] -z-10 group-hover:bg-[#10b981]/30 transition-all duration-1000" />
                                <div className="max-w-5xl relative z-10">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="h-12 w-12 rounded-2xl bg-[#10b981] flex items-center justify-center shadow-lg shadow-[#10b981]/20">
                                            <ShieldCheck className="h-6 w-6 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-3xl font-black text-white tracking-tighter uppercase italic">CRM <span className="text-[#10b981]">KF IMOVEIS</span></h3>
                                            <p className="text-[#10b981] font-black text-[11px] uppercase tracking-[0.4em]">Solução Integrada de Gestão</p>
                                        </div>
                                    </div>

                                    <p className="text-white/70 font-bold text-sm tracking-tight leading-relaxed mb-12 max-w-2xl">
                                        Eleve o patamar do seu atendimento, garantindo que nenhuma oportunidade passe despercebida.
                                        Com uma interface intuitiva, você organiza sua rotina e foca no que realmente traz resultado: <span className="text-white border-b-2 border-[#10b981]">o fechamento</span>.
                                    </p>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                        {[
                                            { title: 'Alertas de Leads', desc: 'Saiba instantaneamente no WhatsApp quando um novo lead chega ou um cliente volta ao site.', icon: Bell, color: 'text-emerald-400' },
                                            { title: 'Funil com Lembretes', desc: 'Visualize negociações e receba avisos automáticos via WhatsApp para follow-ups.', icon: Filter, color: 'text-blue-400' },
                                            { title: 'Envio em Um Clique', desc: 'Compartilhe imóveis pelo WhatsApp de maneira rápida, profissional e personalizada.', icon: MessageSquare, color: 'text-indigo-400' },
                                            { title: 'Agenda Inteligente', desc: 'Centralize compromissos, elimine o retrabalho e mantenha sua rotina organizada.', icon: Calendar, color: 'text-amber-400' }
                                        ].map((benefit, i) => (
                                            <div key={i} className="bg-white/5 border border-white/10 p-8 rounded-[35px] hover:bg-white/10 transition-all hover:-translate-y-1">
                                                <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6">
                                                    <benefit.icon className={`h-6 w-6 ${benefit.color}`} />
                                                </div>
                                                <h4 className="text-white text-sm font-black uppercase tracking-widest mb-3 leading-tight">{benefit.title}</h4>
                                                <p className="text-white/40 text-[12px] font-bold leading-relaxed">{benefit.desc}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-2 rounded-[50px] border border-slate-100 shadow-sm overflow-hidden">
                                <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-xl bg-[#10b981] text-white flex items-center justify-center">
                                            <Users className="h-5 w-5" />
                                        </div>
                                        <h4 className="text-xl font-black tracking-tighter uppercase">Gestão de Leads</h4>
                                    </div>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="bg-slate-50/50">
                                                <th className="px-10 py-6 text-[12px] font-black text-slate-400 uppercase tracking-widest">Data</th>
                                                <th className="px-10 py-6 text-[12px] font-black text-slate-400 uppercase tracking-widest">Cliente</th>
                                                <th className="px-10 py-6 text-[12px] font-black text-slate-400 uppercase tracking-widest">Imóvel de Interesse</th>
                                                <th className="px-10 py-6 text-[12px] font-black text-slate-400 uppercase tracking-widest text-center">Corretor</th>
                                                <th className="px-10 py-6 text-[12px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                                                <th className="px-10 py-6 text-[12px] font-black text-slate-400 uppercase tracking-widest text-right">Ação</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {leads.map((lead, i) => (
                                                <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                                                    <td className="px-10 py-8 text-[12px] font-bold text-slate-400">
                                                        {new Date(lead.created_at).toLocaleDateString('pt-BR')}
                                                    </td>
                                                    <td className="px-10 py-8">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-10 w-10 rounded-xl bg-[#1B263B] text-white flex items-center justify-center font-black">
                                                                {(lead.name || lead.profiles?.full_name || 'U').charAt(0).toUpperCase()}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-black text-[#1B263B]">{lead.name || lead.profiles?.full_name || 'Interessado Desconhecido'}</p>
                                                                <p className="text-[12px] font-bold text-slate-400 tracking-widest mt-1 mb-2">{lead.customer_whatsapp || 'Sem número / Via Sistema'}</p>
                                                                {lead.message && (
                                                                    <p className="text-[12px] text-slate-500 italic max-w-[200px] truncate" title={lead.message}>
                                                                        "{lead.message}"
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-10 py-8">
                                                        <p className="text-sm font-black text-[#1B263B]">{lead.properties?.title || 'Interesse Geral / Site'}</p>
                                                        <p className="text-[11px] font-bold text-slate-400">Ref: {lead.properties?.reference_id || 'N/A'}</p>
                                                    </td>
                                                    <td className="px-10 py-8 text-center text-sm font-bold text-slate-400 uppercase">
                                                        {lead.profiles?.full_name || 'Autônomo'}
                                                    </td>
                                                    <td className="px-10 py-8 text-center">
                                                        <span className="px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-100">
                                                            {lead.status || 'Novo'}
                                                        </span>
                                                    </td>
                                                    <td className="px-10 py-8 text-right flex items-center justify-end gap-3">
                                                        {lead.customer_whatsapp && lead.customer_whatsapp.replace(/\D/g, '').length >= 10 ? (
                                                            <a
                                                                href={`https://wa.me/55${lead.customer_whatsapp.replace(/\D/g, '')}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="h-10 w-10 rounded-xl bg-[#10b981] text-white flex items-center justify-center hover:scale-110 transition-all shadow-lg shadow-[#10b981]/20"
                                                                title="Chamar no WhatsApp"
                                                            >
                                                                <MessageSquare className="h-4 w-4" />
                                                            </a>
                                                        ) : (
                                                            <div className="h-10 w-10 rounded-xl bg-slate-100 text-slate-300 flex items-center justify-center border border-slate-200 cursor-not-allowed" title="Sem WhatsApp Válido">
                                                                <MessageSquare className="h-4 w-4" />
                                                            </div>
                                                        )}
                                                        <button
                                                            onClick={async () => {
                                                                const newStatus = prompt('Novo status do lead:', lead.status || 'Novo');
                                                                if (newStatus) {
                                                                    const { error } = await supabase.from('leads').update({ status: newStatus }).eq('id', lead.id);
                                                                    if (!error) {
                                                                        setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, status: newStatus } : l));
                                                                    }
                                                                }
                                                            }}
                                                            className="h-10 w-10 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center hover:bg-amber-50 hover:text-amber-500 transition-all border border-slate-200"
                                                            title="Editar Status"
                                                        >
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setSelectedLeadForTermo(lead);
                                                                setIsTermoModalOpen(true);
                                                            }}
                                                            className="h-10 w-10 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center hover:bg-[#10b981] hover:text-white transition-all border border-slate-200"
                                                            title="Gerar Termo de Visita"
                                                        >
                                                            <FileText className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={async () => {
                                                                if (currentUserProfile?.role === 'admin') {
                                                                    if (confirm('Deseja realmente excluir este lead permanentemente do sistema?')) {
                                                                        const { error } = await supabase.from('leads').delete().eq('id', lead.id);
                                                                        if (!error) {
                                                                            setLeads(prev => prev.filter(l => l.id !== lead.id));
                                                                            fireToast('Lead excluído permanentemente!');
                                                                        } else {
                                                                            fireToast('Erro ao excluir: ' + error.message, 'error');
                                                                        }
                                                                    }
                                                                } else {
                                                                    if (confirm('Deseja remover este lead da sua visualização? (Ele permanecerá no sistema mestre)')) {
                                                                        const { error } = await supabase.from('leads').update({ status: 'arquivado' }).eq('id', lead.id);
                                                                        if (!error) {
                                                                            setLeads(prev => prev.filter(l => l.id !== lead.id));
                                                                            fireToast('Lead arquivado com sucesso!');
                                                                        } else {
                                                                            fireToast('Erro ao arquivar: ' + error.message, 'error');
                                                                        }
                                                                    }
                                                                }
                                                            }}
                                                            className="h-10 w-10 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all border border-slate-200"
                                                            title={currentUserProfile?.role === 'admin' ? "Excluir Lead Permanentemente" : "Remover Lead (Arquivar)"}
                                                        >
                                                            <XCircle className="h-4 w-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {leads.length === 0 && (
                                        <div className="py-20 text-center">
                                            <p className="text-sm font-bold text-slate-300 uppercase tracking-widest">Nenhum lead capturado ainda</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {currentTab === 'parceiros' && <PartnersSection />}
                    {currentTab === 'perfil' && <ProfileSection profile={currentUserProfile} setProfile={setCurrentUserProfile} />}


                    {currentTab === 'agenda' && (
                        <div className="bg-white p-24 rounded-[60px] border border-slate-100 shadow-sm text-center animate-in fade-in zoom-in-95 duration-700">
                            <div className="h-24 w-24 rounded-[40px] bg-slate-50 flex items-center justify-center mx-auto mb-10 border border-slate-100 relative">
                                <Calendar className="h-12 w-12 text-[#10b981]" />
                                <div className="absolute -top-2 -right-2 h-8 w-8 bg-[#10b981] rounded-full flex items-center justify-center text-white font-black text-[12px] shadow-lg animate-pulse">Pro</div>
                            </div>
                            <h3 className="text-4xl font-black text-[#1B263B] tracking-tighter mb-4 uppercase italic">Agenda Inteligente <span className="text-[#10b981]">KF IMOVEIS</span></h3>
                            <p className="text-slate-400 font-bold text-sm uppercase tracking-[0.3em] max-w-2xl mx-auto leading-relaxed">
                                Centralize seus compromissos, elimine o retrabalho e mantenha sua rotina totalmente organizada.
                                <br /><span className="text-[#10b981]/60">Em breve: Sincronização automática com Google Calendar e WhatsApp.</span>
                            </p>
                            <button onClick={() => setCurrentTab('crm')} className="mt-12 bg-[#1B263B] text-white px-10 py-5 rounded-3xl text-[12px] font-black uppercase tracking-[0.2em] shadow-xl shadow-[#1B263B]/20 hover:scale-105 active:scale-95 transition-all">Ver Meus Leads</button>
                        </div>
                    )}

                    {currentTab === 'financeiro' && (
                        <div className="bg-white p-24 rounded-[60px] border border-slate-100 shadow-sm text-center animate-in fade-in zoom-in-95 duration-700">
                            <div className="h-24 w-24 rounded-[40px] bg-slate-50 flex items-center justify-center mx-auto mb-10 border border-slate-100 relative">
                                <DollarSign className="h-12 w-12 text-slate-300 animate-pulse" />
                                <div className="absolute -top-2 -right-2 h-8 w-8 bg-amber-500 rounded-full flex items-center justify-center text-white font-black text-[12px] shadow-lg">Soon</div>
                            </div>
                            <h3 className="text-3xl font-black text-[#1B263B] tracking-tighter mb-4 uppercase">Financeiro Estratégico</h3>
                            <p className="text-slate-400 font-bold text-sm uppercase tracking-[0.3em] max-w-lg mx-auto leading-relaxed">Gestão de comissões, contratos e fluxo de caixa automatizado para sua imobiliária.</p>
                            <button onClick={() => setCurrentTab('overview')} className="mt-12 bg-[#1B263B] text-white px-10 py-5 rounded-3xl text-[12px] font-black uppercase tracking-[0.2em] shadow-xl shadow-[#1B263B]/20 hover:scale-105 active:scale-95 transition-all">Explorar Visão Geral</button>
                        </div>
                    )}
                </div>

                <footer className="mt-auto p-12 border-t border-slate-100 flex justify-between items-center bg-white/50 backdrop-blur-sm">
                    <p className="text-[12px] font-black text-slate-300 uppercase tracking-widest">© 2026 Kátia e Flávio DIGITAL SAAS • SISTEMA DE GESTÃO END-TO-END</p>
                    <div className="flex gap-6">
                        {['Termos', 'Privacidade', 'Ajuda'].map(t => (
                            <button key={t} className="text-[12px] font-black text-slate-400 uppercase tracking-widest hover:text-[#10b981] transition-colors">{t}</button>
                        ))}
                    </div>
                </footer>
            </main>
            {/* Quick View Lightbox */}
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            {
                selectedProperty && (
                    <div className="fixed inset-0 bg-[#1B263B]/80 backdrop-blur-md z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
                        <div className="bg-white w-full max-w-4xl rounded-[50px] overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-500 overflow-y-auto max-h-[90vh]">
                            <button
                                onClick={() => setSelectedProperty(null)}
                                className="absolute top-8 right-8 h-12 w-12 rounded-2xl bg-white/20 backdrop-blur-xl text-[#1B263B] hover:bg-red-500 hover:text-white transition-all flex items-center justify-center z-10 shadow-xl border border-white/40"
                            >
                                <X className="h-6 w-6" />
                            </button>

                            <div className="grid grid-cols-1 md:grid-cols-2">
                                <div className="h-[400px] md:h-[600px] relative group">
                                    <img src={selectedProperty.images?.[0]} className="w-full h-full object-cover" alt="" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                                    <div className="absolute bottom-10 left-10 text-white">
                                        <span className="bg-[#10b981] px-4 py-2 rounded-xl font-black text-[11px] uppercase tracking-widest mb-4 inline-block">{selectedProperty.reference_id}</span>
                                        <h3 className="text-4xl font-black tracking-tighter uppercase">{selectedProperty.title || 'Sem Título'}</h3>
                                    </div>
                                </div>
                                <div className="p-12 flex flex-col justify-between">
                                    <div className="space-y-8">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-[12px] font-black text-slate-300 uppercase tracking-widest mb-2">Localização</p>
                                                <p className="text-sm font-bold text-slate-500">{selectedProperty.neighborhood}, PG</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[12px] font-black text-slate-300 uppercase tracking-widest mb-2">Proprietário</p>
                                                <p className="text-sm font-bold text-[#1B263B]">{selectedProperty.owner_name || 'Desconhecido'}</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="bg-slate-50 p-4 rounded-2xl text-center">
                                                <Bed className="h-4 w-4 text-[#10b981] mx-auto mb-2" />
                                                <p className="text-sm font-black">{selectedProperty.rooms} Dorm</p>
                                            </div>
                                            <div className="bg-slate-50 p-4 rounded-2xl text-center">
                                                <Bath className="h-4 w-4 text-[#10b981] mx-auto mb-2" />
                                                <p className="text-sm font-black">{selectedProperty.bathrooms} WC</p>
                                            </div>
                                            <div className="bg-slate-50 p-4 rounded-2xl text-center">
                                                <Maximize2 className="h-4 w-4 text-[#10b981] mx-auto mb-2" />
                                                <p className="text-sm font-black">{selectedProperty.area}m²</p>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <p className="text-[12px] font-black text-slate-300 uppercase tracking-widest">Resumo Financeiro</p>
                                            <div className="p-6 bg-[#10b981]/5 rounded-3xl border border-[#10b981]/10">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-[12px] font-black text-[#10b981] uppercase tracking-widest">Valor de Tabela</span>
                                                    <span className="text-xl font-black text-[#1B263B]">{selectedProperty.price?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                                                </div>
                                                <div className="flex justify-between items-center opacity-50">
                                                    <span className="text-[11px] font-black uppercase tracking-widest">Comissão Estimada</span>
                                                    <span className="text-sm font-black">{((selectedProperty.price || 0) * 0.06).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-4 mt-12">
                                        <Link href={`/admin/imoveis/editar/${selectedProperty.id}`} className="flex-1">
                                            <button className="w-full bg-[#1B263B] text-white py-5 rounded-2xl font-black text-[12px] uppercase tracking-widest shadow-xl shadow-[#1B263B]/20 hover:scale-[1.03] transition-all">Editar Completo</button>
                                        </Link>
                                        <Link href={`/imovel/${selectedProperty.slug}`} target="_blank" className="flex-1">
                                            <button className="w-full border border-slate-100 py-5 rounded-2xl font-black text-[12px] uppercase tracking-widest hover:bg-slate-50 transition-all">Ver no Site</button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            {editingUser && (
                <EditUserModal
                    user={editingUser}
                    onClose={() => setEditingUser(null)}
                    onUpdate={(updatedUser) => {
                        setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
                        setEditingUser(null);
                    }}
                />
            )}

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
        </div>
    );
}


function TermoVisitaModal({ lead, corretor, siteContact, onClose }: { lead: any, corretor: any, siteContact: any, onClose: () => void }) {
    const [formData, setFormData] = useState({
        visitante_nome: lead.name || '',
        visitante_cpf: '',
        visitante_tel: lead.customer_whatsapp || '',
        visitante_email: '',
        imobiliaria_nome: 'Kátia e Flávio Imóveis',
        imobiliaria_cnpj: siteContact.cnpj || '',
        imobiliaria_end: siteContact.address || '',
        imobiliaria_tel: siteContact.phone || '',
        imovel_end: lead.properties?.title + ' (Ref: ' + lead.properties?.reference_id + ')',
        data_visita: new Date().toLocaleDateString('pt-BR'),
        horario_visita: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        corretor_nome: corretor?.full_name || '',
        corretor_creci: corretor?.creci || ''
    });

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="fixed inset-0 bg-[#1B263B]/80 backdrop-blur-md z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300 overflow-y-auto">
            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    body * { visibility: hidden; }
                    #printable-area, #printable-area * { visibility: visible; }
                    #printable-area { 
                        position: absolute; 
                        left: 0; 
                        top: 0; 
                        width: 100%;
                        padding: 0 !important;
                        margin: 0 !important;
                    }
                    .no-print { display: none !important; }
                }
            `}} />
            
            <div className="bg-white w-full max-w-4xl rounded-[40px] shadow-2xl relative animate-in zoom-in-95 duration-500 overflow-hidden flex flex-col max-h-[90vh]">
                <header className="p-8 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10 no-print">
                    <div>
                        <h3 className="text-xl font-black text-[#1B263B] uppercase tracking-tighter">Gerador de Termo de Visita</h3>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">Preencha os campos faltantes antes de imprimir</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={handlePrint}
                            className="bg-[#10b981] text-white px-6 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-[#10b981]/20 hover:scale-105 transition-all flex items-center gap-2"
                        >
                            <Download className="h-4 w-4" /> Imprimir / PDF
                        </button>
                        <button
                            onClick={onClose}
                            className="h-12 w-12 rounded-xl bg-slate-50 text-slate-400 hover:text-red-500 transition-all flex items-center justify-center border border-slate-100"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-12 bg-slate-50 no-scrollbar">
                    {/* Form Edit Section */}
                    <div className="mb-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 no-print">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">CPF do Visitante</label>
                            <input 
                                type="text" value={formData.visitante_cpf} 
                                onChange={e => setFormData({...formData, visitante_cpf: e.target.value})}
                                className="w-full bg-white border border-slate-200 p-3 rounded-xl text-xs font-bold focus:ring-2 focus:ring-[#10b981]/20 outline-none"
                                placeholder="000.000.000-00"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">E-mail do Visitante</label>
                            <input 
                                type="email" value={formData.visitante_email} 
                                onChange={e => setFormData({...formData, visitante_email: e.target.value})}
                                className="w-full bg-white border border-slate-200 p-3 rounded-xl text-xs font-bold focus:ring-2 focus:ring-[#10b981]/20 outline-none"
                                placeholder="exemplo@email.com"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">CNPJ da Imobiliária</label>
                            <input 
                                type="text" value={formData.imobiliaria_cnpj} 
                                onChange={e => setFormData({...formData, imobiliaria_cnpj: e.target.value})}
                                className="w-full bg-white border border-slate-200 p-3 rounded-xl text-xs font-bold focus:ring-2 focus:ring-[#10b981]/20 outline-none"
                                placeholder="00.000.000/0000-00"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Data da Visita</label>
                            <input 
                                type="text" value={formData.data_visita} 
                                onChange={e => setFormData({...formData, data_visita: e.target.value})}
                                className="w-full bg-white border border-slate-200 p-3 rounded-xl text-xs font-bold focus:ring-2 focus:ring-[#10b981]/20 outline-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Horário</label>
                            <input 
                                type="text" value={formData.horario_visita} 
                                onChange={e => setFormData({...formData, horario_visita: e.target.value})}
                                className="w-full bg-white border border-slate-200 p-3 rounded-xl text-xs font-bold focus:ring-2 focus:ring-[#10b981]/20 outline-none"
                            />
                        </div>
                    </div>

                    {/* Printable Document */}
                    <div id="printable-area" className="bg-white p-12 md:p-20 shadow-xl border border-slate-200 rounded-[20px] text-slate-800 font-serif leading-relaxed text-sm lg:text-base">
                        <div className="text-center mb-12">
                            <h1 className="text-2xl font-bold uppercase tracking-widest border-b-2 border-slate-800 pb-4 inline-block">TERMO DE VISITA DE IMÓVEL</h1>
                        </div>

                        <p className="mb-8 text-justify">
                            Declaro, na qualidade de eventual comprador(a), que realizei a visita presencial ao(s) imóvel(eis) descrito(s) neste documento, tendo recebido todas as informações necessárias acerca de preços, condições de pagamento e demais esclarecimentos por intermédio do corretor de imóveis <strong>{formData.corretor_nome}</strong>, devidamente registrado no CRECI/DF sob o número <strong>{formData.corretor_creci}</strong>. Declaro ainda estar plenamente ciente de que qualquer contato direto com o(s) proprietário(s) do(s) referido(s) imóvel(eis) será feito exclusivamente por meio do corretor mencionado, garantindo o respeito à intermediação profissional.
                        </p>

                        <div className="space-y-6 mb-8">
                            <h2 className="font-bold border-b border-slate-200 pb-2">1. Identificação das Partes:</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4">
                                <div className="space-y-1">
                                    <p><strong>Visitante:</strong> {formData.visitante_nome || '________________________________'}</p>
                                    <p><strong>CPF:</strong> {formData.visitante_cpf || '________________________________'}</p>
                                    <p><strong>Telefone:</strong> {formData.visitante_tel || '________________________________'}</p>
                                    <p><strong>E-mail:</strong> {formData.visitante_email || '________________________________'}</p>
                                </div>
                                <div className="space-y-1">
                                    <p><strong>Responsável pelo Imóvel:</strong> {formData.imobiliaria_nome || '________________________________'}</p>
                                    <p><strong>CNPJ:</strong> {formData.imobiliaria_cnpj || '________________________________'}</p>
                                    <p><strong>Endereço:</strong> {formData.imobiliaria_end || '________________________________'}</p>
                                    <p><strong>Telefone:</strong> {formData.imobiliaria_tel || '________________________________'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6 mb-8">
                            <h2 className="font-bold border-b border-slate-200 pb-2">2. Imóvel Visitado:</h2>
                            <div className="space-y-1">
                                <p><strong>Endereço do Imóvel:</strong> {formData.imovel_end || '________________________________'}</p>
                                <p><strong>Data da Visita:</strong> {formData.data_visita} <strong>Horário:</strong> {formData.horario_visita}</p>
                            </div>
                        </div>

                        <div className="space-y-4 mb-8 text-xs text-slate-500">
                            <h2 className="font-bold border-b border-slate-200 pb-2 text-slate-800 text-sm">3. Finalidade da Coleta de Dados:</h2>
                            <p>Os dados pessoais fornecidos pelo Visitante neste termo serão utilizados exclusivamente para registro e controle das visitas realizadas ao imóvel, garantia de segurança dos envolvidos e contato posterior para negociações ou esclarecimentos relacionados ao imóvel visitado.</p>
                            
                            <h2 className="font-bold border-b border-slate-200 pb-2 text-slate-800 text-sm">4. Base Legal:</h2>
                            <p>A coleta e o tratamento dos dados pessoais do Visitante são realizados com fundamento no consentimento livre, expresso e informado, conforme o disposto no Art. 7º, inciso I da Lei nº 13.709/2018 (LGPD).</p>
                            
                            <h2 className="font-bold border-b border-slate-200 pb-2 text-slate-800 text-sm">5. Compartilhamento de Dados:</h2>
                            <p>Os dados pessoais coletados poderão ser compartilhados apenas com proprietários do imóvel (quando necessário) e colaboradores/parceiros da imobiliária envolvidos diretamente na intermediação.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-20 mt-20 no-break">
                            <div className="text-center pt-4 border-t border-slate-800">
                                <p className="font-bold">Assinatura do Visitante</p>
                                <p className="text-xs uppercase mt-2">Data: {formData.data_visita}</p>
                            </div>
                            <div className="text-center pt-4 border-t border-slate-800">
                                <p className="font-bold">Assinatura do Responsável</p>
                                <p className="text-xs uppercase mt-2">Data: {formData.data_visita}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ThemeConfigSection() {
    const [isSaving, setIsSaving] = useState(false);
    const [theme, setTheme] = useState({
        primary_color: '#1B263B',
        button_color: '#10b981',
        logo_height: 56,
        header_opacity: 100
    });

    const [logoUrl, setLogoUrl] = useState('');
    const [faviconUrl, setFaviconUrl] = useState('');

    const handleFaviconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsSaving(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `favicon_${Math.random()}.${fileExt}`;
            const filePath = `assets/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('properties')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('properties')
                .getPublicUrl(filePath);

            setFaviconUrl(publicUrl);
            alert('Favicon alterado com sucesso! Salve para aplicar.');
        } catch (err: any) {
            alert('Erro ao atualizar favicon: ' + err.message);
        } finally {
            setIsSaving(false);
        }
    };

    useEffect(() => {
        const fetchBranding = async () => {
            const { data: themeData } = await supabase.from('site_settings').select('value').eq('key', 'site_theme').single();
            if (themeData && themeData.value) setTheme(themeData.value);

            const { data: logoData } = await supabase.from('site_settings').select('value').eq('key', 'site_logo').single();
            if (logoData) setLogoUrl(logoData.value);

            const { data: faviconData } = await supabase.from('site_settings').select('value').eq('key', 'site_favicon').single();
            if (faviconData) setFaviconUrl(faviconData.value);
        };
        fetchBranding();
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        await supabase.from('site_settings').upsert({ key: 'site_theme', value: theme });
        await supabase.from('site_settings').upsert({ key: 'site_logo', value: logoUrl });
        await supabase.from('site_settings').upsert({ key: 'site_favicon', value: faviconUrl });
        setIsSaving(false);
        alert('Identidade visual atualizada com sucesso!');
    };

    return (
        <div className="bg-white p-12 rounded-[50px] border border-slate-100 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 blur-[100px] -z-10" />
            
            <header className="flex justify-between items-center mb-10">
                <div>
                    <h3 className="text-2xl font-black text-[#1B263B] tracking-tighter uppercase mb-2">Paleta de Cores</h3>
                    <p className="text-slate-400 font-bold text-[11px] uppercase tracking-widest text-left">Defina a identidade cromática da sua plataforma</p>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center">
                    <Zap className="h-6 w-6 text-indigo-600" />
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                    <div className="space-y-4">
                        <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest ml-2 block text-left">Cor Principal do Site</label>
                        <div className="flex items-center gap-4">
                            <input
                                type="color"
                                value={theme.primary_color}
                                onChange={e => setTheme({ ...theme, primary_color: e.target.value })}
                                className="h-14 w-24 rounded-xl cursor-pointer border-none bg-transparent"
                            />
                            <input
                                type="text"
                                value={theme.primary_color}
                                onChange={e => setTheme({ ...theme, primary_color: e.target.value })}
                                className="flex-1 bg-slate-50 border border-slate-100 p-4 rounded-xl font-mono text-sm uppercase font-bold outline-none focus:ring-2 focus:ring-indigo-500/20"
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest ml-2 block text-left">Cor dos Botões</label>
                        <div className="flex items-center gap-4">
                            <input
                                type="color"
                                value={theme.button_color}
                                onChange={e => setTheme({ ...theme, button_color: e.target.value })}
                                className="h-14 w-24 rounded-xl cursor-pointer border-none bg-transparent"
                            />
                            <input
                                type="text"
                                value={theme.button_color}
                                onChange={e => setTheme({ ...theme, button_color: e.target.value })}
                                className="flex-1 bg-slate-50 border border-slate-100 p-4 rounded-xl font-mono text-sm uppercase font-bold outline-none focus:ring-2 focus:ring-indigo-500/20"
                            />
                        </div>
                        <div className="space-y-4">
                        <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest ml-2 block text-left">Opacidade do Header ({theme.header_opacity || 100}%)</label>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={theme.header_opacity || 100}
                            onChange={e => setTheme({ ...theme, header_opacity: parseInt(e.target.value) })}
                            className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                        />
                        <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">Ajuste para deixar o menu mais ou menos transparente</p>
                    </div>

                    <div className="space-y-4">
                        <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest ml-2 block text-left">Altura do Logo ({theme.logo_height || 56}px)</label>
                        <div className="flex items-center gap-6">
                            <input
                                type="range"
                                min="30"
                                max="150"
                                value={theme.logo_height || 56}
                                onChange={e => setTheme({ ...theme, logo_height: parseInt(e.target.value) })}
                                className="flex-1 h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                            />
                            <div className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 font-bold text-sm text-slate-400">
                                {theme.logo_height || 56}px
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="text-[12px] font-black text-[#1B263B] uppercase tracking-widest ml-2 block text-left">URL do Logotipo</label>
                        <input
                            type="text"
                            value={logoUrl}
                            onChange={e => setLogoUrl(e.target.value)}
                            placeholder="https://..."
                            className="w-full bg-slate-50 border border-slate-100 p-4 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500/20"
                        />
                    </div>

                    <div className="space-y-4">
                        <label className="text-[12px] font-black text-[#1B263B] uppercase tracking-widest ml-2 block text-left">Configurar Favicon (Ícone Navegador)</label>
                        <div className="flex gap-4">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFaviconUpload}
                                className="hidden"
                                id="favicon-upload"
                            />
                            <label
                                htmlFor="favicon-upload"
                                className="flex-1 bg-slate-50 border border-slate-100 p-4 rounded-xl font-bold text-sm text-slate-600 cursor-pointer hover:bg-slate-100 transition-all flex items-center gap-3 border-dashed"
                            >
                                <Upload className="h-4 w-4 text-indigo-600" />
                                {isSaving ? 'Enviando...' : 'Fazer Upload do Favicon'}
                            </label>
                            {faviconUrl && (
                                <div className="h-14 w-14 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center p-2">
                                    <img src={faviconUrl} className="h-full w-full object-contain" alt="Favicon" />
                                </div>
                            )}
                        </div>
                        <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">O ícone que aparece na aba do navegador. Use .ico ou .png quadrado.</p>
                    </div>
                </div>

                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-indigo-600 text-white px-10 py-5 rounded-2xl text-[12px] font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-600/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 disabled:opacity-50"
                    >
                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                        Aplicar Novas Cores
                    </button>
                </div>

                <div className="bg-slate-50 rounded-[40px] p-10 border border-slate-100 flex flex-col justify-center items-center gap-8 group">
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] mb-4">Prévia Instantânea</span>
                    
                    <div className="w-full space-y-6">
                        <div className="h-10 w-full rounded-2xl shadow-sm border border-slate-100 flex items-center px-4" style={{ backgroundColor: theme.primary_color + '10' }}>
                           <div className="h-3 w-24 rounded-full opacity-20" style={{ backgroundColor: theme.primary_color }} />
                        </div>
                        
                        <button className="w-full py-5 rounded-2xl text-white font-black text-[12px] uppercase tracking-widest shadow-xl transition-all" style={{ backgroundColor: theme.button_color }}>
                            Botão de Exemplo
                        </button>
                        
                        <div className="flex gap-4">
                            <div className="h-12 w-12 rounded-2xl flex items-center justify-center text-white" style={{ backgroundColor: theme.primary_color }}>
                                <Star className="h-5 w-5" />
                            </div>
                            <div className="flex-1 space-y-2 py-1">
                                <div className="h-2 w-3/4 rounded-full bg-slate-200" />
                                <div className="h-2 w-1/2 rounded-full bg-slate-100" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}



function HomeSettingsSection() {
    const [isSaving, setIsSaving] = useState(false);
    const [config, setConfig] = useState({
        horizontal_count: 8,
        vertical_count: 6,
        show_horizontal: false,
        show_vertical: true,
        horizontal_title: 'Destaques Exclusive',
        vertical_title: 'Oportunidades em Praia Grande',
        grid_columns: 4
    });

    useEffect(() => {
        const fetchConfig = async () => {
            const { data } = await supabase.from('site_settings').select('value').eq('key', 'home_config').single();
            if (data && data.value) setConfig(prev => ({ ...prev, ...data.value }));
        };
        fetchConfig();
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        const { error } = await supabase.from('site_settings').upsert({ key: 'home_config', value: config });
        setIsSaving(false);
        setIsSaving(false);
        if (error) fireToast('Erro ao salvar configurações: ' + error.message, 'error');
        else fireToast('Configurações da Home atualizadas com sucesso!');
    };

    return (
        <div className="space-y-8">
            <div className="bg-white p-12 rounded-[50px] border border-slate-100 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 blur-[100px] -z-10" />
                
                <header className="flex justify-between items-center mb-10">
                    <div>
                        <h3 className="text-3xl font-black text-primary-900 tracking-tighter uppercase">Layout da Home</h3>
                        <p className="text-slate-400 font-bold text-sm tracking-widest uppercase mt-1">Configure o fluxo de exibição dos imóveis</p>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-8">
                        <div className="p-8 bg-slate-50/50 rounded-[40px] border border-slate-100 space-y-6">
                            <div className="flex items-center justify-between">
                                <h4 className="text-sm font-black text-primary-900 uppercase tracking-[0.2em]">Seção Horizontal (Slider)</h4>
                                <input 
                                    type="checkbox" 
                                    checked={config.show_horizontal}
                                    onChange={e => setConfig({...config, show_horizontal: e.target.checked})}
                                    className="h-6 w-12 appearance-none bg-slate-200 checked:bg-accent rounded-full transition-all relative cursor-pointer before:content-[''] before:absolute before:h-4 before:w-4 before:bg-white before:rounded-full before:top-1 before:left-1 checked:before:left-7 before:transition-all"
                                />
                            </div>
                            
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest ml-2">Título da Seção</label>
                                <input
                                    type="text"
                                    value={config.horizontal_title}
                                    onChange={e => setConfig({...config, horizontal_title: e.target.value})}
                                    className="w-full bg-white border border-slate-100 p-5 rounded-2xl font-bold text-sm outline-none focus:border-accent transition-all uppercase"
                                />
                            </div>

                            <div className="space-y-4">
                                <label className="flex justify-between items-center px-2">
                                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Quantidade de Itens</span>
                                    <span className="text-sm font-black text-accent">{config.horizontal_count} Imóveis</span>
                                </label>
                                <input
                                    type="range"
                                    min="4"
                                    max="24"
                                    step="1"
                                    value={config.horizontal_count}
                                    onChange={e => setConfig({...config, horizontal_count: parseInt(e.target.value)})}
                                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-accent"
                                />
                            </div>
                        </div>

                        <div className="p-8 bg-slate-50/50 rounded-[40px] border border-slate-100 space-y-6">
                            <div className="flex items-center justify-between">
                                <h4 className="text-sm font-black text-primary-900 uppercase tracking-[0.2em]">Seção Vertical (Grade)</h4>
                                <input 
                                    type="checkbox" 
                                    checked={config.show_vertical}
                                    onChange={e => setConfig({...config, show_vertical: e.target.checked})}
                                    className="h-6 w-12 appearance-none bg-slate-200 checked:bg-accent rounded-full transition-all relative cursor-pointer before:content-[''] before:absolute before:h-4 before:w-4 before:bg-white before:rounded-full before:top-1 before:left-1 checked:before:left-7 before:transition-all"
                                />
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest ml-2">Título da Seção</label>
                                <input
                                    type="text"
                                    value={config.vertical_title}
                                    onChange={e => setConfig({...config, vertical_title: e.target.value})}
                                    className="w-full bg-white border border-slate-100 p-5 rounded-2xl font-bold text-sm outline-none focus:border-accent transition-all uppercase"
                                />
                            </div>

                            <div className="space-y-4">
                                <label className="flex justify-between items-center px-2">
                                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Quantidade Total</span>
                                    <span className="text-sm font-black text-accent">{config.vertical_count} Imóveis</span>
                                </label>
                                <input
                                    type="range"
                                    min="4"
                                    max="40"
                                    step={config.grid_columns || 4}
                                    value={config.vertical_count}
                                    onChange={e => setConfig({...config, vertical_count: parseInt(e.target.value)})}
                                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-accent"
                                />
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter text-center">
                                    O passo do ajuste é automático com base no número de colunas ({config.grid_columns || 4})
                                </p>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest ml-2">Cards por Linha (Desktop)</label>
                                <div className="flex gap-4">
                                    {[3, 4].map(cols => (
                                        <button
                                            key={cols}
                                            onClick={() => setConfig({...config, grid_columns: cols, vertical_count: Math.ceil(config.vertical_count / cols) * cols})}
                                            className={clsx(
                                                "flex-1 py-4 rounded-2xl font-black text-[12px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2",
                                                (config.grid_columns || 4) === cols 
                                                    ? "bg-accent text-white shadow-xl shadow-accent/20 scale-[1.02]" 
                                                    : "bg-white text-slate-400 border border-slate-100 hover:border-accent/40"
                                            )}
                                        >
                                            {cols} Colunas
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col justify-center bg-slate-50 rounded-[40px] p-10 border border-slate-100 relative group overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-tr from-accent/5 to-transparent group-hover:opacity-70 transition-opacity" />
                        <div className="relative z-10 text-center space-y-6">
                            <div className="h-20 w-20 bg-white rounded-3xl shadow-xl flex items-center justify-center mx-auto mb-8 rotate-3 group-hover:rotate-6 transition-transform">
                                <Layout className="h-10 w-10 text-accent" />
                            </div>
                            <h4 className="text-xl font-black text-primary-900 tracking-tight uppercase">Equilíbrio Visual</h4>
                            <p className="text-slate-400 font-bold text-sm leading-relaxed max-w-xs mx-auto uppercase">O layout horizontal é ideal para destaques exclusivos com rolagem infinita. Já o vertical (grade) apresenta as oportunidades recentes de forma organizada.</p>
                        </div>
                    </div>
                </div>

                <div className="mt-12 flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-primary-900 text-white px-12 py-6 rounded-2xl text-[12px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-accent transition-all flex items-center gap-3 disabled:opacity-50"
                    >
                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        Salvar Configurações
                    </button>
                </div>
            </div>
        </div>
    );
}

function ContactSettingsSection() {
    const [isSaving, setIsSaving] = useState(false);
    const [contact, setContact] = useState({
        phone: '(13) 3474-0000',
        email: 'katiaeflavioimoveis@gmail.com',
        address: 'Rua Fumio Miyazi, 141 - Sala 811 - Boqueirão',
        instagram: 'https://instagram.com',
        facebook: 'https://facebook.com',
        youtube: 'https://youtube.com',
        linkedin: 'https://linkedin.com',
        whatsapp: '5513999999999'
    });

    useEffect(() => {
        const fetchContact = async () => {
            const { data } = await supabase.from('site_settings').select('value').eq('key', 'site_contact').single();
            if (data && data.value) setContact(data.value);
        };
        fetchContact();
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        const { error } = await supabase.from('site_settings').upsert({ key: 'site_contact', value: contact });
        setIsSaving(false);
        if (error) alert('Erro ao salvar contatos: ' + error.message);
        else alert('Informações de contato atualizadas!');
    };

    return (
        <div className="bg-white p-12 rounded-[50px] border border-slate-100 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50/50 blur-[100px] -z-10" />
            
            <header className="flex justify-between items-center mb-10">
                <div>
                    <h3 className="text-2xl font-black text-[#1B263B] tracking-tighter uppercase mb-2">Informações de Contato</h3>
                    <p className="text-slate-400 font-bold text-[11px] uppercase tracking-widest text-left">Gerencie como seus clientes encontram você</p>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-emerald-50 flex items-center justify-center">
                    <Phone className="h-6 w-6 text-emerald-600" />
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest ml-2 block text-left">Telefone de Contato</label>
                    <input
                        type="text"
                        value={contact.phone}
                        onChange={e => setContact({ ...contact, phone: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-100 p-4 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                </div>
                <div className="space-y-4">
                    <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest ml-2 block text-left">E-mail Oficial</label>
                    <input
                        type="email"
                        value={contact.email}
                        onChange={e => setContact({ ...contact, email: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-100 p-4 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                </div>
                <div className="space-y-4">
                    <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest ml-2 block text-left">Instagram (URL Completa)</label>
                    <input
                        type="text"
                        value={contact.instagram}
                        onChange={e => setContact({ ...contact, instagram: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-100 p-4 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                </div>
                <div className="space-y-4">
                    <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest ml-2 block text-left">YouTube (URL Completa)</label>
                    <input
                        type="text"
                        value={contact.youtube}
                        onChange={e => setContact({ ...contact, youtube: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-100 p-4 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                </div>
                <div className="space-y-4">
                    <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest ml-2 block text-left">LinkedIn (URL Completa)</label>
                    <input
                        type="text"
                        value={contact.linkedin}
                        onChange={e => setContact({ ...contact, linkedin: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-100 p-4 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                </div>
                <div className="space-y-4 md:col-span-2">
                    <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest ml-2 block text-left">Endereço Físico (Exibido no Rodapé)</label>
                    <input
                        type="text"
                        value={contact.address}
                        onChange={e => setContact({ ...contact, address: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-100 p-4 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                </div>
                <div className="space-y-4 md:col-span-2">
                    <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest ml-2 block text-left">WhatsApp (Apenas Números com DDD)</label>
                    <input
                        type="text"
                        value={contact.whatsapp}
                        onChange={e => setContact({ ...contact, whatsapp: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-100 p-4 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-emerald-500/20"
                        placeholder="Ex: 5513997654321"
                    />
                </div>

                <div className="md:col-span-2 pt-4">
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-[#1B263B] text-white px-10 py-5 rounded-2xl text-[12px] font-black uppercase tracking-[0.2em] shadow-xl shadow-[#1B263B]/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 disabled:opacity-50"
                    >
                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                        Salvar Informações de Contato
                    </button>
                </div>
            </div>
        </div>
    );
}

function HomeConfigSection() {
    const [settings, setSettings] = useState({
        title: 'Encontre seu imóvel \nna Praia Grande \ncom atendimento rápido',
        subtitle: 'As melhores oportunidades no Canto do Forte, Boqueirão e toda região da Baixada Santista.',
        image_url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=1920',
        title_font_size: 72
    });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchSettings = async () => {
            const { data } = await supabase.from('site_settings').select('value').eq('key', 'home_hero').single();
            if (data && data.value) setSettings(prev => ({ ...prev, ...data.value }));
        };
        fetchSettings();
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        const { error } = await supabase.from('site_settings').upsert({ key: 'home_hero', value: settings });
        setIsSaving(false);
        if (!error) alert('Configurações salvas com sucesso!');
        else alert('Erro ao salvar: ' + error.message);
    };

    return (
        <div className="bg-[#1B263B] p-12 rounded-[50px] shadow-2xl relative overflow-hidden group mt-12">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#10b981]/10 blur-[100px] -z-10 group-hover:bg-[#10b981]/20 transition-all duration-1000" />

            <header className="flex justify-between items-center mb-12">
                <div>
                    <h3 className="text-3xl font-black text-white tracking-tighter uppercase mb-2">Página Inicial</h3>
                    <p className="text-white/40 font-bold text-[12px] uppercase tracking-widest">Personalize o impacto visual da sua imobiliária</p>
                </div>
                <div className="h-14 w-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                    <Globe className="h-6 w-6 text-[#10b981]" />
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 text-left">
                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[12px] font-black text-white/40 uppercase tracking-widest ml-2">Título Principal (Hero) - Use \n para nova linha</label>
                        <textarea
                            rows={3}
                            value={settings.title}
                            onChange={e => setSettings({ ...settings, title: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl font-bold text-sm text-white outline-none focus:ring-2 focus:ring-[#10b981]/20 transition-all resize-none"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[12px] font-black text-white/40 uppercase tracking-widest ml-2">Subtítulo</label>
                        <textarea
                            rows={3}
                            value={settings.subtitle}
                            onChange={e => setSettings({ ...settings, subtitle: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl font-bold text-sm text-white outline-none focus:ring-2 focus:ring-[#10b981]/20 transition-all resize-none"
                        />
                    </div>

                    <div className="space-y-4">
                        <label className="text-[12px] font-black text-white/40 uppercase tracking-widest ml-2 block text-left">Tamanho da Fonte (Título Desktop: {settings.title_font_size || 72}px)</label>
                        <div className="flex items-center gap-6">
                            <input
                                type="range"
                                min="32"
                                max="120"
                                value={settings.title_font_size || 72}
                                onChange={e => setSettings({ ...settings, title_font_size: parseInt(e.target.value) })}
                                className="flex-1 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#10b981]"
                            />
                            <div className="bg-white/5 px-4 py-2 rounded-xl border border-white/10 font-bold text-sm text-white/40">
                                {settings.title_font_size || 72}px
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-[#10b981] text-white px-10 py-5 rounded-2xl text-[12px] font-black uppercase tracking-[0.2em] shadow-xl shadow-[#10b981]/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 disabled:opacity-50"
                    >
                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                        Salvar Alterações
                    </button>
                </div>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[12px] font-black text-white/40 uppercase tracking-widest ml-2">Imagem de Fundo (Upload)</label>
                        <div className="flex gap-4">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;

                                    setIsSaving(true);
                                    const fileExt = file.name.split('.').pop();
                                    const fileName = `hero_${Math.random()}.${fileExt}`;
                                    const filePath = `hero/${fileName}`;

                                    const { error: uploadError } = await supabase.storage
                                        .from('properties') // Usando o bucket que provavelmente já existe para imóveis
                                        .upload(filePath, file);

                                    if (uploadError) {
                                        alert('Erro no upload: ' + uploadError.message);
                                        setIsSaving(false);
                                        return;
                                    }

                                    const { data: { publicUrl } } = supabase.storage
                                        .from('properties')
                                        .getPublicUrl(filePath);

                                    setSettings({ ...settings, image_url: publicUrl });
                                    setIsSaving(false);
                                }}
                                className="hidden"
                                id="hero-upload"
                            />
                            <label
                                htmlFor="hero-upload"
                                className="flex-1 bg-white/5 border border-white/10 p-5 rounded-2xl font-bold text-sm text-white/60 cursor-pointer hover:bg-white/10 transition-all flex items-center gap-3"
                            >
                                <Upload className="h-5 w-5" />
                                {isSaving ? 'Enviando...' : 'Selecionar Nova Imagem'}
                            </label>
                        </div>
                        <p className="text-[12px] text-white/20 font-bold uppercase tracking-widest ml-2">URL Atual: {settings.image_url}</p>
                    </div>
                    <div className="aspect-video rounded-3xl bg-white/5 border border-white/10 overflow-hidden relative">
                        <img
                            src={settings.image_url}
                            className="w-full h-full object-cover opacity-50"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

function MasterLogoSection() {
    const [isSaving, setIsSaving] = useState(false);
    const [logoUrl, setLogoUrl] = useState('/logo.png');
    const [theme, setTheme] = useState({
        primary_color: '#1B263B',
        button_color: '#10b981',
        header_opacity: 100,
        logo_height: 56
    });

    useEffect(() => {
        const fetchData = async () => {
            const { data: logoData } = await supabase.from('site_settings').select('value').eq('key', 'site_logo').single();
            if (logoData) setLogoUrl(logoData.value);

            const { data: themeData } = await supabase.from('site_settings').select('value').eq('key', 'site_theme').single();
            if (themeData) setTheme(prev => ({ ...prev, ...themeData.value }));
        };
        fetchData();
    }, []);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsSaving(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `logo_${Math.random()}.${fileExt}`;
            const filePath = `assets/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('properties') // Usando property bucket para simplificar, mas ideal seria 'assets'
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('properties')
                .getPublicUrl(filePath);

            const { error: dbError } = await supabase
                .from('site_settings')
                .upsert({ key: 'site_logo', value: publicUrl });

            if (dbError) throw dbError;

            setLogoUrl(publicUrl);
            fireToast('Logotipo atualizado com sucesso! Atualize para ver em todo o site.');
        } catch (err: any) {
            fireToast('Erro ao atualizar logo: ' + err.message, 'error');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="bg-white p-12 rounded-[50px] border border-slate-100 shadow-sm">
            <div className="flex items-center gap-4 mb-8">
                <div className="h-12 w-12 rounded-2xl bg-amber-50 flex items-center justify-center">
                    <Star className="h-6 w-6 text-amber-500 fill-amber-500" />
                </div>
                <div>
                    <h3 className="text-xl font-black uppercase tracking-tighter">Configurações Master</h3>
                    <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">Acesso Restrito: Alteração de Identidade Visual</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest ml-2">Logotipo do Site</label>
                            <p className="text-sm text-slate-400 mb-4">Recomendado: PNG transparente ou SVG, altura de 56px.</p>
                            <div className="flex gap-4">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleUpload}
                                    className="hidden"
                                    id="logo-upload"
                                />
                                <label
                                    htmlFor="logo-upload"
                                    className="flex-1 bg-slate-50 border border-slate-100 p-5 rounded-2xl font-bold text-sm text-slate-600 cursor-pointer hover:bg-slate-100 transition-all flex items-center gap-3 border-dashed"
                                >
                                    <Upload className="h-5 w-5 text-amber-500" />
                                    {isSaving ? 'Enviando...' : 'Fazer Upload de Novo Logo'}
                                </label>
                            </div>
                        </div>

                        <div className="space-y-4 pt-4">
                            <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest ml-2 block text-left">Tamanho do Logo ({theme.logo_height || 56}px)</label>
                            <div className="flex items-center gap-6">
                                <input
                                    type="range"
                                    min="30"
                                    max="150"
                                    value={theme.logo_height || 56}
                                    onChange={async (e) => {
                                        const newHeight = parseInt(e.target.value);
                                        setTheme({ ...theme, logo_height: newHeight });
                                        // Auto-save height for convenience in Master section
                                        await supabase.from('site_settings').upsert({ key: 'site_theme', value: { ...theme, logo_height: newHeight } });
                                    }}
                                    className="flex-1 h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-amber-500"
                                />
                                <div className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 font-bold text-sm text-slate-400">
                                    {theme.logo_height || 56}px
                                </div>
                            </div>
                            <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">
                                Ajuste a altura em pixels. O cabeçalho se adaptará automaticamente.
                            </p>
                        </div>
                    </div>

                <div className="bg-slate-900/5 p-10 rounded-[40px] border border-slate-100 flex items-center justify-center min-h-[160px]">
                    <div className="flex flex-col items-center gap-4">
                        <span className="text-[12px] font-black text-slate-300 uppercase tracking-widest">Visualização Atual</span>
                        <img 
                            src={logoUrl} 
                            alt="Logo Preview" 
                            style={{ height: `${theme.logo_height || 56}px` }}
                            className="w-auto object-contain brightness-110 drop-shadow-xl transition-all duration-300" 
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

function HQConfigSection() {
    const [isSaving, setIsSaving] = useState(false);
    const [settings, setSettings] = useState({
        hq_title: 'Nossa Sede em Praia Grande',
        hq_description: 'Venha nos visitar e conhecer as melhores oportunidades imobiliárias pessoalmente.',
        hq_maps_url: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3648.4682014844397!2d-46.4172448!3d-24.004944!2m3!1f0!2f0!3f3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94ce1c4f00000001%3A0x0!2zMjTCsDAwJzE3LjgiUyA0NsKwMjUnMDIuMSJX!5e0!3m2!1spt-BR!2sbr!4v1714589254321!5m2!1spt-BR!2sbr'
    });

    useEffect(() => {
        const fetchSettings = async () => {
            const { data } = await supabase.from('site_settings').select('value').eq('key', 'home_hq').single();
            if (data) setSettings(data.value);
        };
        fetchSettings();
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        const { error } = await supabase.from('site_settings').upsert({ key: 'home_hq', value: settings });
        setIsSaving(false);
        if (error) fireToast('Erro ao salvar: ' + error.message, 'error');
        else fireToast('Informações da Sede atualizadas com sucesso!');
    };

    return (
        <div className="bg-white p-12 rounded-[50px] border border-slate-100 shadow-sm relative overflow-hidden">
            <header className="flex justify-between items-center mb-10">
                <div>
                    <h3 className="text-2xl font-black text-[#1B263B] tracking-tighter uppercase mb-2">Sede e Localização</h3>
                    <p className="text-slate-400 font-bold text-[11px] uppercase tracking-widest text-left">Gerencie o destaque da sede na Home</p>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center">
                    <MapPin className="h-6 w-6 text-indigo-600" />
                </div>
            </header>

            <div className="space-y-8">
                <div className="space-y-4">
                    <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest ml-2 block text-left">Título do Bloco</label>
                    <input
                        type="text"
                        value={settings.hq_title}
                        onChange={e => setSettings({ ...settings, hq_title: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-100 p-5 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-indigo-500/10"
                        placeholder="Ex: Nossa Sede em Praia Grande"
                    />
                </div>
                <div className="space-y-4">
                    <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest ml-2 block text-left">Texto Informativo</label>
                    <textarea
                        value={settings.hq_description}
                        onChange={e => setSettings({ ...settings, hq_description: e.target.value })}
                        rows={3}
                        className="w-full bg-slate-50 border border-slate-100 p-5 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-indigo-500/10 resize-none"
                    />
                </div>
                <div className="space-y-4">
                    <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest ml-2 block text-left">URL do Iframe do Google Maps</label>
                    <input
                        type="text"
                        value={settings.hq_maps_url}
                        onChange={e => setSettings({ ...settings, hq_maps_url: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-100 p-5 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-indigo-500/10"
                        placeholder="Cole o src do iframe aqui..."
                    />
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed mt-2 bg-amber-50 p-4 rounded-xl border border-amber-100/50">
                        ⚠️ <span className="text-amber-600">Atenção:</span> Não use links curtos (como share.google/...). <br />
                        <span className="opacity-70 mt-1 block">Siga: Google Maps ➔ Compartilhar ➔ Incorporar um Mapa ➔ Copie apenas o link dentro de src="...".</span>
                    </p>
                </div>

                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-indigo-600 text-white px-10 py-5 rounded-2xl text-[12px] font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-600/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 disabled:opacity-50"
                >
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                    Salvar Sede
                </button>
            </div>
        </div>
    );
}

function LocationsConfigSection() {
    const [isSaving, setIsSaving] = useState(false);
    const [cities, setCities] = useState<any[]>([]);

    useEffect(() => {
        const fetchLocations = async () => {
            const { data } = await supabase.from('site_settings').select('value').eq('key', 'site_locations').single();
            if (data) setCities(data.value);
            else {
                // Fallback and Initialize
                setCities([
                    { name: 'Praia Grande', slug: 'praia-grande', neighborhoods: ['Canto do Forte', 'Boqueirão', 'Guilhermina', 'Aviação', 'Tupi'] }
                ]);
            }
        };
        fetchLocations();
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        const { error } = await supabase.from('site_settings').upsert({ key: 'site_locations', value: cities });
        setIsSaving(false);
        if (error) fireToast('Erro ao salvar: ' + error.message, 'error');
        else fireToast('Localidades atualizadas com sucesso!');
    };

    const addCity = () => {
        const name = prompt('Nome da Cidade:');
        if (name) {
            setCities([...cities, { name, slug: name.toLowerCase().replace(/ /g, '-'), neighborhoods: [] }]);
        }
    };

    const addNeighborhood = (cityIndex: number) => {
        const name = prompt('Nome do Bairro:');
        if (name) {
            const newCities = [...cities];
            newCities[cityIndex].neighborhoods.push(name);
            setCities(newCities);
        }
    };

    const removeNeighborhood = (cityIndex: number, nebIndex: number) => {
        const newCities = [...cities];
        newCities[cityIndex].neighborhoods.splice(nebIndex, 1);
        setCities(newCities);
    };

    return (
        <div className="bg-white p-12 rounded-[50px] border border-slate-100 shadow-sm relative overflow-hidden">
            <header className="flex justify-between items-center mb-10">
                <div>
                    <h3 className="text-2xl font-black text-[#1B263B] tracking-tighter uppercase mb-2">Estrutura de Localização</h3>
                    <p className="text-slate-400 font-bold text-[11px] uppercase tracking-widest text-left">Gerencie Cidades e Bairros do sistema</p>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-amber-50 flex items-center justify-center">
                    <MapPin className="h-6 w-6 text-amber-600" />
                </div>
            </header>

            <div className="space-y-10">
                <button 
                    onClick={addCity}
                    className="flex items-center gap-3 px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                >
                    <Plus className="h-4 w-4" /> Adicionar Cidade
                </button>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                    {cities.map((city, cityIdx) => (
                        <div key={cityIdx} className="bg-slate-50/50 p-8 rounded-[35px] border border-slate-100 space-y-6">
                            <div className="flex justify-between items-center">
                                <h4 className="text-lg font-black text-primary-900 uppercase tracking-tighter">{city.name}</h4>
                                <button 
                                    onClick={() => setCities(cities.filter((_, i) => i !== cityIdx))}
                                    className="text-red-300 hover:text-red-500 transition-colors"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {city.neighborhoods.map((neb: string, nebIdx: number) => (
                                    <div key={nebIdx} className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest border border-slate-100">
                                        {neb}
                                        <button onClick={() => removeNeighborhood(cityIdx, nebIdx)} className="text-slate-300 hover:text-red-500"><X className="h-3 w-3" /></button>
                                    </div>
                                ))}
                                <button 
                                    onClick={() => addNeighborhood(cityIdx)}
                                    className="bg-indigo-100 text-indigo-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all"
                                >
                                    + Bairro
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="pt-8 border-t border-slate-50">
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-indigo-600 text-white px-10 py-5 rounded-2xl text-[12px] font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-600/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 disabled:opacity-50"
                    >
                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                        Salvar Localidades
                    </button>
                </div>
            </div>
        </div>
    );
}

function AboutConfigSection() {
    const [isSaving, setIsSaving] = useState(false);
    const [settings, setSettings] = useState({
        title: 'Sua parceira de sucesso em Praia Grande.',
        subtitle: 'Mais que uma imobiliária, sua escolha estratégica.',
        text_1: 'Fundada com o propósito de transformar o mercado imobiliário da Baixada Santista, nossa empresa consolidou-se como referência em imóveis de alto padrão e investimentos seguros em Praia Grande.',
        text_2: 'Nossa equipe é formada por especialistas que entendem profundamente a dinâmica local, garantindo que cada cliente não apenas encontre um imóvel, mas realize um investimento estratégico para o futuro de sua família.',
        image_url: 'https://images.unsplash.com/photo-1541888946425-d81bb19480c5?q=80&w=1200',
        years_of_history: '15+'
    });

    useEffect(() => {
        const fetchSettings = async () => {
            const { data } = await supabase.from('site_settings').select('value').eq('key', 'about_us').single();
            if (data && data.value) setSettings(prev => ({ ...prev, ...data.value }));
        };
        fetchSettings();
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        const { error } = await supabase.from('site_settings').upsert({ key: 'about_us', value: settings });
        setIsSaving(false);
        if (error) fireToast('Erro ao salvar: ' + error.message, 'error');
        else fireToast('Página Sobre Nós atualizada com sucesso!');
    };

    return (
        <div className="bg-white p-12 rounded-[50px] border border-slate-100 shadow-sm">
            <div className="flex items-center gap-4 mb-8">
                <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center">
                    <Users className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                    <h3 className="text-xl font-black uppercase tracking-tighter">Página Sobre Nós</h3>
                    <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">Personalize a história e missão da empresa</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest ml-2">Título de Destaque</label>
                    <input
                        className="w-full bg-slate-50 border border-slate-100 p-5 rounded-3xl font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500/20"
                        value={settings.title}
                        onChange={e => setSettings({ ...settings, title: e.target.value })}
                    />
                </div>
                <div className="space-y-4">
                    <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest ml-2">Subtítulo (Headline)</label>
                    <input
                        className="w-full bg-slate-50 border border-slate-100 p-5 rounded-3xl font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500/20"
                        value={settings.subtitle}
                        onChange={e => setSettings({ ...settings, subtitle: e.target.value })}
                    />
                </div>
                <div className="space-y-4">
                    <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest ml-2">Parágrafo 1</label>
                    <textarea
                        rows={3}
                        className="w-full bg-slate-50 border border-slate-100 p-5 rounded-3xl font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
                        value={settings.text_1}
                        onChange={e => setSettings({ ...settings, text_1: e.target.value })}
                    />
                </div>
                <div className="space-y-4">
                    <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest ml-2">Parágrafo 2</label>
                    <textarea
                        rows={3}
                        className="w-full bg-slate-50 border border-slate-100 p-5 rounded-3xl font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
                        value={settings.text_2}
                        onChange={e => setSettings({ ...settings, text_2: e.target.value })}
                    />
                </div>
                <div className="space-y-4">
                    <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest ml-2">URL da Imagem de Capa</label>
                    <input
                        className="w-full bg-slate-50 border border-slate-100 p-5 rounded-3xl font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500/20"
                        value={settings.image_url}
                        onChange={e => setSettings({ ...settings, image_url: e.target.value })}
                    />
                </div>
                <div className="space-y-4">
                    <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest ml-2">Anos de História</label>
                    <input
                        className="w-full bg-slate-50 border border-slate-100 p-5 rounded-3xl font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500/20"
                        value={settings.years_of_history}
                        placeholder="Ex: 15+"
                        onChange={e => setSettings({ ...settings, years_of_history: e.target.value })}
                    />
                </div>
                <div className="lg:col-span-2 pt-4">
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="w-full lg:w-fit px-12 py-5 bg-indigo-600 text-white rounded-[24px] text-[12px] font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-600/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-4"
                    >
                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Salvar Alterações'}
                    </button>
                </div>
            </div>
        </div>
    );
}

function ProfileSection({ profile, setProfile }: { profile: any; setProfile: (p: any) => void }) {
    const [isSaving, setIsSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [formData, setFormData] = useState({
        full_name: profile?.full_name || '',
        creci: profile?.creci || '',
        avatar_url: profile?.avatar_url || ''
    });

    const handleSave = async () => {
        if (!profile?.id) return;
        setIsSaving(true);
        const { error } = await supabase.from('profiles').update(formData).eq('id', profile.id);
        
        if (!error) {
            setProfile({ ...profile, ...formData });
            fireToast('Perfil atualizado com sucesso!');
        } else {
            fireToast('Erro ao salvar perfil: ' + error.message, 'error');
        }
        setIsSaving(false);
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !profile?.id) return;

        setUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const filePath = `avatars/${profile.id}-${Math.random()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from(STORAGE_BUCKET)
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from(STORAGE_BUCKET)
                .getPublicUrl(filePath);

            setFormData(prev => ({ ...prev, avatar_url: publicUrl }));
        } catch (err: any) {
            alert('Erro no upload: ' + err.message);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <header className="flex justify-between items-center bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 blur-[100px] -z-10" />
                <div className="flex items-center gap-6">
                    <div className="relative group">
                        <div className="h-32 w-32 rounded-[32px] bg-[#1B263B] text-white flex items-center justify-center text-4xl font-black shadow-2xl overflow-hidden border-4 border-white">
                            {formData.avatar_url ? (
                                <img src={formData.avatar_url} className="w-full h-full object-cover" alt="" />
                            ) : (
                                formData.full_name?.charAt(0) || 'U'
                            )}
                        </div>
                        <label className="absolute -bottom-2 -right-2 h-10 w-10 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-xl cursor-pointer hover:scale-110 active:scale-95 transition-all">
                            {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Camera className="h-5 w-5" />}
                            <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={uploading} />
                        </label>
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-[#1B263B] tracking-tighter uppercase mb-1">Meu Perfil</h2>
                        <p className="text-slate-400 font-bold text-[11px] uppercase tracking-widest flex items-center gap-2">
                            <ShieldCheck className="h-3.5 w-3.5 text-indigo-500" /> Nível de Acesso: <span className="text-indigo-600">{profile?.role || 'Usuário'}</span>
                        </p>
                    </div>
                </div>
            </header>

            <div className="bg-white p-12 rounded-[50px] border border-slate-100 shadow-sm space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4 text-left">
                        <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest ml-2 block italic">Nome Completo</label>
                        <div className="relative">
                            <User className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                            <input
                                type="text"
                                value={formData.full_name}
                                onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-100 p-5 pl-14 rounded-3xl font-bold text-sm outline-none focus:ring-4 focus:ring-indigo-500/10 placeholder:text-slate-300"
                                placeholder="Seu Nome Completo"
                            />
                        </div>
                    </div>

                    <div className="space-y-4 text-left">
                        <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest ml-2 block italic">Registro CRECI / Profissional</label>
                        <div className="relative">
                            <Briefcase className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                            <input
                                type="text"
                                value={formData.creci}
                                onChange={e => setFormData({ ...formData, creci: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-100 p-5 pl-14 rounded-3xl font-bold text-sm outline-none focus:ring-4 focus:ring-indigo-500/10 placeholder:text-slate-300"
                                placeholder="Ex: 123.456-F"
                            />
                        </div>
                    </div>
                </div>

                <div className="p-8 bg-indigo-50/50 rounded-[35px] border border-indigo-100/50 flex flex-col md:flex-row items-center gap-6">
                    <div className="h-14 w-14 rounded-2xl bg-white flex items-center justify-center shadow-sm border border-indigo-100">
                        <Info className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <h4 className="text-sm font-black text-indigo-900 uppercase tracking-widest mb-1">Dica Profissional</h4>
                        <p className="text-indigo-600/60 text-[12px] font-bold leading-relaxed max-w-xl">Mantenha seu CRECI atualizado. Ele será exibido em todos os seus roteiros de visita e propostas geradas pelo sistema para garantir conformidade legal.</p>
                    </div>
                </div>

                <div className="flex gap-4 pt-4">
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex-1 md:flex-none px-12 py-5 bg-[#1B263B] text-white rounded-[24px] text-[12px] font-black uppercase tracking-[0.2em] shadow-xl shadow-[#1B263B]/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-4 disabled:opacity-50"
                    >
                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                        Salvar Alterações
                    </button>
                </div>
            </div>
        </div>
    );
}

function FeaturesConfigSection() {
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [features, setFeatures] = useState<any[]>([]);
    const [editingFeature, setEditingFeature] = useState<any | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const [formData, setFormData] = useState({
        name: '',
        category: 'Outros'
    });

    const CATEGORIES = ['Localização', 'Área de Lazer', 'Diferenciais Internos', 'Infraestrutura', 'Outros'];

    const fetchFeatures = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('property_features')
            .select('*')
            .order('category', { ascending: true })
            .order('name', { ascending: true });
        
        if (!error) {
            setFeatures(data || []);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchFeatures();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            if (editingFeature) {
                const { error } = await supabase
                    .from('property_features')
                    .update({
                        name: formData.name,
                        category: formData.category
                    })
                    .eq('id', editingFeature.id);
                
                if (error) throw error;
                fireToast('Característica atualizada com sucesso!');
            } else {
                const { error } = await supabase
                    .from('property_features')
                    .insert([{
                        name: formData.name,
                        category: formData.category
                    }]);
                
                if (error) throw error;
                fireToast('Característica adicionada com sucesso!');
            }

            setFormData({ name: '', category: 'Outros' });
            setEditingFeature(null);
            setIsModalOpen(false);
            fetchFeatures();
        } catch (error: any) {
            fireToast(`Erro: ${error.message}`, 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir esta característica?')) return;

        const { error } = await supabase
            .from('property_features')
            .delete()
            .eq('id', id);
        
        if (error) {
            fireToast('Erro ao excluir. Verifique se ela está sendo usada em algum imóvel.', 'error');
        } else {
            fireToast('Característica removida com sucesso!');
            fetchFeatures();
        }
    };

    const openEditModal = (feature: any) => {
        setEditingFeature(feature);
        setFormData({ name: feature.name, category: feature.category });
        setIsModalOpen(true);
    };

    if (isLoading) {
        return (
            <div className="py-20 flex flex-col items-center justify-center gap-8">
                <Loader2 className="h-12 w-12 text-[#1B263B] animate-spin" />
                <p className="text-[12px] font-black uppercase tracking-[0.4em] text-slate-300">Carregando Características</p>
            </div>
        );
    }

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <header className="flex justify-between items-center bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm">
                <div>
                    <h3 className="text-3xl font-black text-[#1B263B] tracking-tighter uppercase mb-2">Gestão de Características</h3>
                    <p className="text-slate-400 font-bold text-[11px] uppercase tracking-widest text-left">Comodidades, detalhes técnicos e diferenciais dos imóveis</p>
                </div>
                <button
                    onClick={() => {
                        setEditingFeature(null);
                        setFormData({ name: '', category: 'Outros' });
                        setIsModalOpen(true);
                    }}
                    className="flex items-center gap-3 bg-[#1B263B] text-white px-8 py-4 rounded-2xl text-[12px] font-black uppercase tracking-widest hover:bg-[#10b981] transition-all shadow-xl shadow-[#10b981]/10 group"
                >
                    <Plus className="h-4 w-4" />
                    Adicionar Novo
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {CATEGORIES.map(cat => (
                    <div key={cat} className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                        <div className="p-8 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="font-black text-sm uppercase tracking-widest text-[#1B263B]">{cat}</h3>
                            <span className="bg-[#10b981]/10 text-[#10b981] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                                {features.filter(f => f.category === cat).length} itens
                            </span>
                        </div>
                        <div className="p-6 flex-1 space-y-2">
                            {features.filter(f => f.category === cat).length > 0 ? (
                                features.filter(f => f.category === cat).map(feature => (
                                    <div key={feature.id} className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-2xl transition-all group border border-transparent hover:border-slate-100">
                                        <span className="text-sm font-bold text-slate-600 group-hover:text-[#1B263B]">{feature.name}</span>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                            <button 
                                                onClick={() => openEditModal(feature)}
                                                className="h-8 w-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                                            >
                                                <Edit2 className="h-3.5 w-3.5" />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(feature.id)}
                                                className="h-8 w-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-8 text-center text-slate-300">
                                    <p className="text-[10px] font-black uppercase tracking-widest italic">Nenhum item cadastrado</p>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 sm:p-12">
                    <div className="absolute inset-0 bg-[#1B263B]/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
                    <div className="bg-white w-full max-w-lg rounded-[50px] shadow-2xl relative z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
                        <div className="p-10 border-b border-slate-50 flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-black tracking-tighter uppercase">
                                    {editingFeature ? 'Editar Característica' : 'Nova Característica'}
                                </h2>
                                <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em] mt-1 text-left">
                                    Organização técnica do inventário
                                </p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="h-10 w-10 rounded-xl bg-slate-50 text-slate-300 flex items-center justify-center hover:text-red-500">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSave} className="p-10 space-y-8">
                            <div className="space-y-4 text-left">
                                <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest ml-2 italic block text-left">Nome da Característica</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="Ex: Aquecimento Central, Tomadas USB"
                                    className="w-full bg-slate-50 border border-slate-100 p-5 rounded-[24px] font-bold text-sm outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-4 text-left">
                                <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest ml-2 italic block text-left">Categoria do Sistema</label>
                                <div className="relative">
                                    <select
                                        required
                                        className="w-full bg-slate-50 border border-slate-100 p-5 rounded-[24px] font-bold text-sm outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all appearance-none"
                                        value={formData.category}
                                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    >
                                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                    <ChevronRight className="absolute right-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 rotate-90" />
                                </div>
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 bg-slate-50 text-slate-400 p-5 rounded-[24px] font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-100 transition-all"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="flex-3 bg-[#1B263B] text-white p-5 px-10 rounded-[24px] font-black text-xs uppercase tracking-[0.2em] hover:bg-indigo-600 transition-all shadow-xl shadow-[#1B263B]/10 disabled:opacity-50"
                                >
                                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : (editingFeature ? 'Salvar Alterações' : 'Criar Característica')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

function PartnersSection() {
    const [partners, setPartners] = useState<any[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [newName, setNewName] = useState('');
    const [newLogoUrl, setNewLogoUrl] = useState('');

    const fetchPartners = async () => {
        setIsLoading(true);
        const { data } = await supabase.from('partners').select('*').order('created_at', { ascending: false });
        if (data) setPartners(data);
        setIsLoading(false);
    };

    useEffect(() => {
        fetchPartners();
    }, []);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsSaving(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `partner_${Math.random()}.${fileExt}`;
            const filePath = `partners/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from(STORAGE_BUCKET)
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from(STORAGE_BUCKET)
                .getPublicUrl(filePath);

            setNewLogoUrl(publicUrl);
        } catch (err: any) {
            alert('Erro no upload: ' + err.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleAdd = async () => {
        if (!newName || !newLogoUrl) {
            alert('Preencha o nome e faça upload da logo.');
            return;
        }

        setIsSaving(true);
        const { error } = await supabase.from('partners').insert({
            name: newName,
            logo_url: newLogoUrl
        });

        if (!error) {
            setNewName('');
            setNewLogoUrl('');
            fetchPartners();
            fireToast('Parceiro adicionado com sucesso!');
        } else {
            fireToast('Erro ao salvar: ' + error.message, 'error');
        }
        setIsSaving(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Deseja excluir este parceiro?')) return;
        const { error } = await supabase.from('partners').delete().eq('id', id);
        if (!error) fetchPartners();
    };

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="bg-white p-12 rounded-[50px] border border-slate-100 shadow-sm">
                <header className="flex justify-between items-center mb-12">
                    <div>
                        <h3 className="text-3xl font-black text-[#1B263B] tracking-tighter uppercase mb-2">Nossos Parceiros</h3>
                        <p className="text-slate-400 font-bold text-[12px] uppercase tracking-widest">Gerencie as marcas e logotipos exibidos na Home</p>
                    </div>
                    <div className="h-14 w-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                        <Handshake className="h-6 w-6 text-[#10b981]" />
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1 bg-slate-50 p-8 rounded-[40px] space-y-6">
                        <h4 className="text-sm font-black uppercase tracking-widest text-[#1B263B]">Novo Parceiro</h4>

                        <div className="space-y-2">
                            <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest ml-2">Nome da Empresa</label>
                            <input
                                type="text"
                                value={newName}
                                onChange={e => setNewName(e.target.value)}
                                className="w-full bg-white border border-slate-200 p-4 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-[#10b981]/20"
                                placeholder="Ex: Banco Itaú"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest ml-2">Logotipo</label>
                            <div className="flex flex-col gap-4">
                                {newLogoUrl ? (
                                    <div className="relative aspect-video rounded-2xl bg-white border border-slate-200 p-4 flex items-center justify-center">
                                        <img src={newLogoUrl} className="max-h-full max-w-full object-contain" />
                                        <button
                                            onClick={() => setNewLogoUrl('')}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg"
                                        >
                                            <XCircle className="h-4 w-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <input type="file" id="partner-logo" className="hidden" accept="image/*" onChange={handleUpload} />
                                        <label htmlFor="partner-logo" className="w-full aspect-video rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-white transition-all text-slate-400 hover:text-[#10b981] hover:border-[#10b981]/50">
                                            <Upload className="h-8 w-8" />
                                            <span className="text-[12px] font-black uppercase tracking-widest">Upload Logo</span>
                                        </label>
                                    </>
                                )}
                            </div>
                        </div>

                        <button
                            disabled={isSaving}
                            onClick={handleAdd}
                            className="w-full bg-[#1B263B] text-white py-5 rounded-2xl font-black text-[12px] uppercase tracking-[0.2em] shadow-xl hover:scale-105 transition-all active:scale-95 disabled:opacity-50"
                        >
                            {isSaving ? 'Processando...' : 'Adicionar Parceiro'}
                        </button>
                    </div>

                    <div className="lg:col-span-2 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {isLoading ? (
                                <p className="col-span-full text-center py-12 text-slate-400 uppercase font-black text-[12px] tracking-widest">Carregando...</p>
                            ) : partners.length > 0 ? partners.map((p) => (
                                <div key={p.id} className="bg-white border border-slate-100 p-6 rounded-[30px] flex items-center justify-between group hover:shadow-xl hover:shadow-slate-200/50 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="h-16 w-24 bg-slate-50 rounded-2xl p-3 flex items-center justify-center border border-slate-50">
                                            <img src={p.logo_url} className="max-h-full max-w-full object-contain" alt={p.name} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-[#1B263B]">{p.name}</p>
                                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Ativo na Home</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(p.id)}
                                        className="h-10 w-10 rounded-full bg-red-50 text-red-500 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center hover:bg-red-500 hover:text-white"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            )) : (
                                <p className="col-span-full text-center py-12 text-slate-400 uppercase font-black text-[12px] tracking-widest">Nenhum parceiro cadastrado</p>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

function EditUserModal({ user, onClose, onUpdate }: { user: any, onClose: () => void, onUpdate: (user: any) => void }) {
    const [fullName, setFullName] = useState(user.full_name);
    const [creci, setCreci] = useState(user.creci || '');
    const [role, setRole] = useState(user.role);
    const [isApproved, setIsApproved] = useState(user.is_approved);
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        const { data, error } = await supabase.from('profiles').update({
            full_name: fullName,
            creci: creci,
            role: role,
            is_approved: isApproved
        }).eq('id', user.id).select();

        if (!error && data && data.length > 0) {
            onUpdate({ ...user, full_name: fullName, role, is_approved: isApproved });
            alert('Usuário atualizado com sucesso!');
        } else {
            alert('Erro ao atualizar: ' + (error?.message || 'Nenhuma linha afetada. Verifique as permissões de RLS.'));
        }
        setIsSaving(false);
    };

    const handleResetPassword = async () => {
        const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
            redirectTo: `${window.location.origin}/redefinir-senha`,
        });
        if (!error) {
            alert(`E-mail de redefinição enviado para ${user.email}`);
        } else {
            alert('Erro ao enviar e-mail: ' + error.message);
        }
    };

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-primary-900/60 backdrop-blur-md" onClick={onClose} />
            <div className="relative bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
                <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center text-[#1B263B]">
                    <div>
                        <h3 className="text-xl font-black text-primary-900 tracking-tighter uppercase">Editar Usuário</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{user.email}</p>
                    </div>
                    <button onClick={onClose} className="h-10 w-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100 text-slate-400 hover:text-red-500 transition-all">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-8 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome Completo</label>
                            <input
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 text-[#1B263B]"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Registro CRECI</label>
                            <input
                                value={creci}
                                onChange={(e) => setCreci(e.target.value)}
                                placeholder="123.456-F"
                                className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 text-[#1B263B]"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Nível de Acesso</label>
                            <select
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                disabled={user.email === 'augustocalado@hotmail.com'}
                                className={clsx(
                                    "w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 text-[#1B263B]",
                                    user.email === 'augustocalado@hotmail.com' && "opacity-50 cursor-not-allowed"
                                )}
                            >
                                <option value="corretor">Corretor</option>
                                <option value="admin">Administrador</option>
                                <option value="cliente">Cliente</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Status da Conta</label>
                            <select
                                value={isApproved ? 'true' : 'false'}
                                onChange={(e) => setIsApproved(e.target.value === 'true')}
                                disabled={user.email === 'augustocalado@hotmail.com'}
                                className={clsx(
                                    "w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 text-[#1B263B]",
                                    user.email === 'augustocalado@hotmail.com' && "opacity-50 cursor-not-allowed"
                                )}
                            >
                                <option value="true">Ativo / Aprovado</option>
                                <option value="false">Pendente / Bloqueado</option>
                            </select>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-slate-100">
                        <div className="flex items-center justify-between p-4 bg-red-50 rounded-2xl border border-red-100">
                            <div>
                                <p className="text-[11px] font-black text-red-600 uppercase tracking-widest">Segurança</p>
                                <p className="text-[12px] font-bold text-red-900/60 mt-1 whitespace-nowrap overflow-hidden">Resetar a senha do usuário.</p>
                            </div>
                            <button
                                onClick={handleResetPassword}
                                className="px-4 py-2 bg-white text-red-600 border border-red-100 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-sm shrink-0"
                            >
                                Enviar Reset
                            </button>
                        </div>
                    </div>
                </div>

                <div className="p-8 bg-slate-50 border-t border-slate-100 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-4 rounded-2xl text-[12px] font-black uppercase tracking-widest text-slate-400 hover:text-primary-900 transition-all font-bold font-black"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex-[2] bg-primary-900 text-white px-8 py-4 rounded-2xl text-[12px] font-black uppercase tracking-widest hover:bg-emerald-600 shadow-xl shadow-primary-900/20 transition-all flex items-center justify-center gap-4 disabled:opacity-50"
                    >
                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        Salvar Informações
                    </button>
                </div>
            </div>
        </div>
    );
}


function BlogSection({ posts, setPosts }: { posts: any[], setPosts: any }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPost, setEditingPost] = useState<any>(null);

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir esta postagem?')) return;
        const { error } = await supabase.from('blog_posts').delete().eq('id', id);
        if (!error) setPosts(posts.filter(p => p.id !== id));
    };

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-6 border-b border-slate-100">
                <div>
                    <h3 className="text-3xl font-black tracking-tighter uppercase flex items-center gap-4 text-[#1B263B]">
                        <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center">
                            <Newspaper className="h-6 w-6 text-indigo-600" />
                        </div>
                        Blog e Conteúdo
                    </h3>
                    <p className="text-[12px] font-bold text-slate-400 uppercase tracking-[0.4em] mt-3 ml-16">Gerencie artigos, dicas e novidades do site</p>
                </div>
                <div className="flex flex-wrap gap-4">
                    <button
                        onClick={() => {
                            setEditingPost(null);
                            setIsModalOpen(true);
                        }}
                        className="bg-[#1B263B] text-white px-10 py-5 rounded-3xl text-[12px] font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-indigo-600 transition-all flex items-center gap-4 group"
                    >
                        <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform" />
                        Nova Postagem
                    </button>
                </div>
            </header>


            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {posts.map((post) => (
                    <div key={post.id} className="bg-white rounded-[45px] border border-slate-100 shadow-sm overflow-hidden group hover:border-indigo-200 transition-all duration-500">
                        <div className="h-56 relative overflow-hidden">
                            <img src={post.image_url || 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt="" />
                            <div className="absolute top-6 left-6">
                                <span className="bg-white/90 backdrop-blur-md text-[#1B263B] px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg">
                                    {post.category || 'Geral'}
                                </span>
                            </div>
                        </div>
                        <div className="p-8 space-y-6">
                            <h4 className="text-xl font-black text-[#1B263B] tracking-tight line-clamp-2 uppercase leading-tight min-h-[3rem] group-hover:text-indigo-600 transition-colors">
                                {post.title}
                            </h4>
                            <p className="text-sm text-slate-400 font-bold line-clamp-2 min-h-[2.5rem] italic">
                                {post.excerpt || post.content?.substring(0, 100) + '...'}
                            </p>
                            <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                                    {new Date(post.created_at).toLocaleDateString()}
                                </span>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => {
                                            setEditingPost(post);
                                            setIsModalOpen(true);
                                        }}
                                        className="h-10 w-10 rounded-xl bg-slate-50 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-all flex items-center justify-center border border-slate-100"
                                    >
                                        <Edit2 className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(post.id)}
                                        className="h-10 w-10 rounded-xl bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all flex items-center justify-center border border-slate-100"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {posts.length === 0 && (
                    <div className="col-span-full py-32 text-center bg-white rounded-[60px] border border-dashed border-slate-200">
                        <Newspaper className="h-20 w-20 text-slate-100 mx-auto mb-6" />
                        <p className="text-slate-400 font-bold text-sm uppercase tracking-[0.3em]">Nenhuma postagem no blog ainda.</p>
                    </div>
                )}
            </div>

            {isModalOpen && (
                <NewsPostModal
                    post={editingPost}
                    onClose={() => setIsModalOpen(false)}
                    onUpdate={(newPost) => {
                        if (editingPost) {
                            setPosts(posts.map(p => p.id === newPost.id ? newPost : p));
                        } else {
                            setPosts([newPost, ...posts]);
                        }
                        setIsModalOpen(false);
                    }}
                />
            )}
        </div>
    );
}

function MarketingSection({ properties }: { properties: any[] }) {
    const [selectedPropertyForAI, setSelectedPropertyForAI] = useState<any>(null);
    const [templateId, setTemplateId] = useState<'modern' | 'glass' | 'bold'>('modern');
    const [format, setFormat] = useState<'feed' | 'stories'>('feed');
    const [aiPitch, setAiPitch] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const templateRef = useRef<HTMLDivElement>(null);

    const downloadTemplate = async (platform: string) => {
        if (!templateRef.current) return;
        try {
            // Set dimensions for high quality
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
            const pitch = `✨ OPORTUNIDADE EM ${prop.neighborhood?.toUpperCase()}! ✨\n\nEste incrível imóvel de ${prop.rooms} dormitórios com ${prop.area}m² é exatamente o que você procura. Com acabamento premium e localização privilegiada em ${prop.city}, ele oferece o equilíbrio perfeito entre conforto e sofisticação.\n\n💰 Investimento: ${prop.price?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}\n\nEntre em contato agora para uma visita exclusiva! 🚀 #KFEImoveis #ImoveisPraiaGrande`;
            setAiPitch(pitch);
            setIsGenerating(false);
        }, 1200);
    };

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <header className="pb-6 border-b border-slate-100">
                <h3 className="text-3xl font-black tracking-tighter uppercase flex items-center gap-4 text-[#1B263B]">
                    <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center">
                        <Zap className="h-6 w-6 text-indigo-600 fill-indigo-600" />
                    </div>
                    Marketing & IA de Vendas
                </h3>
                <p className="text-[12px] font-bold text-slate-400 uppercase tracking-[0.4em] mt-3 ml-16">Crie artes e conteúdos profissionais para WhatsApp e Instagram</p>
            </header>

            <div className="bg-[#1B263B] p-10 rounded-[50px] shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 blur-[100px] group-hover:bg-accent/30 transition-all" />
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
                    {/* Control Side */}
                    <div className="lg:col-span-3 space-y-8 bg-white/5 p-8 rounded-[40px] border border-white/5 flex flex-col justify-between">
                        <div className="space-y-8">
                            <div className="inline-flex items-center gap-3 bg-accent/20 border border-white/10 px-4 py-1.5 rounded-full">
                                <Zap className="h-4 w-4 text-accent fill-accent" />
                                <span className="text-[10px] font-black text-white uppercase tracking-widest">IA KF IMOVEIS</span>
                            </div>
                            <h3 className="text-2xl font-black text-white tracking-tighter uppercase leading-none">Criar Postagem</h3>
                            
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-white/40 uppercase tracking-widest ml-1">Imóvel</label>
                                    <select 
                                        className="w-full bg-[#1B263B] border border-white/10 p-5 rounded-3xl text-white font-bold text-sm outline-none focus:ring-4 focus:ring-accent/20 transition-all appearance-none"
                                        onChange={(e) => {
                                            const prop = properties.find(p => p.id === e.target.value);
                                            setSelectedPropertyForAI(prop);
                                        }}
                                    >
                                        <option value="" className="bg-[#1B263B]">Selecionar...</option>
                                        {properties.map(p => (
                                            <option key={p.id} value={p.id}>{p.title}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-white/40 uppercase tracking-widest ml-1">Estilo</label>
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
                                                    "p-3 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all",
                                                    templateId === t.id ? "bg-accent text-white shadow-xl" : "bg-white/5 text-white/40 hover:bg-white/10"
                                                )}
                                            >
                                                {t.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-white/40 uppercase tracking-widest ml-1">Formato</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {[
                                            {id: 'feed', label: 'Feed (4:5)'},
                                            {id: 'stories', label: 'Stories (9:16)'}
                                        ].map(f => (
                                            <button 
                                                key={f.id}
                                                onClick={() => setFormat(f.id as any)}
                                                className={clsx(
                                                    "p-3 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all",
                                                    format === f.id ? "bg-emerald-500 text-white shadow-xl" : "bg-white/5 text-white/40 hover:bg-white/10"
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
                            className="w-full py-5 bg-white text-[#1B263B] rounded-3xl font-black text-[12px] uppercase tracking-widest hover:bg-accent hover:text-white transition-all shadow-2xl disabled:opacity-40"
                        >
                            {isGenerating ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : '🚀 Gerar Card e Texto'}
                        </button>
                    </div>

                    {/* Preview Side */}
                    <div className="lg:col-span-4 flex flex-col items-center justify-center p-8 bg-black/40 rounded-[40px] border border-white/5 space-y-6">
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
                                                <span className="bg-accent px-4 py-2 rounded-xl text-white font-black text-[9px] uppercase tracking-[0.2em]">{selectedPropertyForAI.neighborhood}</span>
                                                <h4 className={clsx(
                                                    "font-black text-white leading-tight uppercase tracking-tighter line-clamp-2",
                                                    format === 'stories' ? "text-3xl" : "text-2xl"
                                                )}>{selectedPropertyForAI.title}</h4>
                                                <div className="flex items-center gap-4">
                                                    <p className={clsx("font-black text-white", format === 'stories' ? "text-3xl" : "text-2xl")}>{selectedPropertyForAI.price?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                                                    <div className="h-8 w-px bg-white/20" />
                                                    <div className="flex flex-col">
                                                        <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">Área Útil</span>
                                                        <span className="text-sm font-bold text-white">{selectedPropertyForAI.area}m²</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {templateId === 'glass' && (
                                        <div className={clsx(
                                            "absolute inset-x-4 bottom-4 p-8 rounded-[30px] bg-white/10 backdrop-blur-2xl border border-white/20 text-white shadow-2xl",
                                            format === 'stories' && "bottom-12"
                                        )}>
                                            <div className="absolute top-[-15px] left-1/2 -translate-x-1/2 bg-accent px-4 py-1 rounded-full text-[8px] font-black uppercase tracking-widest shadow-xl">Luxo Exclusive</div>
                                            <h4 className="text-xl font-black mb-3 uppercase leading-none">{selectedPropertyForAI.title}</h4>
                                            <div className="grid grid-cols-2 gap-4 items-end">
                                                <div>
                                                    <span className="text-[8px] font-black text-white/40 uppercase tracking-widest block mb-0.5">Valor</span>
                                                    <p className="text-xl font-black">{selectedPropertyForAI.price?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-[8px] font-black text-white/40 uppercase tracking-widest block mb-0.5">Ref. {selectedPropertyForAI.reference_id}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {templateId === 'bold' && (
                                        <>
                                            <div className="absolute top-0 right-0 h-32 w-32 bg-accent rotate-45 shadow-2xl translate-x-12 -translate-y-12" />
                                            <div className={clsx(
                                                "absolute inset-x-0 bottom-0 p-8 bg-accent text-white",
                                                format === 'stories' && "pb-20"
                                            )}>
                                                <p className="text-5xl font-black tracking-tighter leading-none mb-3">{selectedPropertyForAI.price?.toLocaleString('pt-BR', { maximumFractionDigits: 0, currency: 'BRL' }).split(',')[0]}K</p>
                                                <h4 className="text-md font-black uppercase tracking-widest leading-none mb-4 border-b border-white/20 pb-4">{selectedPropertyForAI.neighborhood}</h4>
                                                <div className="flex gap-4">
                                                    <div className="flex gap-1.5 items-center"><Bed className="h-4 w-4" /><span className="font-bold text-sm">{selectedPropertyForAI.rooms}</span></div>
                                                    <div className="flex gap-1.5 items-center"><Bath className="h-4 w-4" /><span className="font-bold text-sm">{selectedPropertyForAI.bathrooms}</span></div>
                                                    <div className="flex gap-1.5 items-center"><Maximize2 className="h-4 w-4" /><span className="font-bold text-sm">{selectedPropertyForAI.area}m²</span></div>
                                                </div>
                                            </div>
                                        </>
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
                            <div className="text-center space-y-4">
                                <div className="h-20 w-20 bg-white/5 rounded-[30px] flex items-center justify-center mx-auto border border-white/10">
                                    <ImageIcon className="h-8 w-8 text-white/5" />
                                </div>
                                <p className="text-white/10 font-bold text-[9px] uppercase tracking-widest">Aguardando Seleção</p>
                            </div>
                        )}
                    </div>

                    {/* Content Side */}
                    <div className="lg:col-span-5 bg-white/5 p-8 rounded-[40px] border border-white/5 flex flex-col">
                        <h4 className="text-xl font-black text-white tracking-widest uppercase mb-8 flex items-center gap-3">
                            <FileText className="h-5 w-5 text-accent" />
                            Legenda de Vendas
                        </h4>
                        {aiPitch ? (
                            <div className="flex-1 flex flex-col justify-between space-y-8 animate-in fade-in slide-in-from-right-10 duration-700">
                                <div className="bg-[#1B263B] p-8 rounded-[35px] border border-white/5 relative group/text">
                                    <p className="text-sm text-white/80 font-medium whitespace-pre-line leading-relaxed italic pr-4 select-all">
                                        "{aiPitch}"
                                    </p>
                                    <div className="absolute top-4 right-4 h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center">
                                        <Zap className="h-3 w-3 text-accent fill-accent animate-pulse" />
                                    </div>
                                </div>
                                
                                <div className="space-y-4">
                                    <button 
                                        onClick={() => {
                                            navigator.clipboard.writeText(aiPitch);
                                            alert('Texto copiado!');
                                        }}
                                        className="w-full py-5 bg-accent/10 text-accent border border-accent/20 rounded-3xl text-[12px] font-black uppercase tracking-widest hover:bg-accent hover:text-white transition-all flex items-center justify-center gap-3"
                                    >
                                        <Download className="h-4 w-4 rotate-180" /> Copiar para o WhatsApp
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex items-center justify-center">
                                <div className="text-center space-y-4">
                                    <MessageSquare className="h-12 w-12 text-white/5 mx-auto" />
                                    <p className="text-white/10 font-bold text-[10px] uppercase tracking-widest max-w-[200px] leading-relaxed">Clique em "Gerar" para criar a legenda.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function IntegracaoSection({ properties }: { properties: any[] }) {
    const [baseUrl, setBaseUrl] = useState('');

    useEffect(() => {
        setBaseUrl(`${window.location.protocol}//${window.location.host}`);
    }, []);

    const feedUrl = `${baseUrl}/api/feed/zap`;
    
    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <header className="pb-6 border-b border-slate-100">
                <h3 className="text-3xl font-black tracking-tighter uppercase flex items-center gap-4 text-[#1B263B]">
                    <div className="h-12 w-12 rounded-2xl bg-[#10b981]/10 flex items-center justify-center">
                        <Globe className="h-6 w-6 text-[#10b981]" />
                    </div>
                    Integrações com Portais
                </h3>
                <p className="text-[12px] font-bold text-slate-400 uppercase tracking-[0.4em] mt-3 ml-16">Sincronize seus imóveis com o Zap Imóveis e VivaReal</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                <div className="bg-white rounded-[60px] p-12 border border-slate-100 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#10b981]/5 blur-[60px] group-hover:bg-[#10b981]/10 transition-all duration-700" />
                    
                    <div className="flex items-center gap-6 mb-10">
                        <div className="h-20 w-20 rounded-3xl bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:scale-110 transition-transform shadow-sm">
                            <Zap className="h-10 w-10 text-[#10b981]" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-[#1B263B] leading-none mb-2 uppercase">Zap & VivaReal</h3>
                            <span className="px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100 italic">VrSync / ZAP Active</span>
                        </div>
                    </div>

                    <p className="text-slate-500 font-medium text-sm leading-relaxed mb-10">
                        O portal solicita uma URL de Feed XML para coletar seus anúncios. Utilize o link abaixo no portal do "Grupo OLX" para sincronização automática a cada 12 horas.
                    </p>

                    <div className="space-y-4">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">URL do Feed XML (VrSync)</label>
                        <div className="flex gap-2">
                            <input 
                                readOnly
                                value={feedUrl}
                                className="flex-1 bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl font-bold text-xs text-slate-400 outline-none"
                            />
                            <button 
                                onClick={() => {
                                    navigator.clipboard.writeText(feedUrl);
                                    alert('Link copiado! Cole no portal Zap Imóveis.');
                                }}
                                className="px-6 py-4 bg-[#1B263B] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#10b981] transition-all whitespace-nowrap"
                            >
                                Copiar Link
                            </button>
                        </div>
                    </div>

                    <div className="mt-12 pt-10 border-t border-slate-50 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-[#10b981]" />
                            <span className="text-[11px] font-black uppercase text-slate-400">Total: {properties.length} imóveis disponíveis</span>
                        </div>
                        <Link href="/api/feed/zap" target="_blank" className="text-[10px] font-black uppercase text-[#1B263B] hover:text-[#10b981] underline decoration-wavy underline-offset-8">
                            Ver Arquivo XML
                        </Link>
                    </div>
                </div>

                <div className="bg-[#1B263B] rounded-[60px] p-12 shadow-2xl relative overflow-hidden flex flex-col justify-between border border-white/5">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#10b981]/10 blur-[100px]" />
                    
                    <div className="relative z-10">
                        <Star className="h-12 w-12 text-[#10b981] mb-8 animate-pulse" />
                        <h3 className="text-3xl font-black text-white leading-tight uppercase mb-6">Cadastre uma vez,<br/><span className="text-[#10b981]">venda em dobro.</span></h3>
                        <p className="text-white/40 font-medium text-sm leading-relaxed mb-8">
                            A integração via XML é a maneira mais profissional de manter seu estoque atualizado nos maiores portais do Brasil sem trabalho manual repetitivo.
                        </p>

                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-white/60">
                                <div className="h-6 w-6 rounded-full bg-white/5 flex items-center justify-center text-[10px] font-black">1</div>
                                <span className="text-[11px] font-bold uppercase tracking-wider">Acesse o CRM do Zap Imóveis</span>
                            </div>
                            <div className="flex items-center gap-3 text-white/60">
                                <div className="h-6 w-6 rounded-full bg-white/5 flex items-center justify-center text-[10px] font-black">2</div>
                                <span className="text-[11px] font-bold uppercase tracking-wider">Vá em Configurações &gt; Carga de Dados</span>
                            </div>
                            <div className="flex items-center gap-3 text-[#10b981]">
                                <div className="h-6 w-6 rounded-full bg-[#10b981]/20 flex items-center justify-center text-[10px] font-black">3</div>
                                <span className="text-[11px] font-bold uppercase tracking-wider">Cole o link copiado aqui ao lado</span>
                            </div>
                        </div>
                    </div>

                    <div className="pt-8 text-[9px] font-black text-white/20 uppercase tracking-[0.5em]">KF Network Integration Service</div>
                </div>
            </div>
        </div>
    );
}

function NewsPostModal({ post, onClose, onUpdate }: { post: any, onClose: () => void, onUpdate: (post: any) => void }) {
    const [title, setTitle] = useState(post?.title || '');
    const [excerpt, setExcerpt] = useState(post?.excerpt || '');
    const [content, setContent] = useState(post?.content || '');
    const [imageUrl, setImageUrl] = useState(post?.image_url || '');
    const [importUrl, setImportUrl] = useState('');
    const [isExtracting, setIsExtracting] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const handleExtract = async () => {
        if (!importUrl) return;
        setIsExtracting(true);
        try {
            const res = await fetch('/api/blog/extract', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: importUrl })
            });
            const data = await res.json();
            if (data.title) setTitle(data.title);
            if (data.image) setImageUrl(data.image);
            if (data.excerpt) setExcerpt(data.excerpt);
            if (data.source) setContent(`Fonte: ${data.source}\n\n${content}`);
        } catch (error) {
            console.error('Erro ao extrair:', error);
            alert('Não foi possível extrair dados deste link.');
        } finally {
            setIsExtracting(false);
        }
    };

    const handleSave = async () => {
        if (!title || !content) {
            alert('Título e conteúdo são obrigatórios.');
            return;
        }

        setIsSaving(true);
        const postData = {
            title,
            excerpt,
            content,
            image_url: imageUrl,
            slug: title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '')
        };

        if (post) {
            const { data, error } = await supabase.from('blog_posts').update(postData).eq('id', post.id).select().single();
            if (!error && data) onUpdate(data);
            else alert('Erro ao atualizar: ' + error?.message);
        } else {
            const { data, error } = await supabase.from('blog_posts').insert([postData]).select().single();
            if (!error && data) onUpdate(data);
            else alert('Erro ao Criar: ' + error?.message);
        }
        setIsSaving(false);
    };

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-[#1B263B]/80 backdrop-blur-md" onClick={onClose} />
            <div className="relative bg-white w-full max-w-4xl rounded-[50px] shadow-2xl overflow-hidden animate-in zoom-in duration-300 max-h-[90vh] overflow-y-auto">
                <div className="p-10 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
                    <div>
                        <h3 className="text-3xl font-black text-[#1B263B] tracking-tighter uppercase">{post ? 'Editar Postagem' : 'Nova Postagem'}</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Crie conteúdo relevante para seu público</p>
                    </div>
                    <button onClick={onClose} className="h-12 w-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 hover:text-red-500 transition-all">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <div className="px-10 py-6 bg-indigo-50/50 border-b border-indigo-100 flex gap-4 items-end">
                    <div className="flex-1 space-y-2">
                        <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-2">Importar conteúdo de link externo (Real Time)</label>
                        <div className="relative">
                            <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-300" />
                            <input
                                value={importUrl}
                                onChange={(e) => setImportUrl(e.target.value)}
                                placeholder="Cole o link da notícia aqui (ex: G1, Portais...)"
                                className="w-full bg-white border border-indigo-100 p-4 pl-12 rounded-2xl font-bold text-xs outline-none focus:ring-4 focus:ring-indigo-500/10"
                            />
                        </div>
                    </div>
                    <button
                        onClick={handleExtract}
                        disabled={isExtracting || !importUrl}
                        className="bg-indigo-600 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#1B263B] transition-all disabled:opacity-40 flex items-center gap-2 shadow-lg shadow-indigo-200"
                    >
                        {isExtracting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                        {isExtracting ? 'Extraindo...' : 'Extrair Dados'}
                    </button>
                </div>

                <div className="p-10 grid grid-cols-1 lg:grid-cols-2 gap-10">
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-2">Título do Artigo</label>
                            <input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-100 p-6 rounded-3xl font-bold text-sm outline-none focus:ring-4 focus:ring-indigo-500/10"
                                placeholder="Ex: Por que investir em Praia Grande agora?"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-2">Resumo (opcional)</label>
                            <textarea
                                value={excerpt}
                                onChange={(e) => setExcerpt(e.target.value)}
                                rows={3}
                                className="w-full bg-slate-50 border border-slate-100 p-6 rounded-3xl font-bold text-sm outline-none focus:ring-4 focus:ring-indigo-500/10 resize-none"
                                placeholder="Uma breve descrição que aparece na listagem..."
                            />
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-2">URL da Imagem</label>
                                <input
                                    value={imageUrl}
                                    onChange={(e) => setImageUrl(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-100 p-6 rounded-3xl font-bold text-sm outline-none focus:ring-4 focus:ring-indigo-500/10"
                                    placeholder="https://..."
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-2">Conteúdo do Artigo (Markdown/HTML)</label>
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                rows={10}
                                className="w-full h-[350px] bg-slate-50 border border-slate-100 p-8 rounded-[40px] font-medium text-sm outline-none focus:ring-4 focus:ring-indigo-500/10 resize-none leading-relaxed"
                                placeholder="Escreva seu artigo aqui..."
                            />
                        </div>
                    </div>
                </div>

                <div className="p-10 bg-slate-50 border-t border-slate-100 flex gap-4">
                    <button onClick={onClose} className="flex-1 px-8 py-5 rounded-2xl text-[12px] font-black uppercase tracking-widest text-slate-400 hover:text-[#1B263B] transition-all">Cancelar</button>
                    <button
                        disabled={isSaving}
                        onClick={handleSave}
                        className="flex-[2] bg-[#1B263B] text-white px-8 py-5 rounded-2xl text-[12px] font-black uppercase tracking-widest hover:bg-indigo-600 shadow-xl shadow-[#1B263B]/20 transition-all flex items-center justify-center gap-4 disabled:opacity-50"
                    >
                        {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <ShieldCheck className="h-5 w-5" />}
                        {isSaving ? 'Processando...' : 'Publicar Artigo'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function AdminDashboard() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <Loader2 className="h-12 w-12 text-[#10b981] animate-spin" />
            </div>
        }>
            <AdminDashboardContent />
        </Suspense>
    );
}
function SpecsConfigSection() {
    const [specs, setSpecs] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSpec, setEditingSpec] = useState<any>(null);

    const [formData, setFormData] = useState({
        label: '',
        field: 'rooms',
        icon: 'Bed',
        color: 'text-blue-500',
        suffix: ''
    });

    const AVAILABLE_FIELDS = [
        { value: 'rooms', label: 'Dormitórios' },
        { value: 'suites', label: 'Suítes' },
        { value: 'bathrooms', label: 'Banheiros/WC' },
        { value: 'parking_spaces', label: 'Vagas de Garagem' },
        { value: 'area', label: 'Área Útil' },
        { value: 'area_total', label: 'Área Total' }
    ];

    const AVAILABLE_ICONS = [
        { value: 'Bed', label: 'Cama' },
        { value: 'BedDouble', label: 'Cama Casal (Suíte)' },
        { value: 'Bath', label: 'Banheira/WC' },
        { value: 'Car', label: 'Carro' },
        { value: 'Maximize2', label: 'Área/Expansão' },
        { value: 'Star', label: 'Estrela' },
        { value: 'Navigation', label: 'Navegação' },
        { value: 'Building2', label: 'Prédio' },
        { value: 'Home', label: 'Casa' },
        { value: 'Zap', label: 'Raio' },
        { value: 'Check', label: 'Check' },
        { value: 'Sofa', label: 'Sala/Sofá' },
        { value: 'Fence', label: 'Quintal/Cerca' },
        { value: 'Waves', label: 'Piscina/Água' },
        { value: 'Flame', label: 'Churrasqueira/Fogo' },
        { value: 'Dumbbell', label: 'Academia' },
        { value: 'Trees', label: 'Jardim/Horta' },
        { value: 'TreePine', label: 'Natureza/Lazer' },
        { value: 'Wifi', label: 'Internet/WiFi' },
        { value: 'Bike', label: 'Bicicleta' },
        { value: 'Volleyball', label: 'Esportes/Bola' },
        { value: 'Goal', label: 'Quadra/Futebol' },
        { value: 'Trophy', label: 'Troféu' },
        { value: 'Gamepad2', label: 'Salão de Jogos' },
        { value: 'Dog', label: 'Pet Place/Animais' },
        { value: 'PartyPopper', label: 'Salão das Festas' },
        { value: 'Coffee', label: 'Café/Bem-estar' },
        { value: 'Info', label: 'Info' }
    ];

    const AVAILABLE_COLORS = [
        { value: 'text-blue-500', label: 'Azul' },
        { value: 'text-emerald-500', label: 'Verde' },
        { value: 'text-amber-500', label: 'Amarelo' },
        { value: 'text-indigo-500', label: 'Índigo' },
        { value: 'text-red-500', label: 'Vermelho' },
        { value: 'text-slate-500', label: 'Cinza' }
    ];

    const fetchSpecs = async () => {
        setIsLoading(true);
        const { data } = await supabase.from('site_settings').select('value').eq('key', 'property_specs').single();
        if (data && data.value) {
            setSpecs(data.value);
        } else {
            // Default initial state if empty
            const defaultSpecs = [
                { id: 'area', label: 'Área', field: 'area', icon: 'Maximize2', color: 'text-emerald-500', suffix: 'm²' },
                { id: 'rooms', label: 'Dorm', field: 'rooms', icon: 'Bed', color: 'text-blue-500' },
                { id: 'suites', label: 'Suítes', field: 'suites', icon: 'BedDouble', color: 'text-indigo-500' },
                { id: 'parking', label: 'Vagas', field: 'parking_spaces', icon: 'Car', color: 'text-amber-500' },
                { id: 'bathrooms', label: 'WC', field: 'bathrooms', icon: 'Bath', color: 'text-indigo-500' }
            ];
            setSpecs(defaultSpecs);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchSpecs();
    }, []);

    const handleSaveSpecs = async (newSpecs: any[]) => {
        setIsSaving(true);
        const { error } = await supabase.from('site_settings').upsert({ key: 'property_specs', value: newSpecs });
        if (!error) {
            setSpecs(newSpecs);
            fireToast('Atributos atualizados com sucesso!');
        } else {
            fireToast('Erro ao salvar atributos: ' + error.message, 'error');
        }
        setIsSaving(false);
    };

    const handleAddOrEdit = (e: React.FormEvent) => {
        e.preventDefault();
        let newSpecs;
        if (editingSpec) {
            newSpecs = specs.map(s => s.id === editingSpec.id ? { ...formData, id: editingSpec.id } : s);
        } else {
            const newId = Math.random().toString(36).substr(2, 9);
            newSpecs = [...specs, { ...formData, id: newId }];
        }
        handleSaveSpecs(newSpecs);
        setIsModalOpen(false);
        setEditingSpec(null);
    };

    const handleDelete = (id: string) => {
        if (!confirm('Deseja remover este atributo da exibição?')) return;
        const newSpecs = specs.filter(s => s.id !== id);
        handleSaveSpecs(newSpecs);
    };

    if (isLoading) {
        return (
            <div className="py-20 flex flex-col items-center justify-center gap-8">
                <Loader2 className="h-12 w-12 text-[#1B263B] animate-spin" />
                <p className="text-[12px] font-black uppercase tracking-[0.4em] text-slate-300">Carregando Configurações</p>
            </div>
        );
    }

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <header className="flex justify-between items-center bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 blur-[100px] -z-10" />
                <div>
                    <h3 className="text-3xl font-black text-[#1B263B] tracking-tighter uppercase mb-2">Atributos dos Imóveis</h3>
                    <p className="text-slate-400 font-bold text-[11px] uppercase tracking-widest text-left">Configure os ícones e informações que aparecem nos cards e detalhes</p>
                </div>
                <button
                    onClick={() => {
                        setEditingSpec(null);
                        setFormData({ label: '', field: 'rooms', icon: 'Bed', color: 'text-blue-500', suffix: '' });
                        setIsModalOpen(true);
                    }}
                    className="flex items-center gap-3 bg-[#1B263B] text-white px-8 py-4 rounded-2xl text-[12px] font-black uppercase tracking-widest hover:bg-[#10b981] transition-all shadow-xl shadow-[#10b981]/10 group"
                >
                    <Plus className="h-4 w-4" />
                    Adicionar Atributo
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {specs.map((spec) => {
                    const IconComp = ICON_MAP[spec.icon] || Info;
                    return (
                        <div key={spec.id} className="bg-white p-10 rounded-[50px] border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col items-center text-center gap-6 group relative translate-y-0 hover:-translate-y-2">
                             <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                <button 
                                    onClick={() => {
                                        setEditingSpec(spec);
                                        setFormData({ label: spec.label, field: spec.field, icon: spec.icon, color: spec.color, suffix: spec.suffix || '' });
                                        setIsModalOpen(true);
                                    }}
                                    className="h-8 w-8 rounded-xl bg-slate-50 text-slate-400 hover:bg-indigo-600 hover:text-white flex items-center justify-center transition-all"
                                >
                                    <Edit2 className="h-4 w-4" />
                                </button>
                                <button 
                                    onClick={() => handleDelete(spec.id)}
                                    className="h-8 w-8 rounded-xl bg-slate-50 text-slate-400 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                            
                            <div className={clsx("h-16 w-16 rounded-3xl flex items-center justify-center shadow-inner mb-2", spec.color.replace('text-', 'bg-') + '/10')}>
                                <IconComp className={clsx("h-8 w-8", spec.color)} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-300 tracking-[0.3em] mb-1 uppercase">{spec.label}</p>
                                <p className="text-sm font-black text-[#1B263B] uppercase tracking-tighter">Campo: <span className="text-slate-400">{spec.field}</span></p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 sm:p-12">
                    <div className="absolute inset-0 bg-[#1B263B]/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
                    <div className="bg-white w-full max-w-lg rounded-[50px] shadow-2xl relative z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
                        <div className="p-10 border-b border-slate-50 flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-black tracking-tighter uppercase">
                                    {editingSpec ? 'Editar Atributo' : 'Novo Atributo'}
                                </h2>
                                <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em] mt-1 text-left">
                                    Configure como a informação será exibida
                                </p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="h-10 w-10 rounded-xl bg-slate-50 text-slate-300 flex items-center justify-center hover:text-red-500">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <form onSubmit={handleAddOrEdit} className="p-10 space-y-6">
                            <div className="space-y-4 text-left">
                                <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest ml-2 block">Rótulo Exibido (Label)</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="Ex: Dormitórios, Área, Suítes"
                                    className="w-full bg-slate-50 border border-slate-100 p-5 rounded-[24px] font-bold text-sm outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                                    value={formData.label}
                                    onChange={e => setFormData({ ...formData, label: e.target.value })}
                                />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-4 text-left">
                                    <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest ml-2 block text-left">Campo de Dados MySQL</label>
                                    <input
                                        list="available-fields"
                                        className="w-full bg-slate-50 border border-slate-100 p-5 rounded-[24px] font-bold text-sm outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                                        value={formData.field}
                                        onChange={e => setFormData({ ...formData, field: e.target.value })}
                                        placeholder="Digite ou selecione o campo..."
                                    />
                                    <datalist id="available-fields">
                                        {AVAILABLE_FIELDS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                                    </datalist>
                                    <p className="text-[9px] font-bold text-slate-400 px-2 leading-relaxed">
                                        * Esse deve ser o nome exato da coluna no seu Banco de Dados (ex: `iptu`, `condominio`, `area`). Caso informe um campo que não existe na tabela, ao cadastrar um novo imóvel você não poderá salvar esse valor. 
                                    </p>
                                </div>
                                <div className="space-y-4 text-left">

                                    <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest ml-2 block text-left">Ícone</label>
                                    <select
                                        className="w-full bg-slate-50 border border-slate-100 p-5 rounded-[24px] font-bold text-sm outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                                        value={formData.icon}
                                        onChange={e => setFormData({ ...formData, icon: e.target.value })}
                                    >
                                        {AVAILABLE_ICONS.map(i => <option key={i.value} value={i.value}>{i.label}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-4 text-left">
                                    <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest ml-2 block text-left">Cor do Ícone</label>
                                    <select
                                        className="w-full bg-slate-50 border border-slate-100 p-5 rounded-[24px] font-bold text-sm outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                                        value={formData.color}
                                        onChange={e => setFormData({ ...formData, color: e.target.value })}
                                    >
                                        {AVAILABLE_COLORS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-4 text-left">
                                    <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest ml-2 block text-left">Sufixo (ex: m²)</label>
                                    <input
                                        type="text"
                                        placeholder="Opcional"
                                        className="w-full bg-slate-50 border border-slate-100 p-5 rounded-[24px] font-bold text-sm outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                                        value={formData.suffix}
                                        onChange={e => setFormData({ ...formData, suffix: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 bg-slate-50 text-slate-400 p-5 rounded-[24px] font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-100 transition-all"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="flex-3 bg-[#1B263B] text-white p-5 px-10 rounded-[24px] font-black text-xs uppercase tracking-[0.2em] hover:bg-indigo-600 transition-all shadow-xl shadow-[#1B263B]/10 disabled:opacity-50"
                                >
                                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : (editingSpec ? 'Salvar Alterações' : 'Adicionar Atributo')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
