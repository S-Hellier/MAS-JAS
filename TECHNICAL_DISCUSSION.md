# Technical Discussion - Sprint 3
## Pantry Management Application (MAS-JAS)

---

## Platform & Architecture Choices

### Technology Stack

**Frontend (Mobile)**
- React Native 0.82.0 - Cross-platform iOS/Android development
- Redux Toolkit 2.9.0 - Centralized state management with async thunks
- React Navigation 7.x - Tab + Stack navigation pattern
- Axios 1.12.2 - HTTP client for API requests
- TypeScript 5.8.3 - Static typing across entire codebase

**Backend (API Server)**
- Node.js 18+ with Express 4.21.2 - RESTful API server
- TypeScript 5.8.3 - Type safety on backend
- Zod 3.24.1 - Runtime schema validation
- Helmet 8.0.0 + CORS - Security middleware

**Database & Services**
- PostgreSQL 15+ via Supabase - Relational database with BaaS features
- OpenAI GPT-4o-mini - AI recipe generation using function calling
- Docker Desktop - Local Supabase containerization

**Rationale**: React Native enables single codebase for iOS/Android. Redux provides scalable state management. Supabase offers PostgreSQL with built-in auth/storage/realtime capabilities. TypeScript ensures type safety across full stack.

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────┐
│         React Native Mobile App                 │
│                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │  Home    │  │  Pantry  │  │ Settings │     │
│  │  Screen  │  │  Screen  │  │  Screen  │     │
│  └────┬─────┘  └────┬─────┘  └──────────┘     │
│       │             │                           │
│       └─────────────┴──────┐                   │
│                            │                   │
│              ┌─────────────▼────────┐          │
│              │    Redux Store       │          │
│              │   (Pantry Slice)     │          │
│              └─────────────┬────────┘          │
│                            │                   │
│              ┌─────────────▼────────┐          │
│              │   API Service        │          │
│              │   (Axios Client)     │          │
│              └─────────────┬────────┘          │
└────────────────────────────┼────────────────────┘
                             │ HTTP/JSON
                             │ x-user-id header
┌────────────────────────────▼────────────────────┐
│         Express Backend (Node.js)               │
│                                                 │
│  Middleware: Helmet → CORS → JSON Parser       │
│       │                                         │
│  ┌────▼─────┐    ┌──────────┐                  │
│  │  Pantry  │    │  Recipe  │                  │
│  │  Routes  │    │  Routes  │                  │
│  └────┬─────┘    └────┬─────┘                  │
│       │               │                         │
│  ┌────▼─────┐    ┌────▼─────────┐              │
│  │  Pantry  │    │   Recipe     │              │
│  │Controller│    │  Generator   │              │
│  └────┬─────┘    └────┬─────────┘              │
│       │               │                         │
│  ┌────▼───────────────┼─────┐                  │
│  │  Database Service  │     │                  │
│  │ (Supabase Client)  │     │                  │
│  └────────────────────┘     │                  │
└────────┬────────────────────┼───────────────────┘
         │                    │
         │                    │
    ┌────▼─────┐      ┌───────▼────────┐
    │Supabase  │      │  OpenAI API    │
    │PostgreSQL│      │  GPT-4o-mini   │
    └──────────┘      └────────────────┘
```

---

## REST API Endpoints

**Base URL**: `http://localhost:3001/api/v1`
**Authentication**: Custom header `x-user-id` (will migrate to JWT)

### ✅ Implemented Endpoints

| HTTP Verb | URI | Description | Implementation |
|-----------|-----|-------------|----------------|
| **GET** | `/health` | Health check | `backend/src/routes/index.ts:12-18` |
| **POST** | `/pantry` | Create pantry item | `backend/src/controllers/pantry.controller.ts:59-85` |
| **GET** | `/pantry` | Get all items (with filters) | `backend/src/controllers/pantry.controller.ts:136-171` |
| **GET** | `/pantry/:id` | Get single item | `backend/src/controllers/pantry.controller.ts:90-131` |
| **PUT** | `/pantry/:id` | Update item | `backend/src/controllers/pantry.controller.ts:176-210` |
| **DELETE** | `/pantry/:id` | Delete item | `backend/src/controllers/pantry.controller.ts:215-246` |
| **GET** | `/pantry/expiring?days=7` | Get items expiring soon | `backend/src/controllers/pantry.controller.ts:251-274` |
| **GET** | `/pantry/expired` | Get expired items | `backend/src/controllers/pantry.controller.ts:279-301` |
| **GET** | `/pantry/barcode/:barcode` | Check barcode exists | `backend/src/controllers/pantry.controller.ts:306-332` |
| **POST** | `/recipes/generate` | Generate AI recipe | `backend/src/controllers/generate-recipes.ts:159-236` |

