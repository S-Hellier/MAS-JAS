import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  ScrollView, 
  ActivityIndicator, 
  StyleSheet,
  Alert,
  TouchableOpacity,
  Modal,
  SafeAreaView,
} from "react-native";

import { apiService } from "../services/api.service";
import { Recipe } from "../types/recipe.types";

export default function CookbookScreen() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  useEffect(() => {
    loadRecipes();
  }, []);

  const loadRecipes = async () => {
    try {
      setLoading(true);
      
      const savedRecipes = await apiService.getSavedRecipes();
      
      setRecipes(savedRecipes);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load recipes");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRecipe = (recipeId: string, recipeName: string) => {
    Alert.alert(
      "Delete Recipe",
      `Are you sure you want to remove "${recipeName}" from your cookbook?`,
      [
        { text: "Cancel", onPress: () => {}, style: "cancel" },
        {
          text: "Delete",
          onPress: async () => {
            await performDelete(recipeId);
          },
          style: "destructive",
        },
      ]
    );
  };

  const performDelete = async (recipeId: string) => {
    try {
      setDeleting(recipeId);
      console.log("🗑️ [COOKBOOK] Deleting recipe:", recipeId);
      
      await apiService.deleteRecipe(recipeId);
      
      setRecipes(recipes.filter((r) => r.id !== recipeId));
      setSelectedRecipe(null);
      
      Alert.alert("Success", "Recipe deleted from your cookbook");
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to delete recipe");
    } finally {
      setDeleting(null);
    }
  };

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
    <>
      <ScrollView style={styles.container}>
        <Text style={styles.header}>My Cookbook</Text>

        {recipes.length === 0 ? (
          <Text style={styles.empty}>You have no saved recipes yet.</Text>
        ) : (
          <View style={styles.cardsContainer}>
            {recipes.map((r) => (
              <TouchableOpacity
                key={r.id}
                onPress={() => setSelectedRecipe(r)}
                activeOpacity={0.8}
              >
                <View style={styles.card}>
                  <Text style={styles.cardTitle} numberOfLines={2}>
                    {r.title}
                  </Text>
                  <Text style={styles.cardSubtitle}>
                    Servings: {r.servings}
                  </Text>
                  <Text style={styles.cardInfo}>
                    {r.ingredients.length} ingredients • {r.steps.length} steps
                  </Text>
                  <Text style={styles.cardTapHint}>Tap to view details</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Recipe Detail Modal */}
      <Modal
        visible={selectedRecipe !== null}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setSelectedRecipe(null)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => setSelectedRecipe(null)}
              style={styles.backButton}
            >
              <Text style={styles.backButtonText}>← Back to Cookbook</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                if (selectedRecipe) {
                  handleDeleteRecipe(selectedRecipe.id, selectedRecipe.title);
                }
              }}
              disabled={deleting === selectedRecipe?.id}
              style={styles.deleteButton}
            >
              <Text style={styles.deleteButtonText}>
                {deleting === selectedRecipe?.id ? "..." : "✕"}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.recipeTitle}>
            <Text style={styles.modalTitle}>{selectedRecipe?.title}</Text>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.infoSection}>
              <Text style={styles.infoLabel}>Servings:</Text>
              <Text style={styles.infoValue}>{selectedRecipe?.servings}</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Ingredients</Text>
              {selectedRecipe?.ingredients.map((ing, idx) => (
                <View key={idx} style={styles.ingredientItem}>
                  <Text style={styles.ingredientText}>
                    • {ing.quantity} {ing.name}
                  </Text>
                </View>
              ))}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Instructions</Text>
              {selectedRecipe?.steps.map((step, idx) => (
                <View key={idx} style={styles.stepItem}>
                  <Text style={styles.stepNumber}>{idx + 1}</Text>
                  <Text style={styles.stepText}>{step}</Text>
                </View>
              ))}
            </View>

            {selectedRecipe?.nutrition && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Nutrition Info</Text>
                <View style={styles.nutritionGrid}>
                  {Object.entries(selectedRecipe.nutrition).map(([key, value]) => (
                    <View key={key} style={styles.nutritionItem}>
                      <Text style={styles.nutritionLabel}>
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                      </Text>
                      <Text style={styles.nutritionValue}>{value}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 16,
  },
  header: { 
    fontSize: 28, 
    fontWeight: "bold", 
    marginBottom: 16,
    marginTop: 12,
  },
  empty: { 
    marginTop: 20, 
    fontSize: 18, 
    color: "#888" 
  },
  cardsContainer: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: { 
    fontSize: 18, 
    fontWeight: "bold", 
    marginBottom: 8,
    color: "#333",
  },
  cardSubtitle: { 
    fontSize: 14, 
    color: "#666", 
    marginBottom: 6,
  },
  cardInfo: {
    fontSize: 13,
    color: "#999",
    marginBottom: 10,
  },
  cardTapHint: {
    fontSize: 12,
    color: "#0066cc",
    fontStyle: "italic",
  },
  
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 14,
    color: "#0066cc",
    fontWeight: "600",
  },
  deleteButton: {
    width: 20,
    height: 20,
    borderRadius: 25,
    backgroundColor: "#ff4444",
    justifyContent: "center",
    alignItems: "center",
  },
  deleteButtonText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
  recipeTitle: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  infoSection: {
    backgroundColor: "#f9f9f9",
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  infoLabel: {
    fontSize: 12,
    color: "#666",
    fontWeight: "600",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#333",
  },
  ingredientItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  ingredientText: {
    fontSize: 15,
    color: "#333",
    lineHeight: 22,
  },
  stepItem: {
    flexDirection: "row",
    marginBottom: 16,
  },
  stepNumber: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0066cc",
    marginRight: 12,
    minWidth: 30,
  },
  stepText: {
    flex: 1,
    fontSize: 15,
    color: "#333",
    lineHeight: 22,
  },
  nutritionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  nutritionItem: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: "#f9f9f9",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  nutritionLabel: {
    fontSize: 12,
    color: "#666",
    fontWeight: "600",
    marginBottom: 4,
  },
  nutritionValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
});