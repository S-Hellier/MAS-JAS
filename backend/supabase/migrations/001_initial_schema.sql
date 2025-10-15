-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE food_category AS ENUM (
  'produce', 'grains', 'meat', 'dairy', 'seafood', 'beverages', 
  'snacks', 'condiments', 'frozen', 'canned', 'bakery', 'spices', 'other'
);

CREATE TYPE quantity_unit AS ENUM (
  'pieces', 'grams', 'kilograms', 'pounds', 'ounces', 'liters', 
  'milliliters', 'cups', 'tablespoons', 'teaspoons', 'packages', 'cans', 'bottles'
);

-- Create pantry_items table
CREATE TABLE pantry_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  brand VARCHAR(255),
  quantity DECIMAL(10,2) NOT NULL CHECK (quantity > 0),
  unit quantity_unit NOT NULL,
  category food_category NOT NULL,
  expiration_date DATE NOT NULL,
  date_added TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  date_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  nutrition_info JSONB,
  barcode VARCHAR(50) UNIQUE,
  images TEXT[], -- Array of image URLs
  notes TEXT,
  user_id UUID NOT NULL, -- For multi-user support
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_pantry_items_user_id ON pantry_items(user_id);
CREATE INDEX idx_pantry_items_category ON pantry_items(category);
CREATE INDEX idx_pantry_items_expiration_date ON pantry_items(expiration_date);
CREATE INDEX idx_pantry_items_barcode ON pantry_items(barcode);
CREATE INDEX idx_pantry_items_name ON pantry_items USING gin(to_tsvector('english', name));
CREATE INDEX idx_pantry_items_brand ON pantry_items(brand);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_pantry_items_updated_at 
  BEFORE UPDATE ON pantry_items 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Create a function to get items expiring soon (within 7 days)
CREATE OR REPLACE FUNCTION get_items_expiring_soon(user_uuid UUID, days_ahead INTEGER DEFAULT 7)
RETURNS TABLE (
  id UUID,
  name VARCHAR(255),
  brand VARCHAR(255),
  quantity DECIMAL(10,2),
  unit quantity_unit,
  category food_category,
  expiration_date DATE,
  days_until_expiry INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pi.id,
    pi.name,
    pi.brand,
    pi.quantity,
    pi.unit,
    pi.category,
    pi.expiration_date,
    (pi.expiration_date - CURRENT_DATE)::INTEGER as days_until_expiry
  FROM pantry_items pi
  WHERE pi.user_id = user_uuid
    AND pi.expiration_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '1 day' * days_ahead
  ORDER BY pi.expiration_date ASC;
END;
$$ LANGUAGE plpgsql;

-- Create a function to get expired items
CREATE OR REPLACE FUNCTION get_expired_items(user_uuid UUID)
RETURNS TABLE (
  id UUID,
  name VARCHAR(255),
  brand VARCHAR(255),
  quantity DECIMAL(10,2),
  unit quantity_unit,
  category food_category,
  expiration_date DATE,
  days_expired INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pi.id,
    pi.name,
    pi.brand,
    pi.quantity,
    pi.unit,
    pi.category,
    pi.expiration_date,
    (CURRENT_DATE - pi.expiration_date)::INTEGER as days_expired
  FROM pantry_items pi
  WHERE pi.user_id = user_uuid
    AND pi.expiration_date < CURRENT_DATE
  ORDER BY pi.expiration_date ASC;
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security (RLS)
ALTER TABLE pantry_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (these will be customized based on your auth setup)
-- For now, we'll create a policy that allows all operations
-- In production, you'll want to restrict based on user authentication
CREATE POLICY "Enable all operations for authenticated users" ON pantry_items
  FOR ALL USING (true);

-- Create a view for pantry items with computed fields
CREATE VIEW pantry_items_view AS
SELECT 
  pi.*,
  CASE 
    WHEN pi.expiration_date < CURRENT_DATE THEN 'expired'
    WHEN pi.expiration_date <= CURRENT_DATE + INTERVAL '7 days' THEN 'expiring_soon'
    ELSE 'fresh'
  END as expiration_status,
  (pi.expiration_date - CURRENT_DATE)::INTEGER as days_until_expiry
FROM pantry_items pi;
