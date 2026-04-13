'use client';

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Building2, 
  Search, 
  Plus, 
  Trash2, 
  Printer, 
  Send, 
  CheckCircle2, 
  Maximize2, 
  Bed, 
  Bath, 
  Car,
  MapPin,
  Clock,
  User, 
  Phone,
  Layout
} from 'lucide-react';
import SignatureCanvas from 'react-signature-canvas';
import { v4 as uuidv4 } from 'uuid';

interface Property {
  id: string;
  title: string;
  reference_id: string;
  price: number;
  images: string[];
  area: number;
  rooms: number;
  bathrooms: number;
  parking_spaces: number;
  address: string;
  address_number: string;
  neighborhood: string;
  city: string;
  condo_fee: number;
  iptu: number;
}

export default function RoteiroVisitaPage() {
  const [selectedProperties, setSelectedProperties] = useState<Property[]>([]);
  const [searchResults, setSearchResults] = useState<Property[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientWhatsApp, setClientWhatsApp] = useState('');
  const [visitDate, setVisitDate] = useState(new Date().toISOString().split('T')[0]);
  const [visitTime, setVisitTime] = useState(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
  
  const signatureRefCorretor = useRef<SignatureCanvas>(null);
  const signatureRefCliente = useRef<SignatureCanvas>(null);

  const searchProperties = async (term: string) => {
    if (!term) {
      setSearchResults([]);
      return;
    }
    const { data } = await supabase
      .from('properties')
      .select('*')
      .or(`title.ilike.%${term}%,reference_id.ilike.%${term}%,neighborhood.ilike.%${term}%`)
      .limit(10);
    setSearchResults(data || []);
  };

  useEffect(() => {
    const timer = setTimeout(() => searchProperties(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const addProperty = (prop: Property) => {
    if (!selectedProperties.find(p => p.id === prop.id)) {
      setSelectedProperties([...selectedProperties, prop]);
    }
    setSearchTerm('');
    setSearchResults([]);
  };

  const removeProperty = (id: string) => {
    setSelectedProperties(selectedProperties.filter(p => p.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 lg:p-12 print:bg-white print:p-0">
      {/* Search & UI Controls - Hidden on Print */}
      <div className="max-w-5xl mx-auto mb-8 space-y-6 print:hidden">
        <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-200">
          <h1 className="text-2xl font-black uppercase tracking-tighter mb-6 flex items-center gap-3">
            <Layout className="h-6 w-6 text-[#10b981]" /> Gerador de Roteiro Digital
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-2">Nome do Cliente</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                <input 
                  type="text" 
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Nome completo do interessado"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-[#10b981]/20"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-2">WhatsApp do Cliente</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                <input 
                  type="text" 
                  value={clientWhatsApp}
                  onChange={(e) => setClientWhatsApp(e.target.value)}
                  placeholder="(13) 90000-0000"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-[#10b981]/20"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2 relative">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-2">Buscar Imóveis para Visitar</label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Busque por código, bairro ou título..."
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-[#10b981]/20"
              />
            </div>

            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 z-50 bg-white border border-slate-200 mt-2 rounded-2xl shadow-2xl overflow-hidden divide-y divide-slate-50">
                {searchResults.map(prop => (
                  <button 
                    key={prop.id}
                    onClick={() => addProperty(prop)}
                    className="w-full flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors text-left"
                  >
                    <img src={prop.images?.[0]} className="h-12 w-12 rounded-lg object-cover" alt="" />
                    <div className="flex-1">
                      <p className="text-xs font-black text-[#1B263B] uppercase">{prop.title}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Ref: {prop.reference_id} • R$ {prop.price?.toLocaleString('pt-BR')}</p>
                    </div>
                    <Plus className="h-4 w-4 text-[#10b981]" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button 
            onClick={() => window.print()}
            className="px-8 py-4 bg-[#1B263B] text-white rounded-2xl font-black text-[12px] uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-all shadow-xl shadow-[#1B263B]/20"
          >
            <Printer className="h-4 w-4" /> Imprimir Documento
          </button>
          <button 
            className="px-8 py-4 bg-[#10b981] text-white rounded-2xl font-black text-[12px] uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-all shadow-xl shadow-[#10b981]/20"
          >
            <Send className="h-4 w-4" /> Enviar Link de Assinatura
          </button>
        </div>
      </div>

      {/* DOCUMENT PAPER - A4 FORMAT (CSS) */}
      <div id="capture-area" className="max-w-[210mm] min-h-[297mm] mx-auto bg-white p-[20mm] shadow-2xl print:shadow-none print:p-0 print:max-w-none text-[#334155] border print:border-none">
        
        {/* HEADER */}
        <header className="flex justify-between items-start border-b-2 border-slate-100 pb-8 mb-8">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 bg-[#1B263B] rounded-2xl flex items-center justify-center p-2">
              <Building2 className="h-10 w-10 text-[#10b981]" />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight text-[#1B263B] uppercase">Kátia e Flávio Imóveis</h2>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] italic">Consultoria Imobiliária Premium</p>
            </div>
          </div>
          <div className="text-right">
            <h1 className="text-3xl font-black text-slate-200 tracking-tighter mb-2">ROTEIRO DE VISITA</h1>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-[#1B263B] uppercase tracking-widest">Imobiliária: <span className="text-slate-500">Kátia e Flávio Imóveis</span></p>
              <p className="text-[10px] font-bold text-[#1B263B] uppercase tracking-widest">Corretor: <span className="text-slate-500">Flávio Belchior</span></p>
            </div>
          </div>
        </header>

        {/* INTRO TEXT */}
        <div className="mb-10 p-6 bg-slate-50 rounded-2xl border border-slate-200 italic font-medium text-sm leading-relaxed text-slate-500">
          "Separamos os imóveis abaixo para visitarmos hoje. Para garantir uma qualidade no seu atendimento pedimos que preencha abaixo de acordo com sua visita."
        </div>

        {/* PROPERTY LIST */}
        <div className="space-y-8 mb-12">
          {selectedProperties.length > 0 ? selectedProperties.map((prop, idx) => (
            <div key={prop.id} className="border border-slate-300 rounded-[24px] overflow-hidden group">
              {/* Property Header (Gray background) */}
              <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex justify-between items-center">
                <h4 className="text-sm font-black text-[#1B263B] uppercase tracking-tight flex items-center gap-2">
                  <span className="h-6 w-6 rounded-full bg-[#1B263B] text-white flex items-center justify-center text-[10px]">{idx + 1}</span>
                  {prop.title} - Venda: R$ {prop.price?.toLocaleString('pt-BR')}
                </h4>
                <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase">Cod. {prop.reference_id}</span>
              </div>
              
              {/* Property Body (Flex) */}
              <div className="p-6 flex flex-col md:flex-row gap-8">
                {/* Details Section */}
                <div className="flex-1 flex gap-6">
                  <div className="h-24 w-24 min-w-[96px] rounded-2xl overflow-hidden border border-slate-100 shadow-sm relative">
                    <img src={prop.images?.[0]} className="h-full w-full object-cover" alt="" />
                    <button 
                      onClick={() => removeProperty(prop.id)}
                      className="absolute -top-1 -right-1 h-6 w-6 bg-white rounded-full flex items-center justify-center shadow-lg border border-red-100 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity print:hidden"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                  <div className="space-y-4">
                     <div className="flex items-center gap-4 text-[10px] font-black text-slate-600 uppercase tracking-widest bg-slate-100/50 px-3 py-1.5 rounded-xl w-fit">
                        <span className="flex items-center gap-1"><Bed className="h-3 w-3" /> {prop.rooms} dorms</span>
                        <span className="flex items-center gap-1"><Bath className="h-3 w-3" /> {prop.bathrooms} banh</span>
                        <span className="flex items-center gap-1"><Car className="h-3 w-3" /> {prop.parking_spaces} vaga</span>
                        <span className="flex items-center gap-1"><Maximize2 className="h-3 w-3" /> {prop.area}m²</span>
                     </div>
                     <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tighter leading-tight flex items-center gap-2">
                        <MapPin className="h-3 w-3 text-[#10b981]" /> {prop.address}, {prop.address_number} - {prop.neighborhood}, {prop.city}
                     </p>
                     <div className="flex gap-6">
                        <p className="text-[10px] font-black uppercase text-[#1B263B]">Cond: <span className="text-slate-400">R$ {prop.condo_fee || '0,00'}</span></p>
                        <p className="text-[10px] font-black uppercase text-[#1B263B]">IPTU: <span className="text-slate-400">R$ {prop.iptu || '0,00'}</span></p>
                     </div>
                  </div>
                </div>

                {/* Rating Table */}
                <div className="flex-shrink-0">
                  <table className="border-collapse">
                    <thead>
                      <tr>
                        <th className="p-1"></th>
                        {[...Array(10)].map((_, i) => (
                          <th key={i} className="w-8 text-[9px] font-black text-slate-300 uppercase tracking-tighter">{i + 1}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {['Preço', 'Localização', 'Estado'].map(category => (
                        <tr key={category}>
                          <td className="text-[10px] font-black uppercase text-slate-400 px-3 border border-slate-100">{category}</td>
                          {[...Array(10)].map((_, i) => (
                            <td key={i} className="border border-slate-200">
                              <div className="h-5 w-8 hover:bg-[#10b981]/10 cursor-pointer transition-colors" />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Property Footer (Checkboxes) */}
              <div className="bg-slate-50/30 p-6 border-t border-slate-100 flex gap-8">
                 {['Gostei', 'Não gostei', 'Proposta'].map(opt => (
                   <label key={opt} className="flex items-center gap-3 cursor-pointer group">
                      <div className="h-5 w-5 bg-white border-2 border-slate-300 rounded-lg group-hover:border-[#10b981] transition-all flex items-center justify-center">
                         <div className="h-2.5 w-2.5 bg-[#10b981] rounded-sm opacity-0 group-hover:opacity-20 translate-scale-0 transition-all" />
                      </div>
                      <span className="text-[11px] font-black uppercase tracking-widest text-slate-500 group-hover:text-[#1B263B]">{opt}</span>
                   </label>
                 ))}
              </div>
            </div>
          )) : (
            <div className="py-20 border-2 border-dashed border-slate-200 rounded-[40px] flex flex-col items-center justify-center text-slate-300 gap-4 print:hidden">
               <Building2 className="h-16 w-16" />
               <p className="text-xs font-black uppercase tracking-widest">Nenhum imóvel selecionado para o roteiro</p>
            </div>
          )}
        </div>

        {/* LEGAL FOOTER */}
        <div className="p-10 border-2 border-slate-100 rounded-[30px] bg-slate-50/20 text-justify mb-16">
          <h4 className="text-[12px] font-black text-[#1B263B] uppercase tracking-widest mb-4 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-[#10b981]" /> Declaração de Visita e Intermediação
          </h4>
          <p className="text-[11px] font-bold text-slate-500 leading-relaxed uppercase tracking-tighter">
            Declara o cliente <strong className="text-slate-800 border-b-2 border-dotted border-slate-300 px-2">{clientName || '________________________________'}</strong>, fone <strong className="text-slate-800 border-b-2 border-dotted border-slate-300 px-2">{clientWhatsApp || '________________________________'}</strong>, que visitou os imóveis acima descritos no dia <strong className="text-slate-800 border-b-2 border-dotted border-slate-300 px-2">{visitDate.split('-').reverse().join('/')}</strong> e horário <strong className="text-slate-800 border-b-2 border-dotted border-slate-300 px-2">{visitTime}</strong>, e que a qualquer tempo e a qualquer título, na intenção de efetivar quaisquer transações para um deles, se obriga a fazê-lo através da Kátia e Flávio Imóveis, sob pena de pagar os honorários profissionais, pela intermediação do negócio apontado por este Corretor(a), conforme a Lei 6530/78 e a resolução COFECI 458/95.
          </p>
        </div>

        {/* SIGNATURE SECTION */}
        <div className="grid grid-cols-2 gap-12">
          <div className="space-y-4">
             <div className="border-b-2 border-slate-400 bg-slate-50 rounded-t-2xl overflow-hidden h-32 relative">
                <SignatureCanvas 
                  ref={signatureRefCorretor}
                  penColor="#1B263B"
                  canvasProps={{ className: 'sigCanvas w-full h-full' }}
                />
             </div>
             <p className="text-[11px] font-black uppercase text-center tracking-widest text-[#1B263B]">Assinatura do Corretor</p>
          </div>
          <div className="space-y-4">
             <div className="border-b-2 border-slate-400 bg-slate-50 rounded-t-2xl overflow-hidden h-32 relative">
                <SignatureCanvas 
                  ref={signatureRefCliente}
                  penColor="#1B263B"
                  canvasProps={{ className: 'sigCanvas w-full h-full' }}
                />
             </div>
             <p className="text-[11px] font-black uppercase text-center tracking-widest text-[#1B263B]">Assinatura do Cliente</p>
          </div>
        </div>

        <footer className="mt-20 pt-8 border-t border-slate-100 flex justify-between items-center opacity-40">
           <p className="text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
             <Layout className="h-3 w-3" /> Sistema de Gestão KF Imóveis - Roteiro de Visita v2.0
           </p>
           <p className="text-[9px] font-black uppercase tracking-widest">
             Emitido em: {new Date().toLocaleString('pt-BR')}
           </p>
        </footer>
      </div>

      <style jsx global>{`
        @media print {
          body {
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .min-h-screen {
            min-height: auto !important;
          }
          @page {
            size: A4;
            margin: 10mm;
          }
          .custom-scrollbar::-webkit-scrollbar {
             display: none;
          }
          .sigCanvas {
            width: 100% !important;
            height: 100% !important;
          }
        }
      `}</style>
    </div>
  );
}
