import { z } from "zod";

export const RecipeSchema = z.object({
  title: z.string().min(1),
  servings: z.number().int().positive(),
  ingredients: z.array(
    z.object({
      name: z.string(),
      quantity: z.string(),
    })
  ),
  steps: z.array(z.string()).min(1),
  nutrition: z
    .object({
      calories_per_serving: z.number().optional(),
      protein_g: z.number().optional(),
      fat_g: z.number().optional(),
      carbs_g: z.number().optional(),
    })
    .optional(),
});

export type Recipe = z.infer<typeof RecipeSchema>;