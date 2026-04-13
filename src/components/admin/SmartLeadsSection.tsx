"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { MessageSquare, Calendar, Phone, MapPin, User, ChevronRight, CheckCircle, Clock, Search, X, Trash2, Edit2, Save, Globe, List, LayoutDashboard } from 'lucide-react';
import clsx from 'clsx';
import FollowUpFunnel from './FollowUpFunnel';

export default function SmartLeadsSection() {
    const [leads, setLeads] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedLead, setSelectedLead] = useState<any>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({ name: '', phone: '' });
    const [viewMode, setViewMode] = useState<'list' | 'funnel'>('list');

    useEffect(() => {
        if (selectedLead) {
            setEditForm({ name: selectedLead.name, phone: selectedLead.phone });
            setIsEditing(false);
        }
    }, [selectedLead]);

    useEffect(() => {
        fetchLeads();

        // Listen for lead selection from the Funnel component
        const handleSelectLead = (e: any) => {
            setSelectedLead(e.detail);
        };
        window.addEventListener('select-lead', handleSelectLead);
        return () => window.removeEventListener('select-lead', handleSelectLead);
    }, []);

    const fireToast = (message: string, type: 'success' | 'error' = 'success') => {
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('show-toast', { detail: { message, type } }));
        }
    };

    const fetchLeads = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('chat_leads')
            .select('*')
            .neq('status', 'arquivado')
            .order('created_at', { ascending: false });

        if (!error && data) {
            setLeads(data);
        }
        setIsLoading(false);
    };

    const updateStatus = async (id: string, newStatus: string) => {
        const { error } = await supabase.from('chat_leads').update({ status: newStatus }).eq('id', id);
        if (!error) {
            setLeads(prev => prev.map(l => l.id === id ? { ...l, status: newStatus } : l));
            fireToast('Status atualizado!');
        }
    };

    const handleDeleteLead = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir este Lead permanentemente?')) return;
        const { error } = await supabase.from('chat_leads').delete().eq('id', id);
        if (!error) {
            setLeads(prev => prev.filter(l => l.id !== id));
            setSelectedLead(null);
            fireToast('Lead excluído permanentemente!');
        } else {
            fireToast('Erro ao excluir: ' + error.message, 'error');
        }
    };

    const handleSaveEdit = async () => {
        if (!selectedLead) return;
        const { error } = await supabase.from('chat_leads').update({ name: editForm.name, phone: editForm.phone }).eq('id', selectedLead.id);
        if (!error) {
            setLeads(prev => prev.map(l => l.id === selectedLead.id ? { ...l, name: editForm.name, phone: editForm.phone } : l));
            setSelectedLead({ ...selectedLead, name: editForm.name, phone: editForm.phone });
            setIsEditing(false);
        } else {
            alert('Erro ao salvar: ' + error.message);
        }
    };

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center md:items-end gap-6 pb-6 border-b border-slate-100 mb-8">
                <div>
                    <h3 className="text-3xl font-black tracking-tighter uppercase flex items-center gap-4 text-[#1B263B]">
                        <div className="h-12 w-12 rounded-2xl bg-[#10b981]/10 flex items-center justify-center">
                            <MessageSquare className="h-6 w-6 text-[#10b981]" />
                        </div>
                        Leads IA (Chat Automático)
                    </h3>
                    <p className="text-[12px] font-bold text-slate-400 uppercase tracking-[0.4em] mt-3 ml-16">Histórico e qualificação de clientes</p>
                </div>
                
                <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
                    <button 
                        onClick={() => setViewMode('list')}
                        className={clsx(
                            "flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                            viewMode === 'list' ? "bg-[#1B263B] text-white shadow-lg shadow-[#1B263B]/20" : "text-slate-400 hover:bg-slate-50"
                        )}
                    >
                        <List className="h-3 w-3" /> Lista
                    </button>
                    <button 
                        onClick={() => setViewMode('funnel')}
                        className={clsx(
                            "flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                            viewMode === 'funnel' ? "bg-[#1B263B] text-white shadow-lg shadow-[#1B263B]/20" : "text-slate-400 hover:bg-slate-50"
                        )}
                    >
                        <LayoutDashboard className="h-3 w-3" /> Funil
                    </button>
                    <div className="w-[1px] h-6 bg-slate-100 mx-2" />
                    <div className="px-4 py-1 border-l border-slate-100">
                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Total</p>
                        <p className="text-sm font-black text-[#1B263B]">{leads.length}</p>
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-sm">Carregando leads...</div>
            ) : viewMode === 'funnel' ? (
                <FollowUpFunnel />
            ) : leads.length === 0 ? (
                <div className="py-20 text-center bg-white rounded-[50px] border border-dashed border-slate-100">
                    <MessageSquare className="h-16 w-16 text-slate-200 mx-auto mb-6" />
                    <p className="text-sm font-black text-slate-300 uppercase tracking-widest">Nenhum lead capturado ainda pelo chat</p>
                </div>
            ) : (
                <div className="bg-white rounded-[40px] border border-slate-100 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100">
                                    <th className="p-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">Lead</th>
                                    <th className="p-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">Contato</th>
                                    <th className="p-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">Interesse & Contexto</th>
                                    <th className="p-6 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Score</th>
                                    <th className="p-6 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                                    <th className="p-6 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Ação</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {leads.map(lead => (
                                    <tr key={lead.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="p-6">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 rounded-xl bg-[#1B263B]/5 flex items-center justify-center">
                                                    <User className="h-4 w-4 text-[#1B263B]" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-[#1B263B]">{lead.name}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1 mt-1">
                                                        <Calendar className="h-3 w-3" /> {new Date(lead.created_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                                <Phone className="h-4 w-4 text-[#10b981]" />
                                                {lead.phone || <span className="text-slate-300 text-xs uppercase tracking-widest">Não informado</span>}
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm font-bold text-[#1B263B] capitalize line-clamp-1 max-w-[200px]">{lead.interest}</p>
                                                {lead.phone?.startsWith('55') || lead.profile_data?.source === 'WhatsApp' ? (
                                                    <span className="bg-emerald-500/10 text-emerald-600 p-1 rounded-md" title="Vindo do WhatsApp">
                                                        <MessageSquare className="h-3 w-3 fill-current" />
                                                    </span>
                                                ) : (
                                                    <span className="bg-blue-500/10 text-blue-600 p-1 rounded-md" title="Vindo do Site">
                                                        <Globe className="h-3 w-3" />
                                                    </span>
                                                )}
                                            </div>
                                            {lead.profile_data?.budget && (
                                                <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Orçamento: {lead.profile_data.budget}</p>
                                            )}
                                        </td>
                                        <td className="p-6 text-center">
                                            <span className={clsx(
                                                "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest",
                                                lead.score?.includes('Quente') ? "bg-red-500/10 text-red-500" :
                                                lead.score?.includes('Morno') ? "bg-amber-500/10 text-amber-500" :
                                                "bg-blue-500/10 text-blue-500"
                                            )}>
                                                {lead.score}
                                            </span>
                                        </td>
                                        <td className="p-6 text-center">
                                            <select 
                                                value={lead.status}
                                                onChange={(e) => updateStatus(lead.id, e.target.value)}
                                                className={clsx(
                                                    "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer border-0 appearance-none text-center",
                                                    lead.status === 'Novo' ? "bg-emerald-500/10 text-emerald-600" :
                                                    lead.status === 'Em atendimento' ? "bg-indigo-500/10 text-indigo-600" :
                                                    "bg-slate-100 text-slate-400"
                                                )}
                                            >
                                                <option value="Novo">Novo</option>
                                                <option value="Em atendimento">Em Atendimento</option>
                                                <option value="Fechado">Fechado</option>
                                            </select>
                                        </td>
                                        <td className="p-6 text-right">
                                            <button 
                                                onClick={() => setSelectedLead(lead)}
                                                className="h-10 w-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-[#10b981] hover:border-[#10b981] shadow-sm transform group-hover:scale-110 transition-all ml-auto"
                                            >
                                                <ChevronRight className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal de Detalhes da Conversa */}
            {selectedLead && (
                <div className="fixed inset-0 z-[100] flex justify-end bg-black/40 backdrop-blur-sm">
                    <div className="w-full max-w-lg bg-white h-full shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">
                        <div className="p-6 bg-[#1B263B] text-white flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-black uppercase tracking-widest">Histórico do Chat</h3>
                                {isEditing ? (
                                    <input 
                                        type="text" 
                                        value={editForm.name} 
                                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} 
                                        className="bg-white/10 border border-white/20 text-accent px-2 py-1 rounded-md text-xs font-bold uppercase tracking-widest outline-none mt-1 w-full"
                                    />
                                ) : (
                                    <p className="text-accent text-xs font-bold uppercase tracking-widest">{selectedLead.name}</p>
                                )}
                            </div>
                            <button onClick={() => setSelectedLead(null)} className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="p-6 border-b border-slate-100 bg-slate-50">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Dados Coletados (IA)</h4>
                            <div className="grid grid-cols-2 gap-4">
                                {isEditing ? (
                                    <div className="bg-white p-3 rounded-xl border border-slate-100">
                                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Telefone / WhatsApp</p>
                                        <input 
                                            type="text" 
                                            value={editForm.phone} 
                                            onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} 
                                            className="w-full bg-slate-50 border border-slate-100 px-2 py-1 rounded text-sm font-bold text-[#1B263B] outline-none mt-1"
                                            placeholder="Ex: 11999999999"
                                        />
                                    </div>
                                ) : null}
                                {Object.entries(selectedLead.profile_data || {}).map(([key, value]) => (
                                    <div key={key} className="bg-white p-3 rounded-xl border border-slate-100">
                                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{key}</p>
                                        <p className="text-sm font-bold text-[#1B263B] line-clamp-1">{value as string}</p>
                                    </div>
                                ))}
                                <div className="bg-white p-3 rounded-xl border border-slate-100 col-span-2">
                                     <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Origem</p>
                                     <p className="text-xs font-bold text-[#1B263B] line-clamp-1">{selectedLead.page_visited}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/50 custom-scrollbar">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Transcrição</h4>
                            {selectedLead.chat_history?.map((msg: any, i: number) => (
                                <div key={i} className={clsx("flex flex-col max-w-[90%]", msg.sender === 'user' ? "self-end items-end ml-auto" : "self-start items-start")}>
                                    <div className={clsx(
                                        "p-3 rounded-2xl text-[12px] font-medium leading-relaxed whitespace-pre-line border",
                                        msg.sender === 'user' 
                                            ? "bg-[#1B263B] text-white border-[#1B263B] rounded-br-sm" 
                                            : "bg-white text-slate-600 border-slate-200 rounded-bl-sm"
                                    )}>
                                        {msg.text}
                                    </div>
                                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">{msg.time}</span>
                                </div>
                            ))}
                        </div>
                        
                        <div className="p-6 bg-white border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-3">
                            <button
                                onClick={() => handleDeleteLead(selectedLead.id)}
                                className="flex-1 bg-red-50 text-red-500 border border-red-100 py-4 rounded-xl font-black text-[12px] uppercase tracking-widest hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                            >
                                <Trash2 className="h-4 w-4" /> Excluir
                            </button>
                            <button
                                onClick={() => isEditing ? handleSaveEdit() : setIsEditing(true)}
                                className="flex-1 bg-slate-50 text-[#1B263B] border border-slate-200 py-4 rounded-xl font-black text-[12px] uppercase tracking-widest hover:bg-slate-100 transition-colors flex items-center justify-center gap-2"
                            >
                                {isEditing ? <Save className="h-4 w-4 text-emerald-500" /> : <Edit2 className="h-4 w-4" />}
                                {isEditing ? 'Salvar' : 'Editar'}
                            </button>
                            <button
                                onClick={() => {
                                    const text = `Olá ${selectedLead.name}, vim pelo nosso atendimento digital!`;
                                    window.open(`https://wa.me/55${selectedLead.phone?.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`, '_blank');
                                }}
                                disabled={!selectedLead.phone}
                                title={!selectedLead.phone ? "Lead não informou telefone" : ""}
                                className="flex-1 bg-[#10b981] text-white py-4 rounded-xl font-black text-[12px] uppercase tracking-widest hover:bg-[#059669] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-[#10b981]/20"
                            >
                                <Phone className="h-4 w-4" /> WhatsApp
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
