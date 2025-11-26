import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal,
  FlatList,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useDispatch } from 'react-redux';
import { createPantryItem } from '../store/pantrySlice';
import { FoodCategory, QuantityUnit, CreatePantryItemRequest, NutritionInfo } from '../types/pantry.types';
import BarcodeScanner from '../components/BarcodeScanner';
import apiService from '../services/api.service';
import { Colors, BorderRadius, Spacing } from '../theme';

interface AddItemScreenProps {
  navigation: any;
}

const AddItemScreen: React.FC<AddItemScreenProps> = ({ navigation }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showUnitModal, setShowUnitModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // Form state
  const [formData, setFormData] = useState<CreatePantryItemRequest>({
    name: '',
    brand: '',
    quantity: 1,
    unit: QuantityUnit.PIECES,
    category: FoodCategory.OTHER,
    expirationDate: '',
    nutritionInfo: {
      calories: undefined,
      protein: undefined,
      carbohydrates: undefined,
      fat: undefined,
      fiber: undefined,
      sugar: undefined,
      sodium: undefined,
      servingSize: '',
      servingUnit: '',
    },
    barcode: '',
    notes: '',
  });

  // Category options
  const categoryOptions = Object.values(FoodCategory).map(category => ({
    label: category.charAt(0).toUpperCase() + category.slice(1),
    value: category,
  }));

  // Unit options
  const unitOptions = Object.values(QuantityUnit).map(unit => ({
    label: unit.charAt(0).toUpperCase() + unit.slice(1),
    value: unit,
  }));

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNutritionChange = (field: keyof NutritionInfo, value: any) => {
    setFormData(prev => ({
      ...prev,
      nutritionInfo: {
        ...prev.nutritionInfo,
        [field]: value,
      },
    }));
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (selectedDate) {
      setSelectedDate(selectedDate);
      // Don't update the form data until Done is clicked
    }
    
    // Only close on Android when user confirms selection
    if (Platform.OS === 'android' && event.type === 'set') {
      const formattedDate = selectedDate!.toISOString().split('T')[0];
      handleInputChange('expirationDate', formattedDate);
      setShowDatePicker(false);
    }
  };

  const handleDatePickerDone = () => {
    const formattedDate = selectedDate.toISOString().split('T')[0];
    handleInputChange('expirationDate', formattedDate);
    setShowDatePicker(false);
  };

  /**
   * Handle barcode scan result
   * This function is called when the BarcodeScanner component detects a barcode
   * It fetches product information from Open Food Facts and auto-populates the form
   */
  const handleBarcodeScanned = async (barcode: string) => {
    // Close the scanner modal
    setShowBarcodeScanner(false);
    
    // Update the barcode field immediately
    handleInputChange('barcode', barcode);
    
    // Show loading state
    setLoading(true);
    
    try {
      // Call the barcode lookup API
      const response = await apiService.lookupBarcode(barcode);
      
      if (response.success && response.data) {
        const productData = response.data;
        
        // Auto-populate form fields with the fetched data
        if (productData.name) {
          handleInputChange('name', productData.name);
        }
        
        if (productData.brand) {
          handleInputChange('brand', productData.brand);
        }
        
        if (productData.category) {
          // Map the category string to our FoodCategory enum
          handleInputChange('category', productData.category as FoodCategory);
        }
        
        // Auto-populate expiration date if AI suggested one
        if (productData.suggestedExpirationDate) {
          handleInputChange('expirationDate', productData.suggestedExpirationDate);
          // Also update the date picker state
          setSelectedDate(new Date(productData.suggestedExpirationDate));
        }
        
        // Populate nutrition information if available
        if (productData.nutritionInfo) {
          setFormData(prev => ({
            ...prev,
            nutritionInfo: {
              calories: productData.nutritionInfo.calories || prev.nutritionInfo?.calories,
              protein: productData.nutritionInfo.protein || prev.nutritionInfo?.protein,
              carbohydrates: productData.nutritionInfo.carbohydrates || prev.nutritionInfo?.carbohydrates,
              fat: productData.nutritionInfo.fat || prev.nutritionInfo?.fat,
              fiber: productData.nutritionInfo.fiber || prev.nutritionInfo?.fiber,
              sugar: productData.nutritionInfo.sugar || prev.nutritionInfo?.sugar,
              sodium: productData.nutritionInfo.sodium || prev.nutritionInfo?.sodium,
              servingSize: productData.nutritionInfo.servingSize || prev.nutritionInfo?.servingSize || '',
              servingUnit: prev.nutritionInfo?.servingUnit || '',
            },
          }));
        }
        
        // Show success message with product name
        const expirationMessage = productData.suggestedExpirationDate 
          ? '\n\n✨ AI suggested an expiration date based on the product type. You can adjust it if needed.'
          : '\n\nPlease add an expiration date.';
        
        Alert.alert(
          '✓ Product Found!',
          `${productData.name}${productData.brand ? ' by ' + productData.brand : ''}${expirationMessage}`,
          [{ text: 'OK' }]
        );
      } else {
        // Product not found in database
        Alert.alert(
          'Product Not Found',
          `Barcode ${barcode} was scanned but the product is not in the database.\n\nThe barcode has been added to the form. Please enter the product details manually.`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error looking up barcode:', error);
      
      // Show error message but keep the barcode in the form
      Alert.alert(
        'Lookup Failed',
        `Could not fetch product information for this barcode.\n\nThe barcode has been saved. You can enter the product details manually.`,
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const formatDateForDisplay = (dateString: string) => {
    if (!dateString) return 'Select expiration date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      Alert.alert('Validation Error', 'Item name is required');
      return false;
    }
    if (formData.quantity <= 0) {
      Alert.alert('Validation Error', 'Quantity must be greater than 0');
      return false;
    }
    // Expiration date is now optional - AI will suggest one if not provided
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Clean up form data
      const submitData: CreatePantryItemRequest = {
        ...formData,
        name: formData.name.trim(),
        brand: formData.brand?.trim() || undefined,
        barcode: formData.barcode?.trim() || undefined,
        notes: formData.notes?.trim() || undefined,
        nutritionInfo: formData.nutritionInfo && 
          (formData.nutritionInfo.calories || formData.nutritionInfo.protein || 
           formData.nutritionInfo.carbohydrates || formData.nutritionInfo.fat ||
           formData.nutritionInfo.fiber || formData.nutritionInfo.sugar ||
           formData.nutritionInfo.sodium || formData.nutritionInfo.servingSize) 
          ? formData.nutritionInfo : undefined,
      };

      await dispatch(createPantryItem(submitData) as any);
      
      Alert.alert(
        'Success',
        'Pantry item added successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to add pantry item. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const renderDropdown = (
    label: string,
    value: string,
    options: { label: string; value: string }[],
    onValueChange: (value: string) => void,
    showModal: boolean,
    setShowModal: (show: boolean) => void
  ) => {
    const selectedOption = options.find(option => option.value === value);
    
    return (
      <View style={styles.inputGroup}>
        <Text style={styles.label}>{label}</Text>
        <TouchableOpacity
          style={styles.dropdownButton}
          onPress={() => setShowModal(true)}
        >
          <Text style={styles.dropdownButtonText}>
            {selectedOption ? selectedOption.label : 'Select...'}
          </Text>
          <Text style={styles.dropdownArrow}>▼</Text>
        </TouchableOpacity>
        
        <Modal
          visible={showModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowModal(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowModal(false)}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select {label}</Text>
                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={() => setShowModal(false)}
                >
                  <Text style={styles.modalCloseText}>✕</Text>
                </TouchableOpacity>
              </View>
              
              <FlatList
                data={options}
                keyExtractor={(item) => item.value}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.modalOption,
                      value === item.value && styles.modalOptionSelected,
                    ]}
                    onPress={() => {
                      onValueChange(item.value);
                      setShowModal(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.modalOptionText,
                        value === item.value && styles.modalOptionTextSelected,
                      ]}
                    >
                      {item.label}
                    </Text>
                    {value === item.value && (
                      <Text style={styles.modalOptionCheck}>✓</Text>
                    )}
                  </TouchableOpacity>
                )}
                style={styles.modalList}
              />
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Add Pantry Item</Text>
          </View>

          <View style={styles.form}>
            {/* Basic Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Basic Information</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Item Name *</Text>
                <TextInput
                  style={styles.textInput}
                  value={formData.name}
                  onChangeText={(value) => handleInputChange('name', value)}
                  placeholder="e.g., Organic Apples"
                  placeholderTextColor={Colors.textTertiary}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Brand (Optional)</Text>
                <TextInput
                  style={styles.textInput}
                  value={formData.brand}
                  onChangeText={(value) => handleInputChange('brand', value)}
                  placeholder="e.g., Whole Foods"
                  placeholderTextColor={Colors.textTertiary}
                />
              </View>

              {renderDropdown(
                'Category',
                formData.category,
                categoryOptions,
                (value) => handleInputChange('category', value as FoodCategory),
                showCategoryModal,
                setShowCategoryModal
              )}

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Quantity *</Text>
                <TextInput
                  style={styles.textInput}
                  value={formData.quantity.toString()}
                  onChangeText={(value) => handleInputChange('quantity', parseFloat(value) || 0)}
                  placeholder="1"
                  keyboardType="numeric"
                  placeholderTextColor={Colors.textTertiary}
                />
              </View>

              {renderDropdown(
                'Unit *',
                formData.unit,
                unitOptions,
                (value) => handleInputChange('unit', value as QuantityUnit),
                showUnitModal,
                setShowUnitModal
              )}

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Expiration Date (Optional - AI will suggest if blank)</Text>
                <TouchableOpacity
                  style={styles.datePickerButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={[
                    styles.datePickerButtonText,
                    !formData.expirationDate && styles.datePickerPlaceholder
                  ]}>
                    {formatDateForDisplay(formData.expirationDate)}
                  </Text>
                  <Text style={styles.datePickerIcon}>📅</Text>
                </TouchableOpacity>
                
                {showDatePicker && (
                  <Modal
                    visible={showDatePicker}
                    transparent={true}
                    animationType="slide"
                    onRequestClose={() => setShowDatePicker(false)}
                  >
                    <View style={styles.datePickerModal}>
                      <View style={styles.datePickerContainer}>
                        <View style={styles.datePickerHeader}>
                          <TouchableOpacity
                            style={styles.datePickerCancelButton}
                            onPress={() => setShowDatePicker(false)}
                          >
                            <Text style={styles.datePickerCancelText}>Cancel</Text>
                          </TouchableOpacity>
                          <Text style={styles.datePickerTitle}>Select Expiration Date</Text>
                          <TouchableOpacity
                            style={styles.datePickerCloseButton}
                            onPress={handleDatePickerDone}
                          >
                            <Text style={styles.datePickerCloseText}>Done</Text>
                          </TouchableOpacity>
                        </View>
                        <DateTimePicker
                          value={selectedDate}
                          mode="date"
                          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                          onChange={handleDateChange}
                          minimumDate={new Date()}
                          textColor="#000000"
                          style={styles.datePicker}
                        />
                      </View>
                    </View>
                  </Modal>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Barcode (Optional)</Text>
                <View style={styles.barcodeInputContainer}>
                  <TextInput
                    style={[styles.textInput, styles.barcodeInput]}
                    value={formData.barcode}
                    onChangeText={(value) => handleInputChange('barcode', value)}
                    placeholder="1234567890123"
                    keyboardType="numeric"
                    placeholderTextColor={Colors.textTertiary}
                  />
                  <TouchableOpacity
                    style={styles.scanButton}
                    onPress={() => setShowBarcodeScanner(true)}
                  >
                    <Text style={styles.scanButtonText}>📷 Scan</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Notes (Optional)</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  value={formData.notes}
                  onChangeText={(value) => handleInputChange('notes', value)}
                  placeholder="Any additional notes..."
                  multiline
                  numberOfLines={3}
                  placeholderTextColor={Colors.textTertiary}
                />
              </View>
            </View>

            {/* Nutrition Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Nutrition Information (Optional)</Text>
              
              <View style={styles.row}>
                <View style={[styles.inputGroup, styles.halfWidth]}>
                  <Text style={styles.label}>Calories</Text>
                  <TextInput
                    style={styles.textInput}
                    value={formData.nutritionInfo?.calories?.toString() || ''}
                    onChangeText={(value) => handleNutritionChange('calories', parseFloat(value) || undefined)}
                    placeholder="0"
                    keyboardType="numeric"
                    placeholderTextColor={Colors.textTertiary}
                  />
                </View>
                <View style={[styles.inputGroup, styles.halfWidth]}>
                  <Text style={styles.label}>Protein (g)</Text>
                  <TextInput
                    style={styles.textInput}
                    value={formData.nutritionInfo?.protein?.toString() || ''}
                    onChangeText={(value) => handleNutritionChange('protein', parseFloat(value) || undefined)}
                    placeholder="0"
                    keyboardType="numeric"
                    placeholderTextColor={Colors.textTertiary}
                  />
                </View>
              </View>

              <View style={styles.row}>
                <View style={[styles.inputGroup, styles.halfWidth]}>
                  <Text style={styles.label}>Carbs (g)</Text>
                  <TextInput
                    style={styles.textInput}
                    value={formData.nutritionInfo?.carbohydrates?.toString() || ''}
                    onChangeText={(value) => handleNutritionChange('carbohydrates', parseFloat(value) || undefined)}
                    placeholder="0"
                    keyboardType="numeric"
                    placeholderTextColor={Colors.textTertiary}
                  />
                </View>
                <View style={[styles.inputGroup, styles.halfWidth]}>
                  <Text style={styles.label}>Fat (g)</Text>
                  <TextInput
                    style={styles.textInput}
                    value={formData.nutritionInfo?.fat?.toString() || ''}
                    onChangeText={(value) => handleNutritionChange('fat', parseFloat(value) || undefined)}
                    placeholder="0"
                    keyboardType="numeric"
                    placeholderTextColor={Colors.textTertiary}
                  />
                </View>
              </View>

              <View style={styles.row}>
                <View style={[styles.inputGroup, styles.halfWidth]}>
                  <Text style={styles.label}>Fiber (g)</Text>
                  <TextInput
                    style={styles.textInput}
                    value={formData.nutritionInfo?.fiber?.toString() || ''}
                    onChangeText={(value) => handleNutritionChange('fiber', parseFloat(value) || undefined)}
                    placeholder="0"
                    keyboardType="numeric"
                    placeholderTextColor={Colors.textTertiary}
                  />
                </View>
                <View style={[styles.inputGroup, styles.halfWidth]}>
                  <Text style={styles.label}>Sugar (g)</Text>
                  <TextInput
                    style={styles.textInput}
                    value={formData.nutritionInfo?.sugar?.toString() || ''}
                    onChangeText={(value) => handleNutritionChange('sugar', parseFloat(value) || undefined)}
                    placeholder="0"
                    keyboardType="numeric"
                    placeholderTextColor={Colors.textTertiary}
                  />
                </View>
              </View>

              <View style={styles.row}>
                <View style={[styles.inputGroup, styles.halfWidth]}>
                  <Text style={styles.label}>Sodium (mg)</Text>
                  <TextInput
                    style={styles.textInput}
                    value={formData.nutritionInfo?.sodium?.toString() || ''}
                    onChangeText={(value) => handleNutritionChange('sodium', parseFloat(value) || undefined)}
                    placeholder="0"
                    keyboardType="numeric"
                    placeholderTextColor={Colors.textTertiary}
                  />
                </View>
                <View style={[styles.inputGroup, styles.halfWidth]}>
                  <Text style={styles.label}>Serving Size</Text>
                  <TextInput
                    style={styles.textInput}
                    value={formData.nutritionInfo?.servingSize || ''}
                    onChangeText={(value) => handleNutritionChange('servingSize', value)}
                    placeholder="1 cup"
                    placeholderTextColor={Colors.textTertiary}
                  />
                </View>
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              <Text style={styles.submitButtonText}>
                {loading ? 'Adding...' : 'Add to Pantry'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      
      {/* Barcode Scanner Modal */}
      <Modal
        visible={showBarcodeScanner}
        animationType="slide"
        onRequestClose={() => setShowBarcodeScanner(false)}
      >
        <BarcodeScanner
          onBarcodeScanned={handleBarcodeScanned}
          onClose={() => setShowBarcodeScanner(false)}
        />
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    marginRight: Spacing.md,
  },
  backButtonText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '500',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  form: {
    padding: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.xxxl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  inputGroup: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 5,
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
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  barcodeInputContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  barcodeInput: {
    flex: 1,
  },
  scanButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 90,
  },
  scanButtonText: {
    color: Colors.textInverse,
    fontSize: 16,
    fontWeight: '600',
  },
  dropdownButton: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownButtonText: {
    fontSize: 16,
    color: Colors.textPrimary,
    flex: 1,
  },
  dropdownArrow: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginLeft: Spacing.sm,
  },
  datePickerButton: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  datePickerButtonText: {
    fontSize: 16,
    color: Colors.textPrimary,
    flex: 1,
  },
  datePickerPlaceholder: {
    color: Colors.textTertiary,
  },
  datePickerIcon: {
    fontSize: 16,
    marginLeft: Spacing.sm,
  },
  datePickerModal: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  datePickerContainer: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Spacing.lg,
    borderTopRightRadius: Spacing.lg,
    paddingBottom: 34,
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  datePickerCancelButton: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    backgroundColor: 'transparent',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  datePickerCancelText: {
    color: Colors.textSecondary,
    fontSize: 16,
    fontWeight: '500',
  },
  datePickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  datePickerCloseButton: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
  },
  datePickerCloseText: {
    color: Colors.textInverse,
    fontSize: 16,
    fontWeight: '600',
  },
  datePicker: {
    height: 200,
    backgroundColor: Colors.surface,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    margin: Spacing.lg,
    maxHeight: '70%',
    minWidth: '80%',
    shadowColor: Colors.textPrimary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  modalCloseButton: {
    padding: 4,
  },
  modalCloseText: {
    fontSize: 18,
    color: Colors.textSecondary,
    fontWeight: 'bold',
  },
  modalList: {
    maxHeight: 300,
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  modalOptionSelected: {
    backgroundColor: Colors.background,
  },
  modalOptionText: {
    fontSize: 16,
    color: Colors.textPrimary,
    flex: 1,
  },
  modalOptionTextSelected: {
    color: Colors.primary,
    fontWeight: '500',
  },
  modalOptionCheck: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  submitButtonDisabled: {
    backgroundColor: Colors.disabled,
  },
  submitButtonText: {
    color: Colors.textInverse,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AddItemScreen;
