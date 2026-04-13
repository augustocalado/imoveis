-- SQL para atualizar as cidades e bairros da Baixada Santista no site
-- Execute este comando no SQL Editor do seu Supabase

INSERT INTO site_settings (key, value)
VALUES ('site_locations', '[
    {
        "name": "Praia Grande",
        "slug": "praia-grande",
        "neighborhoods": [
            "Canto do Forte", "Boqueirão", "Guilhermina", "Aviação", "Tupi", 
            "Ocian", "Mirim", "Maracanã", "Caiçara", "Real", "Flórida", "Solemar",
            "Antártica", "Vila Sônia", "Tupiry", "Anhanguera"
        ]
    },
    {
        "name": "Santos",
        "slug": "santos",
        "neighborhoods": [
            "Gonzaga", "Ponta da Praia", "Boqueirão", "Embaré", "Aparecida", 
            "José Menino", "Pompeia", "Campo Grande", "Encruzilhada", "Macuco", "Estuário"
        ]
    },
    {
        "name": "São Vicente",
        "slug": "sao-vicente",
        "neighborhoods": [
            "Itararé", "Bitaru", "Centro", "Boa Vista", "Parque Prainha", 
            "Cidade Ocian", "Vila Valença", "Vila Margarida"
        ]
    },
    {
        "name": "Guarujá",
        "slug": "guaruja",
        "neighborhoods": [
            "Enseada", "Pitangueiras", "Astúrias", "Tombo", "Guaiúba", 
            "Perequê", "Tortuga", "Vila Alice", "Vila Edna"
        ]
    },
    {
        "name": "Bertioga",
        "slug": "bertioga",
        "neighborhoods": [
            "Riviera de São Lourenço", "Centro", "Indaiá", "Maitinga", 
            "Boracéia", "Guaratuba", "Vista Linda"
        ]
    },
    {
        "name": "Mongaguá",
        "slug": "mongagua",
        "neighborhoods": [
            "Centro", "Agenor de Campos", "Itaóca", "Vila Atlântica", 
            "Jardim Praia Grande", "Flórida Mirim"
        ]
    },
    {
        "name": "Itanhaém",
        "slug": "itanhaem",
        "neighborhoods": [
            "Cibratel I", "Cibratel II", "Belas Artes", "Gaivota", 
            "Centro", "Bopiranga", "Praia do Sonho", "Suarão"
        ]
    },
    {
        "name": "Peruíbe",
        "slug": "peruibe",
        "neighborhoods": [
            "Centro", "Stella Maris", "Oasis", "Arpoador", 
            "Guaraú", "Estância dos Nobres"
        ]
    },
    {
        "name": "Cubatão",
        "slug": "cubatao",
        "neighborhoods": [
            "Centro", "Vila Nova", "Jardim Casqueiro", "Parque São Luiz", "Vila dos Pescadores"
        ]
    }
]'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
