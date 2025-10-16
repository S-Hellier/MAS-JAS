import express from "express";
import { generateRecipeForUser } from "@/controllers/generate-recipes";

const router = express.Router();

router.post("/generate", async (req, res) => { // add leading /
  try {
    const { allergies, diets } = req.body;
    const recipe = await generateRecipeForUser({ allergies, diets });
    res.json({ recipe });
  } catch (err: any) {
    console.error("Recipe generation failed:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;