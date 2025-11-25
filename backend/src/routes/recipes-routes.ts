import { Router } from "express";
import { saveRecipeHandler, getSavedRecipesHandler } from "@/controllers/recipe.controller";
import { generateRecipeForUser } from "@/controllers/generate-recipes";
import { authMiddleware } from "@/services/auth.middleware";
import { supabase } from "@/config/supabase";

const router = Router();

// All recipe routes require auth
router.use(authMiddleware);

router.post("/generate", async (req, res) => { // add leading
  try { 
    const { allergies, diets } = req.body;
    const recipe = await generateRecipeForUser({ allergies, diets });
    res.json({ recipe }); 
  } catch (err: any) { 
    console.error("Recipe generation failed:", err);
    res.status(500).json({ error: err.message }); 
  } 
});

// Save a recipe
router.post("/save", saveRecipeHandler);
router.get("/saved", authMiddleware, getSavedRecipesHandler);


export default router;
