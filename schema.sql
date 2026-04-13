-- Use isso no SQL Editor do seu projeto Supabase para configurar as tabelas e permissÃµes (RLS).

-- Profiles table
CREATE TABLE public.profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email text NOT NULL,
  full_name text,
  is_approved boolean DEFAULT false,
  role text DEFAULT 'cliente' CHECK (role IN ('admin', 'corretor', 'cliente')),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Properties table
CREATE TABLE public.properties (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  price numeric NOT NULL,
  type text NOT NULL CHECK (type IN ('venda', 'aluguel')),
  images text[] DEFAULT '{}',
  address text,
  city text,
  rooms integer DEFAULT 1,
  suites integer DEFAULT 0,
  bathrooms integer DEFAULT 1,
  parking_spaces integer DEFAULT 0,
  area numeric DEFAULT 0, -- m2
  has_pool boolean DEFAULT false,
  has_playground boolean DEFAULT false,
  has_elevator boolean DEFAULT false,
  has_remote_concierge boolean DEFAULT false,
  has_cftv boolean DEFAULT false,
  status text DEFAULT 'disponivel' CHECK (status IN ('disponivel', 'vendido', 'alugado')),
  corretor_id uuid REFERENCES public.profiles(id) NOT NULL,
  slug text UNIQUE,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Leads table
CREATE TABLE public.leads (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id uuid REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  cliente_id uuid REFERENCES public.profiles(id) NOT NULL,
  message text,
  status text DEFAULT 'novo' CHECK (status IN ('novo', 'em_atendimento', 'concluido')),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Notifications (Global or targeted)
CREATE TABLE public.notifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  message text NOT NULL,
  type text DEFAULT 'lead_received',
  target_user_id uuid REFERENCES public.profiles(id), -- NULL para broadcast
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Policies for Profiles
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Policies for Properties
CREATE POLICY "Properties viewable by everyone" ON public.properties FOR SELECT USING (true);
CREATE POLICY "Corretores can insert own properties" ON public.properties FOR INSERT WITH CHECK (
  auth.uid() = corretor_id AND 
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('corretor', 'admin')
);
CREATE POLICY "Corretores can update/delete own properties" ON public.properties FOR ALL USING (
  auth.uid() = corretor_id OR 
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- Policies for Leads
CREATE POLICY "Leads viewable by owning corretor or client" ON public.leads FOR SELECT USING (
  auth.uid() = cliente_id OR 
  auth.uid() IN (SELECT corretor_id FROM public.properties WHERE id = property_id) OR
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);
CREATE POLICY "Clients can insert leads" ON public.leads FOR INSERT WITH CHECK (
  auth.uid() = cliente_id
);

-- Policies for Notifications
CREATE POLICY "Everyone can see notifications" ON public.notifications FOR SELECT USING (true);

-- Functions and Triggers
-- Automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  v_role text;
  v_is_approved boolean;
BEGIN
  -- Determine role
  v_role := CASE WHEN new.email = 'augustocalado@hotmail.com' THEN 'admin' ELSE COALESCE(new.raw_user_meta_data->>'role', 'cliente') END;
  
  -- Admins and clients are approved by default, brokers need manual approval
  v_is_approved := CASE WHEN v_role = 'corretor' THEN false ELSE true END;

  -- Create profile
  INSERT INTO public.profiles (id, email, full_name, role, is_approved)
  VALUES (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name', 
    v_role,
    v_is_approved
  );

  -- Notify admin if it's a broker request
  IF v_role = 'corretor' THEN
    INSERT INTO public.notifications (message, type)
    VALUES (
      (new.raw_user_meta_data->>'full_name') || ' pediu para se cadastrar como corretor.',
      'broker_request'
    );
  END IF;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- Unified Site Configuration
CREATE TABLE public.site_configs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  key text UNIQUE NOT NULL,
  value text,
  description text,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Hero Banners
CREATE TABLE public.banners (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text,
  subtitle text,
  image_url text,
  link_url text,
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for news tables
ALTER TABLE public.site_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;

-- Admin-only access for configs and banners
CREATE POLICY " Admins can manage site_configs\ ON public.site_configs FOR ALL USING (
 (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);
CREATE POLICY \Public can view site_configs\ ON public.site_configs FOR SELECT USING (true);

CREATE POLICY \Admins can manage banners\ ON public.banners FOR ALL USING (
 (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);
CREATE POLICY \Public can view banners\ ON public.banners FOR SELECT USING (true);

-- Initial Configs
INSERT INTO public.site_configs (key, value, description) VALUES 
('site_title', 'KF Imóveis - Luxury Real Estate', 'Título principal da plataforma'),
('contact_email', 'contato@kfimoveis.com.br', 'E-mail de contato oficial'),
('contact_phone', '(13) 3474-0000', 'Telefone de contato oficial'),
('seo_description', 'Os melhores imóveis e lançamentos em Praia Grande SP.', 'Meta descrição para SEO');



-- Property Registration Enhancement
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS owner_name text;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS owner_address text;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS owner_contact text;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS owner_document text; -- CPF/RG/CNPJ
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS reference_id text UNIQUE;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS is_featured boolean DEFAULT false;

-- Index for reference lookup
CREATE INDEX IF NOT EXISTS idx_properties_reference ON public.properties(reference_id);

-- Function to generate unique RF# reference
CREATE OR REPLACE FUNCTION public.generate_property_reference()
RETURNS text AS 
DECLARE
  new_ref text;
  exists_already boolean;
BEGIN
  LOOP
    new_ref := 'RF#' || floor(random() * (999999 - 100000 + 1) + 100000)::text;
    SELECT EXISTS (SELECT 1 FROM public.properties WHERE reference_id = new_ref) INTO exists_already;
    EXIT WHEN NOT exists_already;
  END LOOP;
  RETURN new_ref;
END;
 LANGUAGE plpgsql;

-- Financial, Document, and Appointments Extensions
CREATE TABLE public.financial_records ( id uuid DEFAULT gen_random_uuid() PRIMARY KEY, property_id uuid REFERENCES public.properties(id), type text NOT NULL, amount numeric(15,2) NOT NULL, status text DEFAULT 'pending', description text, occurred_at timestamp with time zone DEFAULT timezone('utc'::text, now()), created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL ); CREATE TABLE public.documents ( id uuid DEFAULT gen_random_uuid() PRIMARY KEY, property_id uuid REFERENCES public.properties(id), file_name text NOT NULL, file_url text NOT NULL, file_type text, uploaded_by uuid REFERENCES auth.users(id), created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL ); CREATE TABLE public.appointments ( id uuid DEFAULT gen_random_uuid() PRIMARY KEY, property_id uuid REFERENCES public.properties(id), corretor_id uuid REFERENCES auth.users(id), cliente_id uuid REFERENCES auth.users(id), scheduled_at timestamp with time zone NOT NULL, status text DEFAULT 'scheduled', notes text, created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL ); ALTER TABLE public.financial_records ENABLE ROW LEVEL SECURITY; ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY; ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS neighborhood text;

ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS video_url text;

ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS address_number text;

ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS features text[] DEFAULT '{}';

CREATE TABLE IF NOT EXISTS public.site_settings (key text PRIMARY KEY, value jsonb NOT NULL, updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL);

-- Fix: Adicionando colunas faltantes na tabela properties
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS category text;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS area_total numeric;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS condo_fee numeric DEFAULT 0;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS iptu numeric DEFAULT 0;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS accepts_financing boolean DEFAULT true;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS accepts_exchange boolean DEFAULT false;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS is_launch boolean DEFAULT false;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS subtype text;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS cep text;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS complement text;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS state text DEFAULT 'SP';
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS condo_name text;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS block text;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS unit text;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS year_built integer;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS region text;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS floor text;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS marketing_source text;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS down_payment numeric DEFAULT 0;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS monthly_payment numeric DEFAULT 0;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS keys_payment numeric DEFAULT 0;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS quarterly_payment numeric DEFAULT 0;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS semi_annual_payment numeric DEFAULT 0;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS annual_payment numeric DEFAULT 0;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS financing_balance numeric DEFAULT 0;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS adjustment_index text;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS accepts_mcmv boolean DEFAULT false;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS accepts_direct_financing boolean DEFAULT false;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS keys_location text;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS capturer text;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS observations text;
