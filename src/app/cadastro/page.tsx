'use client';

import { useState } from 'react';
import { supabase, STORAGE_BUCKET } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { UserPlus, User, Mail, Lock, Loader2, House, Briefcase, UserCircle, ShieldCheck, Camera, ImageIcon } from 'lucide-react';
import Link from 'next/link';

export default function RegisterPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [role, setRole] = useState('cliente');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const [photo, setPhoto] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            if (role === 'corretor' && !photo) {
                throw new Error('A foto de perfil é obrigatória para corretores.');
            }

            const { data, error: signUpError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                        role: role,
                    },
                    emailRedirectTo: `${window.location.origin}/confirmacao-email`,
                },
            });

            if (signUpError) throw signUpError;
            if (!data.user) throw new Error('Falha na criação do usuário.');

            if (photo) {
                const fileExt = photo.name.split('.').pop();
                const filePath = `avatars/${data.user.id}-${Math.random().toString(36).substring(7)}.${fileExt}`;

                const { error: uploadError } = await supabase.storage
                    .from(STORAGE_BUCKET)
                    .upload(filePath, photo);

                if (!uploadError) {
                    const { data: publicData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(filePath);
                    const avatarUrl = publicData.publicUrl;

                    await supabase.auth.updateUser({
                        data: { avatar_url: avatarUrl }
                    });

                    // Update profile row
                    await supabase.from('profiles').update({ avatar_url: avatarUrl }).eq('id', data.user.id);
                }
            }

            router.push('/cadastro/sucesso');
        } catch (err: any) {
            setError(err.message);
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-bl from-blue-100 to-transparent opacity-40 -z-10" />
            <div className="absolute top-20 right-20 w-80 h-80 bg-primary-100 blur-3xl rounded-full opacity-30 animate-pulse pointer-events-none" />

            <div className="max-w-lg w-full mx-auto px-4 z-10 transition-all duration-700 animate-in fade-in slide-in-from-bottom-8">
                <Link href="/" className="flex items-center space-x-2 mb-10 justify-center group ">
                    <div className="bg-accent p-2.5 rounded-2xl group-hover:rotate-6 transition-all shadow-xl shadow-accent/20">
                        <House className="h-8 w-8 text-white" />
                    </div>
                    <div className="flex flex-col -space-y-1">
                        <span className="text-3xl font-black text-primary-900 tracking-tighter uppercase">KF</span>
                        <span className="text-[12px] font-black text-accent uppercase tracking-[0.2em]">Imóveis</span>
                    </div>
                </Link>

                <div className="glass p-10 rounded-3xl shadow-2xl border-white/40">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Criar sua conta</h2>
                        <p className="text-gray-500">Escolha seu perfil e junte-se à nossa plataforma.</p>
                    </div>

                    <form onSubmit={handleRegister} className="space-y-5">
                        {error && (
                            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100 flex items-center animate-shake">
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-3 gap-4 mb-6 ">
                            <button
                                type="button"
                                onClick={() => setRole('cliente')}
                                className={`p-4 rounded-2xl flex flex-col items-center gap-2 transition-all border-2 ${role === 'cliente' ? 'bg-primary-50 border-primary-500 shadow-md' : 'bg-gray-50/50 border-transparent hover:border-gray-200'}`}
                            >
                                <UserCircle className={`h-6 w-6 ${role === 'cliente' ? 'text-primary-600' : 'text-gray-400'}`} />
                                <span className={`text-[12px] font-bold ${role === 'cliente' ? 'text-primary-700' : 'text-gray-500'} uppercase tracking-widest`}>Sou Cliente</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setRole('corretor')}
                                className={`p-4 rounded-2xl flex flex-col items-center gap-2 transition-all border-2 ${role === 'corretor' ? 'bg-primary-50 border-primary-500 shadow-md' : 'bg-gray-50/50 border-transparent hover:border-gray-200'}`}
                            >
                                <Briefcase className={`h-6 w-6 ${role === 'corretor' ? 'text-primary-600' : 'text-gray-400'}`} />
                                <span className={`text-[12px] font-bold ${role === 'corretor' ? 'text-primary-700' : 'text-gray-500'} uppercase tracking-widest`}>Sou Corretor</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setRole('admin')}
                                className={`p-4 rounded-2xl flex flex-col items-center gap-2 transition-all border-2 ${role === 'admin' ? 'bg-primary-50 border-primary-500 shadow-md' : 'bg-gray-50/50 border-transparent hover:border-gray-200'}`}
                            >
                                <ShieldCheck className={`h-6 w-6 ${role === 'admin' ? 'text-primary-600' : 'text-gray-400'}`} />
                                <span className={`text-[12px] font-bold ${role === 'admin' ? 'text-primary-700' : 'text-gray-500'} uppercase tracking-widest`}>Admin Master</span>
                            </button>
                        </div>

                        {role === 'corretor' && (
                            <div className="flex flex-col items-center mb-8 bg-primary-50/50 p-6 rounded-[32px] border border-primary-100 animate-in fade-in slide-in-from-top-4 duration-500">
                                <label className="text-[11px] font-black text-primary-900 uppercase tracking-[0.2em] mb-4">Sua Foto Profissional</label>
                                <div className="relative group shadow-2xl rounded-[35px]">
                                    <div className="h-28 w-28 rounded-[35px] bg-white border-2 border-dashed border-primary-200 flex items-center justify-center overflow-hidden shadow-inner group-hover:border-primary-400 transition-all">
                                        {previewUrl ? (
                                            <img src={previewUrl} className="h-full w-full object-cover transition-transform group-hover:scale-110" alt="Preview" />
                                        ) : (
                                            <Camera className="h-8 w-8 text-primary-200 group-hover:text-primary-400 transition-colors" />
                                        )}
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                            if (e.target.files?.[0]) {
                                                const file = e.target.files[0];
                                                setPhoto(file);
                                                setPreviewUrl(URL.createObjectURL(file));
                                            }
                                        }}
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        required
                                    />
                                    <div className="absolute -bottom-2 -right-2 bg-accent text-white p-2.5 rounded-2xl shadow-xl group-hover:scale-110 transition-transform">
                                        <ImageIcon className="h-4 w-4" />
                                    </div>
                                </div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-6 italic">Foto obrigatória para corretores</p>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 ml-1">Nome Completo</label>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="Seu nome"
                                    className="w-full bg-gray-50/50 border border-gray-200 p-4 pl-12 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 ml-1">E-mail</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="exemplo@email.com"
                                    className="w-full bg-gray-50/50 border border-gray-200 p-4 pl-12 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 ml-1">Senha</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-gray-50/50 border border-gray-200 p-4 pl-12 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-primary-600 text-white p-4 rounded-2xl font-bold flex items-center justify-center space-x-2 hover:bg-primary-700 transition-all shadow-lg hover:shadow-primary-600/30 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group"
                        >
                            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                                <>
                                    <UserPlus className="h-5 w-5 transition-transform group-hover:scale-110" />
                                    <span>Cadastrar Agora</span>
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center text-gray-500 text-sm">
                        Já tem uma conta?{' '}
                        <Link href="/login" className="text-primary-600 font-bold hover:underline transition-all">
                            Fazer login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
