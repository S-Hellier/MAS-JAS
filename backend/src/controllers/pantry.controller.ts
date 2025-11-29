import { Request, Response } from 'express';
import { DatabaseService } from '@/services/database.service';
import { 
  CreatePantryItemRequest, 
  UpdatePantryItemRequest, 
  PantryFilterOptions,
  PantryItemResponse,
  PantryItemsResponse,
  FoodCategory,
  QuantityUnit
} from '@/types/pantry.types';
import { z } from 'zod';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Validation schemas
const createPantryItemSchema = z.object({
  name: z.string().min(1).max(255),
  brand: z.string().max(255).optional(),
  quantity: z.number().positive(),
  unit: z.enum(['pieces', 'grams', 'kilograms', 'pounds', 'ounces', 'liters', 'milliliters', 'cups', 'tablespoons', 'teaspoons', 'packages', 'cans', 'bottles']),
  category: z.enum(['produce', 'grains', 'meat', 'dairy', 'seafood', 'beverages', 'snacks', 'condiments', 'frozen', 'canned', 'bakery', 'spices', 'other']),
  expirationDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal('')), // Allow empty string or valid date - AI will suggest if empty
  nutritionInfo: z.object({
    calories: z.number().optional(),
    protein: z.number().optional(),
    carbohydrates: z.number().optional(),
    fat: z.number().optional(),
    fiber: z.number().optional(),
    sugar: z.number().optional(),
    sodium: z.number().optional(),
    servingSize: z.string().optional(),
    servingUnit: z.string().optional()
  }).optional(),
  barcode: z.string().max(50).optional(),
  images: z.array(z.string()).optional(),
  notes: z.string().optional()
});

const updatePantryItemSchema = createPantryItemSchema.partial();

