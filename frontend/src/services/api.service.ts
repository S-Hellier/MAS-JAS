import axios, { AxiosInstance, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Recipe } from "../types/recipe.types";
import {
  PantryItem,
  CreatePantryItemRequest,
  UpdatePantryItemRequest,
  PantryFilterOptions,
  PantryItemResponse,
  PantryItemsResponse,
  BarcodeLookupResponse,
} from '../types/pantry.types';

const AUTH_STORAGE_KEY = '@pantry_app_user';

class ApiService {
  private api: AxiosInstance;
  private userId: string = '';

  constructor() {
    // For Android emulator: use 10.0.2.2 (maps to host's localhost)
    // For iOS simulator: use localhost
    // For physical devices: use your computer's local IP address
    const baseURL = 'http://localhost:3001/api/v1/pantry';

    this.api = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to include user ID in all requests
    this.api.interceptors.request.use(async (config) => {
      // Get user ID from storage if not set
      if (!this.userId) {
        await this.loadUserId();
      }
      config.headers['x-user-id'] = this.userId;
      return config;
    });

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  // Load user ID from AsyncStorage
  private async loadUserId(): Promise<void> {
    try {
      const storedUser = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      if (storedUser) {
        const user = JSON.parse(storedUser);
        this.userId = user.id;
      }
    } catch (error) {
      console.error('Error loading user ID:', error);
    }
  }

  // Set user ID for API requests
  setUserId(userId: string) {
    this.userId = userId;
  }

  // Get current user ID
  getUserId(): string {
    return this.userId;
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string; version: string }> {
    const response: AxiosResponse = await axios.get('http://localhost:3001/health');
    return response.data;
  }

  // Pantry Items CRUD operations
  async getPantryItems(options: PantryFilterOptions = {}): Promise<PantryItemsResponse> {
    const params = new URLSearchParams();
    
    if (options.category) params.append('category', options.category);
    if (options.expiringSoon) params.append('expiringSoon', 'true');
    if (options.expired) params.append('expired', 'true');
    if (options.search) params.append('search', options.search);
    if (options.page) params.append('page', options.page.toString());
    if (options.limit) params.append('limit', options.limit.toString());
    if (options.sortBy) params.append('sortBy', options.sortBy);
    if (options.sortOrder) params.append('sortOrder', options.sortOrder);

    const response: AxiosResponse<PantryItemsResponse> = await this.api.get(`?${params.toString()}`);
    return response.data;
  }

  async getPantryItem(id: string): Promise<PantryItemResponse> {
    const response: AxiosResponse<PantryItemResponse> = await this.api.get(`/${id}`);
    return response.data;
  }

  async createPantryItem(item: CreatePantryItemRequest): Promise<PantryItemResponse> {
    const response: AxiosResponse<PantryItemResponse> = await this.api.post('/', item);
    return response.data;
  }

  async updatePantryItem(id: string, item: UpdatePantryItemRequest): Promise<PantryItemResponse> {
    const response: AxiosResponse<PantryItemResponse> = await this.api.put(`/${id}`, item);
    return response.data;
  }

  async deletePantryItem(id: string): Promise<PantryItemResponse> {
    const response: AxiosResponse<PantryItemResponse> = await this.api.delete(`/${id}`);
    return response.data;
  }

  // Special queries
  async getItemsExpiringSoon(days: number = 7): Promise<PantryItemsResponse> {
    const response: AxiosResponse<PantryItemsResponse> = await this.api.get(`/expiring?days=${days}`);
    return response.data;
  }

  async getExpiredItems(): Promise<PantryItemsResponse> {
    const response: AxiosResponse<PantryItemsResponse> = await this.api.get('/expired');
    return response.data;
  }

  async checkBarcode(barcode: string): Promise<BarcodeLookupResponse> {
    const response: AxiosResponse<BarcodeLookupResponse> = await this.api.get(`/barcode/${barcode}`);
    return response.data;
  }

  /**
   * Look up product information by barcode using Open Food Facts
   * This calls the new barcode lookup endpoint
   */
  async lookupBarcode(barcode: string): Promise<any> {
    const response: AxiosResponse = await axios.get(
      `http://localhost:3001/api/v1/barcode/lookup/${barcode}`,
      {
        headers: { 'x-user-id': this.userId },
        timeout: 15000, // 15 second timeout for external API call
      }
    );
    return response.data;
  }

  async generateRecipe(): Promise<{ recipe: any }> {
    const response: AxiosResponse<{ recipe: any }> = await axios.post(
      'http://localhost:3001/api/v1/recipes/generate',
      {},
      { headers: { 'x-user-id': this.userId } }
    );
    return response.data;
  }

  /**
   * Get items needing expiration notifications
   * Uses smart rule-based thresholds based on shelf life duration
   */
  async getExpiringNotifications(): Promise<any> {
    const response: AxiosResponse = await axios.get(
      'http://localhost:3001/api/v1/notifications/expiring',
      {
        headers: { 'x-user-id': this.userId },
      }
    );
    return response.data;
  }

  async saveRecipe(recipe: any) {
    const response = await axios.post(
      'http://localhost:3001/api/v1/recipes/save',
      recipe,
      { headers: { 'x-user-id': this.userId } }
    );
    return response.data;
  }
  
  async getSavedRecipes(): Promise<Recipe[]> {
    try {
      const response = await axios.get(
        'http://localhost:3001/api/v1/recipes/saved',
        {
          headers: { 
            'x-user-id': this.userId,
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      );
      return response.data.data || [];
    } catch (error: any) {
      console.error(error.message);
      throw error;
    }
  }
  
}
// Export singleton instance
export const apiService = new ApiService();
export default apiService;
