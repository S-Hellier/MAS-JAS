import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, ActivityIndicator, StyleSheet } from "react-native";
import { apiService } from "../services/api.service";
import { Recipe } from "../types/recipe.types";

export default function CookbookScreen() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRecipes = async () => {
      try {
        const savedRecipes = await apiService.getSavedRecipes();
        
        setRecipes(savedRecipes);
        setError(null);
      } catch (err: any) {
        console.error(err.message);
        setError(err.message || "Failed to load recipes");
      } finally {
        setLoading(false);
      }
    };

    loadRecipes();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10 }}>Loading recipes...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={{ color: "red", fontSize: 16, marginBottom: 10 }}>
          Error: {error}
        </Text>
        <Text style={{ fontSize: 12, color: "#666", marginBottom: 20 }}>
          Check console for full details
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>My Cookbook</Text>

      {recipes.length === 0 ? (
        <Text style={styles.empty}>You have no saved recipes yet.</Text>
      ) : (
        recipes.map((r) => (
          <View key={r.id} style={styles.card}>
            <Text style={styles.title}>{r.title}</Text>
            <Text style={styles.subtitle}>Servings: {r.servings}</Text>

            <Text style={styles.section}>Ingredients:</Text>
            {r.ingredients.map((ing, idx) => (
              <Text key={idx} style={styles.text}>
                • {ing.quantity} {ing.name}
              </Text>
            ))}

            <Text style={styles.section}>Steps:</Text>
            {r.steps.map((step, idx) => (
              <Text key={idx} style={styles.text}>
                {idx + 1}. {step}
              </Text>
            ))}
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, flex: 1 },
  header: { fontSize: 28, fontWeight: "bold", marginBottom: 16 },
  empty: { marginTop: 20, fontSize: 18, color: "#888" },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 3,
  },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 4 },
  subtitle: { fontSize: 16, color: "#666", marginBottom: 10 },
  section: { fontSize: 18, fontWeight: "600", marginTop: 12 },
  text: { fontSize: 16, marginVertical: 2 },
});