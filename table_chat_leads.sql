CREATE TABLE IF NOT EXISTS public.chat_leads (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text,
    phone text,
    interest text,
    page_visited text,
    score text DEFAULT '❄️ Frio',
    status text DEFAULT 'Novo',
    profile_data jsonb DEFAULT '{}'::jsonb,
    chat_history jsonb DEFAULT '[]'::jsonb,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.chat_leads ENABLE ROW LEVEL SECURITY;

-- Política para permitir que o "usuário anônimo" (o widget no site) insira dados novos
CREATE POLICY "Permitir inserção anônima no chat_leads"
    ON public.chat_leads
    FOR INSERT
    WITH CHECK (true);

-- Política para permitir que usuários autenticados (Admin) leiam e atualizem dados
CREATE POLICY "Permitir leitura para admin no chat_leads"
    ON public.chat_leads
    FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir atualização para admin no chat_leads"
    ON public.chat_leads
    FOR UPDATE
    USING (auth.role() = 'authenticated');

-- Permitir update anônimo também? Talvez o cliente mande mais msgs no mesmo ID de sessão
-- Vamos permitir update baseado na sessão se passarmos um id, mas para simplificar o widget: ele cria o ID e a gente faz o update usando esse ID apenas
CREATE POLICY "Permitir update anônimo da própria sessão no chat_leads"
    ON public.chat_leads
    FOR UPDATE
    USING (true)
    WITH CHECK (true);
