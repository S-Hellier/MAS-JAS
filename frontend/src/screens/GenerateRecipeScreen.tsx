import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
  ScrollView,
  TextInput,
} from "react-native";
import { apiService } from "../services/api.service";
import { Recipe } from "../types/recipe.types";
import { Colors, BorderRadius, Shadows, Spacing } from "../theme";

export default function GenerateRecipeScreen() {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [recipeDescription, setRecipeDescription] = useState("");

  const handleGenerateRecipe = async () => {
    setLoading(true);
    try {
      const result = await apiService.generateRecipe(recipeDescription);
      setRecipe(result.recipe);
    } catch (error: any) {
      console.error("Failed to generate recipe:", error.response?.data || error.message);
      Alert.alert("Error", "Failed to generate recipe. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRecipe = async () => {
    if (!recipe) return;

    setSaving(true);
    try {
      const result = await apiService.saveRecipe(recipe);
      Alert.alert("Success", "Recipe saved successfully!");
    } catch (error: any) {
      console.error("Failed to save recipe:", error.response?.data || error.message);

      // Handle validation errors
      if (error.response?.status === 400 && error.response.data?.details) {
        Alert.alert("Invalid Recipe", "The recipe format is invalid.");
      } else if (error.response?.status === 401) {
        Alert.alert("Unauthorized", "You must be logged in to save recipes.");
      } else {
        Alert.alert("Error", "Failed to save recipe. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Generate Recipe</Text>

      <Text style={styles.label}>What type of recipe are you looking for today?</Text>
      <TextInput
        style={styles.textInput}
        placeholder="e.g., Help me generate a recipe for 2 for a casual date night. I would like the recipe to be based on italian cuisine"
        placeholderTextColor={Colors.textSecondary}
        value={recipeDescription}
        onChangeText={setRecipeDescription}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleGenerateRecipe}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={Colors.textInverse} />
        ) : (
          <Text style={styles.buttonText}>Generate Recipe</Text>
        )}
      </TouchableOpacity>

      {recipe && (
        <View style={styles.recipeContainer}>
          <Text style={styles.title}>{recipe.title}</Text>
          <Text style={styles.subtitle}>Servings: {recipe.servings}</Text>

          <Text style={styles.section}>Ingredients:</Text>
          {recipe.ingredients.map((ing, idx) => (
            <Text key={idx} style={styles.text}>
              • {ing.quantity} {ing.name}
            </Text>
          ))}

          <Text style={styles.section}>Steps:</Text>
          {recipe.steps.map((step, idx) => (
            <Text key={idx} style={styles.text}>
              {idx + 1}. {step}
            </Text>
          ))}

          <TouchableOpacity
            style={[styles.button, styles.saveButton]}
            onPress={handleSaveRecipe}
            disabled={saving}
          >
            {saving ? <ActivityIndicator color={Colors.textInverse} /> : <Text style={styles.buttonText}>Save Recipe</Text>}
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.base,
    backgroundColor: Colors.background,
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: Spacing.base,
    color: Colors.textPrimary,
  },
  button: {
    backgroundColor: Colors.primary,
    padding: Spacing.base,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    marginBottom: Spacing.lg,
    ...Shadows.medium,
  },
  saveButton: {
    backgroundColor: Colors.accent,
    marginTop: Spacing.lg,
  },
  buttonText: {
    color: Colors.textInverse,
    fontSize: 16,
    fontWeight: "600",
  },
  recipeContainer: {
    backgroundColor: Colors.surface,
    padding: Spacing.base,
    borderRadius: BorderRadius.lg,
    ...Shadows.card,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 4,
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  section: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: Spacing.md,
    color: Colors.textPrimary,
  },
  text: {
    fontSize: 16,
    marginVertical: 2,
    color: Colors.textPrimary,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: Spacing.sm,
    color: Colors.textPrimary,
  },
  textInput: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border || Colors.textSecondary,
    borderRadius: BorderRadius.md,
    padding: Spacing.base,
    fontSize: 16,
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
    minHeight: 100,
    ...Shadows.small,
  },
});
