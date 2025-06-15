
-- Add breed enum and update dog type enum
CREATE TYPE dog_breed AS ENUM ('yorkshire_terrier', 'pomeranian');
CREATE TYPE dog_age AS ENUM ('puppy', 'adult');
CREATE TYPE dog_gender AS ENUM ('male', 'female');

-- Add new columns to dogs table
ALTER TABLE public.dogs 
ADD COLUMN breed dog_breed,
ADD COLUMN age dog_age,
ADD COLUMN gender dog_gender;

-- Update existing records to have default values (you can adjust these as needed)
UPDATE public.dogs 
SET 
  breed = 'yorkshire_terrier',
  age = CASE 
    WHEN type = 'puppy' THEN 'puppy'::dog_age
    ELSE 'adult'::dog_age
  END,
  gender = CASE 
    WHEN type = 'adult_male' THEN 'male'::dog_gender
    WHEN type = 'adult_female' THEN 'female'::dog_gender
    ELSE 'male'::dog_gender
  END;

-- Make the new columns required after setting default values
ALTER TABLE public.dogs 
ALTER COLUMN breed SET NOT NULL,
ALTER COLUMN age SET NOT NULL,
ALTER COLUMN gender SET NOT NULL;
