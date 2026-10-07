-- Add addons column to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS addons JSONB DEFAULT '[]'::jsonb;

-- Update existing orders to have empty addons array
UPDATE orders SET addons = '[]'::jsonb WHERE addons IS NULL;
