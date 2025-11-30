import { Router } from "express";
import { saveRecipeHandler, getSavedRecipesHandler, deleteRecipeHandler } from "../controllers/recipe.controller";
import { generateRecipeForUser } from "../controllers/generate-recipes";
import { authMiddleware } from "../services/auth.middleware";
import { supabaseAdmin } from "../config/supabase";

const router = Router();


// All recipe routes require auth
router.use(authMiddleware);

router.post("/generate", async (req, res) => {
  const startTime = Date.now();
  const userId = req.headers['x-user-id'] as string || 'default-user';
  
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { allergies, diets } = req.body;
    const recipe = await generateRecipeForUser({ userId, allergies, diets });

    const generationTime = Date.now() - startTime;
    
    // Store recipe generation in database for metrics
    if (supabaseAdmin) {
      try {
        await supabaseAdmin.from('recipe_generations').insert({
          user_id: userId,
          recipe_title: recipe.title,
          generation_time_ms: generationTime,
          created_at: new Date().toISOString(),
        });
      } catch (dbError) {
        // Table might not exist yet - that's okay, metrics will still work
        console.log('Could not store recipe generation (table may not exist):', dbError);
      }
    }
    
    res.json({ 
      success: true,
      recipe,
      generationTimeMs: generationTime 
    });
    return;
  } catch (err: any) {
    console.error("Recipe generation failed:", err);
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
    return;
  }
});
router.post("/save", saveRecipeHandler);
router.get("/saved", authMiddleware, getSavedRecipesHandler);
router.delete("/delete/:id", authMiddleware, deleteRecipeHandler);


export default router;
