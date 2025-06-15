-- Adds litter_letter column
ALTER TABLE public.puppies
ADD COLUMN IF NOT EXISTS litter_letter character(1) NOT NULL; 