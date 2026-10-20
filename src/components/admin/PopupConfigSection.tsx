'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
    Search, Sliders, CheckCircle2, Save, Eye, Layers, 
    Clock, Globe, Sparkles, Check, Plus, Trash2, AlertCircle 
} from 'lucide-react';
import clsx from 'clsx';
import { PopupSearchConfig } from '@/components/InitialSearchModal';

const DEFAULT_CONFIG: PopupSearchConfig = {
    enabled: true,
    frequency: 'once',
    target_pages: 'all',
    specific_pages: ['/', '/catalogo', '/imoveis'],
    delay_seconds: 1,
    title: 'O que você procura hoje?',
    subtitle: 'Encontre os melhores imóveis em Praia Grande com busca rápida personalizada'
};

const AVAILABLE_PAGES = [
    { path: '/', label: 'Página Inicial (Home)' },
    { path: '/catalogo', label: 'Catálogo de Compras (/catalogo)' },
    { path: '/imoveis', label: 'Todos os Imóveis / Aluguel (/imoveis)' },
    { path: '/lancamentos', label: 'Lançamentos (/lancamentos)' },
    { path: '/bairros', label: 'Guia de Bairros (/bairros)' },
    { path: '/sobre-nos', label: 'Sobre Nós (/sobre-nos)' },
    { path: '/contato', label: 'Contato (/contato)' },
    { path: '/comprar-imovel-em-praia-grande', label: 'Guia de Compra (/comprar-imovel...)' },
];

