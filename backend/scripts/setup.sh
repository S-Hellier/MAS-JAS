#!/bin/bash

# Pantry App Backend Setup Script
# This script sets up the development environment for the pantry app backend

set -e  # Exit on any error

echo "🚀 Setting up Pantry App Backend..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ and try again."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm and try again."
    exit 1
fi

echo "✅ npm version: $(npm -v)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "📦 Installing Supabase CLI..."
    npm install -g supabase
else
    echo "✅ Supabase CLI is already installed"
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp env.example .env
    echo "⚠️  Please update .env with your Supabase credentials"
    echo "   You can get these from your Supabase project dashboard"
else
    echo "✅ .env file already exists"
fi

# Initialize Supabase if not already done
if [ ! -d "supabase/.git" ]; then
    echo "🔧 Initializing Supabase..."
    supabase init
else
    echo "✅ Supabase already initialized"
fi

# Start Supabase (this will download Docker images if needed)
echo "🐳 Starting Supabase..."
supabase start

# Wait for Supabase to be ready
echo "⏳ Waiting for Supabase to be ready..."
sleep 10

# Apply database migrations
echo "🗄️  Applying database migrations..."
supabase db reset

# Generate TypeScript types
echo "🔧 Generating TypeScript types..."
npm run db:generate

# Seed the database
echo "🌱 Seeding database with sample data..."
npm run db:seed

echo ""
echo "🎉 Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Update .env with your Supabase credentials (if using remote Supabase)"
echo "2. Start the development server: npm run dev"
echo "3. Test the API: curl http://localhost:3001/health"
echo ""
echo "🔗 Useful URLs:"
echo "   API: http://localhost:3001"
echo "   Health Check: http://localhost:3001/health"
echo "   Supabase Studio: http://localhost:54323"
echo ""
echo "📚 Documentation:"
echo "   Backend README: ./README.md"
echo "   API Documentation: ./API_DOCUMENTATION.md"
echo ""
echo "Happy coding! 🚀"
