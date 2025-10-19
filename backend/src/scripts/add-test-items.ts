import { apiService } from '../services/api.service';

const testItems = [
  {
    name: 'Organic Milk',
    brand: 'Horizon Organic',
    quantity: 1,
    unit: 'gallons',
    category: 'dairy',
    expirationDate: '2025-10-25',
    notes: 'Whole milk, refrigerate after opening',
    nutritionInfo: {
      calories: 150,
      protein: 8,
      carbohydrates: 12,
      fat: 8,
      servingSize: '1',
      servingUnit: 'cup',
    },
  },
  {
    name: 'Fresh Strawberries',
    brand: 'Driscoll\'s',
    quantity: 1,
    unit: 'pounds',
    category: 'produce',
    expirationDate: '2025-10-22',
    notes: 'Wash before eating',
    nutritionInfo: {
      calories: 50,
      carbohydrates: 12,
      fiber: 3,
      sugar: 8,
      servingSize: '1',
      servingUnit: 'cup',
    },
  },
  {
    name: 'Whole Wheat Bread',
    brand: 'Dave\'s Killer Bread',
    quantity: 1,
    unit: 'loaves',
    category: 'bakery',
    expirationDate: '2025-10-28',
    notes: 'Keep in pantry or freeze for longer storage',
    nutritionInfo: {
      calories: 110,
      protein: 6,
      carbohydrates: 22,
      fat: 1.5,
      fiber: 5,
      servingSize: '1',
      servingUnit: 'slice',
    },
  },
  {
    name: 'Ground Beef',
    brand: 'Organic Valley',
    quantity: 2,
    unit: 'pounds',
    category: 'meat',
    expirationDate: '2025-10-21',
    notes: 'Use or freeze within 2 days',
    nutritionInfo: {
      calories: 250,
      protein: 22,
      fat: 18,
      servingSize: '4',
      servingUnit: 'oz',
    },
  },
  {
    name: 'Eggs',
    brand: 'Pete and Gerry\'s',
    quantity: 12,
    unit: 'pieces',
    category: 'dairy',
    expirationDate: '2025-11-05',
    notes: 'Large, cage-free eggs',
    nutritionInfo: {
      calories: 70,
      protein: 6,
      fat: 5,
      servingSize: '1',
      servingUnit: 'egg',
    },
  },
  {
    name: 'Pasta',
    brand: 'Barilla',
    quantity: 2,
    unit: 'pounds',
    category: 'grains',
    expirationDate: '2026-06-15',
    notes: 'Penne rigate',
    nutritionInfo: {
      calories: 200,
      protein: 7,
      carbohydrates: 42,
      fiber: 2,
      servingSize: '2',
      servingUnit: 'oz',
    },
  },
  {
    name: 'Cheddar Cheese',
    brand: 'Tillamook',
    quantity: 1,
    unit: 'pounds',
    category: 'dairy',
    expirationDate: '2025-11-10',
    notes: 'Sharp cheddar, shredded',
    nutritionInfo: {
      calories: 110,
      protein: 7,
      fat: 9,
      servingSize: '1',
      servingUnit: 'oz',
    },
  },
  {
    name: 'Orange Juice',
    brand: 'Tropicana',
    quantity: 64,
    unit: 'ounces',
    category: 'beverages',
    expirationDate: '2025-10-30',
    notes: 'Pulp-free, refrigerate after opening',
    nutritionInfo: {
      calories: 110,
      carbohydrates: 26,
      sugar: 22,
      servingSize: '8',
      servingUnit: 'oz',
    },
  },
  {
    name: 'Chicken Breast',
    brand: 'Perdue',
    quantity: 2,
    unit: 'pounds',
    category: 'meat',
    expirationDate: '2025-10-23',
    notes: 'Boneless, skinless',
    nutritionInfo: {
      calories: 165,
      protein: 31,
      fat: 3.6,
      servingSize: '4',
      servingUnit: 'oz',
    },
  },
  {
    name: 'Bananas',
    brand: '',
    quantity: 6,
    unit: 'pieces',
    category: 'produce',
    expirationDate: '2025-10-24',
    notes: 'Organic',
    nutritionInfo: {
      calories: 105,
      carbohydrates: 27,
      fiber: 3,
      sugar: 14,
      servingSize: '1',
      servingUnit: 'banana',
    },
  },
];

async function addTestItems() {
  console.log('Adding test items to pantry...\n');

  for (const item of testItems) {
    try {
      const result = await apiService.createPantryItem(item as any);
      if (result.success) {
        console.log(`✓ Added: ${item.name}`);
      } else {
        console.log(`✗ Failed to add: ${item.name} - ${result.error}`);
      }
    } catch (error: any) {
      console.log(`✗ Error adding ${item.name}: ${error.message}`);
    }
  }

  console.log('\nDone adding test items!');
  process.exit(0);
}

addTestItems();
