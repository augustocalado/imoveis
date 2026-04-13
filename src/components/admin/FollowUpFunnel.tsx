"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
    MessageSquare, Phone, User, ChevronRight, 
    CheckCircle, Clock, Trash2, Edit2, Globe, 
    ArrowRightCircle, ArrowLeftCircle, Flame, 
    Calendar, CheckCircle2, XCircle
} from 'lucide-react';
import clsx from 'clsx';

const STAGES = [
    { id: 'Novo', title: 'Novos', color: 'bg-emerald-500/10 text-emerald-600', icon: MessageSquare },
    { id: 'Em atendimento', title: 'Atendimento', color: 'bg-indigo-500/10 text-indigo-600', icon: Clock },
    { id: 'Visita Agendada', title: 'Visita', color: 'bg-amber-500/10 text-amber-600', icon: Calendar },
    { id: 'Proposta', title: 'Proposta', color: 'bg-pink-500/10 text-pink-600', icon: Rocket },
    { id: 'Fechado', title: 'Fechado', color: 'bg-green-500/10 text-green-600', icon: CheckCircle2 },
    { id: 'arquivado', title: 'Arquivado', color: 'bg-slate-100 text-slate-400', icon: XCircle },
];

export default function FollowUpFunnel() {
    const [leads, setLeads] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedLead, setSelectedLead] = useState<any>(null);

    useEffect(() => {
        fetchLeads();
    }, []);

    const fetchLeads = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('chat_leads')
            .select('*')
            .order('updated_at', { ascending: false });

        if (!error && data) {
            setLeads(data);
        }
        setIsLoading(false);
    };

    const updateStatus = async (id: string, newStatus: string) => {
        const { error } = await supabase
            .from('chat_leads')
            .update({ status: newStatus, updated_at: new Date().toISOString() })
            .eq('id', id);
            
        if (!error) {
            setLeads(prev => prev.map(l => l.id === id ? { ...l, status: newStatus } : l));
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('show-toast', { 
                    detail: { message: `Status alterado para: ${newStatus}`, type: 'success' } 
                }));
            }
        }
    };

    if (isLoading) {
        return <div className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-sm">Carregando funil...</div>;
    }

    return (
        <div className="flex gap-4 overflow-x-auto pb-10 custom-scrollbar -mx-4 px-4 min-h-[70vh]">
            {STAGES.map((stage) => {
                const stageLeads = leads.filter(l => (l.status || 'Novo') === stage.id);
                return (
                    <div key={stage.id} className="min-w-[280px] w-[320px] flex flex-col gap-4">
                        {/* Stage Header */}
                        <div className="flex items-center justify-between px-3 py-1">
                            <div className="flex items-center gap-2">
                                <div className={clsx("p-2 rounded-lg", stage.color)}>
                                    <stage.icon className="h-4 w-4" />
                                </div>
                                <h4 className="text-[12px] font-black uppercase tracking-widest text-slate-700">{stage.title}</h4>
                            </div>
                            <span className="bg-slate-100 text-slate-500 text-[10px] font-black px-2 py-0.5 rounded-full">
                                {stageLeads.length}
                            </span>
                        </div>

                        {/* Drop Zone / Cards List */}
                        <div className="flex-1 bg-slate-50/50 rounded-[32px] p-3 border border-slate-100 space-y-3 min-h-[500px]">
                            {stageLeads.map((lead) => (
                                <div 
                                    key={lead.id}
                                    className="group bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-accent/20 transition-all cursor-default"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-1.5">
                                            {lead.score?.includes('Quente') && (
                                                <Flame className="h-3.5 w-3.5 text-red-500 fill-current" />
                                            )}
                                            <p className="text-xs font-black text-[#1B263B] leading-tight line-clamp-1">{lead.name}</p>
                                        </div>
                                        <button 
                                            // Trigger the parent's lead selection (will need to be passed down or handled via event)
                                            onClick={() => {
                                                // Just a placeholder, ideally this triggers the detail modal
                                                window.dispatchEvent(new CustomEvent('select-lead', { detail: lead }));
                                            }}
                                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-100 rounded-md transition-all text-slate-400"
                                        >
                                            <ChevronRight className="h-3 w-3" />
                                        </button>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
                                            <Phone className="h-3 w-3 text-emerald-500" />
                                            {lead.phone || 'Sem contato'}
                                        </div>
                                        <div className="flex items-start gap-2 text-[9px] font-medium text-slate-400">
                                            <MessageSquare className="h-3 w-3 mt-0.5" />
                                            <p className="line-clamp-2">{lead.interest || 'Pesquisa geral'}</p>
                                        </div>
                                    </div>

                                    {/* Action Buttons to Move */}
                                    <div className="mt-4 pt-3 border-t border-slate-50 flex justify-between items-center">
                                        <div className="flex gap-1">
                                            <button 
                                                disabled={stage.id === 'Novo'}
                                                onClick={() => {
                                                    const idx = STAGES.findIndex(s => s.id === stage.id);
                                                    if (idx > 0) updateStatus(lead.id, STAGES[idx - 1].id);
                                                }}
                                                className="p-1.5 text-slate-300 hover:text-accent disabled:opacity-0 transition-colors"
                                            >
                                                <ArrowLeftCircle className="h-4 w-4" />
                                            </button>
                                            <button 
                                                disabled={stage.id === 'arquivado' || stage.id === 'Fechado'}
                                                onClick={() => {
                                                    const idx = STAGES.findIndex(s => s.id === stage.id);
                                                    if (idx < STAGES.length - 1) updateStatus(lead.id, STAGES[idx + 1].id);
                                                }}
                                                className="p-1.5 text-slate-300 hover:text-accent disabled:opacity-0 transition-colors"
                                            >
                                                <ArrowRightCircle className="h-4 w-4" />
                                            </button>
                                        </div>
                                        
                                        <p className="text-[8px] font-black uppercase tracking-widest text-slate-300">
                                            {new Date(lead.updated_at || lead.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            
                            {stageLeads.length === 0 && (
                                <div className="h-32 flex flex-col items-center justify-center opacity-20 filter grayscale">
                                    <stage.icon className="h-6 w-6 mb-2" />
                                    <p className="text-[10px] font-black uppercase tracking-widest">Vazio</p>
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

// Add a "Rocket" icon missing in above imports if needed, or use a suitable replacement.
function Rocket(props: any) {
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
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      <path d="M9 12H4s.55-3.03 2-5c1.62-2.2 5-3 5-3" />
      <path d="M12 15v5s3.03-.55 5-2c2.2-1.62 3-5 3-5" />
    </svg>
  )
}
