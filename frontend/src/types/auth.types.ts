export enum DietType {
  KETO = 'keto',
  PALEO = 'paleo',
  CARNIVORE = 'carnivore',
  VEGAN = 'vegan',
  VEGETARIAN = 'vegetarian',
  MEDITERRANEAN = 'mediterranean',
  LOW_CARB = 'low_carb',
  NONE = 'none',
}

export enum GoalType {
  LOSE_WEIGHT = 'lose_weight',
  BUILD_MUSCLE = 'build_muscle',
  MAINTAIN_WEIGHT = 'maintain_weight',
  IMPROVE_HEALTH = 'improve_health',
  NONE = 'none',
}

export interface User {
  id: string;
  email: string;
  name?: string;
  diet?: DietType;
  goals?: GoalType;
  food_restrictions?: string[];
  profile_completed?: boolean;
  created_at: string;
  updated_at: string;
}

export interface LoginRequest {
  email: string;
  name?: string;
}

export interface LoginResponse {
  user: User;
  message: string;
}

export interface UpdatePreferencesRequest {
  diet?: DietType;
  goals?: GoalType;
  food_restrictions?: string[];
  profile_completed?: boolean;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  updatePreferences: (preferences: UpdatePreferencesRequest) => Promise<void>;
}
