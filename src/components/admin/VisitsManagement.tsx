'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
    Plus, Search, Building2, Calendar, X, Download, Bed, Bath, Maximize2, Loader2, CheckCircle2, MapPin
} from 'lucide-react';
import clsx from 'clsx';

export default function VisitsManagement({ properties, leads, chatLeads, visits, onRefresh, currentUserProfile }: { 
    properties: any[], 
    leads: any[], 
    chatLeads: any[], 
    visits: any[], 
    onRefresh: () => void, 
    currentUserProfile: any 
}) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [selectedVisitForPrint, setSelectedVisitForPrint] = useState<any>(null);
    const [selectedChatLead, setSelectedChatLead] = useState<any>(null);
    
    // Modal Form State
    const [clientName, setClientName] = useState('');
    const [clientPhone, setClientPhone] = useState('');
    const [visitDate, setVisitDate] = useState('');
    const [visitTime, setVisitTime] = useState('');
    const [selectedPropIds, setSelectedPropIds] = useState<string[]>([]);
    const [searchClient, setSearchClient] = useState('');
    const [searchProp, setSearchProp] = useState('');
    const [showClientResults, setShowClientResults] = useState(true);

    const allContacts = [
        ...leads.map(l => ({ 
            name: l.name || l.full_name || 'Lead s/ Nome', 
            phone: l.customer_whatsapp || l.whatsapp || l.phone || l.email || '', 
            source: 'Lead' 
        })),
        ...chatLeads.map(l => ({ 
            name: l.name || 'Chat IA s/ Nome', 
            phone: l.phone || l.whatsapp || l.customer_whatsapp || '', 
            source: 'Chat IA' 
        }))
    ];

    const filteredContacts = searchClient.length > 1 
        ? allContacts.filter(c => c.name?.toLowerCase().includes(searchClient.toLowerCase()))
        : [];

    const filteredProps = searchProp.length > 0
        ? properties.filter(p => 
            p.title?.toLowerCase().includes(searchProp.toLowerCase()) || 
            p.reference_id?.toLowerCase().includes(searchProp.toLowerCase())
        )
        : [];

    const handleCreateVisit = async () => {
        if (!clientName || !visitDate || !visitTime || selectedPropIds.length === 0) {
            alert('Preencha todos os campos e selecione ao menos um imóvel.');
            return;
        }

        setIsSaving(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { error } = await supabase
                .from('visits')
                .insert({
                    corretor_id: user.id,
                    client_name: clientName,
                    client_phone: clientPhone,
                    visit_date: visitDate,
                    visit_time: visitTime,
                    property_ids: selectedPropIds,
                    status: 'agendado'
                });

            if (error) throw error;
            setIsModalOpen(false);
            onRefresh();
        } catch (err: any) {
            alert('Erro ao criar agendamento: ' + err.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteVisit = async (id: string) => {
        if (!confirm('Deseja excluir este agendamento?')) return;
        const { error } = await supabase.from('visits').delete().eq('id', id);
        if (error) alert('Erro ao excluir');
        else onRefresh();
    };

    return (
        <div className="space-y-12 animate-in slide-in-from-bottom-8 duration-700">
            <div className="flex justify-between items-center px-4">
                <div>
                    <h2 className="text-4xl font-black text-[#1B263B] tracking-tighter uppercase">Agenda de Visitas</h2>
                    <p className="text-slate-400 font-bold text-[12px] uppercase tracking-[0.4em]">Organize atendimentos e gere roteiros profissionais</p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="bg-[#1B263B] text-white px-10 py-5 rounded-3xl text-[12px] font-black uppercase tracking-widest shadow-2xl hover:bg-[#10b981] transition-all flex items-center gap-3"
                >
                    <Plus className="h-5 w-5" /> Novo Agendamento
                </button>
            </div>

            <div className="bg-white rounded-[60px] border border-slate-100 shadow-2xl overflow-hidden mx-4">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-10 py-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Cliente / Contato</th>
                                <th className="px-10 py-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Data e Hora</th>
                                <th className="px-10 py-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Imóveis</th>
                                <th className="px-10 py-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {visits.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="p-20 text-center text-slate-400 font-bold uppercase tracking-widest">Nenhum agendamento encontrado.</td>
                                </tr>
                            ) : (
                                visits.map((v) => (
                                    <tr key={v.id} className="hover:bg-slate-50/30 transition-all group">
                                        <td className="px-10 py-8">
                                            <p className="text-sm font-black text-[#1B263B] uppercase tracking-tight">{v.client_name}</p>
                                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{v.client_phone || 'Sem telefone'}</p>
                                        </td>
                                        <td className="px-10 py-8">
                                            <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">{new Date(v.visit_date).toLocaleDateString('pt-BR')}</p>
                                            <p className="text-[9px] font-bold text-slate-300 uppercase mt-1">{v.visit_time.slice(0, 5)}h</p>
                                        </td>
                                        <td className="px-10 py-8">
                                            <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-500 text-[9px] font-black rounded-lg uppercase tracking-widest">{v.property_ids?.length || 0} Imóveis</span>
                                        </td>
                                        <td className="px-10 py-8 text-right space-x-2">
                                            <button 
                                                onClick={() => setSelectedVisitForPrint(v)}
                                                className="bg-emerald-500 text-white px-5 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-[#1B263B] transition-all shadow-lg"
                                            >
                                                Imprimir Roteiro
                                            </button>
                                            {(() => {
                                                const zapMatch = chatLeads.find(c => c.phone === v.client_phone);
                                                if (zapMatch) {
                                                    return (
                                                        <button 
                                                            onClick={() => setSelectedChatLead(zapMatch)}
                                                            className="bg-blue-50 text-blue-500 px-5 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all shadow-sm flex-inline items-center gap-1"
                                                        >
                                                            Conversa do Zap
                                                        </button>
                                                    );
                                                }
                                                return null;
                                            })()}
                                            <button 
                                                onClick={() => handleDeleteVisit(v.id)}
                                                className="bg-red-50 text-red-400 px-5 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
                                            >
                                                Excluir
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Novo Agendamento */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-[#1B263B]/80 backdrop-blur-md z-[200] flex items-center justify-center p-6 animate-in fade-in duration-300 overflow-y-auto">
                    <div className="bg-white w-full max-w-4xl rounded-[50px] shadow-2xl p-12 relative animate-in zoom-in-95 duration-500">
                        <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 h-12 w-12 rounded-2xl bg-slate-50 text-slate-400 hover:text-red-500 transition-all flex items-center justify-center border border-slate-100">
                            <X className="h-6 w-6" />
                        </button>

                        <div className="mb-10 text-center">
                            <h3 className="text-3xl font-black text-[#1B263B] uppercase tracking-tighter">Agendar Nova Visita</h3>
                            <p className="text-slate-400 font-bold text-[11px] uppercase tracking-widest mt-2">Selecione o cliente e os imóveis para gerar o roteiro</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-6">
                                <div className="space-y-2 relative">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-2">Buscar Cliente (Lead ou IA)</label>
                                    <div className="relative">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                                        <input 
                                            type="text" 
                                            placeholder="Nome do cliente..."
                                            value={searchClient}
                                            onFocus={() => setShowClientResults(true)}
                                            onChange={(e) => {
                                                setSearchClient(e.target.value);
                                                setClientName(e.target.value);
                                                setShowClientResults(true);
                                            }}
                                            className="w-full bg-slate-50 border border-slate-100 pl-12 pr-4 py-4 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-[#10b981]/10 transition-all"
                                        />
                                    </div>
                                    {showClientResults && filteredContacts.length > 0 && (
                                        <div className="absolute top-full left-0 right-0 bg-white border border-slate-100 shadow-2xl rounded-2xl mt-2 max-h-48 overflow-y-auto z-20 p-2 space-y-1">
                                            {filteredContacts.map((c, i) => (
                                                <button 
                                                    key={i}
                                                    type="button"
                                                    onMouseDown={(e) => {
                                                        e.preventDefault();
                                                        setClientName(c.name);
                                                        setClientPhone(c.phone);
                                                        setSearchClient(c.name);
                                                        setShowClientResults(false);
                                                    }}
                                                    className="w-full text-left p-3 hover:bg-slate-50 rounded-xl transition-all flex justify-between items-center cursor-pointer relative z-30"
                                                >
                                                    <div>
                                                        <p className="text-sm font-black text-[#1B263B]">{c.name}</p>
                                                        <p className="text-[10px] font-bold text-slate-400">{c.phone}</p>
                                                    </div>
                                                    <span className="text-[9px] font-black bg-slate-100 px-2 py-1 rounded-lg text-slate-400 uppercase">{c.source}</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-2">Telefone (WhatsApp)</label>
                                    <input 
                                        type="text" 
                                        placeholder="(00) 00000-0000"
                                        value={clientPhone}
                                        onChange={(e) => setClientPhone(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-[#10b981]/10 transition-all"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-2">Data</label>
                                        <input 
                                            type="date"
                                            value={visitDate}
                                            onChange={(e) => setVisitDate(e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl text-sm font-bold outline-none cursor-pointer"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-2">Horário</label>
                                        <input 
                                            type="time" 
                                            value={visitTime}
                                            onChange={(e) => setVisitTime(e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl text-sm font-bold outline-none cursor-pointer"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2 relative">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-2">Selecionar Imóveis ({selectedPropIds.length})</label>
                                    <div className="relative">
                                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                                        <input 
                                            type="text" 
                                            placeholder="Buscar na carteira..."
                                            value={searchProp}
                                            onChange={(e) => setSearchProp(e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-100 pl-12 pr-4 py-4 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-[#10b981]/10 transition-all"
                                        />
                                    </div>
                                    {filteredProps.length > 0 && (
                                        <div className="absolute top-full left-0 right-0 bg-white border border-slate-100 shadow-2xl rounded-2xl mt-2 max-h-48 overflow-y-auto z-20 p-2 space-y-1">
                                            {filteredProps.map((p) => (
                                                <button 
                                                    key={p.id}
                                                    type="button"
                                                    onMouseDown={(e) => {
                                                        e.preventDefault(); // Prevent input blur before selection
                                                        if (!selectedPropIds.includes(p.id)) {
                                                            setSelectedPropIds([...selectedPropIds, p.id]);
                                                        }
                                                        setSearchProp('');
                                                    }}
                                                    className="w-full text-left p-3 hover:bg-slate-50 rounded-xl transition-all flex items-center gap-3 cursor-pointer relative z-30"
                                                >
                                                    <div className="h-10 w-10 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                                                        <img src={p.images?.[0]} className="w-full h-full object-cover" alt="" />
                                                    </div>
                                                    <div className="truncate">
                                                        <p className="text-[11px] font-black text-[#1B263B] truncate">{p.title}</p>
                                                        <p className="text-[9px] font-bold text-[#10b981] uppercase">{p.reference_id}</p>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="bg-slate-50 p-6 rounded-[32px] min-h-[180px] max-h-[180px] overflow-y-auto space-y-3 shadow-inner">
                                    {selectedPropIds.length === 0 ? (
                                        <p className="text-[10px] font-bold text-slate-300 uppercase text-center mt-12">Nenhum imóvel adicionado</p>
                                    ) : (
                                        selectedPropIds.map(id => {
                                            const p = properties.find(prop => prop.id === id);
                                            return (
                                                <div key={id} className="bg-white p-3 rounded-2xl flex items-center justify-between border border-slate-100 shadow-sm">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-8 w-8 bg-slate-100 rounded flex-shrink-0"><img src={p?.images?.[0]} className="w-full h-full object-cover rounded" alt="" /></div>
                                                        <p className="text-[10px] font-black text-[#1B263B] truncate max-w-[150px]">{p?.reference_id} - {p?.neighborhood}</p>
                                                    </div>
                                                    <button onClick={() => setSelectedPropIds(selectedPropIds.filter(v => v !== id))} className="text-red-400 hover:text-red-600 p-2"><X className="h-4 w-4" /></button>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 flex justify-center">
                            <button 
                                onClick={handleCreateVisit}
                                type="button"
                                disabled={isSaving}
                                className="bg-[#1B263B] text-white px-20 py-5 rounded-3xl text-sm font-black uppercase tracking-widest shadow-2xl hover:bg-[#10b981] transition-all flex items-center justify-center gap-4 disabled:opacity-50"
                            >
                                {isSaving ? <Loader2 className="h-6 w-6 animate-spin" /> : <CheckCircle2 className="h-6 w-6" />}
                                {isSaving ? 'Agendando...' : 'Confirmar Agendamento'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Impressão de Roteiro */}
            {selectedVisitForPrint && (
                <VisitItineraryPDF 
                    visit={selectedVisitForPrint}
                    properties={properties}
                    corretor={currentUserProfile}
                    onClose={() => setSelectedVisitForPrint(null)}
                />
            )}

            {/* Modal Histórico do Zap Integrado */}
            {selectedChatLead && (
                <div className="fixed inset-0 z-[200] flex justify-end bg-black/40 backdrop-blur-sm">
                    <div className="w-full max-w-lg bg-white h-full shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">
                        <div className="p-6 bg-[#1B263B] text-white flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-black uppercase tracking-widest flex items-center gap-2"><Search className="h-4 w-4 text-[#10b981]" /> Memória da Catarina</h3>
                                <p className="text-white/50 text-xs font-bold uppercase tracking-widest mt-1">{selectedChatLead.name}</p>
                            </div>
                            <button onClick={() => setSelectedChatLead(null)} className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/50">
                            {selectedChatLead.chat_history?.map((msg: any, i: number) => (
                                <div key={i} className={clsx("flex flex-col max-w-[90%]", msg.sender === 'user' ? "self-end items-end ml-auto" : "self-start items-start")}>
                                    <div className={clsx(
                                        "p-3 rounded-2xl text-[12px] font-medium leading-relaxed whitespace-pre-line border",
                                        msg.sender === 'user' 
                                            ? "bg-[#1B263B] text-white border-[#1B263B] rounded-br-sm shadow-md" 
                                            : "bg-white text-slate-600 border-slate-200 rounded-bl-sm shadow-sm"
                                    )}>
                                        {msg.text}
                                    </div>
                                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">{msg.time}</span>
                                </div>
                            ))}
                            {(!selectedChatLead.chat_history || selectedChatLead.chat_history.length === 0) && (
                                <p className="text-center text-slate-400 text-sm font-bold uppercase tracking-widest py-10">Nenhuma conversa registrada.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function VisitItineraryPDF({ visit, properties, corretor, onClose }: { visit: any, properties: any[], corretor: any, onClose: () => void }) {
    const selectedProperties = visit.property_ids.map((id: string) => properties.find(p => p.id === id)).filter(Boolean);

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="fixed inset-0 bg-[#1B263B]/90 backdrop-blur-md z-[250] flex flex-col items-center justify-center p-6 sm:p-12 overflow-y-auto animate-in fade-in duration-300">
            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    body * { visibility: hidden; }
                    #print-itinerary, #print-itinerary * { visibility: visible; }
                    #print-itinerary { 
                        position: absolute; 
                        left: 0; 
                        top: 0; 
                        width: 100%;
                        padding: 0 !important;
                        margin: 0 !important;
                    }
                    .no-print { display: none !important; }
                    @page { size: portrait; margin: 1cm; }
                }
            `}} />

            <div className="bg-white w-full max-w-5xl rounded-[40px] shadow-2xl flex flex-col max-h-[95vh] overflow-hidden">
                <header className="p-8 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10 no-print">
                    <div>
                        <h3 className="text-xl font-black text-[#1B263B] uppercase tracking-tighter">Roteiro de Visita Gerado</h3>
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={handlePrint}
                            className="bg-[#10b981] text-white px-8 py-4 rounded-xl text-[12px] font-black uppercase tracking-widest shadow-xl shadow-[#10b981]/20 hover:scale-105 transition-all flex items-center gap-3"
                        >
                            <Download className="h-5 w-5" /> Imprimir
                        </button>
                        <button onClick={onClose} className="h-14 w-14 rounded-xl bg-slate-50 text-slate-400 hover:text-red-500 flex items-center justify-center border border-slate-100">
                            <X className="h-7 w-7" />
                        </button>
                    </div>
                </header>

                <div id="print-itinerary" className="flex-1 overflow-y-auto p-12 bg-white print:p-0">
                    <div className="flex justify-between items-start mb-8 border-b-2 border-slate-900 pb-4">
                        <div className="flex items-center gap-6">
                            <img src="/logo.png" className="h-16 w-auto object-contain" alt="Logo" />
                            <div>
                                <h1 className="text-xl font-black text-[#1B263B] uppercase tracking-tighter leading-none mb-1">Roteiro de Visita</h1>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">KF Imóveis Professional Network</p>
                                <p className="text-[11px] font-black uppercase mt-1">Corretor: {corretor?.full_name}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{new Date(visit.visit_date).toLocaleDateString('pt-BR')} às {visit.visit_time.slice(0, 5)}h</p>
                            <p className="text-[11px] font-black text-[#1B263B] uppercase mt-1">Cliente: {visit.client_name}</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {selectedProperties.map((p: any, index: number) => (
                            <div key={p.id} className={clsx(
                                "p-4 relative overflow-hidden page-break-inside-avoid",
                                index < selectedProperties.length - 1 && "border-b border-dashed border-slate-300 pb-4"
                            )}>
                                {/* Título Completo no Topo */}
                                <div className="mb-3">
                                    <h2 className="text-[14px] font-black text-[#1B263B] uppercase tracking-tight leading-tight">{p.title}</h2>
                                    <div className="flex flex-col mt-1">
                                        <p className="text-[10px] font-black text-[#10b981] uppercase tracking-widest flex items-center gap-1">
                                            <MapPin className="h-3 w-3" />
                                            {p.address}{p.address_number ? `, ${p.address_number}` : ''} {p.complement ? `- ${p.complement}` : ''}
                                        </p>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.25em]">{p.neighborhood}, {p.city} {p.condo_name ? ` - Ed. ${p.condo_name}` : ''}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-12 gap-4 items-center">
                                    {/* Imagem */}
                                    <div className="col-span-2">
                                        <div className="h-16 w-20 bg-slate-100 rounded-lg overflow-hidden border border-slate-100">
                                            <img src={p.images?.[0]} className="w-full h-full object-cover" alt="" />
                                        </div>
                                    </div>

                                    {/* Valores e Specs */}
                                    <div className="col-span-4 space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[13px] font-black text-[#10b981]">{p.price?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                                            <div className="bg-slate-900 text-white px-2 py-0.5 rounded text-[8px] font-black uppercase">REF: {p.reference_id}</div>
                                        </div>
                                        <div className="flex gap-4 text-[9px] font-black text-slate-400 uppercase">
                                            {p.condo_fee > 0 && <span>Cond: R$ {p.condo_fee}</span>}
                                            {p.iptu > 0 && <span>IPTU: R$ {p.iptu}</span>}
                                        </div>
                                        <div className="flex gap-3 text-[9px] font-bold text-slate-500 uppercase overflow-hidden">
                                            <span>{p.rooms} qts</span>
                                            <span>{p.area}m²</span>
                                            <span>{p.parking_spaces} vagas</span>
                                        </div>
                                    </div>

                                    {/* Avaliação */}
                                    <div className="col-span-6 grid grid-cols-3 gap-2">
                                        {[
                                            { label: 'Gostou', color: 'border-emerald-200' },
                                            { label: 'Não Gostou', color: 'border-red-200' },
                                            { label: 'Não Visitou', color: 'border-slate-200' }
                                        ].map((opt) => (
                                            <div key={opt.label} className={clsx("border-2 rounded-xl p-2 flex flex-col items-center justify-center gap-1", opt.color)}>
                                                <div className="h-4 w-4 border-2 border-slate-300 rounded flex-shrink-0" />
                                                <span className="text-[8px] font-black text-slate-500 uppercase text-center leading-tight">{opt.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-200 flex justify-between items-end">
                         <div className="space-y-4">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Anotações do Corretor:</p>
                            <div className="h-16 w-[400px] border border-slate-100 bg-slate-50 rounded-2xl" />
                         </div>
                        <div className="text-right">
                            <p className="text-[10px] text-slate-400 mb-6 italic">Assinatura do Cliente: ___________________________________________________________</p>
                            <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Documento gerado em {new Date().toLocaleString('pt-BR')}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
