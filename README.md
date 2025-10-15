# Pantry Management & Recipe Generation App

## Tech Stack

### Backend
- **Framework**: Node.js + Express + TypeScript
- **Database**: PostgreSQL via Supabase
- **Authentication**: Supabase Auth
- **API**: RESTful with comprehensive validation

### Frontend (Planned)
- **Framework**: React Native + TypeScript
- **Camera**: react-native-vision-camera
- **Barcode Scanning**: vision-camera-code-scanner
- **State Management**: Redux Toolkit or Zustand
- **Navigation**: React Navigation

## 📁 Project Structure

```
MAS-JAS/
├── backend/                 # Node.js + Express API
│   ├── src/
│   │   ├── config/         # Supabase configuration
│   │   ├── controllers/    # API route handlers
│   │   ├── routes/         # Route definitions
│   │   ├── services/       # Business logic
│   │   ├── types/          # TypeScript interfaces
│   │   └── utils/          # Utility functions
│   ├── supabase/           # Database migrations
│   └── README.md           # Backend documentation
├── frontend/               # React Native app (coming soon)
└── README.md              # This file
```

## Getting Started

### Backend Setup

1. **Navigate to backend directory**:
```bash
cd backend
```

2. **Install dependencies**:
```bash
npm install
```

3. **Set up Supabase**:
```bash
# Install Supabase CLI
npm install -g supabase

# Start local Supabase instance
supabase start

# Copy environment file
cp env.example .env
# Edit .env with your Supabase credentials
```

4. **Initialize database**:
```bash
# Apply migrations
supabase db reset

# Seed with sample data
npm run db:seed
```

5. **Start development server**:
```bash
npm run dev
```

The API will be available at `http://localhost:3001`

## Current Features

### ✅ Backend API
- Complete CRUD operations for pantry items
- Comprehensive data model with nutrition tracking
- Barcode support for product identification
- Expiration date management with smart filtering
- Category-based organization
- Search and pagination
- Database migrations and seeding

### 🔄 In Progress
- Frontend React Native application
- Camera integration for barcode scanning
- Image recognition for food items
- Recipe generation algorithms

## Data Model

### Pantry Items
Each item in the pantry includes:
- **Basic Information**: Name, brand, quantity, unit
- **Organization**: Category, expiration date
- **Nutrition**: Complete nutritional information (calories, protein, carbs, etc.)
- **Media**: Barcode, images
- **Metadata**: Notes, timestamps, user association

### Categories
- Produce, Grains, Meat, Dairy, Seafood
- Beverages, Snacks, Condiments, Frozen
- Canned, Bakery, Spices, Other

### Quantity Units
- Pieces, Weight (grams, kg, pounds, ounces)
- Volume (liters, ml, cups, tablespoons, teaspoons)
- Packages (cans, bottles, packages)

## Development

### Backend Commands
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run db:generate  # Generate TypeScript types
npm run db:reset     # Reset database
npm run db:seed      # Seed with sample data
```

### API Documentation
See `backend/README.md` for comprehensive API documentation including:
- All available endpoints
- Request/response formats
- Authentication details
- Error handling

**JAS Team** - Georgia Tech Mobile Apps and Services Fall 2025
