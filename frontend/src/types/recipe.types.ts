export interface Recipe {
    id?: string;
    title: string;
    servings: number;
    ingredients: {
      name: string;
      quantity: string;
    }[];
    steps: string[];
    nutrition?: {
      calories_per_serving?: number;
      protein_g?: number;
      fat_g?: number;
      carbs_g?: number;
    };
    created_at?: string;
  }