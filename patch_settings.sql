-- Script para criar a tabela site_settings e popular os dados iniciais do site
-- Execute este script no SQL Editor do seu Supabase

-- 1. Criar a tabela se não existir
CREATE TABLE IF NOT EXISTS public.site_settings (
    key text PRIMARY KEY,
    value jsonb NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Inserir chaves necessárias para o Header, Footer e Home
INSERT INTO public.site_settings (key, value) VALUES 
('site_logo', '"/logo.png"'),
('home_hero', '{
    "title": "Kátia e Flávio Imóveis: Imóveis em Praia Grande SP",
    "subtitle": "Confira as melhores opções de apartamentos à venda e lançamentos imobiliários nos bairros mais valorizados de Praia Grande.",
    "image_url": "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1920"
}')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- 3. Habilitar RLS e Permissão de Leitura Pública
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Política para leitura anônima (Público)
DROP POLICY IF EXISTS "Permitir leitura anonima" ON public.site_settings;
CREATE POLICY "Permitir leitura anonima" ON public.site_settings
FOR SELECT USING (true);

-- 4. Permitir edição apenas para administradores
DROP POLICY IF EXISTS "Permitir edição para admins" ON public.site_settings;
CREATE POLICY "Permitir edição para admins" ON public.site_settings
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);
