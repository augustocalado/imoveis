'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Bell, X, Info, Zap } from 'lucide-react';

export default function NotificationBell() {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [hasNew, setHasNew] = useState(false);

    useEffect(() => {
        // Initial fetch
        const fetchNotifications = async () => {
            const { data } = await supabase
                .from('notifications')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(5);

            setNotifications(data || []);
        };

        fetchNotifications();

        // Subscribe to new notifications (Real-time)
        const channel = supabase
            .channel('public:notifications')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, (payload) => {
                setNotifications(prev => [payload.new, ...prev].slice(0, 5));
                setHasNew(true);
                // Play subtle sound or toast if needed (visual alert)
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    return (
        <div className="relative">
            <button
                onClick={() => { setIsOpen(!isOpen); setHasNew(false); }}
                className="relative p-3 bg-gray-50 rounded-2xl hover:bg-primary-50 hover:text-primary-600 transition-all active:scale-90 group"
            >
                <Bell className={`h-5 w-5 ${hasNew ? 'animate-bounce text-primary-600' : 'text-gray-400'}`} />
                {hasNew && (
                    <span className="absolute top-2 right-2 w-3 h-3 bg-primary-600 rounded-full border-2 border-white animate-pulse" />
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-4 w-96 glass rounded-[40px] shadow-2xl border-white/40 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300 z-[100]">
                    <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-white/50">
                        <div>
                            <h4 className="text-xl font-black text-gray-900 tracking-tighter">Notificações</h4>
                            <p className="text-[12px] font-black text-primary-600 uppercase tracking-widest mt-0.5">Alertas do Sistema</p>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-gray-100 rounded-2xl transition-colors">
                            <X className="h-4 w-4 text-gray-400" />
                        </button>
                    </div>

                    <div className="max-h-[400px] overflow-y-auto p-4 space-y-3 bg-slate-50/50">
                        {notifications.length === 0 ? (
                            <div className="py-20 text-center space-y-4">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-200">
                                    <Bell className="h-8 w-8" />
                                </div>
                                <p className="text-gray-400 font-bold text-sm uppercase tracking-widest">Nenhuma atividade recente</p>
                            </div>
                        ) : (
                            notifications.map((notif) => (
                                <div key={notif.id} className="p-6 bg-white rounded-[30px] border border-gray-50 shadow-sm hover:shadow-xl transition-all duration-300 group cursor-pointer active:scale-95 border-b-2 border-b-primary-100/30">
                                    <div className="flex gap-4">
                                        <div className="w-10 h-10 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-600 flex-shrink-0 group-hover:bg-primary-600 group-hover:text-white transition-colors duration-500 shadow-sm shadow-primary-500/10">
                                            <Zap className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900 leading-tight mb-2 group-hover:text-primary-600 transition-colors">{notif.message}</p>
                                            <div className="flex items-center gap-2">
                                                <Info className="h-3 w-3 text-gray-300" />
                                                <span className="text-[12px] font-black text-gray-300 uppercase tracking-widest">
                                                    {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {notifications.length > 0 && (
                        <div className="p-6 text-center border-t border-gray-100 bg-white/50">
                            <button className="text-[12px] font-black text-gray-400 uppercase tracking-widest hover:text-primary-600 transition-colors">Limpar todas as notificações</button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
