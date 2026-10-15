-- Migration: Update orders table to support multiple items
-- This replaces the single product_id/product_name/quantity/addons columns with an items JSONB array

-- Add new items column
ALTER TABLE orders ADD COLUMN IF NOT EXISTS items JSONB DEFAULT '[]'::jsonb;

-- Migrate existing data: convert old single-product orders to items array
-- This creates a JSON array with one item for each existing order
UPDATE orders 
SET items = jsonb_build_array(
  jsonb_build_object(
    'product_id', product_id,
    'product_name', product_name,
    'quantity', quantity,
    'unit_price', COALESCE((SELECT price FROM products WHERE id = product_id), 0),
    'addons', COALESCE(addons, '[]'::jsonb),
    'item_total', total_price
  )
)
WHERE items = '[]'::jsonb AND product_id IS NOT NULL;

-- Drop old columns (optional - uncomment if you want to remove them)
-- ALTER TABLE orders DROP COLUMN IF EXISTS product_id;
-- ALTER TABLE orders DROP COLUMN IF EXISTS product_name;
-- ALTER TABLE orders DROP COLUMN IF EXISTS quantity;
-- ALTER TABLE orders DROP COLUMN IF EXISTS addons;
