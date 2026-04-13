-- Tabela para gestão dinâmica de características dos imóveis
CREATE TABLE IF NOT EXISTS property_features (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    category TEXT NOT NULL, -- Ex: 'Localização', 'Área de Lazer', 'Diferenciais Internos'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE property_features ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso
-- Todos podem ler
CREATE POLICY "Public read property_features" ON property_features FOR SELECT USING (true);
-- Apenas corretores e admins podem gerenciar
CREATE POLICY "Manage property_features" ON property_features FOR ALL 
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND (role = 'corretor' OR role = 'admin')));

-- Dados Iniciais (Migração do que era fixo no código)
INSERT INTO property_features (name, category) VALUES
-- Localização
('Próximo a metrô / transporte público', 'Localização'),
('Perto de shopping', 'Localização'),
('Próximo a hospitais', 'Localização'),
('Escolas e faculdades', 'Localização'),
('Supermercados', 'Localização'),
('Bairro tranquilo / valorizado', 'Localização'),
('Fácil acesso a avenidas principais', 'Localização'),
('Próximo à Orla da Praia', 'Localização'),

-- Área de Lazer
('Piscina Adulto', 'Área de Lazer'),
('Piscina Infantil', 'Área de Lazer'),
('Piscina Aquecida', 'Área de Lazer'),
('Academia', 'Área de Lazer'),
('Salão de festas', 'Área de Lazer'),
('Churrasqueira', 'Área de Lazer'),
('Espaço gourmet', 'Área de Lazer'),
('Brinquedoteca', 'Área de Lazer'),
('Playground', 'Área de Lazer'),
('Quadra esportiva', 'Área de Lazer'),
('Sauna', 'Área de Lazer'),
('Spa / hidromassagem', 'Área de Lazer'),
('Sala de jogos Adulto', 'Área de Lazer'),
('Sala de jogos Juvenil', 'Área de Lazer'),
('Cinema', 'Área de Lazer'),
('Espaço Pet', 'Área de Lazer'),
('Pet Care', 'Área de Lazer'),
('Coworking', 'Área de Lazer'),
('Surf Lounge', 'Área de Lazer'),
('Bicicletário', 'Área de Lazer'),
('Redário', 'Área de Lazer'),
('Pista de Cooper', 'Área de Lazer'),
('Espaço Teen', 'Área de Lazer'),
('Espaço Zen', 'Área de Lazer'),
('Beauty Care', 'Área de Lazer'),
('Market (Mercadinho)', 'Área de Lazer'),

-- Diferenciais Internos
('Suíte (principal ou múltiplas)', 'Diferenciais Internos'),
('Closet', 'Diferenciais Internos'),
('Ar-condicionado instalado', 'Diferenciais Internos'),
('Aquecimento a gás', 'Diferenciais Internos'),
('Piso porcelanato / vinílico', 'Diferenciais Internos'),
('Iluminação planejada (LED, spots, trilho)', 'Diferenciais Internos'),
('Automação residencial (Alexa, Google Home etc.)', 'Diferenciais Internos'),
('Fechadura digital', 'Diferenciais Internos'),
('Janelas antirruído', 'Diferenciais Internos'),
('Pé-direito alto', 'Diferenciais Internos'),
('Vista livre / panorâmica', 'Diferenciais Internos'),
('Varanda gourmet com churrasqueira', 'Diferenciais Internos'),
('Infra para Ar-Condicionado', 'Diferenciais Internos'),
('Tomadas USB', 'Diferenciais Internos'),
('Varanda Técnica', 'Diferenciais Internos'),
('Persiana Integrada', 'Diferenciais Internos'),
('Depósito Privativo', 'Diferenciais Internos'),
('Vagas para Visitantes', 'Diferenciais Internos'),
('Elevador Inteligente', 'Diferenciais Internos'),
('Gerador de Energia', 'Diferenciais Internos'),
('Acessibilidade PNE', 'Diferenciais Internos')
ON CONFLICT (name) DO NOTHING;
