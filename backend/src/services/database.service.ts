import { supabaseAdmin } from '@/config/supabase';
import { 
  PantryItem, 
  CreatePantryItemRequest, 
  UpdatePantryItemRequest, 
  PantryFilterOptions,
  FoodCategory,
  QuantityUnit 
} from '@/types/pantry.types';

export class DatabaseService {
  private static instance: DatabaseService;

  private constructor() {}

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  /**
   * Create a new pantry item
   */
  async createPantryItem(userId: string, itemData: CreatePantryItemRequest): Promise<PantryItem> {
    if (!supabaseAdmin) {
      throw new Error('Supabase admin client not configured');
    }

    // Map camelCase to snake_case for database
    const { expirationDate, nutritionInfo, ...restItemData } = itemData;
    
    const { data, error } = await supabaseAdmin
      .from('pantry_items')
      .insert({
        ...restItemData,
        user_id: userId,
        expiration_date: expirationDate,
        nutrition_info: nutritionInfo,
        date_added: new Date().toISOString(),
        date_updated: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create pantry item: ${error.message}`);
    }

    return this.mapDatabaseItemToPantryItem(data);
  }

  /**
   * Get a pantry item by ID
   */
  async getPantryItem(userId: string, itemId: string): Promise<PantryItem | null> {
    if (!supabaseAdmin) {
      throw new Error('Supabase admin client not configured');
    }

    const { data, error } = await supabaseAdmin
      .from('pantry_items')
      .select('*')
      .eq('id', itemId)
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Item not found
      }
      throw new Error(`Failed to get pantry item: ${error.message}`);
    }

    return this.mapDatabaseItemToPantryItem(data);
  }

  /**
   * Get all pantry items with filtering and pagination
   */
  async getPantryItems(userId: string, options: PantryFilterOptions = {}): Promise<{
    items: PantryItem[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    if (!supabaseAdmin) {
      throw new Error('Supabase admin client not configured');
    }

    const {
      category,
      expiringSoon = false,
      expired = false,
      search,
      page = 1,
      limit = 20,
      sortBy = 'date_added',
      sortOrder = 'desc'
    } = options;

    let query = supabaseAdmin
      .from('pantry_items')
      .select('*', { count: 'exact' })
      .eq('user_id', userId);

    // Apply filters
    if (category) {
      query = query.eq('category', category);
    }

    if (expiringSoon) {
      query = query.lte('expiration_date', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    }

    if (expired) {
      query = query.lt('expiration_date', new Date().toISOString().split('T')[0]);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,brand.ilike.%${search}%`);
    }

    // Apply sorting
    const sortColumn = sortBy === 'expirationDate' ? 'expiration_date' : 
                      sortBy === 'dateAdded' ? 'date_added' : sortBy;
    query = query.order(sortColumn, { ascending: sortOrder === 'asc' });

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Failed to get pantry items: ${error.message}`);
    }

    const items = data?.map(item => this.mapDatabaseItemToPantryItem(item)) || [];
    const total = count || 0;
    const totalPages = Math.ceil(total / limit);

    return {
      items,
      total,
      page,
      limit,
      totalPages
    };
  }

  /**
   * Update a pantry item
   */
  async updatePantryItem(
    userId: string, 
    itemId: string, 
    updateData: UpdatePantryItemRequest
  ): Promise<PantryItem> {
    if (!supabaseAdmin) {
      throw new Error('Supabase admin client not configured');
    }

    // Map camelCase to snake_case for database
    const { expirationDate, nutritionInfo, ...restUpdateData } = updateData;
    
    const updateFields: any = {
      ...restUpdateData,
      date_updated: new Date().toISOString()
    };

    if (expirationDate) {
      updateFields.expiration_date = expirationDate;
    }

    if (nutritionInfo !== undefined) {
      updateFields.nutrition_info = nutritionInfo;
    }

    const { data, error } = await supabaseAdmin
      .from('pantry_items')
      .update(updateFields)
      .eq('id', itemId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update pantry item: ${error.message}`);
    }

    return this.mapDatabaseItemToPantryItem(data);
  }

  /**
   * Delete a pantry item
   */
  async deletePantryItem(userId: string, itemId: string): Promise<boolean> {
    if (!supabaseAdmin) {
      throw new Error('Supabase admin client not configured');
    }

    const { error } = await supabaseAdmin
      .from('pantry_items')
      .delete()
      .eq('id', itemId)
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to delete pantry item: ${error.message}`);
    }

    return true;
  }

  /**
   * Get items expiring soon
   */
  async getItemsExpiringSoon(userId: string, daysAhead: number = 7): Promise<PantryItem[]> {
    if (!supabaseAdmin) {
      throw new Error('Supabase admin client not configured');
    }

    const { data, error } = await supabaseAdmin
      .rpc('get_items_expiring_soon', {
        user_uuid: userId,
        days_ahead: daysAhead
      });

    if (error) {
      throw new Error(`Failed to get items expiring soon: ${error.message}`);
    }

    return data?.map(item => this.mapDatabaseItemToPantryItem(item)) || [];
  }

  /**
   * Get expired items
   */
  async getExpiredItems(userId: string): Promise<PantryItem[]> {
    if (!supabaseAdmin) {
      throw new Error('Supabase admin client not configured');
    }

    const { data, error } = await supabaseAdmin
      .rpc('get_expired_items', {
        user_uuid: userId
      });

    if (error) {
      throw new Error(`Failed to get expired items: ${error.message}`);
    }

    return data?.map(item => this.mapDatabaseItemToPantryItem(item)) || [];
  }

  /**
   * Check if barcode exists
   */
  async checkBarcodeExists(barcode: string): Promise<boolean> {
    if (!supabaseAdmin) {
      throw new Error('Supabase admin client not configured');
    }

    const { data, error } = await supabaseAdmin
      .from('pantry_items')
      .select('id')
      .eq('barcode', barcode)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to check barcode: ${error.message}`);
    }

    return !!data;
  }

  /**
   * Map database item to PantryItem interface
   */
  private mapDatabaseItemToPantryItem(dbItem: any): PantryItem {
    return {
      id: dbItem.id,
      name: dbItem.name,
      brand: dbItem.brand,
      quantity: parseFloat(dbItem.quantity),
      unit: dbItem.unit as QuantityUnit,
      category: dbItem.category as FoodCategory,
      expirationDate: new Date(dbItem.expiration_date),
      dateAdded: new Date(dbItem.date_added),
      dateUpdated: new Date(dbItem.date_updated),
      nutritionInfo: dbItem.nutrition_info,
      barcode: dbItem.barcode,
      images: dbItem.images || [],
      notes: dbItem.notes,
      userId: dbItem.user_id
    };
  }
}
