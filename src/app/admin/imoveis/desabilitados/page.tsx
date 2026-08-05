'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import {
    Building2, MapPin, DollarSign, Home, Maximize,
    BedDouble, Bath, Car, ArrowLeft, Loader2,
    CheckCircle2, XCircle, Info, Image as ImageIcon,
    Search, RefreshCw, Power, Edit3, Trash2, Shield, Eye,
    Filter, AlertCircle, Sparkles, Check, ChevronRight, Menu, X, LayoutDashboard, Users, Settings, LogOut, Layers
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';
import Toast, { ToastType } from '@/components/Toast';

export default function ImoveisDesabilitadosPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [isActionLoading, setIsActionLoading] = useState<string | null>(null);
    const [properties, setProperties] = useState<any[]>([]);
    const [filteredProperties, setFilteredProperties] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'todos' | 'pausado' | 'desabilitado' | 'vendido' | 'inativo'>('todos');
    const [currentUserProfile, setCurrentUserProfile] = useState<any>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

    const showToast = (message: string, type: ToastType = 'success') => {
        setToast({ message, type });
    };

    const fetchDisabledProperties = async () => {
        setIsLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push('/login');
                return;
            }

            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();
            
            setCurrentUserProfile(profile);

            // Fetch properties whose status is NOT available (i.e., paused, disabled, inactive, sold)
            const { data, error } = await supabase
                .from('properties')
                .select('*, profiles!corretor_id(full_name)')
                .not('status', 'in', '("disponivel","disponível","Disponivel","Disponível","DISPONIVEL","DISPONÍVEL")')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Erro ao buscar imóveis desabilitados:', error);
                // Fallback attempt getting all and filtering client side if needed
                const { data: allProps } = await supabase.from('properties').select('*, profiles!corretor_id(full_name)');
                const disabledProps = (allProps || []).filter(p => {
                    const st = (p.status || '').toLowerCase();
                    return st !== 'disponivel' && st !== 'disponível';
                });
                setProperties(disabledProps);
            } else {
                setProperties(data || []);
            }
        } catch (err) {
            console.error('Erro na consulta:', err);
            showToast('Erro ao carregar lista de imóveis.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDisabledProperties();
    }, []);

    useEffect(() => {
        let result = properties;

        if (statusFilter !== 'todos') {
            result = result.filter(p => (p.status || '').toLowerCase() === statusFilter.toLowerCase());
        }

        if (searchTerm.trim()) {
            const s = searchTerm.toLowerCase().trim();
            result = result.filter(p =>
                (p.title || '').toLowerCase().includes(s) ||
                (p.reference_id || '').toLowerCase().includes(s) ||
                (p.neighborhood || '').toLowerCase().includes(s) ||
                (p.city || '').toLowerCase().includes(s) ||
                (p.type || '').toLowerCase().includes(s)
            );
        }

        setFilteredProperties(result);
    }, [searchTerm, statusFilter, properties]);

    const handleEnableProperty = async (id: string, refId: string) => {
        setIsActionLoading(id);
        try {
            const { error } = await supabase
                .from('properties')
                .update({ status: 'disponivel' })
                .eq('id', id);

            if (error) throw error;

            showToast(`Imóvel Ref ${refId || id} reativado com sucesso!`, 'success');
            setProperties(prev => prev.filter(p => p.id !== id));
        } catch (error: any) {
            console.error('Erro ao habilitar imóvel:', error);
            showToast(error.message || 'Erro ao habilitar imóvel.', 'error');
        } finally {
            setIsActionLoading(null);
        }
    };

    const handleDeleteProperty = async (id: string) => {
        setIsActionLoading(id);
        try {
            const { error } = await supabase
                .from('properties')
                .delete()
                .eq('id', id);

            if (error) throw error;

            showToast('Imóvel excluído permanentemente com sucesso!', 'success');
            setProperties(prev => prev.filter(p => p.id !== id));
            setDeleteConfirmId(null);
        } catch (error: any) {
            console.error('Erro ao excluir imóvel:', error);
            showToast(error.message || 'Erro ao excluir imóvel.', 'error');
        } finally {
            setIsActionLoading(null);
        }
    };

    const stats = {
        total: properties.length,
        pausados: properties.filter(p => (p.status || '').toLowerCase() === 'pausado').length,
        desabilitados: properties.filter(p => ['desabilitado', 'inativo'].includes((p.status || '').toLowerCase())).length,
        vendidos: properties.filter(p => (p.status || '').toLowerCase() === 'vendido').length,
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] text-[#1B263B] font-sans antialiased flex flex-col">
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            {/* HEADER ADMIN */}
            <header className="bg-[#1B263B] text-white border-b border-white/10 sticky top-0 z-40 shadow-xl">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-2 hover:bg-white/10 rounded-xl transition-all md:hidden"
                        >
                            {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                        <Link href="/admin" className="flex items-center gap-3 group">
                            <div className="bg-amber-500/20 p-2.5 rounded-2xl border border-amber-500/30 group-hover:scale-105 transition-all">
                                <Power className="h-6 w-6 text-amber-400" />
                            </div>
                            <div>
                                <h1 className="font-black text-lg tracking-tight uppercase flex items-center gap-2">
                                    Imóveis Desabilitados
                                </h1>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                    Painel de Controle e Reativação
                                </p>
                            </div>
                        </Link>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            href="/admin"
                            className="bg-white/10 hover:bg-white/20 text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            <span className="hidden sm:inline">Voltar ao Painel Admin</span>
                        </Link>
                        <Link
                            href="/admin/imoveis/novo"
                            className="bg-[#10b981] hover:bg-[#059669] text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg shadow-[#10b981]/20 transition-all"
                        >
                            <Building2 className="h-4 w-4" />
                            <span className="hidden sm:inline">Novo Imóvel</span>
                        </Link>
                    </div>
                </div>
            </header>

            {/* CONTAINER PRINCIPAL */}
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                
                {/* CARDS DE ESTATÍSTICAS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    <div
                        onClick={() => setStatusFilter('todos')}
                        className={clsx(
                            "cursor-pointer p-6 rounded-3xl border transition-all shadow-sm flex items-center justify-between",
                            statusFilter === 'todos'
                                ? "bg-white border-[#1B263B] ring-2 ring-[#1B263B]/10 shadow-md"
                                : "bg-white border-slate-200/80 hover:border-slate-300"
                        )}
                    >
                        <div>
                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Total Fora de Linha</p>
                            <h3 className="text-3xl font-black text-[#1B263B] mt-1">{stats.total}</h3>
                        </div>
                        <div className="bg-slate-100 p-3.5 rounded-2xl text-slate-600">
                            <Layers className="h-6 w-6" />
                        </div>
                    </div>

                    <div
                        onClick={() => setStatusFilter('pausado')}
                        className={clsx(
                            "cursor-pointer p-6 rounded-3xl border transition-all shadow-sm flex items-center justify-between",
                            statusFilter === 'pausado'
                                ? "bg-amber-50/80 border-amber-500 ring-2 ring-amber-500/20"
                                : "bg-white border-slate-200/80 hover:border-amber-200"
                        )}
                    >
                        <div>
                            <p className="text-[11px] font-black text-amber-600 uppercase tracking-widest">Pausados</p>
                            <h3 className="text-3xl font-black text-amber-700 mt-1">{stats.pausados}</h3>
                        </div>
                        <div className="bg-amber-100 p-3.5 rounded-2xl text-amber-600">
                            <Power className="h-6 w-6" />
                        </div>
                    </div>

                    <div
                        onClick={() => setStatusFilter('desabilitado')}
                        className={clsx(
                            "cursor-pointer p-6 rounded-3xl border transition-all shadow-sm flex items-center justify-between",
                            statusFilter === 'desabilitado'
                                ? "bg-rose-50/80 border-rose-500 ring-2 ring-rose-500/20"
                                : "bg-white border-slate-200/80 hover:border-rose-200"
                        )}
                    >
                        <div>
                            <p className="text-[11px] font-black text-rose-600 uppercase tracking-widest">Desabilitados / Inativos</p>
                            <h3 className="text-3xl font-black text-rose-700 mt-1">{stats.desabilitados}</h3>
                        </div>
                        <div className="bg-rose-100 p-3.5 rounded-2xl text-rose-600">
                            <XCircle className="h-6 w-6" />
                        </div>
                    </div>

                    <div
                        onClick={() => setStatusFilter('vendido')}
                        className={clsx(
                            "cursor-pointer p-6 rounded-3xl border transition-all shadow-sm flex items-center justify-between",
                            statusFilter === 'vendido'
                                ? "bg-indigo-50/80 border-indigo-500 ring-2 ring-indigo-500/20"
                                : "bg-white border-slate-200/80 hover:border-indigo-200"
                        )}
                    >
                        <div>
                            <p className="text-[11px] font-black text-indigo-600 uppercase tracking-widest">Vendidos</p>
                            <h3 className="text-3xl font-black text-indigo-700 mt-1">{stats.vendidos}</h3>
                        </div>
                        <div className="bg-indigo-100 p-3.5 rounded-2xl text-indigo-600">
                            <CheckCircle2 className="h-6 w-6" />
                        </div>
                    </div>
                </div>

                {/* FILTROS E BUSCA */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Buscar por referência, título, bairro..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm text-[#1B263B] placeholder-slate-400 outline-none focus:ring-2 focus:ring-[#10b981]/20 transition-all"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                        <span className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5 whitespace-nowrap">
                            <Filter className="h-4 w-4" /> Status:
                        </span>
                        {(['todos', 'pausado', 'desabilitado', 'vendido'] as const).map((st) => (
                            <button
                                key={st}
                                onClick={() => setStatusFilter(st)}
                                className={clsx(
                                    "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap",
                                    statusFilter === st
                                        ? "bg-[#1B263B] text-white shadow-md"
                                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                )}
                            >
                                {st}
                            </button>
                        ))}
                        <button
                            onClick={fetchDisabledProperties}
                            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-all ml-auto"
                            title="Atualizar lista"
                        >
                            <RefreshCw className={clsx("h-4 w-4", isLoading && "animate-spin")} />
                        </button>
                    </div>
                </div>

                {/* LISTAGEM DE IMÓVEIS */}
                {isLoading ? (
                    <div className="bg-white p-12 rounded-3xl border border-slate-200/80 text-center space-y-4">
                        <Loader2 className="h-10 w-10 text-[#10b981] animate-spin mx-auto" />
                        <p className="text-slate-500 font-bold text-sm">Carregando imóveis desabilitados...</p>
                    </div>
                ) : filteredProperties.length === 0 ? (
                    <div className="bg-white p-12 rounded-3xl border border-slate-200/80 text-center space-y-4">
                        <div className="bg-slate-100 p-4 rounded-full w-16 h-16 mx-auto flex items-center justify-center text-slate-400">
                            <Building2 className="h-8 w-8" />
                        </div>
                        <h3 className="text-lg font-black text-[#1B263B] uppercase">Nenhum Imóvel Encontrado</h3>
                        <p className="text-slate-500 text-sm max-w-md mx-auto">
                            {searchTerm || statusFilter !== 'todos'
                                ? 'Nenhum imóvel desabilitado atende aos critérios da sua busca.'
                                : 'Todos os seus imóveis cadastrados estão atualmente ativos e disponíveis no site!'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredProperties.map((prop) => {
                            const mainImage = prop.images && prop.images.length > 0 ? prop.images[0] : null;
                            const stLower = (prop.status || '').toLowerCase();

                            return (
                                <div
                                    key={prop.id}
                                    className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group"
                                >
                                    {/* THUMBNAIL DA PROPRIEDADE */}
                                    <div className="relative h-48 bg-slate-900 overflow-hidden">
                                        {mainImage ? (
                                            <img
                                                src={mainImage}
                                                alt={prop.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-600 bg-slate-100">
                                                <ImageIcon className="h-10 w-10 opacity-30" />
                                            </div>
                                        )}

                                        {/* BADGE DE STATUS */}
                                        <div className="absolute top-4 left-4">
                                            <span
                                                className={clsx(
                                                    "px-3 py-1.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg flex items-center gap-1.5 backdrop-blur-md",
                                                    stLower === 'pausado' && "bg-amber-500/90 text-white",
                                                    stLower === 'vendido' && "bg-indigo-600/90 text-white",
                                                    (stLower === 'desabilitado' || stLower === 'inativo') && "bg-rose-600/90 text-white",
                                                    !['pausado', 'vendido', 'desabilitado', 'inativo'].includes(stLower) && "bg-slate-700/90 text-white"
                                                )}
                                            >
                                                <Power className="h-3 w-3" />
                                                {prop.status || 'Desabilitado'}
                                            </span>
                                        </div>

                                        {/* BADGE DE REFERÊNCIA */}
                                        <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-white text-xs font-black px-3 py-1 rounded-xl">
                                            Ref: {prop.reference_id || 'S/REF'}
                                        </div>

                                        {/* PREÇO */}
                                        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md text-[#1B263B] font-black px-3 py-1.5 rounded-xl text-sm shadow">
                                            R$ {Number(prop.price || 0).toLocaleString('pt-BR')}
                                        </div>
                                    </div>

                                    {/* DETALHES DO IMÓVEL */}
                                    <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                                        <div>
                                            <span className="text-[10px] font-black uppercase text-accent tracking-widest">
                                                {prop.type} • {prop.category || 'Residencial'}
                                            </span>
                                            <h3 className="font-black text-base text-[#1B263B] line-clamp-1 mt-1 group-hover:text-[#10b981] transition-colors">
                                                {prop.title || 'Sem título'}
                                            </h3>
                                            <p className="text-xs text-slate-500 font-bold mt-1 flex items-center gap-1">
                                                <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                                {prop.neighborhood ? `${prop.neighborhood}, ${prop.city}` : prop.city || 'Praia Grande'}
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-100 text-slate-600 text-xs font-bold">
                                            <div className="flex items-center gap-1.5">
                                                <BedDouble className="h-4 w-4 text-slate-400" />
                                                <span>{prop.rooms || 0} Dorms</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Bath className="h-4 w-4 text-slate-400" />
                                                <span>{prop.bathrooms || 0} WCs</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Maximize className="h-4 w-4 text-slate-400" />
                                                <span>{prop.area || 0} m²</span>
                                            </div>
                                        </div>

                                        {/* BOTÕES DE AÇÃO */}
                                        <div className="space-y-2 pt-2">
                                            <button
                                                onClick={() => handleEnableProperty(prop.id, prop.reference_id)}
                                                disabled={isActionLoading === prop.id}
                                                className="w-full bg-[#10b981] hover:bg-[#059669] text-white py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition-all shadow-md hover:shadow-lg shadow-[#10b981]/20 flex items-center justify-center gap-2"
                                            >
                                                {isActionLoading === prop.id ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <>
                                                        <CheckCircle2 className="h-4 w-4" />
                                                        Habilitar / Reativar Imóvel
                                                    </>
                                                )}
                                            </button>

                                            <div className="grid grid-cols-2 gap-2">
                                                <Link
                                                    href={`/admin/imoveis/editar/${prop.id}`}
                                                    className="bg-slate-100 hover:bg-slate-200 text-[#1B263B] py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
                                                >
                                                    <Edit3 className="h-3.5 w-3.5" />
                                                    Editar
                                                </Link>

                                                {deleteConfirmId === prop.id ? (
                                                    <button
                                                        onClick={() => handleDeleteProperty(prop.id)}
                                                        disabled={isActionLoading === prop.id}
                                                        className="bg-rose-600 hover:bg-rose-700 text-white py-2.5 rounded-xl font-black text-[11px] uppercase tracking-wider transition-all flex items-center justify-center gap-1 animate-pulse"
                                                    >
                                                        Confirmar Exclusão
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => setDeleteConfirmId(prop.id)}
                                                        className="bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                        Excluir
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}
