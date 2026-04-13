-- Script MESTRE para expansão da tabela properties
-- Execute este script no SQL Editor do Supabase

ALTER TABLE public.properties 
-- Endereço Detalhado
ADD COLUMN IF NOT EXISTS cep text,
ADD COLUMN IF NOT EXISTS complement text,
ADD COLUMN IF NOT EXISTS state text DEFAULT 'SP',
ADD COLUMN IF NOT EXISTS condo_name text,
ADD COLUMN IF NOT EXISTS block text,
ADD COLUMN IF NOT EXISTS unit text,

-- Detalhes da Construção
ADD COLUMN IF NOT EXISTS year_built integer,
ADD COLUMN IF NOT EXISTS region text,
ADD COLUMN IF NOT EXISTS floor text,

-- Subtipos e Categorias
ADD COLUMN IF NOT EXISTS subtype text,

-- Condições de Pagamento (Valores)
ADD COLUMN IF NOT EXISTS down_payment numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS monthly_payment numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS keys_payment numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS quarterly_payment numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS semi_annual_payment numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS annual_payment numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS financing_balance numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS adjustment_index text,

-- Modalidades de Financiamento
ADD COLUMN IF NOT EXISTS accepts_mcmv boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS accepts_direct_financing boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS is_launch boolean DEFAULT false,

-- Taxas e Opções Gerais
ADD COLUMN IF NOT EXISTS condo_fee numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS iptu numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS accepts_financing boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS accepts_exchange boolean DEFAULT false,

-- Dados Internos / CRM
ADD COLUMN IF NOT EXISTS keys_location text,
ADD COLUMN IF NOT EXISTS capturer text,
ADD COLUMN IF NOT EXISTS marketing_source text, -- placa, site, redes sociais
ADD COLUMN IF NOT EXISTS observations text;

-- Comentários para documentação
COMMENT ON COLUMN public.properties.cep IS 'CEP do imóvel';
COMMENT ON COLUMN public.properties.condo_name IS 'Nome do edifício ou condomínio';
COMMENT ON COLUMN public.properties.block IS 'Bloco do edifício';
COMMENT ON COLUMN public.properties.unit IS 'Número do apartamento ou unidade';
COMMENT ON COLUMN public.properties.year_built IS 'Ano de construção';
COMMENT ON COLUMN public.properties.marketing_source IS 'Origem da captação (Placa, Site, Redes Sociais)';
COMMENT ON COLUMN public.properties.keys_location IS 'Onde se encontram as chaves';
COMMENT ON COLUMN public.properties.is_launch IS 'Identifica se o imóvel é um lançamento';
