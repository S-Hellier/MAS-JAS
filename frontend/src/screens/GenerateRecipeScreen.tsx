import React, { useState } from 'react';
import { Button, Text, View, ScrollView } from 'react-native';
import { apiService } from '../services/api.service';

export default function GenerateRecipeScreen() {
  const [recipe, setRecipe] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerateRecipe = async () => {
    setLoading(true);
    try {
      const data = await apiService.generateRecipe();
      setRecipe(data.recipe);
    } catch (err) {
      console.error('Error generating recipe:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <Button
        title={loading ? 'Generating...' : 'Generate Recipe'}
        onPress={handleGenerateRecipe}
        disabled={loading}
      />

      {recipe && (
        <View style={{ marginTop: 20 }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{recipe.title}</Text>
          <Text style={{ marginTop: 10 }}>Ingredients:</Text>
          {recipe.ingredients.map((item: {name: string; quantity: string}, i: number) => (
            <Text key={i}>• {item.name} - {item.quantity}</Text>
          ))}
          <Text style={{ marginTop: 10 }}>Steps:</Text>
          {recipe.steps.map((step: string, i: number) => (
            <Text key={i}>{i + 1}. {step}</Text>
          ))}
        </View>
      )}
    </ScrollView>
  );
}