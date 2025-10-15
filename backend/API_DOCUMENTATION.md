# Pantry App API Documentation

## Overview

The Pantry App API provides comprehensive endpoints for managing pantry inventory, including CRUD operations, filtering, and specialized queries for expiration management.

**Base URL**: `http://localhost:3001/api/v1/pantry`

**Health Check**: `http://localhost:3001/health`

## Authentication

Currently uses a placeholder user system. Include the `x-user-id` header in all requests:

```http
x-user-id: your-user-id
```

In production, this will be replaced with JWT authentication via Supabase Auth.

## Response Format

All API responses follow this structure:

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "pagination": { ... } // Only for paginated responses
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

## Data Types

### Food Categories
```typescript
enum FoodCategory {
  PRODUCE = 'produce',
  GRAINS = 'grains',
  MEAT = 'meat',
  DAIRY = 'dairy',
  SEAFOOD = 'seafood',
  BEVERAGES = 'beverages',
  SNACKS = 'snacks',
  CONDIMENTS = 'condiments',
  FROZEN = 'frozen',
  CANNED = 'canned',
  BAKERY = 'bakery',
  SPICES = 'spices',
  OTHER = 'other'
}
```

### Quantity Units
```typescript
enum QuantityUnit {
  PIECES = 'pieces',
  GRAMS = 'grams',
  KILOGRAMS = 'kilograms',
  POUNDS = 'pounds',
  OUNCES = 'ounces',
  LITERS = 'liters',
  MILLILITERS = 'milliliters',
  CUPS = 'cups',
  TABLESPOONS = 'tablespoons',
  TEASPOONS = 'teaspoons',
  PACKAGES = 'packages',
  CANS = 'cans',
  BOTTLES = 'bottles'
}
```

### Nutrition Information
```typescript
interface NutritionInfo {
  calories?: number;
  protein?: number;        // grams
  carbohydrates?: number;  // grams
  fat?: number;           // grams
  fiber?: number;         // grams
  sugar?: number;         // grams
  sodium?: number;        // milligrams
  servingSize?: string;
  servingUnit?: string;
}
```

### Pantry Item
```typescript
interface PantryItem {
  id: string;
  name: string;
  brand?: string;
  quantity: number;
  unit: QuantityUnit;
  category: FoodCategory;
  expirationDate: string; // ISO date string
  dateAdded: string;      // ISO timestamp
  dateUpdated: string;    // ISO timestamp
  nutritionInfo?: NutritionInfo;
  barcode?: string;
  images?: string[];      // Array of image URLs
  notes?: string;
  userId: string;
}
```

## Endpoints

### 1. Create Pantry Item

**POST** `/api/v1/pantry`

Creates a new pantry item.

#### Request Body
```json
{
  "name": "Organic Bananas",
  "brand": "Whole Foods",
  "quantity": 6,
  "unit": "pieces",
  "category": "produce",
  "expirationDate": "2024-01-15",
  "nutritionInfo": {
    "calories": 105,
    "protein": 1.3,
    "carbohydrates": 27,
    "fat": 0.4,
    "fiber": 3.1,
    "sugar": 14.4,
    "sodium": 1,
    "servingSize": "1",
    "servingUnit": "medium banana"
  },
  "barcode": "1234567890123",
  "images": ["https://example.com/banana.jpg"],
  "notes": "Perfect ripeness for smoothies"
}
```

#### Required Fields
- `name` (string): Item name
- `quantity` (number): Quantity amount
- `unit` (string): Quantity unit
- `category` (string): Food category
- `expirationDate` (string): Date in YYYY-MM-DD format

#### Optional Fields
- `brand` (string): Brand name
- `nutritionInfo` (object): Nutritional information
- `barcode` (string): Product barcode
- `images` (array): Array of image URLs
- `notes` (string): Additional notes

#### Response
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "name": "Organic Bananas",
    "brand": "Whole Foods",
    "quantity": 6,
    "unit": "pieces",
    "category": "produce",
    "expirationDate": "2024-01-15T00:00:00.000Z",
    "dateAdded": "2024-01-10T10:30:00.000Z",
    "dateUpdated": "2024-01-10T10:30:00.000Z",
    "nutritionInfo": { ... },
    "barcode": "1234567890123",
    "images": ["https://example.com/banana.jpg"],
    "notes": "Perfect ripeness for smoothies",
    "userId": "default-user"
  }
}
```

### 2. Get All Pantry Items

**GET** `/api/v1/pantry`

Retrieves all pantry items with optional filtering and pagination.

#### Query Parameters
- `category` (string): Filter by food category
- `expiringSoon` (boolean): Show items expiring within 7 days
- `expired` (boolean): Show expired items
- `search` (string): Search in name and brand
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20)
- `sortBy` (string): Sort field (`name`, `expirationDate`, `dateAdded`)
- `sortOrder` (string): Sort direction (`asc`, `desc`)

#### Example Request
```http
GET /api/v1/pantry?category=produce&expiringSoon=true&page=1&limit=10&sortBy=expirationDate&sortOrder=asc
x-user-id: default-user
```

#### Response
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-1",
      "name": "Organic Bananas",
      "brand": "Whole Foods",
      "quantity": 6,
      "unit": "pieces",
      "category": "produce",
      "expirationDate": "2024-01-15T00:00:00.000Z",
      "dateAdded": "2024-01-10T10:30:00.000Z",
      "dateUpdated": "2024-01-10T10:30:00.000Z",
      "nutritionInfo": { ... },
      "barcode": "1234567890123",
      "images": ["https://example.com/banana.jpg"],
      "notes": "Perfect ripeness for smoothies",
      "userId": "default-user"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

### 3. Get Single Pantry Item

**GET** `/api/v1/pantry/{item-id}`

Retrieves a specific pantry item by ID.

#### Path Parameters
- `item-id` (string): UUID of the pantry item

#### Response
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "name": "Organic Bananas",
    "brand": "Whole Foods",
    "quantity": 6,
    "unit": "pieces",
    "category": "produce",
    "expirationDate": "2024-01-15T00:00:00.000Z",
    "dateAdded": "2024-01-10T10:30:00.000Z",
    "dateUpdated": "2024-01-10T10:30:00.000Z",
    "nutritionInfo": { ... },
    "barcode": "1234567890123",
    "images": ["https://example.com/banana.jpg"],
    "notes": "Perfect ripeness for smoothies",
    "userId": "default-user"
  }
}
```

