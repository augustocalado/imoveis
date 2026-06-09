-- Corrige exclusão e arquivamento de leads
-- Execute no SQL Editor do Supabase

-- 1. Adiciona 'arquivado' ao CHECK constraint da tabela leads
ALTER TABLE public.leads DROP CONSTRAINT IF EXISTS leads_status_check;
ALTER TABLE public.leads ADD CONSTRAINT leads_status_check 
  CHECK (status IN ('novo', 'em_atendimento', 'concluido', 'arquivado'));

-- 2. Política de DELETE para leads (admin e corretor dono do imóvel)
CREATE POLICY "Permitir delete para admin ou corretor dono do imóvel"
  ON public.leads FOR DELETE
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    OR
    auth.uid() IN (SELECT corretor_id FROM public.properties WHERE id = property_id)
  );

-- 3. Política de UPDATE para leads (admin e corretor dono do imóvel)
CREATE POLICY "Permitir update para admin ou corretor dono do imóvel"
  ON public.leads FOR UPDATE
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    OR
    auth.uid() IN (SELECT corretor_id FROM public.properties WHERE id = property_id)
  );

-- 4. Política de DELETE para chat_leads (usuários autenticados)
CREATE POLICY "Permitir delete para admin no chat_leads"
  ON public.chat_leads FOR DELETE
  USING (auth.role() = 'authenticated');
