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
import { Colors, BorderRadius, Shadows, Spacing } from "../theme";

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
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading recipes...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>
          Error: {error}
        </Text>
        <Text style={styles.errorSubtext}>
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
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.base,
  },
  loadingText: {
    marginTop: Spacing.sm,
    fontSize: 16,
    color: Colors.textSecondary,
  },
  errorText: {
    color: Colors.error,
    fontSize: 16,
    marginBottom: Spacing.sm,
  },
  errorSubtext: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: Spacing.base,
    marginTop: Spacing.md,
    color: Colors.textPrimary,
  },
  empty: {
    marginTop: Spacing.lg,
    fontSize: 18,
    color: Colors.textSecondary,
  },
  cardsContainer: {
    paddingBottom: Spacing.lg,
  },
  card: {
    backgroundColor: Colors.surface,
    padding: Spacing.base,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    ...Shadows.card,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: Spacing.sm,
    color: Colors.textPrimary,
  },
  cardSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  cardInfo: {
    fontSize: 13,
    color: Colors.textTertiary,
    marginBottom: Spacing.sm,
  },
  cardTapHint: {
    fontSize: 12,
    color: Colors.primary,
    fontStyle: "italic",
  },

  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    padding: Spacing.sm,
  },
  backButtonText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: "600",
  },
  deleteButton: {
    width: 20,
    height: 20,
    borderRadius: 25,
    backgroundColor: Colors.error,
    justifyContent: "center",
    alignItems: "center",
  },
  deleteButtonText: {
    color: Colors.textInverse,
    fontSize: 10,
    fontWeight: "bold",
  },
  recipeTitle: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.textPrimary,
  },
  modalContent: {
    flex: 1,
    padding: Spacing.base,
  },
  infoSection: {
    backgroundColor: Colors.background,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
  },
  infoLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: "600",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.textPrimary,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: Spacing.md,
    color: Colors.textPrimary,
  },
  ingredientItem: {
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  ingredientText: {
    fontSize: 15,
    color: Colors.textPrimary,
    lineHeight: 22,
  },
  stepItem: {
    flexDirection: "row",
    marginBottom: Spacing.base,
  },
  stepNumber: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.accent,
    marginRight: Spacing.md,
    minWidth: 30,
  },
  stepText: {
    flex: 1,
    fontSize: 15,
    color: Colors.textPrimary,
    lineHeight: 22,
  },
  nutritionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  nutritionItem: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: Colors.background,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: "center",
  },
  nutritionLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: "600",
    marginBottom: 4,
  },
  nutritionValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.textPrimary,
  },
});