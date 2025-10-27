import { Request, Response } from 'express';
import axios from 'axios';

/**
 * Interface for Open Food Facts API Response
 * This defines the structure of data we get from the API
 */
interface OpenFoodFactsProduct {
  product_name?: string;
  brands?: string;
  categories?: string;
  nutriments?: {
    'energy-kcal_100g'?: number;
    'proteins_100g'?: number;
    'carbohydrates_100g'?: number;
    'fat_100g'?: number;
    'fiber_100g'?: number;
    'sugars_100g'?: number;
    'sodium_100g'?: number;
  };
  serving_size?: string;
  image_url?: string;
  allergens?: string;
}

interface OpenFoodFactsResponse {
  status: number;
  product?: OpenFoodFactsProduct;
  status_verbose?: string;
}

/**
 * Interface for our standardized product response
 * This is what we send back to the frontend
 */
interface ProductInfo {
  name: string;
  brand?: string;
  category?: string;
  nutritionInfo?: {
    calories?: number;
    protein?: number;
    carbohydrates?: number;
    fat?: number;
    fiber?: number;
    sugar?: number;
    sodium?: number;
    servingSize?: string;
  };
  imageUrl?: string;
  allergens?: string;
}

/**
 * Lookup product information by barcode
 * 
 * This endpoint calls the Open Food Facts API to get product details
 * 
 * @route GET /api/v1/barcode/lookup/:barcode
 * @param barcode - The barcode number (EAN-13, UPC-A, etc.)
 * @returns Product information including name, brand, and nutrition facts
 */
export const lookupBarcode = async (req: Request, res: Response) => {
  try {
    const { barcode } = req.params;

    // Validate barcode parameter
    if (!barcode || barcode.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Barcode is required',
      });
    }

    // Validate barcode format (should be numeric and reasonable length)
    if (!/^\d{8,14}$/.test(barcode)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid barcode format. Barcode should be 8-14 digits.',
      });
    }

    console.log(`Looking up barcode: ${barcode}`);

    // Call Open Food Facts API
    // API Documentation: https://world.openfoodfacts.org/data
    const response = await axios.get<OpenFoodFactsResponse>(
      `https://world.openfoodfacts.org/api/v2/product/${barcode}.json`,
      {
        timeout: 10000, // 10 second timeout
        headers: {
          'User-Agent': 'PantryApp/1.0', // Good practice to identify your app
        },
      }
    );

    // Check if product was found
    if (response.data.status !== 1 || !response.data.product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found in database',
        message: 'This barcode is not in the Open Food Facts database. You can add product details manually.',
      });
    }

    const product = response.data.product;

    // Convert Open Food Facts data to our format
    const productInfo: ProductInfo = {
      name: product.product_name || 'Unknown Product',
      brand: product.brands || undefined,
      category: mapCategory(product.categories),
      imageUrl: product.image_url || undefined,
      allergens: product.allergens || undefined,
    };

    // Add nutrition information if available
    if (product.nutriments) {
      productInfo.nutritionInfo = {
        // Convert per 100g to reasonable serving size
        calories: product.nutriments['energy-kcal_100g'] 
          ? Math.round(product.nutriments['energy-kcal_100g']) 
          : undefined,
        protein: product.nutriments['proteins_100g'] 
          ? Number(product.nutriments['proteins_100g'].toFixed(1))
          : undefined,
        carbohydrates: product.nutriments['carbohydrates_100g']
          ? Number(product.nutriments['carbohydrates_100g'].toFixed(1))
          : undefined,
        fat: product.nutriments['fat_100g']
          ? Number(product.nutriments['fat_100g'].toFixed(1))
          : undefined,
        fiber: product.nutriments['fiber_100g']
          ? Number(product.nutriments['fiber_100g'].toFixed(1))
          : undefined,
        sugar: product.nutriments['sugars_100g']
          ? Number(product.nutriments['sugars_100g'].toFixed(1))
          : undefined,
        sodium: product.nutriments['sodium_100g']
          ? Math.round(product.nutriments['sodium_100g'] * 1000) // Convert g to mg
          : undefined,
        servingSize: product.serving_size || '100g',
      };
    }

    console.log(`Product found: ${productInfo.name} by ${productInfo.brand}`);

    // Return successful response
    return res.status(200).json({
      success: true,
      data: productInfo,
    });

  } catch (error) {
    console.error('Error looking up barcode:', error);

    // Handle specific error types
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
        return res.status(504).json({
          success: false,
          error: 'Request timeout',
          message: 'The barcode lookup service is taking too long to respond. Please try again.',
        });
      }

      if (error.response?.status === 404) {
        return res.status(404).json({
          success: false,
          error: 'Product not found',
          message: 'This barcode is not in the database.',
        });
      }
    }

    // Generic error response
    return res.status(500).json({
      success: false,
      error: 'Failed to lookup barcode',
      message: 'An error occurred while looking up the product information.',
    });
  }
};

/**
 * Helper function to map Open Food Facts categories to our app categories
 * Open Food Facts has thousands of categories, so we map to our simpler set
 */
function mapCategory(categories?: string): string | undefined {
  if (!categories) return undefined;

  const categoryLower = categories.toLowerCase();

  // Our app categories: produce, grains, meat, dairy, seafood, beverages,
  // snacks, condiments, frozen, canned, bakery, spices, other

  if (categoryLower.includes('fruit') || categoryLower.includes('vegetable')) {
    return 'produce';
  }
  if (categoryLower.includes('bread') || categoryLower.includes('bakery')) {
    return 'bakery';
  }
  if (categoryLower.includes('dairy') || categoryLower.includes('milk') || 
      categoryLower.includes('cheese') || categoryLower.includes('yogurt')) {
    return 'dairy';
  }
  if (categoryLower.includes('meat') || categoryLower.includes('poultry') || 
      categoryLower.includes('beef') || categoryLower.includes('pork')) {
    return 'meat';
  }
  if (categoryLower.includes('seafood') || categoryLower.includes('fish')) {
    return 'seafood';
  }
  if (categoryLower.includes('beverage') || categoryLower.includes('drink') || 
      categoryLower.includes('juice') || categoryLower.includes('soda')) {
    return 'beverages';
  }
  if (categoryLower.includes('snack') || categoryLower.includes('chip') || 
      categoryLower.includes('cookie')) {
    return 'snacks';
  }
  if (categoryLower.includes('sauce') || categoryLower.includes('condiment') || 
      categoryLower.includes('dressing')) {
    return 'condiments';
  }
  if (categoryLower.includes('frozen')) {
    return 'frozen';
  }
  if (categoryLower.includes('canned') || categoryLower.includes('preserved')) {
    return 'canned';
  }
  if (categoryLower.includes('grain') || categoryLower.includes('cereal') || 
      categoryLower.includes('rice') || categoryLower.includes('pasta')) {
    return 'grains';
  }
  if (categoryLower.includes('spice') || categoryLower.includes('herb') || 
      categoryLower.includes('seasoning')) {
    return 'spices';
  }

  // Default category if no match
  return 'other';
}

