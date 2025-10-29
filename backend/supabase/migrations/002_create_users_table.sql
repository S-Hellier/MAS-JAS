-- Create users table for simple authentication
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for email lookups
CREATE INDEX idx_users_email ON users(email);

-- Add trigger to automatically update updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for users (allow all for prototype)
CREATE POLICY "Enable all operations for users" ON users
  FOR ALL USING (true);

-- Add foreign key constraint to pantry_items (optional - ensures data integrity)
ALTER TABLE pantry_items
  ADD CONSTRAINT fk_pantry_items_user
  FOREIGN KEY (user_id) REFERENCES users(id)
  ON DELETE CASCADE;
