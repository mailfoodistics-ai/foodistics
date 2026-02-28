-- Add weight and weight_unit columns to products table
-- Run this in your Supabase SQL editor (make a backup / test in dev first)

ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS weight numeric DEFAULT 0;

ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS weight_unit varchar(10) DEFAULT 'g';

-- If you want to set defaults or rename existing weight_unit value
-- UPDATE public.products SET weight_unit = 'g' WHERE weight_unit IS NULL;

