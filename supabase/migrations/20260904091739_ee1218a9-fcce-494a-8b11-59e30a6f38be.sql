ALTER TABLE public.restaurants
  ADD COLUMN IF NOT EXISTS theme text NOT NULL DEFAULT 'feu',
  ADD COLUMN IF NOT EXISTS accent text;