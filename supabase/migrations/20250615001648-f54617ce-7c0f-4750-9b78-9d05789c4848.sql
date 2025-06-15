
-- Create enum for dog types
CREATE TYPE dog_type AS ENUM ('puppy', 'adult_male', 'adult_female');

-- Create dogs table
CREATE TABLE public.dogs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type dog_type NOT NULL,
  short_description TEXT,
  long_description TEXT,
  weight_kg DECIMAL(5,2), -- Weight in kilograms with 2 decimal places
  birthday DATE,
  thumbnail_url TEXT, -- URL for the main thumbnail image
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true -- For soft delete functionality
);

-- Create dog_images table for multiple photos per dog
CREATE TABLE public.dog_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dog_id UUID REFERENCES public.dogs(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  image_name TEXT,
  is_thumbnail BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create storage bucket for dog images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('dog-images', 'dog-images', true);

-- Create storage policies for dog images bucket
CREATE POLICY "Allow public read access to dog images" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'dog-images');

CREATE POLICY "Allow authenticated users to upload dog images" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'dog-images' AND auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update dog images" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'dog-images' AND auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete dog images" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'dog-images' AND auth.role() = 'authenticated');

-- Enable Row Level Security on dogs table
ALTER TABLE public.dogs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for dogs table (allow authenticated users full access)
CREATE POLICY "Authenticated users can view all dogs" 
ON public.dogs FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Authenticated users can insert dogs" 
ON public.dogs FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Authenticated users can update dogs" 
ON public.dogs FOR UPDATE 
TO authenticated 
USING (true);

CREATE POLICY "Authenticated users can delete dogs" 
ON public.dogs FOR DELETE 
TO authenticated 
USING (true);

-- Enable Row Level Security on dog_images table
ALTER TABLE public.dog_images ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for dog_images table
CREATE POLICY "Authenticated users can view all dog images" 
ON public.dog_images FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Authenticated users can insert dog images" 
ON public.dog_images FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Authenticated users can update dog images" 
ON public.dog_images FOR UPDATE 
TO authenticated 
USING (true);

CREATE POLICY "Authenticated users can delete dog images" 
ON public.dog_images FOR DELETE 
TO authenticated 
USING (true);

-- Create function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at on dogs table
CREATE TRIGGER update_dogs_updated_at 
    BEFORE UPDATE ON public.dogs 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
