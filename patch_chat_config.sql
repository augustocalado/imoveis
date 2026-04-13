-- Insere as configurações iniciais da Inteligência Artificial no banco de dados.
-- O painel administrativo permitirá alterar isso visualmente no futuro sem precisar desse SQL.
-- Execute no SQL Editor do Supabase.

INSERT INTO public.site_settings (key, value) VALUES (
    'chat_config',
    '{
        "startOpen": false,
        "autoOpenDelay": 8,
        "botName": "Marcela (IA)",
        "initialMessage": "Fala! 👋 Tá procurando imóvel pra comprar ou investir?",
        "q1_label": "🔑 Quero comprar",
        "q2_label": "💰 Quero vender",
        "q3_label": "📊 Simular financiamento",
        "q4_label": "📞 Falar com corretor",
        "followUp1Delay": 30,
        "followUp2Delay": 120
    }'::jsonb
)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
