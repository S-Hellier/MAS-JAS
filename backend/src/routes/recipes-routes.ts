import express from "express";
import { generateRecipeForUser } from "@/controllers/generate-recipes";
import { supabaseAdmin } from "@/config/supabase";

const router = express.Router();

router.post("/generate", async (req, res) => {
  const startTime = Date.now();
  const userId = req.headers['x-user-id'] as string || 'default-user';
  
  try {
    const { allergies, diets } = req.body;
    const recipe = await generateRecipeForUser();
    
    const generationTime = Date.now() - startTime;
    
    // Store recipe generation in database for metrics
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
    
    res.json({ 
      success: true,
      recipe,
      generationTimeMs: generationTime 
    });
  } catch (err: any) {
    console.error("Recipe generation failed:", err);
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
});

export default router;