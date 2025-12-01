-- Convert diet and goals columns from enum to text to allow free-form input
-- This migration allows users to enter any diet type or goal instead of being restricted to enum values

-- First, convert the columns to text
ALTER TABLE users
  ALTER COLUMN diet TYPE TEXT USING diet::TEXT,
  ALTER COLUMN goals TYPE TEXT USING goals::TEXT;

-- Drop the enum types (optional, but cleans up unused types)
-- Note: This will fail if other tables use these enum types, so we'll comment it out
-- DROP TYPE IF EXISTS diet_type;
-- DROP TYPE IF EXISTS goal_type;

-- Add comment for documentation
COMMENT ON COLUMN users.diet IS 'User dietary preference (free-form text)';
COMMENT ON COLUMN users.goals IS 'User health/fitness goal (free-form text)';

