import React, { useState } from 'react';
import { Button, Text, View, ScrollView, StyleSheet, Alert } from 'react-native';
import { apiService } from '../services/api.service';
import { useNavigation } from '@react-navigation/native';

export default function GenerateRecipeScreen() {
  const [recipe, setRecipe] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const handleGenerateRecipe = async () => {
    setLoading(true);
    try {
      const data = await apiService.generateRecipe();
      setRecipe(data.recipe);
    } catch (err) {
      console.error('Error generating recipe:', err);
      Alert.alert('Error', 'Failed to generate recipe.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRecipe = async () => {
    if (!recipe) return;

    try {
      await apiService.saveRecipe(recipe); // Add this method in apiService
      Alert.alert('Success', 'Recipe saved to your collection!');
    } catch (err) {
      console.error('Error saving recipe:', err);
      Alert.alert('Error', 'Failed to save recipe.');
    }
  };

  const handleViewPreviousRecipes = () => {
    navigation.navigate('PreviousRecipes'); // create this screen
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Button
        title={loading ? 'Generating...' : 'Generate Recipe'}
        onPress={handleGenerateRecipe}
        disabled={loading}
      />

      {recipe && (
        <View style={{ marginTop: 20 }}>
          <Text style={styles.title}>{recipe.title}</Text>
          
          <Text style={styles.section}>Ingredients:</Text>
          {recipe.ingredients.map((item: {name: string; quantity: string}, i: number) => (
            <Text key={i}>• {item.name} - {item.quantity}</Text>
          ))}

          <Text style={styles.section}>Steps:</Text>
          {recipe.steps.map((step: string, i: number) => (
            <Text key={i}>{i + 1}. {step}</Text>
          ))}

          <View style={{ marginTop: 20 }}>
            <Button title="💚 Save Recipe" onPress={handleSaveRecipe} color="green" />
            <View style={{ height: 10 }} />
            <Button title="📖 View Previous Recipes" onPress={handleViewPreviousRecipes} />
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold' },
  section: { marginTop: 10, fontWeight: '600' },
});
