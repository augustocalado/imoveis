"use client";

import { MessageCircle } from 'lucide-react';

const WHATSAPP_NUMBER = '5513997826694';

export default function FloatingWhatsApp() {
    const handleClick = () => {
        window.open(`https://wa.me/${WHATSAPP_NUMBER}`, '_blank');
    };

    return (
        <div className="fixed bottom-6 right-6 z-[200] flex flex-col items-end">
            <button
                onClick={handleClick}
                className="h-16 w-16 rounded-full shadow-[0_15px_30px_-5px_rgba(37,211,102,0.5)] bg-[#25D366] text-white flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300 relative group z-50 overflow-hidden"
            >
                <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative flex items-center justify-center">
                    <MessageCircle className="h-8 w-8 fill-current" />
                </div>
                <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full border-2 border-white shadow-lg">
                    24h
                </div>
            </button>
        </div>
    );
}
