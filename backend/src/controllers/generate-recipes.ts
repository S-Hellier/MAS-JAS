/**
 * generate-recipes.ts
 *
 * - Fetch ingredients from a local API
 * - Call OpenAI (gpt-4o-mini) using function-calling with a JSON schema
 * - Parse & validate the response into a typed Recipe object
 */

import { User } from "../types/auth.types";
import { PantryItem } from "../types/pantry.types";
import { z } from "zod";
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config()

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const LOCAL_API_BASE = process.env.LOCAL_API_BASE || "http://localhost:3001/api/v1";

if (!OPENAI_API_KEY) {
  console.error("Missing OPENAI_API_KEY environment variable.");
  process.exit(1);
}

const RecipeSchema = z.object({
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
    .optional()
});

// get non-expired ingredients in pantry
async function fetchIngredients(userId: string): Promise<PantryItem[]> {
  const headers = {
    'x-user-id': userId
  }

  const res = await axios.get(`${LOCAL_API_BASE}/pantry`, {headers: headers});
  const json = res.data as { data: PantryItem[] };
  const items = json.data;

  if (!Array.isArray(items)) {
    throw new Error(`Expected an array of pantry items, got: ${JSON.stringify(json)}`);
  }

  const now = new Date();

  const validIngredients = items.filter(item => {
    const exp = new Date(item.expirationDate);
    return exp >= now;
  });

  const sortedIngredients = validIngredients.sort((a, b) => {
    return new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime();
  });

  console.log(sortedIngredients);
  return sortedIngredients;
}

async function fetchUserPreferences(userId: string) {
  const res = await axios.get(`${LOCAL_API_BASE}/auth/me`, {
    headers: { 'x-user-id': userId },
  });

  const data = res.data as { user: User };

  const { diet = 'none', goals = 'none', food_restrictions = [] } = data.user;

  return {
    diet,
    goal: goals,
    allergies: food_restrictions,
  };
}


// Build functions schema for tool calling
const createRecipeFunction = {
  name: "create_recipe",
  description:
    "Creates a recipe given available ingredients and user constraints. Returns a structured JSON recipe.",
  parameters: {
    type: "object",
    properties: {
      title: { type: "string", description: "Recipe title" },
      servings: { type: "integer", minimum: 1 },
      ingredients: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: { type: "string" },
            quantity: { type: "string", description: "Free text quantity, e.g., '1 cup', '200 g'" },
          },
          required: ["name", "quantity"],
        },
      },
      steps: {
        type: "array",
        items: { type: "string" },
      },
      nutrition: {
        type: "object",
        properties: {
          calories_per_serving: { type: "number" },
          protein_g: { type: "number" },
          fat_g: { type: "number" },
          carbs_g: { type: "number" },
        },
      },
    },
    required: ["title", "servings", "ingredients", "steps"],
  },
};


// model call wrapper
async function callOpenAI(
  model: string,
  messages: Array<{ role: string; content?: string }>,
  functions: any[],
  function_call: "auto" | { name: string } | "none" = "auto"
) {
  const url = "https://api.openai.com/v1/chat/completions";

  const payload = {
    model,
    messages,
    functions,
    function_call,
    temperature: 0.7,
    max_tokens: 800,
  };

  const res = await axios.post(url, payload, {
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
  });

  const data = res.data as {
    choices: Array<{
      message?: {
        role: string;
        content?: string;
        function_call?: {
          name: string;
          arguments: string;
        };
      };
    }>;
  };

  return data;
}


// recipe generation function
async function generateRecipeForUser(options?: { userId?: string; allergies?: string[]; diets?: string[] }) {
  const userId = options?.userId;
  if (!userId) {
    throw new Error('User ID is required for recipe generation');
  }

  const allIngredients = await fetchIngredients(userId);
  const userPreferences = await fetchUserPreferences(userId);

  // parse ingredient data
  const compactIngredients = allIngredients.map(item => ({
    name: item.name,
    category: item.category,
    quantity: item.quantity,
    unit: item.unit,
    expirationDate: item.expirationDate,
    nutritionInfo: item.nutritionInfo
      ? {
          calories: item.nutritionInfo.calories,
          protein: item.nutritionInfo.protein,
          fat: item.nutritionInfo.fat,
          carbohydrates: item.nutritionInfo.carbohydrates
        }
      : undefined
  }));

  // 3) Build chat messages
  const systemMessage = {
    role: "system",
    content:
      "You are a helpful recipe generator. Return a JSON by calling the function 'create_recipe' with the specified JSON schema.",
  };

  const userMessage = {
    role: "user",
    content:
      `Create a recipe tailored to these user constraints. ` +
      `Constraints: allergies=${JSON.stringify(userPreferences.allergies || [])}\n` +
      `Diets=${JSON.stringify(userPreferences.diet || [])},\n` +
      `Goal=${JSON.stringify(userPreferences.goal || "none")}\n` +
      `Available ingredients:\n${JSON.stringify(compactIngredients, null, 2)}\n\n` +
      `Rules:\n` +
      `1) Respect diets & allergies absolutely; set allergensHandled=true if you applied special handling.\n` +
      `2) Steps are clear and numbered. Provide reasonable quantities per serving.\n` +
      `3) Prioritize using ingreidents that are soon to expire\n` +
      `4) You can generate recipes that recipe that extra ingredient, but must let the user know that it has to be bought.\n` +
      `5) Return result by calling the function create_recipe with the exact schema provided.`,
  };

  const model = "gpt-4o-mini";
  const chatResponse = await callOpenAI(model, [systemMessage, userMessage], [createRecipeFunction], "auto");

  const choice = chatResponse.choices?.[0];
  if (!choice) {
    throw new Error("No choice returned from OpenAI");
  }

  const message: any = choice.message || choice;
  if (!message) throw new Error("No message returned in choice");

  const content =
    (message.content as string | undefined) ||
    (message.message?.content as string | undefined) ||
    "";

  if (!message.function_call) {
    const fallbackText = content;
    try {
      const parsed = JSON.parse(fallbackText);
      const validated = RecipeSchema.parse(parsed);
      return validated;
    } catch (err) {
      throw new Error("Model did not call function and non-JSON fallback failed to parse.");
    }
  }

  const funcCall = (message as any).function_call;
  const argsText = funcCall.arguments;

  if (!argsText) throw new Error("Function call contained no arguments");

  let parsed: unknown;
  try {
    parsed = JSON.parse(argsText);
  } catch (err) {
    const sanitized = argsText
      .replace(/(\r\n|\n)/g, " ")
      .replace(/([\{,])\s*([a-zA-Z0-9_]+)\s*:/g, `"$2":`)
      .replace(/'/g, '"');
    try {
      parsed = JSON.parse(sanitized);
    } catch (err2) {
      throw new Error("Failed to parse function_call.arguments into JSON: " + err2);
    }
  }

  try {
    const validated = RecipeSchema.parse(parsed);
    return validated;
  } catch (zErr) {
    console.error("Validation error from recipe schema:", zErr);
    throw new Error("Recipe JSON did not validate against the schema.");
  }
}


// recipe generation test
async function main() {
  try {
    console.log("Fetching ingredients and generating recipe...");
    const recipe = await generateRecipeForUser();
    console.log("=== Generated Recipe ===");
    console.log(JSON.stringify(recipe, null, 2));
  } catch (err) {
      console.error("Error generating recipe:", err);
  }
}

if (require.main === module) {
  main();
}

export {
  fetchIngredients,
  generateRecipeForUser,
  RecipeSchema,
};
