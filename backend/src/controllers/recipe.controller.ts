// controllers/recipe.controller.ts
import { Request, Response } from "express";
import { RecipeSchema } from "../types/recipe.types";
import { RecipeService } from "../services/recipe.service";
import { z } from "zod";

const recipeService = new RecipeService();

// Save a recipe
export const saveRecipeHandler = async (req: Request, res: Response) => {
  try {
    const parsed = RecipeSchema.parse(req.body);
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const saved = await recipeService.saveRecipe(userId, parsed);

    return res.status(200).json({ message: "Recipe saved successfully", recipe: saved });
  } catch (error: any) {
    console.error("Failed to save recipe:", error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid recipe format", details: error.errors });
    }

    return res.status(500).json({ error: error.message });
  }
};

// Get saved recipes for current user
export const getSavedRecipesHandler = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const recipes = await recipeService.getSavedRecipes(userId);

    return res.status(200).json({ data: recipes });
  } catch (error: any) {
    console.error("Failed to fetch recipes:", error);
    return res.status(500).json({ error: error.message });
  }
};

export const deleteRecipeHandler = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const recipeId = req.params.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const deleted = await recipeService.deleteRecipe(userId, recipeId);

    return res.status(200).json({ message: "Recipe deleted successfully", recipe: deleted });
  } catch (error: any) {
    console.error("Failed to delete recipe:", error);
    return res.status(500).json({ error: error.message });
  }
};
