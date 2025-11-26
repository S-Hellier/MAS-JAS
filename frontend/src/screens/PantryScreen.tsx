import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { PantryItem } from '../types/pantry.types';
import { PantryStackParamList } from '../navigation/AppNavigator';
import { StackNavigationProp } from '@react-navigation/stack';
import { fetchPantryItems } from '../store/pantrySlice';
import { Colors, BorderRadius, Shadows, Spacing } from '../theme';

type PantryScreenNavigationProp = StackNavigationProp<PantryStackParamList, 'PantryList'>;

interface PantryScreenProps {
  navigation: PantryScreenNavigationProp;
}

const PantryScreen: React.FC<PantryScreenProps> = ({ navigation }) => {
  const dispatch = useDispatch();
  const { items, loading, error } = useSelector((state: RootState) => state.pantry);

  useEffect(() => {
    dispatch(fetchPantryItems({}) as any);
  }, [dispatch]);

  const renderItem = ({ item }: { item: PantryItem }) => (
    <TouchableOpacity
      style={styles.itemCard}
      onPress={() => navigation.navigate('ItemDetail', { itemId: item.id })}
    >
      <View style={styles.itemHeader}>
        <Text style={styles.itemName}>{item.name}</Text>
        {item.brand && <Text style={styles.itemBrand}>{item.brand}</Text>}
      </View>

      <View style={styles.itemDetails}>
        <Text style={styles.itemQuantity}>
          {item.quantity} {item.unit}
        </Text>
        <Text style={styles.itemCategory}>
          {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
        </Text>
      </View>

      <View style={styles.itemFooter}>
        <Text style={styles.itemExpiry}>
          Expires: {new Date(item.expirationDate).toLocaleDateString()}
        </Text>
        <Text style={styles.itemAdded}>
          Added: {new Date(item.dateAdded).toLocaleDateString()}
        </Text>
      </View>

      {item.notes && (
        <Text style={styles.itemNotes}>{item.notes}</Text>
      )}
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No items in your pantry yet</Text>
      <Text style={styles.emptySubtext}>
        Add some items to get started with managing your food inventory
      </Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading pantry items...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.title}>My Pantry</Text>
            <Text style={styles.subtitle}>{items.length} items</Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('AddItem')}
          >
            <Text style={styles.addButtonText}>+ Add Item</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: Spacing.lg,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 5,
  },
  addButton: {
    backgroundColor: Colors.accent,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.pill,
    marginTop: 5,
    ...Shadows.small,
  },
  addButtonText: {
    color: Colors.textInverse,
    fontSize: 14,
    fontWeight: '600',
  },
  listContainer: {
    padding: 15,
  },
  itemCard: {
    backgroundColor: Colors.surface,
    padding: 15,
    borderRadius: BorderRadius.md,
    marginBottom: 15,
    ...Shadows.card,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  itemName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    flex: 1,
  },
  itemBrand: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  itemDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  itemQuantity: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '500',
  },
  itemCategory: {
    fontSize: 14,
    color: Colors.textSecondary,
    backgroundColor: Colors.divider,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  itemExpiry: {
    fontSize: 12,
    color: Colors.textTertiary,
  },
  itemAdded: {
    fontSize: 12,
    color: Colors.textTertiary,
  },
  itemNotes: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textTertiary,
    textAlign: 'center',
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  errorText: {
    fontSize: 16,
    color: Colors.error,
    textAlign: 'center',
  },
});

export default PantryScreen;
