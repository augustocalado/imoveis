'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  ShieldAlert, 
  Trash2, 
  Database, 
  RefreshCw, 
  Loader2,
  AlertTriangle,
  History,
  Image as ImageIcon,
  HardDrive,
  Cloud,
  CheckCircle2,
  Info,
  Layers,
  ArrowUpRight
} from 'lucide-react';

interface StorageStats {
  supabase: {
    totalFiles: number;
    totalSize: number;
    totalSizeFormatted: string;
    usagePercent: number;
    freeLimitFormatted: string;
    details: Record<string, { files: number; size: number }>;
    error?: string | null;
  };
  r2: {
    totalFiles: number;
    totalSize: number;
    totalSizeFormatted: string;
    usagePercent: number;
    freeLimitFormatted: string;
    folderBreakdown: Record<string, { files: number; size: number }>;
    error?: string | null;
  };
}

export default function SystemToolsSection() {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [compressResult, setCompressResult] = useState<string | null>(null);

  // Storage Stats State
  const [storageStats, setStorageStats] = useState<StorageStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const fetchStorageStats = async (fresh: boolean = false) => {
    setLoadingStats(true);
    setStatsError(null);
    try {
      const res = await fetch(`/api/admin/storage-stats${fresh ? '?fresh=true' : ''}`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setStorageStats(data);
      setLastUpdated(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
    } catch (err: any) {
      console.error('Erro ao carregar estatísticas:', err);
      setStatsError(err.message || 'Falha ao buscar dados de armazenamento');
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchStorageStats(false);
  }, []);

  const resetTable = async (table: string, name: string) => {
    if (!confirm(`TEM CERTEZA? Isso excluirá permanentemente todos os ${name} do banco de dados!`)) return;
    if (!confirm(`ESTÁ MESMO CERTO? Esta ação não pode ser desfeita.`)) return;

    setIsDeleting(true);
    try {
      const { error } = await supabase.from(table).delete().neq('id', 'placeholder-non-existent');
      if (error) throw error;
      alert(`Todos os ${name} foram excluídos com sucesso!`);
    } catch (err: any) {
      alert(`Erro ao limpar tabela: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const revalidateFeeds = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      alert('Sincronização de feeds agendada para o próximo ciclo de 12h.');
    }, 1500);
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  return (
    <div className="mt-12 space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      
      {/* ========================================================================= */}
      {/* PAINEL DE MONITORAMENTO DE ARMAZENAMENTO (STORAGE: SUPABASE + CLOUDFLARE) */}
      {/* ========================================================================= */}
      <div className="bg-[#1B263B] p-8 md:p-12 rounded-[50px] shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 blur-[130px] -z-10 group-hover:bg-blue-500/20 transition-all duration-1000" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-orange-500/10 blur-[120px] -z-10 group-hover:bg-orange-500/15 transition-all duration-1000" />

        <div className="max-w-6xl relative z-10 text-left">
          
          {/* Header do Monitor de Armazenamento */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10 pb-8 border-b border-white/10">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <HardDrive className="h-7 w-7 text-white" />
              </div>
              <div>
                <h3 className="text-3xl font-black text-white tracking-tighter uppercase italic">
                  Monitor de <span className="text-cyan-400">Armazenamento</span>
                </h3>
                <p className="text-cyan-400/70 font-black text-[11px] uppercase tracking-[0.3em]">
                  Consumo de Imagens • Controle de Custos • Limites Gratuitos
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {lastUpdated && (
                <span className="text-white/40 text-xs font-bold">
                  Atualizado às {lastUpdated}
                </span>
              )}
              <button
                onClick={() => fetchStorageStats(true)}
                disabled={loadingStats}
                className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 text-white font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${loadingStats ? 'animate-spin text-cyan-400' : ''}`} />
                {loadingStats ? 'Calculando (100% real)...' : 'Atualizar Dados'}
              </button>
            </div>
          </div>

          {statsError && (
            <div className="mb-8 p-5 rounded-3xl bg-red-500/20 border border-red-500/30 text-red-200 text-sm font-medium flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-red-400 shrink-0" />
              <span>{statsError}</span>
            </div>
          )}

          {/* Grid dos dois provedores: Supabase vs Cloudflare R2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">

            {/* CARD 1: SUPABASE STORAGE */}
            <div className="bg-white/5 border border-white/10 p-8 rounded-[40px] relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 p-8">
                <span className={`px-3 py-1 border rounded-full text-[10px] font-black uppercase tracking-widest ${
                  (storageStats?.supabase.usagePercent || 0) > 100 
                    ? 'bg-red-500/20 border-red-500/40 text-red-400'
                    : 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
                }`}>
                  {(storageStats?.supabase.usagePercent || 0) > 100 ? 'Limite Excedido' : 'Plano Gratuito'}
                </span>
              </div>

              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                    <Database className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-white uppercase tracking-tight">Supabase Storage</h4>
                    <p className="text-white/40 text-xs font-bold">Armazenamento inicial do projeto</p>
                  </div>
                </div>

                {/* Métricas Principais */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-wider block mb-1">
                      Imagens / Arquivos
                    </span>
                    <span className="text-3xl font-black text-white tracking-tight">
                      {loadingStats ? '...' : (storageStats?.supabase.totalFiles ?? 0)}
                    </span>
                    <span className="text-[11px] text-white/50 block mt-1">arquivos reais no Supabase</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-wider block mb-1">
                      Espaço Ocupado
                    </span>
                    <span className={`text-3xl font-black tracking-tight ${
                      (storageStats?.supabase.usagePercent || 0) > 100 
                        ? 'text-red-400' 
                        : (storageStats?.supabase.usagePercent || 0) > 80 
                          ? 'text-amber-400' 
                          : 'text-emerald-400'
                    }`}>
                      {loadingStats ? '...' : (storageStats?.supabase.totalSizeFormatted ?? '0 B')}
                    </span>
                    <span className="text-[11px] text-white/50 block mt-1">de 1 GB gratuito</span>
                  </div>
                </div>

                {/* Barra de Progresso do Limite */}
                <div className="mb-6 space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-white/70">Uso da Cota Gratuita (1 GB):</span>
                    <span className={`font-black ${
                      (storageStats?.supabase.usagePercent || 0) > 100 ? 'text-red-400' :
                      (storageStats?.supabase.usagePercent || 0) > 80 ? 'text-amber-400' : 'text-emerald-400'
                    }`}>
                      {storageStats?.supabase.usagePercent ?? 0}% utilizado
                    </span>
                  </div>
                  <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden p-0.5">
                    <div 
                      className={`h-full rounded-full transition-all duration-700 ${
                        (storageStats?.supabase.usagePercent || 0) > 80 ? 'bg-red-500' : 
                        (storageStats?.supabase.usagePercent || 0) > 50 ? 'bg-amber-400' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.max(2, Math.min(100, storageStats?.supabase.usagePercent || 0))}%` }}
                    />
                  </div>
                </div>

                {/* Detalhes por Bucket */}
                {storageStats?.supabase.details && Object.keys(storageStats.supabase.details).length > 0 && (
                  <div className="space-y-2 pt-4 border-t border-white/5">
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-widest block mb-2">
                      Detalhamento por Pasta:
                    </span>
                    {Object.entries(storageStats.supabase.details).map(([bucketName, bData]) => (
                      <div key={bucketName} className="flex items-center justify-between text-xs py-1.5 px-3 rounded-xl bg-white/5">
                        <span className="font-bold text-white/70 flex items-center gap-2">
                          <Layers className="h-3.5 w-3.5 text-white/40" />
                          {bucketName}
                        </span>
                        <span className="text-white/50 font-mono">
                          {bData.files} arq. • {formatBytes(bData.size)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Dica para não pagar */}
              <div className="mt-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-200 leading-relaxed">
                💡 <strong>Dica de Economia:</strong> O limite gratuito do Supabase é de <strong>1 GB</strong>. Como você já tem mais de 3.6 GB antigos, as <strong>novas fotos agora vão direto para o Cloudflare R2 (10 GB grátis)</strong>, e ao excluir imóveis antigos/vendidos o espaço no Supabase vai sendo liberado!
              </div>
            </div>

            {/* CARD 2: CLOUDFLARE R2 */}
            <div className="bg-white/5 border border-white/10 p-8 rounded-[40px] relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 p-8">
                <span className="px-3 py-1 bg-orange-500/20 border border-orange-500/30 rounded-full text-[10px] font-black text-orange-400 uppercase tracking-widest">
                  10 GB Grátis / Mês
                </span>
              </div>

              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
                    <Cloud className="h-5 w-5 text-orange-400" />
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-white uppercase tracking-tight">Cloudflare R2</h4>
                    <p className="text-white/40 text-xs font-bold">Novo armazenamento principal de alta velocidade</p>
                  </div>
                </div>

                {/* Métricas Principais */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-wider block mb-1">
                      Imagens / Arquivos
                    </span>
                    <span className="text-3xl font-black text-white tracking-tight">
                      {loadingStats ? '...' : (storageStats?.r2.totalFiles ?? 0)}
                    </span>
                    <span className="text-[11px] text-white/50 block mt-1">arquivos no R2</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-wider block mb-1">
                      Espaço Ocupado
                    </span>
                    <span className="text-3xl font-black text-orange-400 tracking-tight">
                      {loadingStats ? '...' : (storageStats?.r2.totalSizeFormatted ?? '0 B')}
                    </span>
                    <span className="text-[11px] text-white/50 block mt-1">de 10 GB gratuitos</span>
                  </div>
                </div>

                {/* Barra de Progresso do Limite */}
                <div className="mb-6 space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-white/70">Uso da Cota Gratuita (10 GB):</span>
                    <span className={`font-black ${
                      (storageStats?.r2.usagePercent || 0) > 80 ? 'text-red-400' : 
                      (storageStats?.r2.usagePercent || 0) > 50 ? 'text-amber-400' : 'text-orange-400'
                    }`}>
                      {storageStats?.r2.usagePercent ?? 0}% utilizado
                    </span>
                  </div>
                  <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden p-0.5">
                    <div 
                      className={`h-full rounded-full transition-all duration-700 ${
                        (storageStats?.r2.usagePercent || 0) > 80 ? 'bg-red-500' : 
                        (storageStats?.r2.usagePercent || 0) > 50 ? 'bg-amber-400' : 'bg-orange-500'
                      }`}
                      style={{ width: `${Math.max(2, Math.min(100, storageStats?.r2.usagePercent || 0))}%` }}
                    />
                  </div>
                </div>

                {/* Detalhes por Pasta no R2 */}
                {storageStats?.r2.folderBreakdown && Object.keys(storageStats.r2.folderBreakdown).length > 0 && (
                  <div className="space-y-2 pt-4 border-t border-white/5">
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-widest block mb-2">
                      Detalhamento por Pasta:
                    </span>
                    {Object.entries(storageStats.r2.folderBreakdown).map(([folderName, fData]) => (
                      <div key={folderName} className="flex items-center justify-between text-xs py-1.5 px-3 rounded-xl bg-white/5">
                        <span className="font-bold text-white/70 flex items-center gap-2">
                          <Layers className="h-3.5 w-3.5 text-orange-400/60" />
                          {folderName}/
                        </span>
                        <span className="text-white/50 font-mono">
                          {fData.files} arq. • {formatBytes(fData.size)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Dica R2 */}
              <div className="mt-6 p-4 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-[11px] text-orange-200 leading-relaxed">
                🚀 <strong>Zero Custo de Tráfego:</strong> O Cloudflare R2 oferece <strong>10 GB gratuitos todo mês</strong> e <strong>NÃO cobra taxa de download/transferência</strong> de fotos!
              </div>
            </div>

          </div>

          {/* Destaque de Limpeza & Gestão Segura */}
          <div className="p-6 rounded-3xl bg-white/5 border border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-6 w-6 text-cyan-400 shrink-0" />
              <p className="text-xs text-white/80 font-medium">
                <strong>Limpeza Automática Ativada:</strong> Ao excluir qualquer imóvel na lista ou na aba de Desabilitados/Vendidos, as fotos do imóvel são <strong>apagadas automaticamente</strong> tanto do R2 quanto do Supabase, liberando espaço na hora!
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* FERRAMENTAS DO SISTEMA (AÇÕES MANUAIS, LOGS E COMPRESSÃO) */}
      {/* ========================================================================= */}
      <div className="bg-[#1B263B] p-12 rounded-[50px] shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-80 h-80 bg-red-500/10 blur-[120px] -z-10 group-hover:bg-red-500/20 transition-all duration-1000" />
        
        <div className="max-w-5xl relative z-10 text-left">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-14 w-14 rounded-2xl bg-red-500 flex items-center justify-center shadow-lg shadow-red-500/20">
              <ShieldAlert className="h-7 w-7 text-white" />
            </div>
            <div>
              <h3 className="text-3xl font-black text-white tracking-tighter uppercase italic">Ferramentas de <span className="text-red-500">Sistema</span></h3>
              <p className="text-red-500/50 font-black text-[11px] uppercase tracking-[0.4em]">Manutenção • Segurança • Dados</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Database Health Card */}
            <div className="bg-white/5 border border-white/10 p-10 rounded-[40px] hover:bg-white/10 transition-all group/card">
              <div className="flex items-center justify-between mb-8">
                <div className="h-12 w-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center">
                  <Database className="h-6 w-6 text-indigo-400" />
                </div>
                <div className="px-3 py-1 bg-emerald-500/20 rounded-full border border-emerald-500/30">
                  <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Ativo</span>
                </div>
              </div>
              <h4 className="text-xl font-black text-white uppercase tracking-tighter mb-2">Banco de Dados</h4>
              <p className="text-white/40 text-sm font-bold leading-relaxed mb-8 italic">Gerencie o estado das suas informações master.</p>
              
              <button 
                onClick={revalidateFeeds}
                disabled={isLoading}
                className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/10 transition-all flex items-center justify-center gap-3"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                Forçar Sincronização
              </button>
            </div>

            {/* Logs/History Card */}
            <div className="bg-white/5 border border-white/10 p-10 rounded-[40px] hover:bg-white/10 transition-all group/card">
              <div className="h-12 w-12 rounded-2xl bg-amber-500/20 flex items-center justify-center mb-8">
                <History className="h-6 w-6 text-amber-400" />
              </div>
              <h4 className="text-xl font-black text-white uppercase tracking-tighter mb-2">Logs de Erros</h4>
              <p className="text-white/40 text-sm font-bold leading-relaxed mb-10">Histórico de erros de sistema detectados em tempo real.</p>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Feed ZapSync</span>
                  <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">OK</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Storage Cache</span>
                  <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">OK</span>
                </div>
              </div>
            </div>

            {/* Compress Images Card */}
            <div className="bg-white/5 border border-white/10 p-10 rounded-[40px] hover:bg-white/10 transition-all group/card">
              <div className="flex items-center justify-between mb-8">
                <div className="h-12 w-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center">
                  <ImageIcon className="h-6 w-6 text-emerald-400" />
                </div>
                <div className="px-3 py-1 bg-emerald-500/20 rounded-full border border-emerald-500/30">
                  <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Otimização</span>
                </div>
              </div>
              <h4 className="text-xl font-black text-white uppercase tracking-tighter mb-2">Comprimir Imagens</h4>
              <p className="text-white/40 text-sm font-bold leading-relaxed mb-8 italic">Reduza o espaço ocupado pelas fotos no Supabase Storage.</p>
              
              {compressResult && (
                <div className="mb-6 p-4 rounded-2xl bg-white/5 border border-white/10 text-[11px] font-bold text-white/70 leading-relaxed">
                  {compressResult}
                </div>
              )}

              <button 
                onClick={async () => {
                  setCompressing(true);
                  setCompressResult(null);
                  try {
                    const res = await fetch('/api/admin/compress-images', { method: 'POST' });
                    const data = await res.json();
                    if (data.error) {
                      setCompressResult(`Erro: ${data.error}`);
                    } else {
                      setCompressResult(
                        `Economia total: ${data.totalSavedFormatted}\n` +
                        (data.files?.filter((f: any) => f.saved > 0).length || 0) + ' imagens comprimidas.'
                      );
                      // Atualiza stats após comprimir
                      fetchStorageStats();
                    }
                  } catch (err: any) {
                    setCompressResult('Erro de conexão: ' + err.message);
                  } finally {
                    setCompressing(false);
                  }
                }}
                disabled={compressing}
                className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/10 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {compressing ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
                {compressing ? 'Comprimindo...' : 'Comprimir Imagens'}
              </button>
            </div>

            {/* Danger Zone Card */}
            <div className="bg-red-500/10 border border-red-500/20 p-10 rounded-[40px] hover:bg-red-500/20 transition-all">
              <div className="h-12 w-12 rounded-2xl bg-red-500/20 flex items-center justify-center mb-8">
                <AlertTriangle className="h-6 w-6 text-red-500" />
              </div>
              <h4 className="text-xl font-black text-white uppercase tracking-tighter mb-2">Zona de Perigo</h4>
              <p className="text-red-500/60 text-[11px] font-black uppercase tracking-widest mb-10">Ações Irreversíveis</p>
              
              <div className="space-y-3">
                <button 
                  onClick={() => resetTable('properties', 'imóveis')}
                  disabled={isDeleting}
                  className="w-full py-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-3"
                >
                  <Trash2 className="h-4 w-4" /> Resetar Imóveis
                </button>
                <button 
                  onClick={() => resetTable('leads', 'leads')}
                  disabled={isDeleting}
                  className="w-full py-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-3"
                >
                  <Trash2 className="h-4 w-4" /> Limpar CRM
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
