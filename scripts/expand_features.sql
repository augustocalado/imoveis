-- Expand property_features with a comprehensive list of features for the Brazilian real estate market.
-- Category mapping: 'Localização', 'Área de Lazer', 'Diferenciais Internos', 'Infraestrutura', 'Segurança'.

INSERT INTO property_features (name, category) VALUES
-- Diferenciais Internos (Salas, Quartos, etc.)
('Sala de Estar Ampliada', 'Diferenciais Internos'),
('Sala de Jantar Conjugada', 'Diferenciais Internos'),
('Home Office / Escritório', 'Diferenciais Internos'),
('Home Theater', 'Diferenciais Internos'),
('Cozinha Americana', 'Diferenciais Internos'),
('Cozinha Planejada', 'Diferenciais Internos'),
('Despensa de Alimentos', 'Diferenciais Internos'),
('Área de Serviço / Lavanderia', 'Diferenciais Internos'),
('Suíte Master com Hidro', 'Diferenciais Internos'),
('Closet Espaçoso', 'Diferenciais Internos'),
('Ar-condicionado Split', 'Diferenciais Internos'),
('Aquecimento de Água Solar', 'Diferenciais Internos'),
('Piso de Madeira / Laminado', 'Diferenciais Internos'),
('Janelas com Blackout', 'Diferenciais Internos'),
('Varanda Integrada', 'Diferenciais Internos'),
('Sacada Envidraçada', 'Diferenciais Internos'),
('Pé-direito Duplo', 'Diferenciais Internos'),
('Iluminação em Gesso / LED', 'Diferenciais Internos'),
('Móveis Planejados', 'Diferenciais Internos'),
('Lareira', 'Diferenciais Internos'),

-- Área de Lazer (Quintal, Diversão, etc.)
('Quintal Privativo', 'Área de Lazer'),
('Espaço Gourmet / Churrasqueira', 'Área de Lazer'),
('Piscina com Deck', 'Área de Lazer'),
('Solarium', 'Área de Lazer'),
('Jardim Interno / Inverno', 'Área de Lazer'),
('Horta Comunitária / Privativa', 'Área de Lazer'),
('Salão de Jogos Equipado', 'Área de Lazer'),
('Espaço Kids / Playground', 'Área de Lazer'),
('Academia / Fitness Center', 'Área de Lazer'),
('Sauna Seca / Úmida', 'Área de Lazer'),
('Quadra de Tênis / Poliesportiva', 'Área de Lazer'),
('Espaço Pet / Pet Place', 'Área de Lazer'),
('Cinema Particular', 'Área de Lazer'),
('Bicicletário', 'Área de Lazer'),
('Coworking / Sala de Estudo', 'Área de Lazer'),

-- Infraestrutura e Comodidades
('Gás Encanado Individual', 'Infraestrutura'),
('Água Individualizada', 'Infraestrutura'),
('Elevador de Alta Velocidade', 'Infraestrutura'),
('Gerador de Energia (Áreas Comuns)', 'Infraestrutura'),
('Vaga de Garagem Coberta', 'Infraestrutura'),
('Vaga com Carregamento Elétrico', 'Infraestrutura'),
('Box / Depósito no Subsolo', 'Infraestrutura'),
('Portaria Remota / Presencial 24h', 'Infraestrutura'),
('Zeladoria Especializada', 'Infraestrutura'),
('Acessibilidade Completa PNE', 'Infraestrutura'),

-- Segurança
('Circuito Interno de TV (CCTV)', 'Segurança'),
('Cerca Elétrica de Alta Voltagem', 'Segurança'),
('Sensores de Movimento', 'Segurança'),
('Alarme Monitorado 24h', 'Segurança'),
('Portão Eletrônico Rápido', 'Segurança'),
('Interfone com Câmera', 'Segurança'),
('Ronda Interna', 'Segurança')
ON CONFLICT ON CONSTRAINT property_features_name_key DO NOTHING;
