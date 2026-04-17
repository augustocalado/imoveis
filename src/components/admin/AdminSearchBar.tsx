'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Loader2, Building2, MapPin, Hash, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';

export default function AdminSearchBar() {
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const fetchResults = async () => {
            if (searchTerm.trim().length < 2) {
                setResults([]);
                setIsSearching(false);
                return;
            }

            setIsSearching(true);
            setIsOpen(true);

            try {
                const { data, error } = await supabase
                    .from('properties')
                    .select('id, title, reference_id, neighborhood, city')
                    .or(`title.ilike.%${searchTerm}%,reference_id.ilike.%${searchTerm}%,neighborhood.ilike.%${searchTerm}%`)
                    .order('created_at', { ascending: false })
                    .limit(8);

                if (!error) {
                    setResults(data || []);
                }
            } catch (err) {
                console.error('Erro na busca global:', err);
            } finally {
                setIsSearching(false);
            }
        };

        const timeoutId = setTimeout(fetchResults, 300);
        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    const handleSelect = (propertyId: string) => {
        setIsOpen(false);
        setSearchTerm('');
        router.push(`/admin/imoveis/editar/${propertyId}`);
    };

    return (
        <div className="relative w-full max-w-md group z-50" ref={dropdownRef}>
            <div className={clsx(
                "relative flex items-center transition-all duration-300",
                isOpen && results.length > 0 ? "rounded-t-2xl" : "rounded-2xl"
            )}>
                <Search className={clsx(
                    "absolute left-4 h-4 w-4 transition-colors duration-300",
                    isSearching ? "text-[#10b981]" : "text-slate-300 group-focus-within:text-[#10b981]"
                )} />
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={() => searchTerm.length >= 2 && setIsOpen(true)}
                    placeholder="Buscar por Ref, Título ou Bairro..."
                    className="w-full bg-slate-50 border border-slate-100 pl-12 pr-10 py-3.5 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-[#10b981]/10 focus:bg-white transition-all placeholder:text-slate-300"
                />
                {searchTerm && (
                    <button 
                        onClick={() => setSearchTerm('')}
                        className="absolute right-4 p-1 hover:bg-slate-100 rounded-full transition-colors"
                    >
                        <X className="h-3 w-3 text-slate-400" />
                    </button>
                )}
            </div>

            {isOpen && (searchTerm.length >= 2) && (
                <div className="absolute top-full left-0 right-0 bg-white border border-t-0 border-slate-100 rounded-b-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    {isSearching ? (
                        <div className="p-8 flex flex-col items-center justify-center gap-3">
                            <Loader2 className="h-6 w-6 text-[#10b981] animate-spin" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Buscando Imóveis...</span>
                        </div>
                    ) : results.length > 0 ? (
                        <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                            <div className="p-3 border-b border-slate-50 bg-slate-50/50">
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Resultados Encontrados ({results.length})</span>
                            </div>
                            {results.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => handleSelect(item.id)}
                                    className="w-full flex items-center gap-4 p-4 hover:bg-emerald-50 transition-all border-b border-slate-50 last:border-0 group/item text-left"
                                >
                                    <div className="h-10 w-10 min-w-[40px] rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-300 group-hover/item:border-[#10b981] group-hover/item:text-[#10b981] transition-all shadow-sm">
                                        <Building2 className="h-4 w-4" />
                                    </div>
                                    <div className="flex flex-col flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="text-[10px] font-black text-[#10b981] uppercase tracking-widest">REF: {item.reference_id}</span>
                                            <div className="flex items-center gap-1 text-[9px] font-bold text-slate-300 whitespace-nowrap">
                                                <MapPin className="h-2.5 w-2.5" /> {item.neighborhood?.split(' ')[0]}
                                            </div>
                                        </div>
                                        <h4 className="text-sm font-bold text-[#1B263B] truncate group-hover/item:text-[#10b981] transition-colors">{item.title}</h4>
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="p-10 text-center">
                            <Search className="h-8 w-8 text-slate-100 mx-auto mb-4" />
                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Nenhum imóvel encontrado</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
