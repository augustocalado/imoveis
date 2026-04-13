-- Adicionar colunas de auditoria na tabela properties
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS last_edited_by uuid REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS last_edited_at timestamp with time zone;

COMMENT ON COLUMN public.properties.last_edited_by IS 'Auditoria: Qual corretor/admin foi o ultimo a modificar o registro';
COMMENT ON COLUMN public.properties.last_edited_at IS 'Auditoria: Qual a data e hora em que a ultima modificacao ocorreu';

-- Criar função que será ativada pelo trigger
CREATE OR REPLACE FUNCTION set_last_edited()
RETURNS TRIGGER AS $$
BEGIN
    -- Nós definimos NEW.last_edited_by para o usuário logado (auth.uid())
    -- E o NEW.last_edited_at para NOW()
    -- Isso garante que as colunas sejam atualizadas automaticamente em cada UPDATE
    NEW.last_edited_by = auth.uid();
    NEW.last_edited_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar o trigger na tabela properties
DROP TRIGGER IF EXISTS properties_last_edited_trigger ON public.properties;
CREATE TRIGGER properties_last_edited_trigger
BEFORE UPDATE ON public.properties
FOR EACH ROW
EXECUTE FUNCTION set_last_edited();
