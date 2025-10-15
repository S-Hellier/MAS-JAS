import { Request, Response } from 'express';
import { DatabaseService } from '@/services/database.service';
import { 
  CreatePantryItemRequest, 
  UpdatePantryItemRequest, 
  PantryFilterOptions,
  PantryItemResponse,
  PantryItemsResponse 
} from '@/types/pantry.types';
import { z } from 'zod';

// Validation schemas
const createPantryItemSchema = z.object({
  name: z.string().min(1).max(255),
  brand: z.string().max(255).optional(),
  quantity: z.number().positive(),
  unit: z.enum(['pieces', 'grams', 'kilograms', 'pounds', 'ounces', 'liters', 'milliliters', 'cups', 'tablespoons', 'teaspoons', 'packages', 'cans', 'bottles']),
  category: z.enum(['produce', 'grains', 'meat', 'dairy', 'seafood', 'beverages', 'snacks', 'condiments', 'frozen', 'canned', 'bakery', 'spices', 'other']),
  expirationDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
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

export class PantryController {
  private dbService: DatabaseService;

  constructor() {
    this.dbService = DatabaseService.getInstance();
  }

  /**
   * Create a new pantry item
   */
  createPantryItem = async (req: Request, res: Response): Promise<void> => {
    try {
      // For now, we'll use a placeholder user ID
      // In production, this would come from authentication middleware
      const userId = req.headers['x-user-id'] as string || 'default-user';

      const validatedData = createPantryItemSchema.parse(req.body);
      
      const pantryItem = await this.dbService.createPantryItem(userId, validatedData);
      
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
      
      const pantryItem = await this.dbService.updatePantryItem(userId, id, validatedData);
      
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
