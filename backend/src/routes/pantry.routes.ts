import { Router } from 'express';
import { PantryController } from '@/controllers/pantry.controller';

const router = Router();
const pantryController = new PantryController();

// Pantry item CRUD operations
router.post('/', pantryController.createPantryItem);
router.get('/', pantryController.getPantryItems);

// Specific routes (must come before parameterized routes)
router.get('/expiring', pantryController.getItemsExpiringSoon);
router.get('/expired', pantryController.getExpiredItems);
router.get('/barcode/:barcode', pantryController.checkBarcode);

// Parameterized routes (must come last)
router.get('/:id', pantryController.getPantryItem);
router.put('/:id', pantryController.updatePantryItem);
router.delete('/:id', pantryController.deletePantryItem);

export default router;
