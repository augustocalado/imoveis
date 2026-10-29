'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Target, Check, Copy, ExternalLink, ShieldCheck, Sparkles, AlertCircle, HelpCircle } from 'lucide-react';

interface GoogleAdsConfig {
    tag_id: string;
    conversion_label?: string;
    enabled: boolean;
}

export default function PixelConfigSection() {
    const [config, setConfig] = useState<GoogleAdsConfig>({
        tag_id: '',
        conversion_label: '',
        enabled: true,
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [feedCopied, setFeedCopied] = useState(false);
    const [baseUrl, setBaseUrl] = useState('');

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setBaseUrl(`${window.location.protocol}//${window.location.host}`);
        }

        const fetchConfig = async () => {
            try {
                const { data } = await supabase
                    .from('site_settings')
                    .select('value')
                    .eq('key', 'google_ads_config')
                    .maybeSingle();

                if (data?.value) {
                    setConfig({
                        tag_id: data.value.tag_id || '',
                        conversion_label: data.value.conversion_label || '',
                        enabled: data.value.enabled !== undefined ? data.value.enabled : true,
                    });
                }
            } catch (err) {
                console.error('Erro ao carregar configurações de pixel:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchConfig();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setSaveSuccess(false);

        try {
            const { error } = await supabase
                .from('site_settings')
                .upsert({
                    key: 'google_ads_config',
                    value: config,
                    updated_at: new Date().toISOString(),
                });

            if (error) throw error;

            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 4000);
        } catch (err: any) {
            console.error('Erro ao salvar pixel:', err);
            alert('Erro ao salvar configurações: ' + (err.message || 'Tente novamente'));
        } finally {
            setIsSaving(false);
        }
    };

    const feedUrl = `${baseUrl}/api/feed/google-ads`;

    const copyFeedUrl = () => {
        navigator.clipboard.writeText(feedUrl);
        setFeedCopied(true);
        setTimeout(() => setFeedCopied(false), 3000);
    };

    if (isLoading) {
        return (
            <div className="bg-white p-12 rounded-[50px] border border-slate-100 flex items-center justify-center min-h-[300px]">
                <div className="flex flex-col items-center gap-3 text-slate-400">
                    <div className="h-8 w-8 border-4 border-[#10b981] border-t-transparent rounded-full animate-spin" />
                    <p className="text-xs font-bold uppercase tracking-widest">Carregando Pixel & Remarketing...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-in fade-in duration-500">
            {/* Header */}
            <div className="bg-white p-10 md:p-12 rounded-[50px] border border-slate-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-[#10b981]/5 blur-[100px] pointer-events-none" />

                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-slate-100">
                    <div className="flex items-center gap-5">
                        <div className="h-16 w-16 rounded-3xl bg-[#1B263B] text-white flex items-center justify-center shadow-xl shadow-[#1B263B]/20">
                            <Target className="h-8 w-8 text-[#10b981]" />
                        </div>
                        <div>
                            <div className="inline-flex items-center gap-2 bg-[#10b981]/10 text-[#10b981] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-1.5">
                                <Sparkles className="h-3 w-3" /> Remarketing Dinâmico
                            </div>
                            <h3 className="text-2xl md:text-3xl font-black text-[#1B263B] tracking-tighter uppercase">
                                Google Ads & Rede de Display
                            </h3>
                            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">
                                Anúncios para quem já pesquisou ou visualizou imóveis no seu portal
                            </p>
                        </div>
                    </div>
                </header>

                {/* Form de Configuração */}
                <form onSubmit={handleSave} className="mt-10 space-y-8">
                    {/* Switch Ativo/Inativo */}
                    <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100">
                        <div className="space-y-1">
                            <p className="text-sm font-black text-[#1B263B] uppercase tracking-wider">
                                Ativar Pixel de Remarketing do Google Ads
                            </p>
                            <p className="text-xs text-slate-500 font-medium">
                                Quando ativado, registra visualizações de imóveis, buscas e conversões de leads.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setConfig({ ...config, enabled: !config.enabled })}
                            className={`relative inline-flex h-8 w-14 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                config.enabled ? 'bg-[#10b981]' : 'bg-slate-300'
                            }`}
                        >
                            <span
                                className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                                    config.enabled ? 'translate-x-6' : 'translate-x-0'
                                }`}
                            />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Google Ads Tag ID */}
                        <div className="space-y-2">
                            <label className="text-xs font-black text-[#1B263B] uppercase tracking-widest flex items-center gap-2">
                                ID da Tag do Google Ads (AW-XXXXXXXXXX)
                                <span className="text-[#10b981]">*</span>
                            </label>
                            <input
                                type="text"
                                placeholder="Ex: AW-1234567890"
                                value={config.tag_id}
                                onChange={(e) => setConfig({ ...config, tag_id: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 px-6 py-4 rounded-2xl font-bold text-sm text-[#1B263B] outline-none focus:ring-2 focus:ring-[#10b981] transition-all"
                            />
                            <p className="text-[11px] text-slate-400 font-medium">
                                Encontrado no Google Ads em <strong>Ferramentas → Gerenciador de Públicos-Alvo → Seus dados → Tag do Google Ads</strong>.
                            </p>
                        </div>

                        {/* Conversion Label */}
                        <div className="space-y-2">
                            <label className="text-xs font-black text-[#1B263B] uppercase tracking-widest flex items-center gap-2">
                                Rótulo de Conversão (Opcional)
                            </label>
                            <input
                                type="text"
                                placeholder="Ex: aBcDeFgHiJk"
                                value={config.conversion_label || ''}
                                onChange={(e) => setConfig({ ...config, conversion_label: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 px-6 py-4 rounded-2xl font-bold text-sm text-[#1B263B] outline-none focus:ring-2 focus:ring-[#10b981] transition-all"
                            />
                            <p className="text-[11px] text-slate-400 font-medium">
                                Usado para rastrear conversões de WhatsApp e Leads.
                            </p>
                        </div>
                    </div>

                    {/* Botão Salvar */}
                    <div className="flex items-center gap-4 pt-4">
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="px-10 py-4 bg-[#1B263B] hover:bg-[#10b981] text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all duration-300 shadow-xl shadow-[#1B263B]/20 flex items-center gap-3 disabled:opacity-50"
                        >
                            {isSaving ? (
                                <>
                                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    <span>Salvando...</span>
                                </>
                            ) : (
                                <>
                                    <Check className="h-4 w-4 text-[#10b981]" />
                                    <span>Salvar Configurações</span>
                                </>
                            )}
                        </button>

                        {saveSuccess && (
                            <span className="text-xs font-black text-[#10b981] uppercase tracking-wider animate-in fade-in flex items-center gap-1.5">
                                <Check className="h-4 w-4" /> Configurações salvas com sucesso!
                            </span>
                        )}
                    </div>
                </form>
            </div>

            {/* Feed para Remarketing Dinâmico do Google Display */}
            <div className="bg-white p-10 md:p-12 rounded-[50px] border border-slate-100 shadow-sm relative overflow-hidden">
                <div className="flex items-center gap-4 mb-6">
                    <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center">
                        <Target className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div>
                        <h4 className="text-xl font-black text-[#1B263B] tracking-tight uppercase">
                            Feed de Imóveis para a Rede de Display
                        </h4>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                            Google Ads Business Data / Feed de Imóveis e Aluguéis (Real Estate)
                        </p>
                    </div>
                </div>

                <p className="text-sm text-slate-600 font-medium leading-relaxed mb-6">
                    Para que o Google Ads exiba banners dinâmicos na <strong>Rede de Display</strong> (sites parceiros, blogs, apps e YouTube) com as fotos e valores exatos dos imóveis que o visitante navegou, cadastre o link abaixo no Google Ads:
                </p>

                <div className="space-y-3">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
                        URL do Feed de Imóveis (CSV)
                    </label>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <input
                            type="text"
                            readOnly
                            value={feedUrl}
                            className="flex-1 bg-slate-50 border border-slate-200 px-6 py-4 rounded-2xl font-mono font-bold text-xs text-slate-700 outline-none"
                        />
                        <button
                            type="button"
                            onClick={copyFeedUrl}
                            className="px-6 py-4 bg-[#1B263B] hover:bg-[#10b981] text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                        >
                            {feedCopied ? (
                                <>
                                    <Check className="h-4 w-4 text-[#10b981]" />
                                    <span>Copiado!</span>
                                </>
                            ) : (
                                <>
                                    <Copy className="h-4 w-4" />
                                    <span>Copiar Feed</span>
                                </>
                            )}
                        </button>
                        <a
                            href={feedUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-6 py-4 bg-slate-100 hover:bg-slate-200 text-[#1B263B] rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                        >
                            <ExternalLink className="h-4 w-4" />
                            <span>Visualizar</span>
                        </a>
                    </div>
                </div>

                {/* Passo a Passo */}
                <div className="mt-8 pt-8 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                        <span className="h-7 w-7 rounded-full bg-[#1B263B] text-white text-xs font-black flex items-center justify-center">1</span>
                        <h5 className="text-xs font-black text-[#1B263B] uppercase tracking-wider">Acesse o Google Ads</h5>
                        <p className="text-xs text-slate-500 font-medium">
                            Vá em <strong>Ferramentas e Configurações → Dados da Empresa → Feeds de Dados</strong>.
                        </p>
                    </div>

                    <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                        <span className="h-7 w-7 rounded-full bg-[#1B263B] text-white text-xs font-black flex items-center justify-center">2</span>
                        <h5 className="text-xs font-black text-[#1B263B] uppercase tracking-wider">Adicione o Feed</h5>
                        <p className="text-xs text-slate-500 font-medium">
                            Clique em <strong>+ → Feed de Imóveis e Aluguéis</strong> e configure para buscar a URL do feed automaticamente a cada 24h.
                        </p>
                    </div>

                    <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                        <span className="h-7 w-7 rounded-full bg-[#1B263B] text-white text-xs font-black flex items-center justify-center">3</span>
                        <h5 className="text-xs font-black text-[#1B263B] uppercase tracking-wider">Crie a Campanha</h5>
                        <p className="text-xs text-slate-500 font-medium">
                            Crie uma campanha na <strong>Rede de Display</strong> selecionando seu feed e o público de visitantes do site.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

