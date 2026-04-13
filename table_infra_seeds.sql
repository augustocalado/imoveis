-- Inserindo itens da categoria 'Infraestrutura' na tabela property_features
INSERT INTO property_features (name, category) VALUES
('Rede Elétrica', 'Infraestrutura'),
('Iluminação Pública', 'Infraestrutura'),
('Saneamento Básico', 'Infraestrutura'),
('Pavimentação (Asfalto)', 'Infraestrutura'),
('Internet Fibra Óptica', 'Infraestrutura'),
('Monitoramento por Câmeras', 'Infraestrutura'),
('Portaria 24h', 'Infraestrutura'),
('Cerca Elétrica', 'Infraestrutura'),
('Interfone', 'Infraestrutura'),
('Elevador Social', 'Infraestrutura'),
('Elevador de Serviço', 'Infraestrutura'),
('Acessibilidade PNE', 'Infraestrutura'),
('Gerador de Emergência', 'Infraestrutura'),
('Gás Encanado', 'Infraestrutura'),
('Zeladoria', 'Infraestrutura')
ON CONFLICT (name) DO NOTHING;
