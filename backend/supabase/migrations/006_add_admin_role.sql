-- Migration: Add admin role to users table
-- Created: 2025-01-26

-- Add is_admin column to users table
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false NOT NULL;

-- Create index for faster admin lookups
CREATE INDEX IF NOT EXISTS idx_users_is_admin ON users(is_admin);

-- Add comment for documentation
COMMENT ON COLUMN users.is_admin IS 'Whether the user has admin privileges';

-- Optional: Set specific users as admins (update email as needed)
-- Example: Make the seed user an admin
UPDATE users
SET is_admin = true
WHERE email = 'seeduser@example.com';

