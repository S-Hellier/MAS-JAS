import { Router } from "express";
import { saveRecipeHandler, getSavedRecipesHandler, deleteRecipeHandler } from "@/controllers/recipe.controller";
import { generateRecipeForUser } from "@/controllers/generate-recipes";
import { authMiddleware } from "@/services/auth.middleware";
import { supabase } from "@/config/supabase";

const router = Router();

// All recipe routes require auth
router.use(authMiddleware);

router.post("/generate", async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { allergies, diets } = req.body;
    const recipe = await generateRecipeForUser({ userId, allergies, diets });
    res.json({ recipe });
  } catch (err: any) {
    console.error("Recipe generation failed:", err);
    res.status(500).json({ error: err.message });
  }
});
router.post("/save", saveRecipeHandler);
router.get("/saved", authMiddleware, getSavedRecipesHandler);
router.delete("/delete/:id", authMiddleware, deleteRecipeHandler);


export default router;