### Request/Response Examples

**Create Item (POST /pantry)**
```json
Request:
{
  "name": "Organic Milk",
  "brand": "Horizon",
  "quantity": 1,
  "unit": "gallons",
  "category": "dairy",
  "expirationDate": "2025-10-25",
  "nutritionInfo": { "calories": 150, "protein": 8 }
}

Response:
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Organic Milk",
    "dateAdded": "2025-10-19T12:00:00Z",
    ...
  }
}
```

**Filter Items (GET /pantry?category=dairy&search=milk&page=1&limit=20)**
```json
Response:
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

**Generate Recipe (POST /recipes/generate)**
```json
Request:
{
  "allergies": ["nuts"],
  "diets": ["vegetarian"]
}

Response:
{
  "success": true,
  "data": {
    "title": "Vegetarian Pasta Primavera",
    "servings": 4,
    "ingredients": [{"name": "Pasta", "quantity": "1 pound"}],
    "steps": ["Boil water...", "Sauté vegetables..."],
    "nutrition": { "calories_per_serving": 350 }
  }
}
```

### Design Choices

1. **Zod Validation**: All endpoints validate input with Zod schemas before processing, ensuring runtime type safety beyond TypeScript.

2. **Standardized Response Format**: All endpoints return `{ success: boolean, data?: T, error?: string, pagination?: {...} }` for consistency.

3. **Query Parameters for Filtering**: GET requests use query params for filters (category, search, pagination) rather than POST body, following REST conventions.

---

## Data Sources & Flow

### 1. Pantry Item Creation Flow

```
User Input (AddItemScreen)
    ↓
dispatch(createPantryItem(itemData))
    ↓
Redux Thunk → API Service (Axios)
    ↓
POST http://10.0.2.2:3001/api/v1/pantry
    ↓
Express Middleware (Helmet → CORS → JSON Parser)
    ↓
pantryController.createPantryItem
    ↓
Zod Validation (createPantryItemSchema)
    ↓
Extract user_id from x-user-id header
    ↓
DatabaseService.createPantryItem(data, userId)
    ↓
Supabase Client → PostgreSQL INSERT
    ↓
Trigger: update_pantry_items_updated_at
    ↓
Response: { success: true, data: PantryItem }
    ↓
Redux State Update (items.unshift)
    ↓
Component Re-render
```

### 2. AI Recipe Generation Flow

```
User Selects Dietary Constraints
    ↓
POST /recipes/generate { allergies, diets }
    ↓
Backend: generateRecipeForUser(constraints)
    ↓
Step 1: Fetch User's Pantry Items
    Internal API Call: GET /pantry
    DatabaseService → Supabase → PostgreSQL
    Returns: Array<{id, name, category}>
    ↓
Step 2: Build OpenAI Prompt
    System: "You are a helpful recipe generator..."
    User: "Constraints: allergies=[nuts], Available: [Milk, Eggs, ...]"
    Functions: [createRecipeFunction with JSON schema]
    ↓
Step 3: Call OpenAI API
    POST https://api.openai.com/v1/chat/completions
    Model: gpt-4o-mini
    Temperature: 0.7, Max Tokens: 800
    ↓
OpenAI Function Calling Response
    {
      choices: [{
        message: {
          function_call: {
            name: "create_recipe",
            arguments: '{"title":"Pasta",...}'
          }
        }
      }]
    }
    ↓
Step 4: Parse & Validate
    JSON.parse(arguments)
    RecipeSchema.parse() [Zod validation]
    ↓
Response: Structured Recipe Object
    ↓
