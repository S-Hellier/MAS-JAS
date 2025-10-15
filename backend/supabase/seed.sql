-- This file contains seed data for the pantry app
-- It will be run after the initial schema migration

-- Insert some sample food categories and units for reference
-- (These are already defined as enums, but this serves as documentation)

-- Sample pantry items for testing (optional - can be removed if using the TypeScript seed script)
-- Note: These will only work if you have a user with ID 'default-user' in your auth system

-- Uncomment the following lines if you want to seed directly via SQL instead of TypeScript:

/*
INSERT INTO pantry_items (
  name, brand, quantity, unit, category, expiration_date, 
  nutrition_info, barcode, notes, user_id
) VALUES 
(
  'Organic Bananas',
  'Whole Foods',
  6,
  'pieces',
  'produce',
  CURRENT_DATE + INTERVAL '5 days',
  '{"calories": 105, "protein": 1.3, "carbohydrates": 27, "fat": 0.4, "fiber": 3.1, "sugar": 14.4, "sodium": 1, "servingSize": "1", "servingUnit": "medium banana"}',
  NULL,
  'Perfect ripeness for smoothies',
  'default-user'
),
(
  'Jasmine Rice',
  'Lundberg',
  2,
  'cups',
  'grains',
  CURRENT_DATE + INTERVAL '365 days',
  '{"calories": 205, "protein": 4.3, "carbohydrates": 45, "fat": 0.4, "fiber": 0.6, "sugar": 0.1, "sodium": 2, "servingSize": "1", "servingUnit": "cup cooked"}',
  '1234567890123',
  NULL,
  'default-user'
),
(
  'Chicken Breast',
  'Perdue',
  1.5,
  'pounds',
  'meat',
  CURRENT_DATE + INTERVAL '3 days',
  '{"calories": 165, "protein": 31, "carbohydrates": 0, "fat": 3.6, "fiber": 0, "sugar": 0, "sodium": 74, "servingSize": "4", "servingUnit": "oz"}',
  NULL,
  'Free-range, organic',
  'default-user'
);
*/
