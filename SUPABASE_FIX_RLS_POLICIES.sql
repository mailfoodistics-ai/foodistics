-- Update RLS policies to allow DELETE operations
-- First, drop and recreate the policies with proper DELETE permissions

-- Drop existing policies on products table
DROP POLICY IF EXISTS "Enable read access for all users" ON products;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON products;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON products;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON products;

-- Create new policies for products table
CREATE POLICY "Enable read access for all users"
ON products FOR SELECT
USING (true);

CREATE POLICY "Enable insert access for authenticated users"
ON products FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update access for authenticated users"
ON products FOR UPDATE
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable delete access for authenticated users"
ON products FOR DELETE
USING (auth.role() = 'authenticated');

-- Ensure RLS is enabled on products
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policies on product_images table
DROP POLICY IF EXISTS "Allow public to view product images" ON product_images;
DROP POLICY IF EXISTS "Allow authenticated users to insert product images" ON product_images;
DROP POLICY IF EXISTS "Allow authenticated users to update product images" ON product_images;
DROP POLICY IF EXISTS "Allow authenticated users to delete product images" ON product_images;

-- Create new policies for product_images table
CREATE POLICY "Allow public to view product images"
ON product_images FOR SELECT
USING (true);

CREATE POLICY "Allow authenticated users to insert product images"
ON product_images FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update product images"
ON product_images FOR UPDATE
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete product images"
ON product_images FOR DELETE
USING (auth.role() = 'authenticated');

-- Ensure RLS is enabled on product_images
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
