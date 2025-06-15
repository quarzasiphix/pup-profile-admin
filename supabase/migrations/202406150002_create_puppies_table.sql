-- Creates puppies table with parent references and birth weight
CREATE TABLE IF NOT EXISTS public.puppies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  weight_at_birth numeric(5,2) NULL,
  mom uuid NULL REFERENCES public.dogs(id) ON DELETE SET NULL,
  dad uuid NULL REFERENCES public.dogs(id) ON DELETE SET NULL,
  mom_color text NULL,
  dad_color text NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- trigger to update updated_at column
CREATE TRIGGER update_puppies_updated_at
BEFORE UPDATE ON public.puppies
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 