import { DatabaseService } from '@/services/database.service';
import { FoodCategory, QuantityUnit } from '@/types/pantry.types';

const sampleItems = [
  {
    name: 'Organic Bananas',
    brand: 'Whole Foods',
    quantity: 6,
    unit: QuantityUnit.PIECES,
    category: FoodCategory.PRODUCE,
    expirationDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 5 days from now
    nutritionInfo: {
      calories: 105,
      protein: 1.3,
      carbohydrates: 27,
      fat: 0.4,
      fiber: 3.1,
      sugar: 14.4,
      sodium: 1,
      servingSize: '1',
      servingUnit: 'medium banana'
    },
    notes: 'Perfect ripeness for smoothies'
  },
  {
    name: 'Jasmine Rice',
    brand: 'Lundberg',
    quantity: 2,
    unit: QuantityUnit.CUPS,
    category: FoodCategory.GRAINS,
    expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 year from now
    nutritionInfo: {
      calories: 205,
      protein: 4.3,
      carbohydrates: 45,
      fat: 0.4,
      fiber: 0.6,
      sugar: 0.1,
      sodium: 2,
      servingSize: '1',
      servingUnit: 'cup cooked'
    },
    barcode: '1234567890123'
  },
  {
    name: 'Chicken Breast',
    brand: 'Perdue',
    quantity: 1.5,
    unit: QuantityUnit.POUNDS,
    category: FoodCategory.MEAT,
    expirationDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 days from now
    nutritionInfo: {
      calories: 165,
      protein: 31,
      carbohydrates: 0,
      fat: 3.6,
      fiber: 0,
      sugar: 0,
      sodium: 74,
      servingSize: '4',
      servingUnit: 'oz'
    },
    notes: 'Free-range, organic'
  },
  {
    name: 'Whole Milk',
    brand: 'Horizon Organic',
    quantity: 1,
    unit: QuantityUnit.GALLONS,
    category: FoodCategory.DAIRY,
    expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
    nutritionInfo: {
      calories: 150,
      protein: 8,
      carbohydrates: 12,
      fat: 8,
      fiber: 0,
      sugar: 12,
      sodium: 105,
      servingSize: '1',
      servingUnit: 'cup'
    },
    barcode: '9876543210987'
  },
  {
    name: 'Salmon Fillet',
    brand: 'Wild Planet',
    quantity: 1,
    unit: QuantityUnit.POUNDS,
    category: FoodCategory.SEAFOOD,
    expirationDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 days from now
    nutritionInfo: {
      calories: 206,
      protein: 22,
      carbohydrates: 0,
      fat: 12,
      fiber: 0,
      sugar: 0,
      sodium: 59,
      servingSize: '4',
      servingUnit: 'oz'
    },
    notes: 'Wild-caught Alaskan salmon'
  },
  {
    name: 'Greek Yogurt',
    brand: 'Chobani',
    quantity: 4,
    unit: QuantityUnit.PIECES,
    category: FoodCategory.DAIRY,
    expirationDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 10 days from now
    nutritionInfo: {
      calories: 100,
      protein: 15,
      carbohydrates: 6,
      fat: 0,
      fiber: 0,
      sugar: 4,
      sodium: 50,
      servingSize: '1',
      servingUnit: 'container'
    },
    barcode: '5555555555555'
  },
  {
    name: 'Expired Bread',
    brand: 'Wonder',
    quantity: 1,
    unit: QuantityUnit.PIECES,
    category: FoodCategory.BAKERY,
    expirationDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 days ago
    nutritionInfo: {
      calories: 80,
      protein: 3,
      carbohydrates: 15,
      fat: 1,
      fiber: 1,
      sugar: 2,
      sodium: 170,
      servingSize: '1',
      servingUnit: 'slice'
    },
    notes: 'White bread - expired'
  }
];

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');
    
    const dbService = DatabaseService.getInstance();
    const userId = '816614f4-b6eb-4806-9e87-0ed87d62c317'; // Using default user for seeding
    
    let createdCount = 0;
    
    for (const item of sampleItems) {
      try {
        await dbService.createPantryItem(userId, item);
        createdCount++;
        console.log(`✅ Created: ${item.name}`);
      } catch (error) {
        console.error(`❌ Failed to create ${item.name}:`, error);
      }
    }
    
    console.log(`🎉 Seeding completed! Created ${createdCount} items.`);
    
    // Display summary
    const allItems = await dbService.getPantryItems(userId, { limit: 100 });
    const expiringSoon = await dbService.getItemsExpiringSoon(userId, 7);
    const expired = await dbService.getExpiredItems(userId);
    
    console.log('\n📊 Database Summary:');
    console.log(`Total items: ${allItems.total}`);
    console.log(`Items expiring soon (7 days): ${expiringSoon.length}`);
    console.log(`Expired items: ${expired.length}`);
    
  } catch (error) {
    console.error('💥 Seeding failed:', error);
    process.exit(1);
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

export { seedDatabase };
