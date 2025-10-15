/**
 * generate-recipes.ts
 *
 * - Fetch ingredients from a local API
 * - Call OpenAI (gpt-4o-mini) using function-calling with a JSON schema
 * - Parse & validate the response into a typed Recipe object
 */

import fetch from "node-fetch";
import { z } from "zod";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "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";
const LOCAL_API_BASE = process.env.LOCAL_API_BASE || "http://localhost:3001/api/v1";

if (!OPENAI_API_KEY) {
  console.error("Missing OPENAI_API_KEY environment variable.");
  process.exit(1);
}

// typecheck structure
type Ingredient = {
  id: string;
  name: string;
  category?: string;
};

type UserConstraints = {
  allergies?: string[];
  diets?: string[];
};

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

type Recipe = z.infer<typeof RecipeSchema>;


// get ingredients in pantry
async function fetchIngredients(): Promise<Ingredient[]> {
  const headers = {
    'x-user-id': '816614f4-b6eb-4806-9e87-0ed87d62c317'
  }

  const res = await fetch(`${LOCAL_API_BASE}/pantry`, {headers: headers});
  if (!res.ok) {
    throw new Error(`Failed to fetch ingredients from ${LOCAL_API_BASE}/pantry: ${res.status} ${res.statusText}`);
  }
  const data = (await res.json()) as Ingredient[];
  return data;
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

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenAI API error: ${res.status} ${res.statusText} - ${text}`);
  }
  const data = (await res.json()) as {
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
async function generateRecipeForUser(constraints: UserConstraints) {
  const allIngredients = await fetchIngredients();

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
      `Constraints: allergies=${JSON.stringify(constraints.allergies || [])}, diets=${JSON.stringify(constraints.diets || [])},\n` +
      `Available ingredients:\n${JSON.stringify(allIngredients, null, 2)}\n\n` +
      `Rules:\n` +
      `1) Respect diets & allergies absolutely; set allergensHandled=true if you applied special handling.\n` +
      `2) Steps are clear and numbered. Provide reasonable quantities per serving.\n` +
      `3) You can generate recipes that recipe that extra ingredient, but must let the user know that it has to be bought.\n` +
      `4) Return result by calling the function create_recipe with the exact schema provided.`,
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
  const userConstraints: UserConstraints = {
    allergies: ["nuts"], // example: user is allergic to nuts
    diets: ["vegetarian"], // wants vegetarian recipes]]
  };

  try {
    console.log("Fetching ingredients and generating recipe...");
    const recipe = await generateRecipeForUser(userConstraints);
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
