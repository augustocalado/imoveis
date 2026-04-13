-- Script para permitir leads da Home e Anônimos no CRM
-- Execute este script no SQL Editor do seu projeto Supabase

-- 1. Tornar colunas de referência nuláveis (permite leads gerais sem imóvel específico ou usuário deslogado)
ALTER TABLE public.leads ALTER COLUMN property_id DROP NOT NULL;
ALTER TABLE public.leads ALTER COLUMN cliente_id DROP NOT NULL;

-- 2. Garantir que as colunas de contato de texto existam para os novos formulários
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leads' AND column_name='name') THEN
        ALTER TABLE public.leads ADD COLUMN name text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leads' AND column_name='customer_whatsapp') THEN
        ALTER TABLE public.leads ADD COLUMN customer_whatsapp text;
    END IF;
END $$;

-- 3. Atualizar políticas de RLS (opcional, para garantir que o Admin veja tudo)
-- Se você tiver problemas de visualização, verifique as políticas de SELECT na tabela leads.
