
-- Update RLS policies for dogs table to allow public access
DROP POLICY IF EXISTS "Authenticated users can view all dogs" ON public.dogs;
DROP POLICY IF EXISTS "Authenticated users can insert dogs" ON public.dogs;
DROP POLICY IF EXISTS "Authenticated users can update dogs" ON public.dogs;
DROP POLICY IF EXISTS "Authenticated users can delete dogs" ON public.dogs;

-- Allow anyone to view dogs (public access)
CREATE POLICY "Anyone can view dogs" 
ON public.dogs FOR SELECT 
USING (true);

-- Only authenticated users can modify dogs
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

-- Update RLS policies for dog_images table to allow public access
DROP POLICY IF EXISTS "Authenticated users can view all dog images" ON public.dog_images;
DROP POLICY IF EXISTS "Authenticated users can insert dog images" ON public.dog_images;
DROP POLICY IF EXISTS "Authenticated users can update dog images" ON public.dog_images;
DROP POLICY IF EXISTS "Authenticated users can delete dog images" ON public.dog_images;

-- Allow anyone to view dog images (public access)
CREATE POLICY "Anyone can view dog images" 
ON public.dog_images FOR SELECT 
USING (true);

-- Only authenticated users can modify dog images
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
