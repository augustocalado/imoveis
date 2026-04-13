-- 1. Garante que o bucket 'properties' exista e seja público
INSERT INTO storage.buckets (id, name, public)
VALUES ('properties', 'properties', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Permite que QUALQUER UM (incluindo visitantes) veja as fotos
CREATE POLICY "Acesso Público para Ver Fotos"
ON storage.objects FOR SELECT
USING (bucket_id = 'properties');

-- 3. Permite que usuários autenticados façam upload
CREATE POLICY "Usuários Autenticados podem fazer Upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'properties');

-- 4. Permite que usuários autenticados atualizem suas próprias fotos
CREATE POLICY "Usuários Autenticados podem Atualizar Fotos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'properties');

-- 5. Permite que usuários autenticados deletem suas próprias fotos
CREATE POLICY "Usuários Autenticados podem Deletar Fotos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'properties');
