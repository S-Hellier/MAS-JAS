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
  diet?: string;
  goals?: string;
  food_restrictions?: string[];
  profile_completed?: boolean;
  is_admin?: boolean;
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
  diet?: string;
  goals?: string;
  food_restrictions?: string[];
  profile_completed?: boolean;
}
