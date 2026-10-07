-- Remove NOT NULL constraints from orders table
ALTER TABLE orders ALTER COLUMN customer_name DROP NOT NULL;
ALTER TABLE orders ALTER COLUMN contact_number DROP NOT NULL;
ALTER TABLE orders ALTER COLUMN address DROP NOT NULL;
ALTER TABLE orders ALTER COLUMN product_name DROP NOT NULL;

-- Set default empty strings for existing records
UPDATE orders SET customer_name = '' WHERE customer_name IS NULL;
UPDATE orders SET contact_number = '' WHERE contact_number IS NULL;
UPDATE orders SET address = '' WHERE address IS NULL;
UPDATE orders SET product_name = '' WHERE product_name IS NULL;
