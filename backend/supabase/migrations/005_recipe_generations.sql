-- Migration: Add recipe_generations table for tracking recipe generation metrics
-- Created: 2025-10-26

-- Create recipe_generations table to track recipe generation for analytics
CREATE TABLE IF NOT EXISTS recipe_generations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  recipe_title VARCHAR(255) NOT NULL,
  generation_time_ms INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_recipe_generations_user_id ON recipe_generations(user_id);
CREATE INDEX IF NOT EXISTS idx_recipe_generations_created_at ON recipe_generations(created_at);
CREATE INDEX IF NOT EXISTS idx_recipe_generations_user_created ON recipe_generations(user_id, created_at);

-- Add comment
COMMENT ON TABLE recipe_generations IS 'Tracks recipe generation events for analytics and metrics';

