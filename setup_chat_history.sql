CREATE TABLE IF NOT EXISTS public.chat_history (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    phone_number text NOT NULL,
    message text NOT NULL,
    role text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.chat_history ENABLE ROW LEVEL SECURITY;

-- Política para permitir que o "service role" / admin (ou anon se configurado assim) faça insert/select
CREATE POLICY "Permitir full access anônimo"
    ON public.chat_history
    FOR ALL
    USING (true)
    WITH CHECK (true);
