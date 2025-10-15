// Food categories for pantry items
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

// Quantity units for pantry items (matching database schema)
export enum QuantityUnit {
  PIECES = 'pieces',
  POUNDS = 'lbs',
  OUNCES = 'oz',
  GRAMS = 'g',
  KILOGRAMS = 'kg',
  CUPS = 'cups',
  LITERS = 'L',
  MILLILITERS = 'mL',
  GALLONS = 'gal',
  QUARTS = 'qt',
  PINTS = 'pt'
}

// Input method for pantry items
export enum InputMethod {
  BARCODE_SCAN = 'barcode_scan',
  CAMERA_PHOTO = 'camera_photo',
  MANUAL = 'manual'
}

// Nutrition information interface
export interface NutritionInfo {
  calories?: number;
  protein?: number; // in grams
  carbohydrates?: number; // in grams
  fat?: number; // in grams
  fiber?: number; // in grams
  sugar?: number; // in grams
  sodium?: number; // in mg
  servingSize?: string;
}

// Main pantry item interface
export interface PantryItem {
  id: string;
  name: string;
  brand?: string;
  category: FoodCategory;
  quantity: number;
  unit: QuantityUnit;
  expirationDate?: Date;
  dateAdded: Date;
  inputMethod: InputMethod;
  barcode?: string; // if scanned
  images?: string[]; // URLs to stored images
  nutritionInfo?: NutritionInfo;
  notes?: string;
}

// Database schema interface (matches Supabase table)
export interface PantryItemDB {
  id: string;
  name: string;
  brand?: string;
  category: string;
  quantity: number;
  unit: string;
  expiration_date?: string; // ISO date string
  date_added: string; // ISO date string
  input_method: string;
  barcode?: string;
  images?: string[];
  nutrition_info?: any; // JSON object
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Filter options for pantry view
export interface PantryFilter {
  category?: FoodCategory;
  expiringSoon?: boolean; // items expiring within 7 days
  searchTerm?: string;
}

// Camera photo data
export interface PhotoData {
  uri: string;
  width: number;
  height: number;
  type?: string;
}

// Barcode scan result
export interface BarcodeResult {
  data: string;
  type: string;
}
