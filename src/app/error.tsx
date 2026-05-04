'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
      <div className="mb-8 p-6 bg-red-50 rounded-3xl border border-red-100 max-w-2xl">
        <h2 className="text-4xl font-black text-primary-900 uppercase tracking-tighter mb-4">
          Ocorreu um erro no servidor
        </h2>
        <p className="text-slate-500 font-bold mb-4 uppercase tracking-widest text-sm">
          Estamos trabalhando para resolver isso o mais rápido possível.
        </p>
        {error.digest && (
          <p className="text-[10px] font-mono text-slate-400 mb-6">
            ID do erro: {error.digest}
          </p>
        )}
      </div>
      
      <div className="flex flex-col md:flex-row gap-4">
        <button
          onClick={() => reset()}
          className="bg-accent text-white px-10 py-5 rounded-2xl font-black text-[12px] uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-accent/20"
        >
          Tentar Novamente
        </button>
        <Link 
          href="/"
          className="bg-[#1B263B] text-white px-10 py-5 rounded-2xl font-black text-[12px] uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-primary-900/20"
        >
          Voltar ao Início
        </Link>
      </div>
    </div>
  );
}
