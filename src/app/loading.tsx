import { Loader2 } from 'lucide-react';

export default function Loading() {
    return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-10 w-10 text-accent animate-spin" />
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Carregando...</p>
            </div>
        </div>
    );
}
