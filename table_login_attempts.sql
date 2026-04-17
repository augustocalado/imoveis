-- Tabela para rastrear tentativas de login falhas
-- Execute este script no Painel SQL do seu Supabase

CREATE TABLE IF NOT EXISTS public.login_attempts (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    email text NOT NULL,
    ip_address text,
    attempts_count integer DEFAULT 1,
    last_attempt_at timestamp with time zone DEFAULT now(),
    locked_until timestamp with time zone,
    created_at timestamp with time zone DEFAULT now()
);

-- Indexar por email e IP para buscas rápidas
CREATE INDEX IF NOT EXISTS idx_login_attempts_email ON public.login_attempts(email);
CREATE INDEX IF NOT EXISTS idx_login_attempts_ip ON public.login_attempts(ip_address);

-- Habilitar RLS
ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;

-- Política de segurança: Ninguém pode ler ou escrever nesta tabela pela API pública
-- Apenas o "service_role" ou funções do sistema terão acesso
DROP POLICY IF EXISTS "No public access" ON public.login_attempts;
CREATE POLICY "No public access" ON public.login_attempts
FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

-- 1. Função para verificar se o usuário está bloqueado
CREATE OR REPLACE FUNCTION public.check_login_lockout(p_email text, p_ip text)
RETURNS TABLE (is_locked boolean, seconds_remaining integer) AS $$
DECLARE
    v_locked_until timestamp with time zone;
BEGIN
    SELECT locked_until INTO v_locked_until
    FROM public.login_attempts
    WHERE email = p_email OR ip_address = p_ip
    ORDER BY locked_until DESC NULLS LAST
    LIMIT 1;

    IF v_locked_until IS NOT NULL AND v_locked_until > now() THEN
        RETURN QUERY SELECT true, EXTRACT(EPOCH FROM (v_locked_until - now()))::integer;
    ELSE
        RETURN QUERY SELECT false, 0;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Função para registrar falha e incrementar contador
CREATE OR REPLACE FUNCTION public.record_login_failure(p_email text, p_ip text)
RETURNS void AS $$
DECLARE
    v_attempts integer;
BEGIN
    INSERT INTO public.login_attempts (email, ip_address, attempts_count, last_attempt_at)
    VALUES (p_email, p_ip, 1, now())
    ON CONFLICT (id) DO NOTHING; -- Apenas para estrutura, usaremos update abaixo

    -- Tentar encontrar registro existente por email ou IP
    IF EXISTS (SELECT 1 FROM public.login_attempts WHERE email = p_email OR ip_address = p_ip) THEN
        UPDATE public.login_attempts
        SET attempts_count = attempts_count + 1,
            last_attempt_at = now(),
            locked_until = CASE WHEN attempts_count + 1 >= 3 THEN now() + interval '15 minutes' ELSE NULL END
        WHERE email = p_email OR ip_address = p_ip;
    ELSE
        INSERT INTO public.login_attempts (email, ip_address, attempts_count, last_attempt_at)
        VALUES (p_email, p_ip, 1, now());
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Função para resetar tentativas após sucesso
CREATE OR REPLACE FUNCTION public.reset_login_attempts(p_email text, p_ip text)
RETURNS void AS $$
BEGIN
    DELETE FROM public.login_attempts
    WHERE email = p_email OR ip_address = p_ip;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para limpar tentativas antigas (opcional, para manutenção)
CREATE OR REPLACE FUNCTION public.clear_old_login_attempts()
RETURNS void AS $$
BEGIN
    DELETE FROM public.login_attempts 
    WHERE last_attempt_at < now() - interval '24 hours'
    AND locked_until IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
