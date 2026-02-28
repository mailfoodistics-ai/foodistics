-- OPTION 1: Disable RLS completely (for development/testing)
-- This allows anyone to read/write the tables without authentication
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE product_images DISABLE ROW LEVEL SECURITY;

-- OPTION 2: If you want RLS enabled, use these permissive policies:
-- First, enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for all users" ON products;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON products;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON products;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON products;

DROP POLICY IF EXISTS "Allow public to view product images" ON product_images;
DROP POLICY IF EXISTS "Allow authenticated users to insert product images" ON product_images;
DROP POLICY IF EXISTS "Allow authenticated users to update product images" ON product_images;
DROP POLICY IF EXISTS "Allow authenticated users to delete product images" ON product_images;

-- Create permissive policies (allow all operations for anyone)
CREATE POLICY "products_all_access"
ON products 
FOR ALL
USING (true)
WITH CHECK (true);

CREATE POLICY "product_images_all_access"
ON product_images
FOR ALL
USING (true)
WITH CHECK (true);
