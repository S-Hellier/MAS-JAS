import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import { apiService } from "../services/api.service";
import { Recipe } from "../types/recipe.types";

export default function GenerateRecipeScreen() {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleGenerateRecipe = async () => {
    setLoading(true);
    try {
      const result = await apiService.generateRecipe();
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

      <TouchableOpacity
        style={styles.button}
        onPress={handleGenerateRecipe}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
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
            style={[styles.button, { marginTop: 20, backgroundColor: "#34C759" }]}
            onPress={handleSaveRecipe}
            disabled={saving}
          >
            {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Save Recipe</Text>}
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 16,
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  recipeContainer: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    elevation: 3,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 10,
  },
  section: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 12,
  },
  text: {
    fontSize: 16,
    marginVertical: 2,
  },
});