Frontend Display (title, ingredients, steps)
```

### 3. Data Storage Locations

**PostgreSQL (Supabase)**
- **pantry_items table**: All user inventory data
  - Location: `backend/supabase/migrations/001_initial_schema.sql:16-33`
  - 16 columns including id, name, quantity, category, expiration_date, nutrition_info (JSONB), user_id
  - 6 indexes for performance (user_id, category, expiration_date, barcode, name GIN, brand)

**Redux Store (Frontend)**
- **pantrySlice**: In-memory state for pantry items
  - Location: `frontend/src/store/pantrySlice.ts`
  - Stores: items[], expiringItems[], expiredItems[], selectedItem, loading, error, pagination, filters
  - Synced with backend via async thunks

**Session Storage**: Not used (stateless API, no sessions)

**External Services**
- **OpenAI**: Processes recipe requests, returns structured JSON (not stored)
- **Supabase Storage**: Prepared for future image uploads (not yet implemented)

### 4. Contextual Information from Device

**✅ Currently Leveraged**
- **Network State**: API service has error interceptors for network failures
  - Location: `frontend/src/services/api.service.ts:37-43`

**🔄 Planned for Future**
- **Camera Access**: For barcode scanning (infrastructure ready, scanner not integrated)
- **Push Notifications**: For expiring item alerts
- **Location**: Potential future feature for store recommendations

---

## Database Schema

**Location**: `backend/supabase/migrations/001_initial_schema.sql`

### Custom Types (Enums)
```sql
-- 13 food categories
CREATE TYPE food_category AS ENUM (
  'produce', 'grains', 'meat', 'dairy', 'seafood', 'beverages',
  'snacks', 'condiments', 'frozen', 'canned', 'bakery', 'spices', 'other'
);

-- 13 quantity units
CREATE TYPE quantity_unit AS ENUM (
  'pieces', 'grams', 'kilograms', 'pounds', 'ounces', 'liters',
  'milliliters', 'cups', 'tablespoons', 'teaspoons', 'packages', 'cans', 'bottles'
);
```

### Main Table: pantry_items
| Column | Type | Key Features |
|--------|------|-------------|
| id | UUID | PRIMARY KEY, auto-generated |
| name | VARCHAR(255) | NOT NULL, full-text indexed (GIN) |
| quantity | DECIMAL(10,2) | CHECK (quantity > 0) |
| category | food_category | Indexed for filtering |
| expiration_date | DATE | Indexed for queries |
| nutrition_info | JSONB | Flexible schema for nutrients |
| barcode | VARCHAR(50) | UNIQUE, indexed |
| user_id | UUID | Multi-user support, indexed |

**Design Choice - JSONB for nutrition_info**: Different foods have different nutrients. JSONB allows flexible schema without requiring migrations for new nutrient types. Example:
```json
{
  "calories": 150,
  "protein": 8,
  "carbohydrates": 12,
  "fat": 8,
  "servingSize": 1,
  "servingUnit": "cup"
}
```

### Performance Indexes
```sql
CREATE INDEX idx_pantry_items_user_id ON pantry_items(user_id);
CREATE INDEX idx_pantry_items_category ON pantry_items(category);
CREATE INDEX idx_pantry_items_expiration_date ON pantry_items(expiration_date);
CREATE INDEX idx_pantry_items_name ON pantry_items USING gin(to_tsvector('english', name));
```

**Why GIN index on name**: Enables fast full-text search on item names using PostgreSQL's tsvector.

### Database Functions

**get_items_expiring_soon(user_uuid, days_ahead)**
- Returns items expiring within N days
- Server-side date calculation for performance
- Lines: `001_initial_schema.sql:59-86`

**get_expired_items(user_uuid)**
- Returns expired items with days_expired calculation
- Lines: `001_initial_schema.sql:89-116`

### Triggers

**update_pantry_items_updated_at**
- Automatically sets `updated_at = NOW()` on every UPDATE
- Lines: `001_initial_schema.sql:43-56`

---

## External Web Services

### 1. OpenAI API (✅ Implemented)

**Endpoint**: `https://api.openai.com/v1/chat/completions`
**Model**: `gpt-4o-mini`
**Authentication**: `Authorization: Bearer ${OPENAI_API_KEY}`

**Data Sent**:
- User's pantry ingredients (fetched from local database)
- Dietary constraints (allergies, diets)
- JSON schema for recipe structure (via function calling)

**Data Received**:
```json
{
  "choices": [{
    "message": {
      "function_call": {
        "name": "create_recipe",
        "arguments": "{\"title\":\"...\",\"ingredients\":[...],\"steps\":[...]}"
      }
    }
  }]
}
```

**Design Choice - Function Calling**: Forces OpenAI to return structured JSON matching our schema, reducing hallucination and parsing errors.

**Implementation**: `backend/src/controllers/generate-recipes.ts:110-155`

### 2. Supabase (✅ Implemented)

**Service Type**: Backend-as-a-Service (BaaS)
**Base URL**: `http://127.0.0.1:54321` (local), production URL TBD

**Services Used**:
- **PostgreSQL Database**: Primary data storage
- **PostgREST API**: Auto-generated REST API (not used directly, we use Supabase JS client)
- **Authentication**: Ready for future JWT implementation
- **Storage**: Infrastructure ready for image uploads

