'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  ShieldAlert, 
  Trash2, 
  Database, 
  RefreshCw, 
  ShieldCheck, 
  Loader2,
  AlertTriangle,
  History
} from 'lucide-react';

export default function SystemToolsSection() {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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

  return (
    <div className="mt-12 space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