export default function PopupConfigSection() {
    const [config, setConfig] = useState<PopupSearchConfig>(DEFAULT_CONFIG);
    const [isSaving, setIsSaving] = useState(false);
    const [customPage, setCustomPage] = useState('');

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const { data } = await supabase
                    .from('site_settings')
                    .select('value')
                    .eq('key', 'popup_search_config')
                    .maybeSingle();

                if (data && data.value) {
                    setConfig({ ...DEFAULT_CONFIG, ...data.value });
                }
            } catch (error) {
                console.error('Erro ao carregar configurações do popup:', error);
            }
        };
        fetchConfig();
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const { error } = await supabase
                .from('site_settings')
                .upsert({
                    key: 'popup_search_config',
                    value: config
                });

            if (error) throw error;

            if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('show-toast', {
                    detail: { message: 'Configurações do popup salvas com sucesso!', type: 'success' }
                }));
            }
        } catch (err: any) {
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('show-toast', {
                    detail: { message: 'Erro ao salvar: ' + err.message, type: 'error' }
                }));
            }
        } finally {
            setIsSaving(false);
        }
    };

    const handlePreview = () => {
        // Dispara o evento global para abrir o popup instantaneamente
        window.dispatchEvent(new CustomEvent('open-search-popup'));
    };

    const togglePage = (path: string) => {
        const current = config.specific_pages || [];
        const updated = current.includes(path)
            ? current.filter(p => p !== path)
            : [...current, path];
        setConfig({ ...config, specific_pages: updated });
    };

    const addCustomPage = () => {
        if (!customPage.trim()) return;
        let formatted = customPage.trim();
        if (!formatted.startsWith('/')) formatted = '/' + formatted;

        const current = config.specific_pages || [];
        if (!current.includes(formatted)) {
            setConfig({ ...config, specific_pages: [...current, formatted] });
        }
        setCustomPage('');
    };

    const removeCustomPage = (path: string) => {
        setConfig({
            ...config,
            specific_pages: (config.specific_pages || []).filter(p => p !== path)
        });
    };

    return (
        <div className="bg-white p-8 md:p-12 rounded-[50px] border border-slate-100 shadow-sm space-y-12 animate-in fade-in duration-500 text-slate-800">
            {/* Header */}
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 pb-8 border-b border-slate-100">
                <div>
                    <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider mb-2">
                        <Sparkles className="h-3 w-3" />
                        Captação e Busca Rápida
                    </div>
                    <h3 className="text-3xl font-black text-[#1B263B] tracking-tighter uppercase">
                        Popup Inicial de Busca
                    </h3>
                    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">
                        Gerencie a abertura automática dos campos de busca para novos visitantes
                    </p>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button
                        type="button"
                        onClick={handlePreview}
                        className="flex-1 sm:flex-none px-6 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-[#1B263B] font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-sm"
                        title="Abrir o popup agora para ver como ele fica"
                    >
                        <Eye className="h-4 w-4" />
                        Testar Visualização
                    </button>

                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex-1 sm:flex-none px-8 py-3.5 rounded-2xl bg-[#10b981] hover:bg-emerald-600 text-white font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/20 active:scale-95 disabled:opacity-50"
                    >
                        <Save className="h-4 w-4" />
                        {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                    </button>
                </div>
            </header>

            {/* Ativar / Desativar */}
            <div className="bg-slate-50 p-6 md:p-8 rounded-3xl border border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div>
                    <h4 className="text-lg font-black text-[#1B263B] uppercase tracking-tight">
                        Status do Popup
                    </h4>
                    <p className="text-xs font-bold text-slate-500 mt-1">
                        Ative ou desative o popup de busca sem perder suas configurações salvas.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => setConfig({ ...config, enabled: !config.enabled })}
                        className={clsx(
                            'relative inline-flex h-8 w-16 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none',
                            config.enabled ? 'bg-[#10b981]' : 'bg-slate-300'
                        )}
                        role="switch"
                        aria-checked={config.enabled}
                    >
                        <span
                            className={clsx(
                                'pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out',
                                config.enabled ? 'translate-x-8' : 'translate-x-0'
                            )}
                        />
                    </button>
                    <span className={clsx('font-black text-xs uppercase tracking-wider', config.enabled ? 'text-emerald-600' : 'text-slate-400')}>
                        {config.enabled ? 'Ativado' : 'Desativado'}
                    </span>
                </div>
            </div>

            {/* 1. Frequência de Exibição (1x ou Sempre) */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400">
                    <Clock className="h-4 w-4 text-[#10b981]" />
                    <span>Frequência de Abertura</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Opção 1x */}
                    <div
                        onClick={() => setConfig({ ...config, frequency: 'once' })}
                        className={clsx(
                            'p-6 rounded-3xl border-2 cursor-pointer transition-all flex items-start gap-4',
                            config.frequency === 'once'
                                ? 'border-[#10b981] bg-emerald-50/40 shadow-sm'
                                : 'border-slate-100 bg-white hover:border-slate-200'
                        )}
                    >
                        <div className={clsx(
                            'h-6 w-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5',
                            config.frequency === 'once' ? 'border-[#10b981] bg-[#10b981] text-white' : 'border-slate-300'
                        )}>
                            {config.frequency === 'once' && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="font-black text-sm text-[#1B263B] uppercase tracking-wide">
                                    1x por Sessão / Visita
                                </span>
                                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                                    Recomendado
                                </span>
                            </div>
                            <p className="text-xs font-medium text-slate-500 mt-1 leading-relaxed">
                                O popup abre apenas quando o cliente entra no site. Depois de fechar ou buscar, ele não reabre a cada clique de página, garantindo ótima experiência de navegação.
                            </p>
                        </div>
                    </div>

                    {/* Opção Sempre */}
                    <div
                        onClick={() => setConfig({ ...config, frequency: 'always' })}
                        className={clsx(
                            'p-6 rounded-3xl border-2 cursor-pointer transition-all flex items-start gap-4',
                            config.frequency === 'always'
                                ? 'border-[#10b981] bg-emerald-50/40 shadow-sm'
                                : 'border-slate-100 bg-white hover:border-slate-200'
                        )}
                    >
                        <div className={clsx(
                            'h-6 w-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5',
                            config.frequency === 'always' ? 'border-[#10b981] bg-[#10b981] text-white' : 'border-slate-300'
                        )}>
                            {config.frequency === 'always' && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                        </div>
                        <div>
                            <span className="font-black text-sm text-[#1B263B] uppercase tracking-wide">
                                Sempre (Toda vez)
                            </span>
                            <p className="text-xs font-medium text-slate-500 mt-1 leading-relaxed">
                                O popup será exibido sempre que o cliente acessar ou recarregar as páginas selecionadas, mesmo que já tenha fechado antes.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. Onde Exibir (Todas as páginas ou páginas específicas) */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400">
                    <Globe className="h-4 w-4 text-[#10b981]" />
                    <span>Onde Exibir o Popup</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Todas as Páginas */}
                    <div
                        onClick={() => setConfig({ ...config, target_pages: 'all' })}
                        className={clsx(
                            'p-6 rounded-3xl border-2 cursor-pointer transition-all flex items-start gap-4',
                            config.target_pages === 'all'
                                ? 'border-[#10b981] bg-emerald-50/40 shadow-sm'
                                : 'border-slate-100 bg-white hover:border-slate-200'
                        )}
                    >
                        <div className={clsx(
                            'h-6 w-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5',
                            config.target_pages === 'all' ? 'border-[#10b981] bg-[#10b981] text-white' : 'border-slate-300'
                        )}>
                            {config.target_pages === 'all' && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                        </div>
                        <div>
                            <span className="font-black text-sm text-[#1B263B] uppercase tracking-wide">
                                Em Todas as Páginas
                            </span>
                            <p className="text-xs font-medium text-slate-500 mt-1 leading-relaxed">
                                Funciona em qualquer página do site que o cliente acessar pela primeira vez.
                            </p>
                        </div>
                    </div>

                    {/* Páginas Específicas */}
                    <div
                        onClick={() => setConfig({ ...config, target_pages: 'specific' })}
                        className={clsx(
                            'p-6 rounded-3xl border-2 cursor-pointer transition-all flex items-start gap-4',
                            config.target_pages === 'specific'
                                ? 'border-[#10b981] bg-emerald-50/40 shadow-sm'
                                : 'border-slate-100 bg-white hover:border-slate-200'
                        )}
                    >
                        <div className={clsx(
                            'h-6 w-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5',
                            config.target_pages === 'specific' ? 'border-[#10b981] bg-[#10b981] text-white' : 'border-slate-300'
                        )}>
                            {config.target_pages === 'specific' && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                        </div>
                        <div>
                            <span className="font-black text-sm text-[#1B263B] uppercase tracking-wide">
                                Apenas em Páginas Específicas
                            </span>
                            <p className="text-xs font-medium text-slate-500 mt-1 leading-relaxed">
                                Escolha abaixo exatamente quais telas do site devem acionar o popup.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Seleção de Páginas Específicas (Condicional) */}
                {config.target_pages === 'specific' && (
                    <div className="mt-4 p-6 bg-slate-50 rounded-3xl border border-slate-200 space-y-4 animate-in fade-in">
                        <p className="text-xs font-black uppercase tracking-wider text-slate-500">
                            Selecione as páginas onde o popup deve aparecer:
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                            {AVAILABLE_PAGES.map((pg) => {
                                const checked = (config.specific_pages || []).includes(pg.path);
                                return (
                                    <label
                                        key={pg.path}
                                        className={clsx(
                                            'p-3.5 rounded-2xl border flex items-center gap-3 cursor-pointer transition-all',
                                            checked ? 'bg-white border-[#10b981] shadow-sm text-slate-900' : 'bg-white/50 border-slate-200 text-slate-600 hover:bg-white'
                                        )}
                                    >
                                        <div className={clsx(
                                            'h-4 w-4 rounded border flex items-center justify-center transition-all shrink-0',
                                            checked ? 'bg-[#10b981] border-[#10b981] text-white' : 'border-slate-300'
                                        )}>
                                            {checked && <Check className="h-3 w-3 stroke-[3]" />}
                                        </div>
                                        <input
                                            type="checkbox"
                                            className="sr-only"
                                            checked={checked}
                                            onChange={() => togglePage(pg.path)}
                                        />
                                        <span className="text-xs font-bold truncate">{pg.label}</span>
                                    </label>
                                );
                            })}
                        </div>

                        {/* Adicionar página customizada */}
                        <div className="pt-4 border-t border-slate-200/60 flex flex-col sm:flex-row items-center gap-3">
                            <input
                                type="text"
                                placeholder="Adicionar outra rota (ex: /imovel)"
                                value={customPage}
                                onChange={(e) => setCustomPage(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustomPage(); }}}
                                className="w-full sm:w-80 bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-[#10b981]/20"
                            />
                            <button
                                type="button"
                                onClick={addCustomPage}
                                className="w-full sm:w-auto px-4 py-2.5 bg-[#1B263B] text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-primary-800 transition-colors"
                            >
                                <Plus className="h-3.5 w-3.5" /> Adicionar
                            </button>
                        </div>

                        {/* Badges de páginas extras selecionadas */}
                        {config.specific_pages && config.specific_pages.filter(p => !AVAILABLE_PAGES.some(a => a.path === p)).length > 0 && (
                            <div className="flex flex-wrap gap-2 pt-2">
                                {config.specific_pages.filter(p => !AVAILABLE_PAGES.some(a => a.path === p)).map(p => (
                                    <span key={p} className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 rounded-full text-xs font-bold text-slate-700">
                                        {p}
                                        <button type="button" onClick={() => removeCustomPage(p)} className="text-slate-400 hover:text-red-500">
                                            <Trash2 className="h-3 w-3" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* 3. Tempo de Espera (Delay) e Textos */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-100">
                {/* Delay */}
                <div className="space-y-2">
                    <label className="block text-[11px] font-black uppercase tracking-wider text-slate-400">
                        Tempo de Espera (Delay)
                    </label>
                    <select
                        value={config.delay_seconds ?? 1}
                        onChange={(e) => setConfig({ ...config, delay_seconds: Number(e.target.value) })}
                        className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-2xl font-bold text-sm text-slate-800 outline-none focus:ring-2 focus:ring-[#10b981]/20 cursor-pointer"
                    >
                        <option value={0}>Imediato (0 segundos)</option>
                        <option value={1}>1 segundo (Recomendado)</option>
                        <option value={2}>2 segundos</option>
                        <option value={3}>3 segundos</option>
                        <option value={5}>5 segundos</option>
                    </select>
                    <p className="text-[11px] text-slate-400 font-medium">Tempo após o carregamento da página até o popup surgir suavemente.</p>
                </div>

                {/* Título */}
                <div className="space-y-2 md:col-span-2">
                    <label className="block text-[11px] font-black uppercase tracking-wider text-slate-400">
                        Título do Popup
                    </label>
                    <input
                        type="text"
                        value={config.title || ''}
                        onChange={(e) => setConfig({ ...config, title: e.target.value })}
                        placeholder="Ex: O que você procura hoje?"
                        className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-2xl font-bold text-sm text-slate-800 outline-none focus:ring-2 focus:ring-[#10b981]/20"
                    />
                </div>

                {/* Subtítulo */}
                <div className="space-y-2 md:col-span-3">
                    <label className="block text-[11px] font-black uppercase tracking-wider text-slate-400">
                        Subtítulo Explicativo
                    </label>
                    <input
                        type="text"
                        value={config.subtitle || ''}
                        onChange={(e) => setConfig({ ...config, subtitle: e.target.value })}
                        placeholder="Ex: Encontre os melhores imóveis em Praia Grande com busca rápida personalizada"
                        className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-2xl font-bold text-sm text-slate-800 outline-none focus:ring-2 focus:ring-[#10b981]/20"
                    />
                </div>
            </div>

            {/* Footer com Salvar */}
            <div className="pt-6 border-t border-slate-100 flex justify-end">
                <button
                    type="button"
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-[#10b981] hover:bg-emerald-600 text-white font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-xl shadow-emerald-500/20 active:scale-95 disabled:opacity-50"
                >
                    <Save className="h-4 w-4" />
                    {isSaving ? 'Salvando...' : 'Salvar Alterações do Popup'}
                </button>
            </div>
        </div>
    );
}
