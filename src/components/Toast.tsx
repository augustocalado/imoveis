'use client';

import React, { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';
import clsx from 'clsx';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
    message: string;
    type: ToastType;
    duration?: number;
    onClose: () => void;
}

export default function Toast({ message, type, duration = 5000, onClose }: ToastProps) {
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            handleClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration]);

    const handleClose = () => {
        setIsExiting(true);
        setTimeout(onClose, 400); // Aguarda a animação de saída de 400ms
    };

    const icons = {
        success: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
        error: <XCircle className="h-5 w-5 text-red-500" />,
        info: <Info className="h-5 w-5 text-indigo-500" />
    };

    const styles = {
        success: "bg-emerald-50 border-emerald-100 text-emerald-900 shadow-emerald-500/10",
        error: "bg-red-50 border-red-100 text-red-900 shadow-red-500/10",
        info: "bg-indigo-50 border-indigo-100 text-indigo-900 shadow-indigo-500/10"
    };

    return (
        <div className={clsx(
            "fixed top-8 right-8 z-[9000] flex items-center gap-4 p-5 rounded-[24px] border border-white/20 backdrop-blur-xl shadow-2xl transition-all duration-400 ease-[cubic-bezier(0.23,1,0.32,1)]",
            styles[type],
            isExiting ? "translate-x-20 opacity-0 scale-95" : "translate-x-0 opacity-100 scale-100 animate-in fade-in slide-in-from-right-8"
        )}>
            <div className="h-10 w-10 min-w-[40px] rounded-xl bg-white/60 flex items-center justify-center shadow-sm">
                {icons[type]}
            </div>
            
            <div className="flex flex-col pr-8">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-0.5">
                    {type === 'success' ? 'Sucesso' : type === 'error' ? 'Erro' : 'Notificação'}
                </span>
                <p className="text-sm font-bold leading-tight">{message}</p>
            </div>

            <button 
                onClick={handleClose}
                className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-black/5 transition-colors text-black/20 hover:text-black/60"
            >
                <X className="h-4 w-4" />
            </button>

            {/* Barra de progresso visual */}
            <div className="absolute bottom-0 left-0 h-1 bg-current opacity-10 w-full overflow-hidden rounded-b-[24px]">
                <div 
                    className="h-full bg-current opacity-30 animate-progress" 
                    style={{ animationDuration: `${duration}ms` }}
                />
            </div>

            <style jsx>{`
                @keyframes progress {
                    from { width: 100%; }
                    to { width: 0%; }
                }
                .animate-progress {
                    animation-name: progress;
                    animation-timing-function: linear;
                    animation-fill-mode: forwards;
                }
            `}</style>
        </div>
    );
}
