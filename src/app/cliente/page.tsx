'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import { 
    House, Home, Heart, MessageSquare, Clock, MapPin, DollarSign, 
    Loader2, ArrowRight, LogOut, Pencil, UserCircle, Star,
    ShieldCheck, Sparkles, Zap
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';

export default function ClienteDashboard() {
    const router = useRouter();
    const [leads, setLeads] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [profile, setProfile] = useState<any>(null);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    };

    useEffect(() => {
        const fetchClientData = async () => {
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                const { data: prof } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();
                setProfile(prof);

                const { data: lds } = await supabase
                    .from('leads')
                    .select('*, properties!inner(*)')
                    .eq('cliente_id', user.id)
                    .order('created_at', { ascending: false });

                setLeads(lds || []);
            } else {
                router.push('/login');
            }
            setIsLoading(false);
        };

        fetchClientData();
    }, [router]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
                <div className="flex flex-col items-center gap-6">
                    <Loader2 className="h-12 w-12 text-[#1B263B] animate-spin" />
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#1B263B]/30">Carregando Perfil Premium</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FDFDFF] text-[#1B263B] selection:bg-indigo-100 selection:text-indigo-900">
            <Navbar />

            {/* Premium Background Elements */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-indigo-50/50 blur-[150px] rounded-full" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-50/50 blur-[150px] rounded-full" />
            </div>

            <main className="max-w-7xl mx-auto px-6 py-28 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                    {/* Sidebar / Profile Card */}
                    <div className="lg:col-span-3">
                        <div className="bg-white/80 backdrop-blur-2xl p-10 rounded-[50px] border border-white shadow-2xl shadow-indigo-100/50 text-center space-y-8 sticky top-28 group">
                            <div className="relative inline-block">
                                <div className="w-28 h-28 rounded-[40px] bg-gradient-to-br from-[#1B263B] to-[#2C3E50] mx-auto flex items-center justify-center text-white text-4xl font-black shadow-2xl shadow-indigo-200 group-hover:rotate-6 transition-all duration-700">
                                    {profile?.full_name?.charAt(0) || 'U'}
                                </div>
                                <div className="absolute -top-2 -right-2 bg-accent p-2 rounded-2xl shadow-xl border-4 border-white animate-bounce">
                                    <Star className="h-4 w-4 text-white fill-white" />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <h2 className="text-2xl font-black tracking-tighter uppercase leading-tight">{profile?.full_name}</h2>
                                <div className="inline-flex items-center gap-2 bg-indigo-50 px-3 py-1 rounded-full">
                                    <ShieldCheck className="h-3 w-3 text-indigo-600" />
                                    <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Membro Prime</span>
                                </div>
                            </div>

                            <div className="pt-8 border-t border-slate-50 space-y-3">
                                <button className="w-full p-4 rounded-3xl bg-[#1B263B] text-white font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-indigo-600 transition-all shadow-xl shadow-indigo-100 active:scale-95 group">
                                    <Heart className="h-4 w-4 transition-transform group-hover:scale-125 group-hover:fill-white" />
                                    <span>Meus Favoritos</span>
                                </button>
                                <button className="w-full p-4 rounded-3xl bg-slate-50 text-slate-400 font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-white border border-transparent hover:border-slate-100 transition-all shadow-sm active:scale-95 group">
                                    <UserCircle className="h-4 w-4 group-hover:text-[#1B263B]" />
                                    <span>Configurações</span>
                                </button>
                                <button 
                                    onClick={handleSignOut}
                                    className="w-full p-4 rounded-3xl bg-red-50 text-red-400 font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-red-500 hover:text-white transition-all active:scale-95 group"
                                >
                                    <LogOut className="h-4 w-4" />
                                    <span>Encerrar Sessão</span>
                                </button>
                            </div>

                            <div className="bg-slate-50/50 p-6 rounded-[35px] border border-dashed border-slate-200">
                                <div className="flex justify-around items-center">
                                    <div className="text-center">
                                        <p className="text-[10px] font-black text-slate-300 uppercase mb-1">Visitas</p>
                                        <p className="text-lg font-black">{leads.length}</p>
                                    </div>
                                    <div className="h-8 w-px bg-slate-200" />
                                    <div className="text-center">
                                        <p className="text-[10px] font-black text-slate-300 uppercase mb-1">Nível</p>
                                        <p className="text-lg font-black">Diamond</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-9 space-y-12 animate-in fade-in slide-in-from-right-10 duration-1000">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="bg-indigo-600 h-2 w-8 rounded-full" />
                                    <p className="text-[11px] font-black text-indigo-600 uppercase tracking-[0.4em]">Dashboard Pessoal</p>
                                </div>
                                <h1 className="text-6xl font-black tracking-tighter uppercase leading-none">Olá, {profile?.full_name?.split(' ')[0]}!</h1>
                            </div>
                        </div>

                        {/* Recent Activity / Leads */}
                        <div className="space-y-8">
                            <div className="flex items-center justify-between">
                                <h2 className="text-3xl font-black text-[#1B263B] tracking-tight uppercase flex items-center gap-4">
                                    <div className="h-14 w-14 bg-white rounded-2xl shadow-lg flex items-center justify-center border border-slate-50">
                                        <Zap className="h-6 w-6 text-[#1B263B] fill-[#1B263B]" />
                                    </div>
                                    Solicitações Recentes
                                </h2>
                                <Link 
                                    href="/" 
                                    className="h-14 px-8 rounded-2xl bg-white border border-indigo-100 shadow-xl shadow-indigo-50 text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center hover:bg-indigo-600 hover:text-white transition-all group"
                                >
                                    Ver todas as ofertas
                                    <ArrowRight className="h-4 w-4 ml-3 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>

                            {leads.length === 0 ? (
                                <div className="bg-white p-24 text-center rounded-[60px] border border-dashed border-slate-100 shadow-2xl shadow-indigo-50/50">
                                    <div className="h-24 w-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8">
                                        <MessageSquare className="h-10 w-10 text-slate-200" />
                                    </div>
                                    <h3 className="text-2xl font-black mb-4 uppercase tracking-tight">Nenhuma interação ainda</h3>
                                    <p className="text-slate-400 font-medium max-w-sm mx-auto mb-10 leading-relaxed">Comece a explorar nossos imóveis exclusivos e entre em contato para agendar uma visita premium.</p>
                                    <Link href="/" className="inline-flex bg-[#1B263B] text-white px-12 py-5 rounded-3xl font-black text-[12px] uppercase tracking-widest hover:bg-indigo-600 shadow-2xl shadow-indigo-200 transition-all hover:scale-105 active:scale-95">Descobrir Imóveis</Link>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {leads.map((lead) => (
                                        <div key={lead.id} className="bg-white p-10 rounded-[50px] border border-slate-50 shadow-xl shadow-indigo-50/20 hover:shadow-2xl hover:shadow-indigo-100 transition-all duration-500 group relative overflow-hidden">
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full translate-x-16 -translate-y-16 group-hover:scale-150 transition-transform duration-700" />
                                            
                                            <div className="relative z-10">
                                                <div className="flex justify-between items-center mb-8">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg">
                                                            <Home className="h-5 w-5" />
                                                        </div>
                                                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-none">Referência {lead.properties?.reference_id}</span>
                                                    </div>
                                                    <span className={clsx(
                                                        "text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl shadow-sm",
                                                        lead.status === 'novo' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                                    )}>
                                                        {lead.status === 'novo' ? 'Em Análise' : 'Finalizado'}
                                                    </span>
                                                </div>

                                                <h4 className="font-black text-[#1B263B] text-2xl mb-6 tracking-tight group-hover:text-indigo-600 transition-colors uppercase leading-tight line-clamp-2 min-h-[4rem]">
                                                    {lead.properties?.title}
                                                </h4>
                                                
                                                <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100 mb-8 italic text-slate-500 text-sm leading-relaxed relative">
                                                    <span className="absolute -top-3 left-6 text-4xl text-indigo-100 font-serif">"</span>
                                                    {lead.message || 'Interesse em agendar visita VIP.'}
                                                </div>

                                                <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                                                    <div>
                                                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1 italic">{new Date(lead.created_at).toLocaleDateString()} às {new Date(lead.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                                        <p className="text-2xl font-black text-indigo-600 tracking-tighter">{lead.properties?.price?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                                                    </div>
                                                    <Link href={`/imovel/${lead.properties?.id}`}>
                                                        <button className="h-14 w-14 bg-[#1B263B] rounded-2xl text-white hover:bg-indigo-600 transition-all flex items-center justify-center shadow-xl shadow-indigo-100 active:scale-90">
                                                            <ArrowRight className="h-6 w-6" />
                                                        </button>
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Premium Support / Concierge */}
                        <div className="bg-gradient-to-br from-[#1B263B] via-[#243B55] to-[#1B263B] p-16 rounded-[60px] shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 blur-[100px] group-hover:bg-indigo-500/20 transition-all duration-1000" />
                            <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-blue-500/10 blur-[100px]" />
                            
                            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
                                <div className="max-w-lg text-center md:text-left space-y-6">
                                    <div className="inline-flex items-center gap-3 bg-white/10 border border-white/20 px-4 py-2 rounded-full">
                                        <span className="h-2 w-2 bg-indigo-400 rounded-full animate-pulse" />
                                        <span className="text-[10px] font-black text-white uppercase tracking-widest">Concierge Exclusivo</span>
                                    </div>
                                    <h3 className="text-5xl font-black text-white leading-tight tracking-tighter uppercase">Precisa de ajuda personalizada?</h3>
                                    <p className="text-indigo-100/60 font-medium text-lg">Nossos consultores Diamond estão disponíveis agora para acelerar sua negociação e garantir condições exclusivas.</p>
                                </div>
                                <div className="flex flex-col gap-4 w-full md:w-auto">
                                    <button className="bg-white text-[#1B263B] px-12 py-6 rounded-3xl font-black text-[12px] uppercase tracking-widest flex items-center justify-center gap-4 hover:bg-indigo-50 transition-all shadow-2xl active:scale-95 group">
                                        Falar com Consultor
                                        <MessageSquare className="h-5 w-5 text-indigo-600 group-hover:scale-125 transition-transform" />
                                    </button>
                                    <p className="text-center text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">Atendimento Prioritário</p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
}