### 4. Update Pantry Item

**PUT** `/api/v1/pantry/{item-id}`

Updates an existing pantry item. All fields are optional.

#### Path Parameters
- `item-id` (string): UUID of the pantry item

#### Request Body
```json
{
  "quantity": 4,
  "notes": "Updated notes about the item"
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "name": "Organic Bananas",
    "brand": "Whole Foods",
    "quantity": 4,
    "unit": "pieces",
    "category": "produce",
    "expirationDate": "2024-01-15T00:00:00.000Z",
    "dateAdded": "2024-01-10T10:30:00.000Z",
    "dateUpdated": "2024-01-10T11:45:00.000Z",
    "nutritionInfo": { ... },
    "barcode": "1234567890123",
    "images": ["https://example.com/banana.jpg"],
    "notes": "Updated notes about the item",
    "userId": "default-user"
  }
}
```

### 5. Delete Pantry Item

**DELETE** `/api/v1/pantry/{item-id}`

Deletes a pantry item.

#### Path Parameters
- `item-id` (string): UUID of the pantry item

#### Response
```json
{
  "success": true
}
```

### 6. Get Items Expiring Soon

**GET** `/api/v1/pantry/expiring`

Retrieves items that are expiring within a specified number of days.

#### Query Parameters
- `days` (number): Number of days ahead to check (default: 7)

#### Example Request
```http
GET /api/v1/pantry/expiring?days=3
x-user-id: default-user
```

#### Response
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-1",
      "name": "Organic Bananas",
      "brand": "Whole Foods",
      "quantity": 6,
      "unit": "pieces",
      "category": "produce",
      "expirationDate": "2024-01-13T00:00:00.000Z",
      "dateAdded": "2024-01-10T10:30:00.000Z",
      "dateUpdated": "2024-01-10T10:30:00.000Z",
      "nutritionInfo": { ... },
      "barcode": "1234567890123",
      "images": ["https://example.com/banana.jpg"],
      "notes": "Perfect ripeness for smoothies",
      "userId": "default-user"
    }
  ]
}
```

### 7. Get Expired Items

**GET** `/api/v1/pantry/expired`

Retrieves all expired items.

#### Response
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-2",
      "name": "Expired Bread",
      "brand": "Wonder",
      "quantity": 1,
      "unit": "pieces",
      "category": "bakery",
      "expirationDate": "2024-01-08T00:00:00.000Z",
      "dateAdded": "2024-01-05T10:30:00.000Z",
      "dateUpdated": "2024-01-05T10:30:00.000Z",
      "nutritionInfo": { ... },
      "barcode": "5555555555555",
      "images": [],
      "notes": "White bread - expired",
      "userId": "default-user"
    }
  ]
}
```

### 8. Check Barcode

**GET** `/api/v1/pantry/barcode/{barcode}`

Checks if a barcode already exists in the system.

#### Path Parameters
- `barcode` (string): The barcode to check

#### Response
```json
{
  "success": true,
  "data": {
    "exists": true
  }
}
```

## Error Codes

### 400 Bad Request
- Invalid request body
- Missing required fields
- Invalid data types
- Validation errors

### 404 Not Found
- Pantry item not found
- Invalid item ID

### 500 Internal Server Error
- Database connection issues
- Server errors

## Example Usage

### Creating a New Item
```bash
curl -X POST http://localhost:3001/api/v1/pantry \
  -H "Content-Type: application/json" \
  -H "x-user-id: default-user" \
  -d '{
    "name": "Greek Yogurt",
    "brand": "Chobani",
    "quantity": 4,
    "unit": "pieces",
    "category": "dairy",
    "expirationDate": "2024-01-20",
    "nutritionInfo": {
      "calories": 100,
      "protein": 15,
      "carbohydrates": 6,
      "fat": 0
    },
    "barcode": "5555555555555"
  }'
```

### Getting Items by Category
```bash
curl -X GET "http://localhost:3001/api/v1/pantry?category=dairy&sortBy=expirationDate&sortOrder=asc" \
  -H "x-user-id: default-user"
```

### Updating Item Quantity
```bash
curl -X PUT http://localhost:3001/api/v1/pantry/uuid-here \
  -H "Content-Type: application/json" \
  -H "x-user-id: default-user" \
  -d '{
    "quantity": 2
  }'
```

## Rate Limiting

Currently no rate limiting is implemented. In production, consider implementing rate limiting to prevent abuse.

## CORS

CORS is configured to allow requests from `http://localhost:3000` by default. Update the `CORS_ORIGIN` environment variable for production.

## Health Check

**GET** `/health`

Returns the health status of the API.

#### Response
```json
{
  "status": "healthy",
  "timestamp": "2024-01-10T10:30:00.000Z",
  "version": "1.0.0"
}
```
