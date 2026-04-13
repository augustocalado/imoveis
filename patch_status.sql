-- Executar este script no Supabase SQL Editor para garantir que as propriedades suportem o status

ALTER TABLE properties ADD COLUMN IF NOT EXISTS status text DEFAULT 'disponivel';

UPDATE properties SET status = 'disponivel' WHERE status IS NULL;
