-- Adicionar coluna area_total à tabela properties
ALTER TABLE properties ADD COLUMN IF NOT EXISTS area_total NUMERIC;

-- Comentário para documentação
COMMENT ON COLUMN properties.area_total IS 'Área total do imóvel em metros quadrados';
