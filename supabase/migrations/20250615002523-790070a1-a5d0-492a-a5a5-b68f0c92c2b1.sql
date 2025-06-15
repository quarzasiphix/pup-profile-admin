
-- Add a column to track the number of images per dog for easier querying
ALTER TABLE public.dog_images 
ADD COLUMN IF NOT EXISTS file_size INTEGER,
ADD COLUMN IF NOT EXISTS original_name TEXT;

-- Create an index on dog_id for better performance when querying images
CREATE INDEX IF NOT EXISTS idx_dog_images_dog_id ON public.dog_images(dog_id);

-- Create an index on sort_order for better performance when ordering images
CREATE INDEX IF NOT EXISTS idx_dog_images_sort_order ON public.dog_images(dog_id, sort_order);

-- Create a function to automatically set sort_order for new images
CREATE OR REPLACE FUNCTION set_image_sort_order()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.sort_order IS NULL THEN
    SELECT COALESCE(MAX(sort_order), -1) + 1 
    INTO NEW.sort_order 
    FROM public.dog_images 
    WHERE dog_id = NEW.dog_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically set sort_order
DROP TRIGGER IF EXISTS trigger_set_image_sort_order ON public.dog_images;
CREATE TRIGGER trigger_set_image_sort_order
  BEFORE INSERT ON public.dog_images
  FOR EACH ROW
  EXECUTE FUNCTION set_image_sort_order();

-- Create RLS policies for dog_images table (if not already created)
DROP POLICY IF EXISTS "Authenticated users can view all dog images" ON public.dog_images;
DROP POLICY IF EXISTS "Authenticated users can insert dog images" ON public.dog_images;
DROP POLICY IF EXISTS "Authenticated users can update dog images" ON public.dog_images;
DROP POLICY IF EXISTS "Authenticated users can delete dog images" ON public.dog_images;

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
