# ImobApp - CRM Imobiliário Premium

Este é um sistema completo de gestão imobiliária desenvolvido com **Next.js 14**, **Supabase** e **Tailwind CSS**.

## Principais Funcionalidades
- **Autenticação RBAC**: Níveis de acesso para Admin, Corretor e Cliente.
- **Gestão de Imóveis**: CRUD completo para corretores e visão global para admins.
- **Sistema de Leads**: Manifestação de interesse em tempo real.
- **Notificações**: Alertas globais para novos leads na plataforma.
- **Dashboard Premium**: Design moderno com glassmorphism e animações.

## Como Configurar

### 1. Supabase
Crie um projeto no [Supabase](https://supabase.com/) e execute o conteúdo do arquivo `schema.sql` no Editor SQL. Isso criará:
- Tabelas de Perfis, Imóveis, Leads e Notificações.
- Políticas de Segurança (RLS).
- Gatilhos para criação automática de perfil ao se cadastrar.

### 2. Variáveis de Ambiente
Renomeie o arquivo `.env.local` e adicione suas credenciais do Supabase:
```env
NEXT_PUBLIC_SUPABASE_URL=seu_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon
```

### 3. Instalação e Execução
```bash
npm install
npm run dev
```

## Estrutura do Projeto
- `/src/app`: Rotas e Dashboards (Admin, Corretor, Cliente).
- `/src/components`: Componentes de UI e Navbar Inteligente.
- `/src/lib`: Configuração do cliente Supabase.
- `/src/middleware.ts`: Proteção de rotas e redirecionamento por cargo (RBAC).

## Design
O sistema utiliza uma paleta de cores **Azul, Branco e Cinza**, com um visual "Premium" e "State of the Art", utilizando sombras profundas, camadas de vidro (glassmorphism) e tipografia moderna (Inter).
