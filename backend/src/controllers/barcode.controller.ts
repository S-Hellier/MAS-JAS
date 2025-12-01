import { Request, Response } from 'express';
import axios from 'axios';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
  suggestedExpirationDate?: string; // AI-suggested expiration date (YYYY-MM-DD)
}

/**
 * Suggest an expiration date for a product using AI
 * 
 * @param productName - The name of the product
 * @param category - The product category
 * @returns Suggested expiration date in ISO format (YYYY-MM-DD)
 */
async function suggestExpirationDate(productName: string, category?: string): Promise<string | null> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      console.log('OpenAI API key not configured, skipping expiration date suggestion');
      return null;
    }

    const prompt = `You are a food safety expert. Based on the product information below, suggest a reasonable expiration date from today.

Product: ${productName}
Category: ${category || 'unknown'}

Guidelines:
- Fresh produce (fruits, vegetables): 3-7 days
- Fresh dairy (milk, yogurt): 7-14 days  
- Fresh meat/seafood: 1-3 days
- Bread/bakery: 3-7 days
- Frozen foods: 3-6 months
- Canned goods: 1-2 years
- Dry goods (rice, pasta, flour): 6-12 months
- Condiments (opened): 1-3 months
- Snacks (chips, cookies): 1-3 months
- Beverages (unopened): 3-12 months

Respond with ONLY a number representing days from today (e.g., "7" for 7 days, "365" for 1 year).
Be conservative - suggest shorter dates when uncertain.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a food safety expert that suggests realistic expiration dates. Respond only with a number of days.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 10,
    });

    const daysFromNow = parseInt(completion.choices[0].message.content?.trim() || '0');
    
    if (isNaN(daysFromNow) || daysFromNow <= 0) {
      console.log('Invalid AI response for expiration date');
      return null;
    }

    // Calculate the expiration date
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + daysFromNow);
    
    // Format as YYYY-MM-DD
    const formattedDate = expirationDate.toISOString().split('T')[0];
    
    console.log(`AI suggested expiration: ${daysFromNow} days (${formattedDate}) for ${productName}`);
    return formattedDate;

  } catch (error) {
    console.error('Error suggesting expiration date:', error);
    return null;
  }
}

/**
 * Lookup product information by barcode
 * 
 * This endpoint calls the Open Food Facts API to get product details
 * and uses AI to suggest a reasonable expiration date
 * 
 * @route GET /api/v1/barcode/lookup/:barcode
 * @param barcode - The barcode number (EAN-13, UPC-A, etc.)
 * @returns Product information including name, brand, nutrition facts, and suggested expiration date
 */
export const lookupBarcode = async (req: Request, res: Response) => {
  try {
    let { barcode } = req.params;

    // Decode URL encoding if present (Express usually does this, but be safe)
    try {
      barcode = decodeURIComponent(barcode);
    } catch (e) {
      // If decoding fails, use original value
    }

    // Store original for error messages
    const originalBarcode = barcode;
    
    // Trim whitespace and remove any non-numeric characters (dashes, spaces, etc.)
    // This handles cases where barcodes might be formatted like "123-456-789"
    const cleanedBarcode = barcode.trim().replace(/[^\d]/g, '');
    
    // Check if barcode had non-numeric characters
    const hadNonNumeric = cleanedBarcode.length !== barcode.trim().length;
    
    // Use cleaned barcode for validation and lookup
    barcode = cleanedBarcode;

    // Validate barcode parameter
    if (!barcode || barcode === '') {
      return res.status(400).json({
        success: false,
        error: 'Barcode is required',
        message: `The barcode "${originalBarcode}" contains no numeric digits. Open Food Facts only supports numeric barcodes.`,
      });
    }

    // Validate barcode format (should be numeric and reasonable length)
    // Allow 6-18 digits to support various barcode formats:
    // - UPC-A: 12 digits
    // - EAN-13: 13 digits
    // - EAN-8: 8 digits
    // - Some internal/store barcodes: 6-7 digits
    // - EAN-18/SSCC: up to 18 digits
    if (!/^\d{6,18}$/.test(barcode)) {
      return res.status(400).json({
        success: false,
        error: `Invalid barcode format. Barcode should be 6-18 numeric digits.`,
        message: `Received: "${originalBarcode}" (cleaned to "${barcode}", ${barcode.length} digits). ${hadNonNumeric ? 'Non-numeric characters were removed.' : ''}`,
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

    // Use AI to suggest an expiration date
    const suggestedExpiration = await suggestExpirationDate(
      productInfo.name,
      productInfo.category
    );
    
    // Add suggested expiration date if AI provided one
    if (suggestedExpiration) {
      productInfo.suggestedExpirationDate = suggestedExpiration;
    }

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

