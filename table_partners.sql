-- Script para criar a tabela de parceiros
-- Execute este script no SQL Editor do Supabase

CREATE TABLE IF NOT EXISTS public.partners (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    logo_url text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;

-- Política para leitura pública (Home)
CREATE POLICY "Permitir leitura pública de parceiros" 
ON public.partners FOR SELECT 
USING (true);

-- Política para inserção/deleção apenas por admins
CREATE POLICY "Admins podem gerenciar parceiros" 
ON public.partners FOR ALL 
USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));
