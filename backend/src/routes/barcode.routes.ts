import { Router } from 'express';
import { lookupBarcode } from '../controllers/barcode.controller';

/**
 * Barcode Routes
 * 
 * These routes handle barcode lookup functionality
 */
const router = Router();

/**
 * GET /api/v1/barcode/lookup/:barcode
 * Look up product information by barcode
 * 
 * Example: GET /api/v1/barcode/lookup/7622210449283
 */
router.get('/lookup/:barcode', lookupBarcode);

export default router;

