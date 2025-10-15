import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { PantryItem, PantryFilterOptions, CreatePantryItemRequest, UpdatePantryItemRequest } from '../types/pantry.types';
import { apiService } from '../services/api.service';

// Async thunks for API calls
export const fetchPantryItems = createAsyncThunk(
  'pantry/fetchItems',
  async (options: PantryFilterOptions = {}) => {
    const response = await apiService.getPantryItems(options);
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch pantry items');
    }
    return response;
  }
);

export const fetchPantryItem = createAsyncThunk(
  'pantry/fetchItem',
  async (id: string) => {
    const response = await apiService.getPantryItem(id);
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch pantry item');
    }
    return response.data;
  }
);

export const createPantryItem = createAsyncThunk(
  'pantry/createItem',
  async (item: CreatePantryItemRequest) => {
    const response = await apiService.createPantryItem(item);
    if (!response.success) {
      throw new Error(response.error || 'Failed to create pantry item');
    }
    return response.data;
  }
);

export const updatePantryItem = createAsyncThunk(
  'pantry/updateItem',
  async ({ id, item }: { id: string; item: UpdatePantryItemRequest }) => {
    const response = await apiService.updatePantryItem(id, item);
    if (!response.success) {
      throw new Error(response.error || 'Failed to update pantry item');
    }
    return response.data;
  }
);

export const deletePantryItem = createAsyncThunk(
  'pantry/deleteItem',
  async (id: string) => {
    const response = await apiService.deletePantryItem(id);
    if (!response.success) {
      throw new Error(response.error || 'Failed to delete pantry item');
    }
    return id;
  }
);

export const fetchExpiringItems = createAsyncThunk(
  'pantry/fetchExpiringItems',
  async (days: number = 7) => {
    const response = await apiService.getItemsExpiringSoon(days);
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch expiring items');
    }
    return response.data || [];
  }
);

export const fetchExpiredItems = createAsyncThunk(
  'pantry/fetchExpiredItems',
  async () => {
    const response = await apiService.getExpiredItems();
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch expired items');
    }
    return response.data || [];
  }
);

interface PantryState {
  items: PantryItem[];
  expiringItems: PantryItem[];
  expiredItems: PantryItem[];
  selectedItem: PantryItem | null;
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null;
  filters: PantryFilterOptions;
}

const initialState: PantryState = {
  items: [],
  expiringItems: [],
  expiredItems: [],
  selectedItem: null,
  loading: false,
  error: null,
  pagination: null,
  filters: {
    page: 1,
    limit: 20,
    sortBy: 'dateAdded',
    sortOrder: 'desc',
  },
};

const pantrySlice = createSlice({
  name: 'pantry',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setFilters: (state, action: PayloadAction<PantryFilterOptions>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        page: 1,
        limit: 20,
        sortBy: 'dateAdded',
        sortOrder: 'desc',
      };
    },
    setSelectedItem: (state, action: PayloadAction<PantryItem | null>) => {
      state.selectedItem = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch pantry items
    builder
      .addCase(fetchPantryItems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPantryItems.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data || [];
        state.pagination = action.payload.pagination || null;
      })
      .addCase(fetchPantryItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch pantry items';
      });

    // Fetch single pantry item
    builder
      .addCase(fetchPantryItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPantryItem.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedItem = action.payload;
      })
      .addCase(fetchPantryItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch pantry item';
      });

    // Create pantry item
    builder
      .addCase(createPantryItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPantryItem.fulfilled, (state, action) => {
        state.loading = false;
        state.items.unshift(action.payload);
      })
      .addCase(createPantryItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create pantry item';
      });

    // Update pantry item
    builder
      .addCase(updatePantryItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePantryItem.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.selectedItem?.id === action.payload.id) {
          state.selectedItem = action.payload;
        }
      })
      .addCase(updatePantryItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update pantry item';
      });

    // Delete pantry item
    builder
      .addCase(deletePantryItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePantryItem.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter(item => item.id !== action.payload);
        if (state.selectedItem?.id === action.payload) {
          state.selectedItem = null;
        }
      })
      .addCase(deletePantryItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete pantry item';
      });

    // Fetch expiring items
    builder
      .addCase(fetchExpiringItems.fulfilled, (state, action) => {
        state.expiringItems = action.payload;
      });

    // Fetch expired items
    builder
      .addCase(fetchExpiredItems.fulfilled, (state, action) => {
        state.expiredItems = action.payload;
      });
  },
});

export const { clearError, setFilters, clearFilters, setSelectedItem } = pantrySlice.actions;
export default pantrySlice.reducer;
