// services/recipe.service.ts
import { supabase } from "@/config/supabase";
import { Recipe } from "@/types/recipe.types";

export class RecipeService {
  async saveRecipe(userId: string, recipe: Recipe) {
    const { data, error } = await supabase
      .from("recipes")
      .insert([
        {
          user_id: userId,
          title: recipe.title,
          servings: recipe.servings,
          ingredients: recipe.ingredients,
          steps: recipe.steps,
          nutrition: recipe.nutrition ?? null,
        },
      ])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async getSavedRecipes(userId: string) {
    const { data, error } = await supabase
      .from("recipes")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return data;
  }
}
