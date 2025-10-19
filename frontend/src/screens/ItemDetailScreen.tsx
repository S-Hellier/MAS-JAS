import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { fetchPantryItem, deletePantryItem } from '../store/pantrySlice';
import { RootState, AppDispatch } from '../store';
import { PantryItem } from '../types/pantry.types';

type PantryStackParamList = {
  PantryList: undefined;
  AddItem: undefined;
  ItemDetail: { itemId: string };
};

type ItemDetailScreenRouteProp = RouteProp<PantryStackParamList, 'ItemDetail'>;
type ItemDetailScreenNavigationProp = StackNavigationProp<PantryStackParamList>;

const ItemDetailScreen: React.FC = () => {
  const route = useRoute<ItemDetailScreenRouteProp>();
  const navigation = useNavigation<ItemDetailScreenNavigationProp>();
  const dispatch = useDispatch<AppDispatch>();

  const { itemId } = route.params;
  const { selectedItem, loading, error } = useSelector((state: RootState) => state.pantry);

  useEffect(() => {
    dispatch(fetchPantryItem(itemId));
  }, [dispatch, itemId]);

  const getExpirationStatus = (expirationDate: string) => {
    const now = new Date();
    const expDate = new Date(expirationDate);
    const daysUntilExpiration = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiration < 0) {
      return { status: 'Expired', color: '#ef4444', days: Math.abs(daysUntilExpiration) };
    } else if (daysUntilExpiration <= 7) {
      return { status: 'Expiring Soon', color: '#f59e0b', days: daysUntilExpiration };
    } else {
      return { status: 'Good', color: '#10b981', days: daysUntilExpiration };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getCategoryDisplayName = (category: string) => {
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  const getUnitDisplayName = (unit: string) => {
    return unit.charAt(0).toUpperCase() + unit.slice(1);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading item details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !selectedItem) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>{error || 'Item not found'}</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const item: PantryItem = selectedItem;
  const expirationInfo = getExpirationStatus(item.expirationDate);
  const hasNutrition = item.nutritionInfo && Object.values(item.nutritionInfo).some(val => val !== undefined && val !== '');

  const handleDelete = () => {
    Alert.alert(
      'Delete Item',
      `Are you sure you want to delete "${item.name}"? This action cannot be undone.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(deletePantryItem(item.id)).unwrap();
              // Navigate back to PantryList
              navigation.navigate('PantryList');
            } catch (error) {
              Alert.alert(
                'Error',
                'Failed to delete item. Please try again.'
              );
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.itemName}>{item.name}</Text>
          {item.brand && <Text style={styles.itemBrand}>{item.brand}</Text>}
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{getCategoryDisplayName(item.category)}</Text>
          </View>
        </View>

        {/* Quantity & Expiration Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quantity & Expiration</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Quantity:</Text>
            <Text style={styles.infoValue}>
              {item.quantity} {getUnitDisplayName(item.unit)}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Expiration Date:</Text>
            <Text style={styles.infoValue}>{formatDate(item.expirationDate)}</Text>
          </View>
          <View style={styles.expirationStatusContainer}>
            <View style={[styles.statusBadge, { backgroundColor: expirationInfo.color }]}>
              <Text style={styles.statusText}>{expirationInfo.status}</Text>
            </View>
            <Text style={styles.daysText}>
              {expirationInfo.status === 'Expired'
                ? `${expirationInfo.days} days ago`
                : `${expirationInfo.days} days remaining`}
            </Text>
          </View>
        </View>

        {/* Dates Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tracking</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Date Added:</Text>
            <Text style={styles.infoValue}>{formatDate(item.dateAdded)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Last Updated:</Text>
            <Text style={styles.infoValue}>{formatDate(item.dateUpdated)}</Text>
          </View>
        </View>

        {/* Nutrition Section - Only show if data exists */}
        {hasNutrition && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Nutrition Information</Text>
            {item.nutritionInfo?.servingSize && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Serving Size:</Text>
                <Text style={styles.infoValue}>
                  {item.nutritionInfo.servingSize} {item.nutritionInfo.servingUnit || ''}
                </Text>
              </View>
            )}
            {item.nutritionInfo?.calories !== undefined && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Calories:</Text>
                <Text style={styles.infoValue}>{item.nutritionInfo.calories}</Text>
              </View>
            )}
            {item.nutritionInfo?.protein !== undefined && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Protein:</Text>
                <Text style={styles.infoValue}>{item.nutritionInfo.protein}g</Text>
              </View>
            )}
            {item.nutritionInfo?.carbohydrates !== undefined && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Carbohydrates:</Text>
                <Text style={styles.infoValue}>{item.nutritionInfo.carbohydrates}g</Text>
              </View>
            )}
            {item.nutritionInfo?.fat !== undefined && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Fat:</Text>
                <Text style={styles.infoValue}>{item.nutritionInfo.fat}g</Text>
              </View>
            )}
            {item.nutritionInfo?.fiber !== undefined && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Fiber:</Text>
                <Text style={styles.infoValue}>{item.nutritionInfo.fiber}g</Text>
              </View>
            )}
            {item.nutritionInfo?.sugar !== undefined && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Sugar:</Text>
                <Text style={styles.infoValue}>{item.nutritionInfo.sugar}g</Text>
              </View>
            )}
            {item.nutritionInfo?.sodium !== undefined && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Sodium:</Text>
                <Text style={styles.infoValue}>{item.nutritionInfo.sodium}mg</Text>
              </View>
            )}
          </View>
        )}

        {/* Additional Info Section */}
        {(item.barcode || item.notes) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Additional Information</Text>
            {item.barcode && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Barcode:</Text>
                <Text style={styles.infoValue}>{item.barcode}</Text>
              </View>
            )}
            {item.notes && (
              <View style={styles.notesContainer}>
                <Text style={styles.infoLabel}>Notes:</Text>
                <Text style={styles.notesText}>{item.notes}</Text>
              </View>
            )}
          </View>
        )}

        {/* Spacer for fixed buttons */}
        <View style={styles.buttonSpacer} />
      </ScrollView>

      {/* Fixed Action Buttons */}
      <View style={styles.fixedButtonContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => navigation.navigate('EditItem', { itemId: item.id })}
        >
          <Text style={styles.buttonText}>Edit Item</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={handleDelete}
        >
          <Text style={styles.buttonText}>Delete Item</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  itemName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 5,
  },
  itemBrand: {
    fontSize: 18,
    color: '#6b7280',
    marginBottom: 10,
  },
  categoryBadge: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  categoryText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 10,
    padding: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e5e5e5',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '400',
  },
  expirationStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 10,
  },
  statusText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  daysText: {
    fontSize: 14,
    color: '#6b7280',
  },
  notesContainer: {
    marginTop: 10,
  },
  notesText: {
    fontSize: 16,
    color: '#1f2937',
    marginTop: 5,
    lineHeight: 22,
  },
  buttonSpacer: {
    height: 120,
  },
  fixedButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  editButton: {
    backgroundColor: '#007AFF',
  },
  deleteButton: {
    backgroundColor: '#ef4444',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ItemDetailScreen;
