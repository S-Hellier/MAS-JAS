export enum FoodCategory {
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

export enum QuantityUnit {
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

export interface NutritionInfo {
  calories?: number;
  protein?: number; // grams
  carbohydrates?: number; // grams
  fat?: number; // grams
  fiber?: number; // grams
  sugar?: number; // grams
  sodium?: number; // milligrams
  servingSize?: string;
  servingUnit?: string;
}

export interface PantryItem {
  id: string;
  name: string;
  brand?: string;
  quantity: number;
  unit: QuantityUnit;
  category: FoodCategory;
  expirationDate: Date;
  dateAdded: Date;
  dateUpdated: Date;
  nutritionInfo?: NutritionInfo;
  barcode?: string;
  images?: string[]; // URLs to stored images
  notes?: string;
  userId: string; // For multi-user support
}

export interface CreatePantryItemRequest {
  name: string;
  brand?: string;
  quantity: number;
  unit: QuantityUnit;
  category: FoodCategory;
  expirationDate: string; // ISO date string
  nutritionInfo?: NutritionInfo;
  barcode?: string;
  images?: string[];
  notes?: string;
}

export interface UpdatePantryItemRequest {
  name?: string;
  brand?: string;
  quantity?: number;
  unit?: QuantityUnit;
  category?: FoodCategory;
  expirationDate?: string; // ISO date string
  nutritionInfo?: NutritionInfo;
  barcode?: string;
  images?: string[];
  notes?: string;
}

export interface PantryItemResponse {
  success: boolean;
  data?: PantryItem;
  error?: string;
}

export interface PantryItemsResponse {
  success: boolean;
  data?: PantryItem[];
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PantryFilterOptions {
  category?: FoodCategory;
  expiringSoon?: boolean; // Items expiring within 7 days
  expired?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'expirationDate' | 'dateAdded';
  sortOrder?: 'asc' | 'desc';
}

export interface BarcodeLookupResponse {
  success: boolean;
  data?: {
    name: string;
    brand?: string;
    category: FoodCategory;
    nutritionInfo?: NutritionInfo;
    images?: string[];
  };
  error?: string;
}
