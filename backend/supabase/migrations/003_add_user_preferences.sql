-- Add user preferences fields to users table
-- This allows users to set dietary preferences, goals, and food restrictions

-- Create enum types for diet and goals
CREATE TYPE diet_type AS ENUM (
  'keto', 'paleo', 'carnivore', 'vegan', 'vegetarian',
  'mediterranean', 'low_carb', 'none'
);

CREATE TYPE goal_type AS ENUM (
  'lose_weight', 'build_muscle', 'maintain_weight',
  'improve_health', 'none'
);

-- Add new columns to users table
ALTER TABLE users
  ADD COLUMN diet diet_type DEFAULT 'none',
  ADD COLUMN goals goal_type DEFAULT 'none',
  ADD COLUMN food_restrictions JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN profile_completed BOOLEAN DEFAULT false;

-- Create index for faster queries on profile_completed
CREATE INDEX idx_users_profile_completed ON users(profile_completed);

-- Add comment for documentation
COMMENT ON COLUMN users.diet IS 'User dietary preference (keto, paleo, etc.)';
COMMENT ON COLUMN users.goals IS 'User health/fitness goal';
COMMENT ON COLUMN users.food_restrictions IS 'Array of food allergies and restrictions';
COMMENT ON COLUMN users.profile_completed IS 'Whether user has completed their profile setup';
