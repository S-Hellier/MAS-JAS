import { Request, Response } from "express";
import { RecipeSchema } from "@/types/recipe.types";
import { RecipeService } from "@/services/recipe.service";
import { z } from "zod";

const recipeService = new RecipeService();

export const saveRecipeHandler = async (req: Request, res: Response) => {
  try {

    
    const parsed = RecipeSchema.parse(req.body);

    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const saved = await recipeService.saveRecipe(userId, parsed);

    return res.status(200).json({
      message: "Recipe saved successfully",
      recipe: saved,
    });
  } catch (error: any) {
    console.error("Failed to save recipe:", error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "Invalid recipe format",
        details: error.errors,
      });
    }

    return res.status(500).json({ error: error.message });
  }
};