const pantryFilterSchema = z.object({
  category: z.enum(['produce', 'grains', 'meat', 'dairy', 'seafood', 'beverages', 'snacks', 'condiments', 'frozen', 'canned', 'bakery', 'spices', 'other']).optional(),
  expiringSoon: z.string().transform(val => val === 'true').optional(),
  expired: z.string().transform(val => val === 'true').optional(),
  search: z.string().optional(),
  page: z.string().transform(val => parseInt(val, 10)).optional(),
  limit: z.string().transform(val => parseInt(val, 10)).optional(),
  sortBy: z.enum(['name', 'expirationDate', 'dateAdded']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional()
});

/**
 * Suggest an expiration date for a product using AI
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

export class PantryController {
  private dbService: DatabaseService;

  constructor() {
    this.dbService = DatabaseService.getInstance();
  }

  /**
   * Create a new pantry item
   * If no expiration date is provided, AI will suggest one based on the product
   */
  createPantryItem = async (req: Request, res: Response): Promise<void> => {
    try {
      // For now, we'll use a placeholder user ID
      // In production, this would come from authentication middleware
      const userId = req.headers['x-user-id'] as string || 'default-user';

      const validatedData = createPantryItemSchema.parse(req.body);
      
      // If no expiration date provided (empty string, undefined, or null), use AI to suggest one
      if (!validatedData.expirationDate || validatedData.expirationDate.trim() === '') {
        console.log(`No expiration date provided for "${validatedData.name}", asking AI...`);
        const suggestedDate = await suggestExpirationDate(
          validatedData.name,
          validatedData.category
        );
        
        if (suggestedDate) {
          validatedData.expirationDate = suggestedDate;
          console.log(`AI suggested expiration date: ${suggestedDate}`);
        } else {
          // Fallback: suggest 30 days if AI fails
          const fallbackDate = new Date();
          fallbackDate.setDate(fallbackDate.getDate() + 30);
          validatedData.expirationDate = fallbackDate.toISOString().split('T')[0];
          console.log(`AI failed, using fallback: ${validatedData.expirationDate}`);
        }
      }
      
      // Convert string literals to enum values
      // expirationDate is guaranteed to be set at this point (either from input or AI suggestion)
      const createRequest: CreatePantryItemRequest = {
        ...validatedData,
        expirationDate: validatedData.expirationDate || new Date().toISOString().split('T')[0],
        unit: validatedData.unit as QuantityUnit,
        category: validatedData.category as FoodCategory,
      };
      
      const pantryItem = await this.dbService.createPantryItem(userId, createRequest);
      
      const response: PantryItemResponse = {
        success: true,
        data: pantryItem
      };

      res.status(201).json(response);
    } catch (error) {
      console.error('Error creating pantry item:', error);
      
      const response: PantryItemResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };

      res.status(400).json(response);
    }
  };

  /**
   * Get a specific pantry item
   */
  getPantryItem = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.headers['x-user-id'] as string || 'default-user';
      const { id } = req.params;

      if (!id) {
        const response: PantryItemResponse = {
          success: false,
          error: 'Item ID is required'
        };
        res.status(400).json(response);
        return;
      }

      const pantryItem = await this.dbService.getPantryItem(userId, id);
      
      if (!pantryItem) {
        const response: PantryItemResponse = {
          success: false,
          error: 'Pantry item not found'
        };
        res.status(404).json(response);
        return;
      }

      const response: PantryItemResponse = {
        success: true,
        data: pantryItem
      };

      res.json(response);
    } catch (error) {
      console.error('Error getting pantry item:', error);
      
      const response: PantryItemResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };

      res.status(500).json(response);
    }
  };

  /**
   * Get all pantry items with filtering
   */
  getPantryItems = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.headers['x-user-id'] as string || 'default-user';
      
      const validatedFilters = pantryFilterSchema.parse(req.query);
      const filterOptions: PantryFilterOptions = {
        ...validatedFilters,
        category: validatedFilters.category as FoodCategory | undefined,
        page: validatedFilters.page || 1,
        limit: validatedFilters.limit || 20
      };

      const result = await this.dbService.getPantryItems(userId, filterOptions);
      
      const response: PantryItemsResponse = {
        success: true,
        data: result.items,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages
        }
      };

      res.json(response);
    } catch (error) {
      console.error('Error getting pantry items:', error);
      
      const response: PantryItemsResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };

      res.status(500).json(response);
    }
  };

  /**
   * Update a pantry item
   */
  updatePantryItem = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.headers['x-user-id'] as string || 'default-user';
      const { id } = req.params;

      if (!id) {
        const response: PantryItemResponse = {
          success: false,
          error: 'Item ID is required'
        };
        res.status(400).json(response);
        return;
      }

      const validatedData = updatePantryItemSchema.parse(req.body);
      
      // Convert string literals to enum values
      const updateRequest: UpdatePantryItemRequest = {
        ...validatedData,
        unit: validatedData.unit as QuantityUnit | undefined,
        category: validatedData.category as FoodCategory | undefined,
      };
      
      const pantryItem = await this.dbService.updatePantryItem(userId, id, updateRequest);
      
      const response: PantryItemResponse = {
        success: true,
        data: pantryItem
      };

      res.json(response);
    } catch (error) {
      console.error('Error updating pantry item:', error);
      
      const response: PantryItemResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };

      res.status(400).json(response);
    }
  };

  /**
   * Delete a pantry item
   */
  deletePantryItem = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.headers['x-user-id'] as string || 'default-user';
      const { id } = req.params;

      if (!id) {
        const response: PantryItemResponse = {
          success: false,
          error: 'Item ID is required'
        };
        res.status(400).json(response);
        return;
      }

      await this.dbService.deletePantryItem(userId, id);
      
      const response: PantryItemResponse = {
        success: true
      };

      res.json(response);
    } catch (error) {
      console.error('Error deleting pantry item:', error);
      
      const response: PantryItemResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };

      res.status(500).json(response);
    }
  };

  /**
   * Get items expiring soon
   */
  getItemsExpiringSoon = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.headers['x-user-id'] as string || 'default-user';
      const daysAhead = parseInt(req.query.days as string) || 7;

      const items = await this.dbService.getItemsExpiringSoon(userId, daysAhead);
      
      const response: PantryItemsResponse = {
        success: true,
        data: items
      };

      res.json(response);
    } catch (error) {
      console.error('Error getting items expiring soon:', error);
      
      const response: PantryItemsResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };

      res.status(500).json(response);
    }
  };

  /**
   * Get expired items
   */
  getExpiredItems = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.headers['x-user-id'] as string || 'default-user';

      const items = await this.dbService.getExpiredItems(userId);
      
      const response: PantryItemsResponse = {
        success: true,
        data: items
      };

      res.json(response);
    } catch (error) {
      console.error('Error getting expired items:', error);
      
      const response: PantryItemsResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };

      res.status(500).json(response);
    }
  };

  /**
   * Check if barcode exists
   */
  checkBarcode = async (req: Request, res: Response): Promise<void> => {
    try {
      const { barcode } = req.params;

      if (!barcode) {
        res.status(400).json({
          success: false,
          error: 'Barcode is required'
        });
        return;
      }

      const exists = await this.dbService.checkBarcodeExists(barcode);
      
      res.json({
        success: true,
        data: { exists }
      });
    } catch (error) {
      console.error('Error checking barcode:', error);
      
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  };
}
