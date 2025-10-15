import { createClient } from '@supabase/supabase-js';
import { PantryItemDB } from '../types';
import { SUPABASE_CONFIG } from '../config/supabase';

export const supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);

// Test connection on startup
if (__DEV__) {
  console.log('🔧 Supabase Config:', {
    url: SUPABASE_CONFIG.url ? '✅ Set' : '❌ Missing',
    anonKey: SUPABASE_CONFIG.anonKey ? '✅ Set' : '❌ Missing',
  });
  
  // Test connection
  supabase.from('pantry_items').select('count').limit(1).then(({ data, error }) => {
    if (error) {
      console.error('❌ Supabase connection test failed:', error);
    } else {
      console.log('✅ Supabase connection test successful');
    }
  });
}

// Database operations for pantry items
export class PantryService {
  // Get all pantry items
  static async getPantryItems() {
    const { data, error } = await supabase
      .from('pantry_items')
      .select('*')
      .order('date_added', { ascending: false });
    
    if (error) throw error;
    return data as PantryItemDB[];
  }

  // Add a new pantry item
  static async addPantryItem(item: Omit<PantryItemDB, 'id' | 'created_at' | 'updated_at'>) {
    console.log('Supabase: Attempting to insert item:', item);
    
    const { data, error } = await supabase
      .from('pantry_items')
      .insert([item])
      .select()
      .single();
    
    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }
    
    console.log('Supabase: Item inserted successfully:', data);
    return data as PantryItemDB;
  }

  // Update a pantry item
  static async updatePantryItem(id: string, updates: Partial<PantryItemDB>) {
    const { data, error } = await supabase
      .from('pantry_items')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as PantryItemDB;
  }

  // Delete a pantry item
  static async deletePantryItem(id: string) {
    const { error } = await supabase
      .from('pantry_items')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  // Get items by category
  static async getItemsByCategory(category: string) {
    const { data, error } = await supabase
      .from('pantry_items')
      .select('*')
      .eq('category', category)
      .order('date_added', { ascending: false });
    
    if (error) throw error;
    return data as PantryItemDB[];
  }

  // Get items expiring soon (within 7 days)
  static async getExpiringItems() {
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    
    const { data, error } = await supabase
      .from('pantry_items')
      .select('*')
      .not('expiration_date', 'is', null)
      .lte('expiration_date', sevenDaysFromNow.toISOString())
      .order('expiration_date', { ascending: true });
    
    if (error) throw error;
    return data as PantryItemDB[];
  }
}
