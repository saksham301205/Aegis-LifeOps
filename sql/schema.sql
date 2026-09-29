-- Aegis LifeOps Supabase Schema Migration
-- Enables Row Level Security (RLS) and provisions tables for Profiles, Obligations, Proofs, and Notice Drafts.

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  preferences JSONB DEFAULT '{"theme": "dark", "currency": "INR"}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Trigger to auto-create profile on user sign up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', new.email),
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- 2. OBLIGATIONS TABLE
CREATE TABLE IF NOT EXISTS public.obligations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  provider TEXT,
  amount NUMERIC(12, 2) DEFAULT 0.00,
  due_date DATE,
  status TEXT DEFAULT 'Pending',
  consequence_severity TEXT DEFAULT 'medium',
  consequence_note TEXT,
  prerequisite_id UUID REFERENCES public.obligations(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on obligations
ALTER TABLE public.obligations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own obligations"
  ON public.obligations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own obligations"
  ON public.obligations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own obligations"
  ON public.obligations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own obligations"
  ON public.obligations FOR DELETE
  USING (auth.uid() = user_id);


-- 3. PROOFS TABLE
CREATE TABLE IF NOT EXISTS public.proofs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  obligation_id UUID NOT NULL REFERENCES public.obligations(id) ON DELETE CASCADE,
  type TEXT DEFAULT 'reference_note',
  reference_number TEXT,
  file_name TEXT,
  file_path TEXT,
  note TEXT,
  attached_at DATE DEFAULT CURRENT_DATE,
  is_self_reported BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on proofs
ALTER TABLE public.proofs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own proofs"
  ON public.proofs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own proofs"
  ON public.proofs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own proofs"
  ON public.proofs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own proofs"
  ON public.proofs FOR DELETE
  USING (auth.uid() = user_id);


-- 4. NOTICE DRAFTS TABLE
CREATE TABLE IF NOT EXISTS public.notice_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  title TEXT,
  raw_text TEXT,
  draft_data JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on notice drafts
ALTER TABLE public.notice_drafts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own notice drafts"
  ON public.notice_drafts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notice drafts"
  ON public.notice_drafts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own notice drafts"
  ON public.notice_drafts FOR DELETE
  USING (auth.uid() = user_id);


-- 5. STORAGE BUCKET setup for proof files
INSERT INTO storage.buckets (id, name, public)
VALUES ('aegis-proofs', 'aegis-proofs', false)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS policies
CREATE POLICY "Authenticated users can upload proof files"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'aegis-proofs' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Authenticated users can view own proof files"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'aegis-proofs' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Authenticated users can delete own proof files"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'aegis-proofs' AND (storage.foldername(name))[1] = auth.uid()::text);
