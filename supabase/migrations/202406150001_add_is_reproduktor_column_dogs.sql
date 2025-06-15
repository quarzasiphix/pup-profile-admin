-- Adds a boolean column to mark if a dog is a reproduktor (breeding male/female)
ALTER TABLE public.dogs
ADD COLUMN IF NOT EXISTS is_reproduktor boolean NOT NULL DEFAULT false; 