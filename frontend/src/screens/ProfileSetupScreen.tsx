import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Colors, BorderRadius, Spacing } from '../theme';

const FOOD_RESTRICTIONS = [
  'Dairy',
  'Gluten',
  'Nuts',
  'Peanuts',
  'Shellfish',
  'Fish',
  'Soy',
  'Eggs',
  'Wheat',
  'Lactose',
];

const ProfileSetupScreen: React.FC = () => {
  const { updatePreferences } = useAuth();
  const [diet, setDiet] = useState<string>('');
  const [goals, setGoals] = useState<string>('');
  const [foodRestrictions, setFoodRestrictions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const toggleRestriction = (restriction: string) => {
    if (foodRestrictions.includes(restriction)) {
      setFoodRestrictions(foodRestrictions.filter((r) => r !== restriction));
    } else {
      setFoodRestrictions([...foodRestrictions, restriction]);
    }
  };

  const handleSkip = async () => {
    try {
      setIsLoading(true);
      await updatePreferences({ profile_completed: true });
    } catch (error) {
      Alert.alert('Error', 'Failed to skip setup. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      await updatePreferences({
        diet: diet || undefined,
        goals: goals || undefined,
        food_restrictions: foodRestrictions,
        profile_completed: true,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to save preferences. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>Complete Your Profile</Text>
        <Text style={styles.subtitle}>Help us personalize your experience</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🥗 Diet Type</Text>
        <TextInput
          style={styles.textInput}
          value={diet}
          onChangeText={setDiet}
          placeholder="e.g., Keto, Vegan, Mediterranean..."
          placeholderTextColor={Colors.textTertiary}
          editable={true}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🎯 Goals</Text>
        <TextInput
          style={styles.textInput}
          value={goals}
          onChangeText={setGoals}
          placeholder="e.g., Lose Weight, Build Muscle..."
          placeholderTextColor={Colors.textTertiary}
          editable={true}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⚠️ Food Restrictions</Text>
        <Text style={styles.sectionDescription}>Select all that apply</Text>
        <View style={styles.restrictionsContainer}>
          {FOOD_RESTRICTIONS.map((restriction) => (
            <TouchableOpacity
              key={restriction}
              style={[
                styles.restrictionChip,
                foodRestrictions.includes(restriction) && styles.restrictionChipSelected,
              ]}
              onPress={() => toggleRestriction(restriction)}
            >
              <Text
                style={[
                  styles.restrictionText,
                  foodRestrictions.includes(restriction) && styles.restrictionTextSelected,
                ]}
              >
                {restriction}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.skipButton}
          onPress={handleSkip}
          disabled={isLoading}
        >
          <Text style={styles.skipButtonText}>Skip for Now</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={Colors.textInverse} />
          ) : (
            <Text style={styles.saveButtonText}>Save & Continue →</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  header: {
    marginBottom: Spacing.xxxl,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  section: {
    marginBottom: Spacing.xxxl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  sectionDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  textInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: 16,
    backgroundColor: Colors.surface,
    color: Colors.textPrimary,
  },
  restrictionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  restrictionChip: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.pill,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  restrictionChipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  restrictionText: {
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  restrictionTextSelected: {
    color: Colors.textInverse,
  },
  buttonContainer: {
    marginTop: Spacing.lg,
    gap: Spacing.md,
  },
  skipButton: {
    padding: Spacing.base,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  saveButton: {
    padding: Spacing.base,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: Colors.disabled,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textInverse,
  },
});

export default ProfileSetupScreen;
