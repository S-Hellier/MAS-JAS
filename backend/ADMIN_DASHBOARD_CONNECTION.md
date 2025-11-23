# Admin Dashboard Connection Guide

This guide explains how to connect your admin dashboard codebase to the backend API endpoints.

## Configuration

### API Base URL
- **Local Development**: `http://localhost:3001/api/v1/admin`
- **Production**: Update this to your production backend URL

### Authentication
All admin endpoints require an API key to be sent in the request header:
- **Header Name**: `x-admin-api-key`
- **API Key**: `e10fc184265409b7d72607f511d2421c5beefdb6a06b5699be33eaccf8c3e222`

⚠️ **Important**: Store this API key securely in your admin dashboard's environment variables. Never commit it to version control.

## Available Endpoints

### 1. Get All Metrics
Get all metrics in a single request.

**Endpoint**: `GET /api/v1/admin/metrics`

**Response**:
```json
{
  "success": true,
  "data": {
    "totalUsers": 42,
    "totalPantryItems": 156,
    "totalRecipes": 89,
    "averageGenerationTimeMs": 2340,
    "average_weekly_recipes_per_user": 2.5,
    "timestamp": "2025-01-26T12:00:00.000Z"
  }
}
```

### 2. Get Overview Metrics
Get basic overview statistics (users, items, recipes).

**Endpoint**: `GET /api/v1/admin/metrics/overview`

**Response**:
```json
{
  "success": true,
  "data": {
    "totalUsers": 42,
    "totalPantryItems": 156,
    "totalRecipes": 89,
    "timestamp": "2025-01-26T12:00:00.000Z"
  }
}
```

### 3. Get Recipe Metrics
Get recipe generation specific metrics.

**Endpoint**: `GET /api/v1/admin/metrics/recipes`

**Response**:
```json
{
  "success": true,
  "data": {
    "totalRecipes": 89,
    "averageGenerationTimeMs": 2340,
    "average_weekly_recipes_per_user": 2.5,
    "timestamp": "2025-01-26T12:00:00.000Z"
  }
}
```

## Example Implementations

### JavaScript/TypeScript (Fetch API)

```typescript
const ADMIN_API_KEY = process.env.ADMIN_API_KEY || 'e10fc184265409b7d72607f511d2421c5beefdb6a06b5699be33eaccf8c3e222';
const API_BASE_URL = 'http://localhost:3001/api/v1/admin';

async function fetchAllMetrics() {
  try {
    const response = await fetch(`${API_BASE_URL}/metrics`, {
      method: 'GET',
      headers: {
        'x-admin-api-key': ADMIN_API_KEY,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching metrics:', error);
    throw error;
  }
}

// Usage
fetchAllMetrics().then(metrics => {
  console.log('Total Users:', metrics.data.totalUsers);
  console.log('Total Items:', metrics.data.totalPantryItems);
  console.log('Total Recipes:', metrics.data.totalRecipes);
});
```

### JavaScript/TypeScript (Axios)

```typescript
import axios from 'axios';

const ADMIN_API_KEY = process.env.ADMIN_API_KEY || 'e10fc184265409b7d72607f511d2421c5beefdb6a06b5699be33eaccf8c3e222';
const API_BASE_URL = 'http://localhost:3001/api/v1/admin';

const adminApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'x-admin-api-key': ADMIN_API_KEY,
    'Content-Type': 'application/json',
  },
});

// Fetch all metrics
async function getAllMetrics() {
  try {
    const response = await adminApi.get('/metrics');
    return response.data;
  } catch (error) {
    console.error('Error fetching metrics:', error);
    throw error;
  }
}

// Fetch overview metrics
async function getOverviewMetrics() {
  try {
    const response = await adminApi.get('/metrics/overview');
    return response.data;
  } catch (error) {
    console.error('Error fetching overview:', error);
    throw error;
  }
}

// Fetch recipe metrics
async function getRecipeMetrics() {
  try {
    const response = await adminApi.get('/metrics/recipes');
    return response.data;
  } catch (error) {
    console.error('Error fetching recipe metrics:', error);
    throw error;
  }
}
```

