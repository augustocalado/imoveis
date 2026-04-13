-- Script para criar a tabela de documentos vinculada a imóveis
-- Execute este script no SQL Editor do Supabase

CREATE TABLE IF NOT EXISTS public.documents (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    property_id uuid REFERENCES public.properties(id) ON DELETE CASCADE,
    file_name text NOT NULL,
    file_type text,
    file_url text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Política para leitura (Admins e corretores)
CREATE POLICY "Permitir leitura de documentos para usuários autenticados" 
ON public.documents FOR SELECT 
TO authenticated
USING (true);

-- Política para inserção/deleção
CREATE POLICY "Usuários autenticados podem gerenciar documentos" 
ON public.documents FOR ALL 
TO authenticated
USING (true)
WITH CHECK (true);