**Data Sent**: SQL queries via Supabase JS client
**Data Received**: Query results as JSON

**Configuration**: `backend/src/config/supabase.ts:14-25`

### 3. Barcode Lookup API (🔄 Planned)

**Status**: Endpoint exists but external API not yet integrated

**Planned Integration**: UPC Database or Open Food Facts API
**Purpose**: Auto-populate item details from barcode scan

**Data Flow** (planned):
```
User scans barcode
    ↓
GET /pantry/barcode/:barcode
    ↓
Check local database first
    ↓
If not found, call external barcode API
    ↓
Return { name, brand, category, nutritionInfo }
```

**Endpoint Ready**: `backend/src/controllers/pantry.controller.ts:306-332`

---

## Implementation Status

### ✅ Fully Implemented

**Backend**
- All 9 REST API endpoints functional
- Zod validation on all inputs
- PostgreSQL schema with indexes, functions, triggers
- OpenAI integration with function calling
- Error handling and logging

**Frontend**
- 7 screens: Home, Pantry List, Add Item, Item Detail, Edit Item, Settings, Recipe Generation
- Redux state management with async thunks
- Tab + Stack navigation
- Full CRUD operations from UI
- AI recipe generation UI

**Database**
- Complete schema with enums, indexes, functions
- Row Level Security infrastructure (permissive during development)
- Database migrations and seeding scripts

### 🔄 Planned / Not Yet Implemented

**Authentication**: Currently using `x-user-id` header. Plan to migrate to Supabase Auth with JWT tokens.

**Barcode Scanning**: Endpoint exists, external API integration pending.

**Image Upload**: Database schema supports images[], Supabase Storage ready, UI not implemented.

**Push Notifications**: No implementation yet.

**Offline Support**: No Redux Persist or offline queuing.

**Analytics**: No tracking implemented.

---

## Key Design Decisions

### 1. Android Emulator Network Configuration

**Decision**: Use `10.0.2.2` instead of `localhost` for API calls.

**Why**: Windows Android emulator cannot access host's `localhost`. `10.0.2.2` is special alias that maps to `127.0.0.1` on host machine.

**Implementation**: `frontend/src/services/api.service.ts:19`

**Trade-off**: iOS simulator requires `localhost`. Will need platform detection for production.

### 2. Custom Header Authentication (Temporary)

**Current**: `x-user-id` header with hardcoded UUID

**Why**: Rapid prototyping without auth overhead

**Limitations**: Not secure, no session management

**Migration Plan**:
1. Implement Supabase Auth
2. Extract user_id from JWT token
3. Enable strict Row Level Security policies
4. Remove x-user-id header

### 3. Redux Toolkit Over Context API

**Decision**: Redux Toolkit with createAsyncThunk

**Why**:
- Built-in async lifecycle (pending/fulfilled/rejected)
- DevTools for debugging
- Scalable for complex state
- Excellent TypeScript support

**Alternative Considered**: React Context + useReducer (rejected due to manual async handling)

### 4. OpenAI Function Calling with Zod Validation

**Decision**: Use OpenAI's function calling feature + Zod schema validation

**Why**:
- Forces structured responses (not free-form text)
- Reduces AI hallucination
- Type-safe recipe objects
- Easy error handling

**Flow**:
```
OpenAI returns function_call.arguments (JSON string)
    ↓
JSON.parse()
    ↓
RecipeSchema.parse() [Zod validation]
    ↓
Typed Recipe object
```

### 5. PostgreSQL Enums vs Lookup Tables

**Decision**: Native PostgreSQL ENUM types for categories and units

**Why**:
- Database-level validation (data integrity)
- Better performance than JOINs
- Self-documenting schema

**Trade-off**: Harder to modify than lookup tables, but categories/units are stable.

---

## Code Repository

**GitHub**: [https://github.com/S-Hellier/MAS-JAS](https://github.com/S-Hellier/MAS-JAS)

**Branch Strategy**:
- `main`: Stable code
- Feature branches: `inventory-frontend`, `recipe` (merged)

**Key Commits**:
- `6b50865`: Merged inventory frontend
- `8ac330b`: Manual pantry item addition
- `2f9616a`: Frontend boilerplate
- `a92ef60`: Merged inventory management backend

---

## Team

**Course**: CS4261 - Mobile Application Development
**Sprint**: 3
**Team**: S-Hellier, JAS
**Contributors**: S-Hellier (GitHub: @S-Hellier)

---

**Document Version**: Sprint 3
**Last Updated**: October 19, 2025
**Status**: Active Development
