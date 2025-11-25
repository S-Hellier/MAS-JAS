import { Router } from 'express';
import pantryRoutes from './pantry.routes';
import recipeRoutes from './recipes-routes';
import barcodeRoutes from './barcode.routes';
import notificationsRoutes from './notifications.routes';
import authRoutes from './auth.routes';


const router = Router();

// API versioning
router.use('/api/v1/auth', authRoutes);
router.use('/api/v1/pantry', pantryRoutes);
router.use('/api/v1/recipes', recipeRoutes);
router.use('/api/v1/barcode', barcodeRoutes);
router.use('/api/v1/notifications', notificationsRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});


export default router;
