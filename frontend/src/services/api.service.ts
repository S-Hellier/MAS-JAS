import axios, { AxiosInstance, AxiosResponse } from 'axios';
import {
  PantryItem,
  CreatePantryItemRequest,
  UpdatePantryItemRequest,
  PantryFilterOptions,
  PantryItemResponse,
  PantryItemsResponse,
  BarcodeLookupResponse,
} from '../types/pantry.types';

class ApiService {
  private api: AxiosInstance;
  private userId: string = '816614f4-b6eb-4806-9e87-0ed87d62c317'; // Default user ID

  constructor() {
    this.api = axios.create({
      baseURL: 'http://localhost:3001/api/v1/pantry',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': this.userId,
      },
    });

    // Add request interceptor to include user ID in all requests
    this.api.interceptors.request.use((config) => {
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

  // Set user ID for API requests
  setUserId(userId: string) {
    this.userId = userId;
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

  async generateRecipe(): Promise<{ recipe: any }> {
    const response: AxiosResponse<{ recipe: any }> = await axios.post(
      'http://localhost:3001/api/v1/recipes/generate',
      {},
      { headers: { 'x-user-id': this.userId } }
    );
    return response.data;
  }
}
// Export singleton instance
export const apiService = new ApiService();
export default apiService;
