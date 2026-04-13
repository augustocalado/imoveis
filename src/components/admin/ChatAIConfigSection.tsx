'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Bot, Save, Loader2, Activity, MessageSquare, Clock, Sparkles, CheckCircle2, X } from 'lucide-react';
import clsx from 'clsx';

export default function ChatAIConfigSection() {
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const [config, setConfig] = useState({
        startOpen: false,
        autoOpenDelay: 8,
        followUp1Delay: 30,
        followUp2Delay: 120,
        botName: 'Marcela (IA)',
        initialMessage: "Fala! 👋 Tá procurando imóvel pra comprar ou investir?",
        q1_label: '🔑 Quero comprar',
        q2_label: '💰 Quero vender',
        q3_label: '📊 Simular financiamento',
        q4_label: '📞 Falar com corretor',
        responseDelay: 2,
        faqs: [
            { question: "Quais documentos preciso para comprar?", answer: "Para pessoa física, geralmente RG, CPF, comprovante de residência, certidão de nascimento/casamento e os 3 últimos holerites ou declaração de IR." },
            { question: "Como agendar uma visita?", answer: "Me conta qual imóvel te interessou e qual o melhor dia/horário pra você. Eu já aviso o corretor!" },
            { question: "Faz simulação de financiamento?", answer: "Sim! Trabalhamos com os principais bancos. Se quiser, me passa seu nome e renda mensal que eu já vejo as taxas pra você agora." },
            { question: "Aceita permuta?", answer: "Alguns proprietários aceitam carro ou outros imóveis. Qual seria a sua proposta? Posso verificar agora." }
        ]
    });

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const { data } = await supabase.from('site_settings').select('value').eq('key', 'chat_config').single();
                if (data && data.value) {
                    setConfig({ ...config, ...data.value });
                }
            } catch (err) {
                console.error('Erro ao buscar chat_config:', err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchConfig();
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        setMessage(null);
        try {
            const { error } = await supabase.from('site_settings').upsert({
                key: 'chat_config',
                value: config
            });

            if (error) throw error;
            setMessage({ type: 'success', text: 'Configurações do Chat IA salvas com sucesso!' });
            setTimeout(() => setMessage(null), 3000);
        } catch (err: any) {
            console.error(err);
            setMessage({ type: 'error', text: 'Erro ao salvar: ' + err.message });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center py-20">
                <Loader2 className="h-8 w-8 text-[#10b981] animate-spin" />
            </div>
        );
    }

    return (
        <div className="bg-white p-12 rounded-[50px] border border-slate-100 shadow-sm animate-in fade-in slide-in-from-bottom-8 duration-700">
            <header className="flex justify-between items-center mb-12">
                <div>
                    <h3 className="text-3xl font-black text-[#1B263B] tracking-tighter uppercase mb-2">Engajamento e IA</h3>
                    <p className="text-slate-400 font-bold text-[12px] uppercase tracking-widest">Personalize o comportamento, pausas e tom de voz da Inteligência Artificial Automática.</p>
                </div>
                <div className="h-14 w-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                    <Sparkles className="h-6 w-6 text-[#10b981]" />
                </div>
            </header>

            {message && (
                <div className={clsx(
                    "mb-8 p-6 rounded-[20px] border flex items-center gap-4",
                    message.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-red-50 border-red-100 text-red-800'
                )}>
                    {message.type === 'success' ? <CheckCircle2 className="h-6 w-6" /> : <Activity className="h-6 w-6" />}
                    <p className="font-bold text-sm uppercase tracking-widest">{message.text}</p>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Visual e Texto da IA */}
                <div className="space-y-8">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="h-10 w-10 min-w-[40px] rounded-xl bg-[#1B263B] text-white flex items-center justify-center">
                            <Bot className="h-5 w-5" />
                        </div>
                        <h4 className="text-lg font-black tracking-tighter uppercase text-[#1B263B]">Identidade da IA</h4>
                    </div>

                    <div className="space-y-3">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Nome Público da Assistente</label>
                        <input
                            type="text"
                            value={config.botName}
                            onChange={(e) => setConfig({ ...config, botName: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-100 p-5 rounded-2xl font-bold text-sm text-[#1B263B] outline-none focus:ring-2 focus:ring-[#10b981]/20 transition-all"
                        />
                    </div>
                    <div className="space-y-3">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Mensagem de Boas-Vindas</label>
                        <textarea
                            rows={3}
                            value={config.initialMessage}
                            onChange={(e) => setConfig({ ...config, initialMessage: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-100 p-5 rounded-2xl font-bold text-sm text-[#1B263B] outline-none focus:ring-2 focus:ring-[#10b981]/20 transition-all resize-none"
                        />
                    </div>

                    {/* Botões/Perguntas Fixas */}
                    <div className="space-y-6 pt-6 border-t border-slate-100">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Atalhos / Intenções de Venda</label>
                        <div className="grid grid-cols-2 gap-4">
                            <input type="text" value={config.q1_label} onChange={e => setConfig({...config, q1_label: e.target.value})} placeholder="Ex: Quero Comprar" className="bg-slate-50 border border-slate-100 p-4 rounded-xl text-xs font-bold w-full" />
                            <input type="text" value={config.q2_label} onChange={e => setConfig({...config, q2_label: e.target.value})} placeholder="Ex: Quero Vender" className="bg-slate-50 border border-slate-100 p-4 rounded-xl text-xs font-bold w-full" />
                            <input type="text" value={config.q3_label} onChange={e => setConfig({...config, q3_label: e.target.value})} placeholder="Ex: Simular Financiamento" className="bg-slate-50 border border-slate-100 p-4 rounded-xl text-xs font-bold w-full" />
                            <input type="text" value={config.q4_label} onChange={e => setConfig({...config, q4_label: e.target.value})} placeholder="Ex: Falar com Humano" className="bg-slate-50 border border-slate-100 p-4 rounded-xl text-xs font-bold w-full" />
                        </div>
                    </div>
                </div>

                {/* Comportamento e Retenção */}
                <div className="space-y-8">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="h-10 w-10 min-w-[40px] rounded-xl bg-accent text-white flex items-center justify-center">
                            <Clock className="h-5 w-5" />
                        </div>
                        <h4 className="text-lg font-black tracking-tighter uppercase text-[#1B263B]">Comportamento e Retenção</h4>
                    </div>

                    <div className="flex gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-100 cursor-pointer items-center" onClick={() => setConfig({...config, startOpen: !config.startOpen})}>
                        <div className={clsx(
                            "h-6 w-10 flex items-center rounded-full p-1 transition-colors",
                            config.startOpen ? 'bg-accent' : 'bg-slate-300'
                        )}>
                            <div className={clsx(
                                "bg-white h-4 w-4 rounded-full shadow-sm transform transition-transform",
                                config.startOpen ? 'translate-x-4' : 'translate-x-0'
                            )} />
                        </div>
                        <div className="flex-1">
                            <span className="font-bold text-sm text-[#1B263B]">Forçar Abertura Automática Tardia?</span>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Se não marcado, a bolinha inicializa sempre fechada.</p>
                        </div>
                    </div>

                    {config.startOpen && (
                        <div className="space-y-3 pl-4 border-l-2 border-accent">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Exibir janela completa após (Segundos)</label>
                            <input
                                type="number"
                                value={config.autoOpenDelay}
                                onChange={(e) => setConfig({ ...config, autoOpenDelay: Number(e.target.value) })}
                                className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl font-bold text-sm text-[#1B263B] outline-none transition-all"
                            />
                        </div>
                    )}

                    <div className="space-y-6 pt-6 border-t border-slate-100">
                        <div className="flex items-center justify-between px-2">
                             <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Tempo de Resposta (Typing Delay)</p>
                             <span className="text-sm font-black text-accent">{config.responseDelay || 2}s</span>
                        </div>
                        <input
                            type="range"
                            min="0.5"
                            max="5"
                            step="0.5"
                            value={config.responseDelay || 2}
                            onChange={e => setConfig({...config, responseDelay: parseFloat(e.target.value)})}
                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-accent"
                        />
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter text-center">Quanto maior o tempo, mais "humana" parece a digitação da IA.</p>
                        
                        <div className="space-y-6 pt-10 mt-10 border-t border-slate-100">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">FAQ - Perguntas Frequentes do Nicho</label>
                            <div className="space-y-4">
                                {(config.faqs || []).map((faq, idx) => (
                                    <div key={idx} className="p-6 bg-white border border-slate-100 rounded-3xl space-y-4 relative group shadow-sm">
                                        <button 
                                            onClick={() => setConfig({...config, faqs: config.faqs.filter((_, i) => i !== idx)})}
                                            className="absolute top-4 right-4 h-8 w-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                        <div className="space-y-2">
                                            <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest ml-1">Pergunta do Cliente (Ativador)</span>
                                            <input 
                                                type="text" 
                                                value={faq.question} 
                                                onChange={e => {
                                                    const newFaqs = [...config.faqs];
                                                    newFaqs[idx].question = e.target.value;
                                                    setConfig({...config, faqs: newFaqs});
                                                }}
                                                className="w-full bg-slate-50 p-4 rounded-xl text-xs font-bold border-none outline-none focus:ring-1 focus:ring-accent/30"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest ml-1">Resposta Automática da IA</span>
                                            <textarea 
                                                value={faq.answer} 
                                                rows={2}
                                                onChange={e => {
                                                    const newFaqs = [...config.faqs];
                                                    newFaqs[idx].answer = e.target.value;
                                                    setConfig({...config, faqs: newFaqs});
                                                }}
                                                className="w-full bg-slate-50 p-4 rounded-xl text-xs font-bold border-none outline-none focus:ring-1 focus:ring-accent/30 resize-none"
                                            />
                                        </div>
                                    </div>
                                ))}
                                <button 
                                    onClick={() => setConfig({...config, faqs: [...(config.faqs || []), { question: '', answer: '' }]})}
                                    className="w-full p-4 border-2 border-dashed border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:border-accent/40 hover:text-accent transition-all"
                                >
                                    + Adicionar Nova Pergunta
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-12 pt-8 border-t border-slate-100 flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-[#10b981] hover:bg-emerald-600 text-white px-10 py-4 rounded-2xl font-black text-[12px] uppercase tracking-[0.2em] transition-all shadow-xl shadow-[#10b981]/20 flex items-center justify-center hover:scale-105 active:scale-95 min-w-[200px]"
                >
                    {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5 mr-3" />}
                    {isSaving ? 'Salvando Config...' : 'Gravar Alterações'}
                </button>
            </div>
        </div>
    );
}