### Python (Requests)

```python
import os
import requests
from typing import Dict, Any

ADMIN_API_KEY = os.getenv('ADMIN_API_KEY', 'e10fc184265409b7d72607f511d2421c5beefdb6a06b5699be33eaccf8c3e222')
API_BASE_URL = 'http://localhost:3001/api/v1/admin'

headers = {
    'x-admin-api-key': ADMIN_API_KEY,
    'Content-Type': 'application/json',
}

def fetch_all_metrics() -> Dict[str, Any]:
    """Fetch all metrics from the admin API."""
    try:
        response = requests.get(
            f'{API_BASE_URL}/metrics',
            headers=headers
        )
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f'Error fetching metrics: {e}')
        raise

def fetch_overview_metrics() -> Dict[str, Any]:
    """Fetch overview metrics."""
    try:
        response = requests.get(
            f'{API_BASE_URL}/metrics/overview',
            headers=headers
        )
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f'Error fetching overview: {e}')
        raise

def fetch_recipe_metrics() -> Dict[str, Any]:
    """Fetch recipe generation metrics."""
    try:
        response = requests.get(
            f'{API_BASE_URL}/metrics/recipes',
            headers=headers
        )
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f'Error fetching recipe metrics: {e}')
        raise

# Usage example
if __name__ == '__main__':
    metrics = fetch_all_metrics()
    print(f"Total Users: {metrics['data']['totalUsers']}")
    print(f"Total Items: {metrics['data']['totalPantryItems']}")
    print(f"Total Recipes: {metrics['data']['totalRecipes']}")
```

### React Hook Example

```typescript
import { useState, useEffect } from 'react';

const ADMIN_API_KEY = process.env.REACT_APP_ADMIN_API_KEY || 'e10fc184265409b7d72607f511d2421c5beefdb6a06b5699be33eaccf8c3e222';
const API_BASE_URL = 'http://localhost:3001/api/v1/admin';

interface Metrics {
  totalUsers: number;
  totalPantryItems: number;
  totalRecipes: number;
  averageGenerationTimeMs: number;
  average_weekly_recipes_per_user: number;
  timestamp: string;
}

export function useAdminMetrics() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMetrics() {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/metrics`, {
          headers: {
            'x-admin-api-key': ADMIN_API_KEY,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch metrics: ${response.statusText}`);
        }

        const data = await response.json();
        if (data.success) {
          setMetrics(data.data);
        } else {
          throw new Error(data.error || 'Failed to fetch metrics');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchMetrics();
  }, []);

  return { metrics, loading, error };
}
```

## Error Responses

If authentication fails or an error occurs, you'll receive an error response:

```json
{
  "success": false,
  "error": "Unauthorized - Invalid admin API key"
}
```

**HTTP Status Codes**:
- `200`: Success
- `401`: Unauthorized (invalid or missing API key)
- `500`: Internal server error

## CORS Configuration

The backend is configured to allow all origins in development mode. For production, you may need to configure CORS to allow your admin dashboard domain.

## Environment Variables

In your admin dashboard codebase, create a `.env` file:

```env
ADMIN_API_KEY=e10fc184265409b7d72607f511d2421c5beefdb6a06b5699be33eaccf8c3e222
API_BASE_URL=http://localhost:3001/api/v1/admin
```

**For production**, update `API_BASE_URL` to your production backend URL.

## Testing the Connection

You can test the connection using curl:

```bash
curl -X GET http://localhost:3001/api/v1/admin/metrics \
  -H "x-admin-api-key: e10fc184265409b7d72607f511d2421c5beefdb6a06b5699be33eaccf8c3e222" \
  -H "Content-Type: application/json"
```

Or using a tool like Postman or Insomnia:
1. Set the request method to `GET`
2. Set the URL to `http://localhost:3001/api/v1/admin/metrics`
3. Add a header: `x-admin-api-key` with the API key value
4. Send the request

## Notes

- The backend must be running for these endpoints to work
- All timestamps are in ISO 8601 format (UTC)
- Metrics are calculated in real-time from the database
- The `recipe_generations` table must exist (migration 005) for recipe metrics to work

