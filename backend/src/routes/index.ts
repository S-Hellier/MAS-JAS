import { Router } from 'express';
import pantryRoutes from './pantry.routes';
import recipeRoutes from './recipes-routes';
import barcodeRoutes from './barcode.routes';
import notificationsRoutes from './notifications.routes';
import authRoutes from './auth.routes';
import adminRoutes from './admin.routes';


const router = Router();

// Root endpoint
router.get('/', (req, res) => {
  res.json({
    message: 'Pantry Partner API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      api: '/api/v1',
      docs: 'See API documentation for available endpoints'
    }
  });
});

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API versioning
router.use('/api/v1/auth', authRoutes);
router.use('/api/v1/pantry', pantryRoutes);
router.use('/api/v1/recipes', recipeRoutes);
router.use('/api/v1/barcode', barcodeRoutes);
router.use('/api/v1/notifications', notificationsRoutes);
router.use('/api/v1/admin', adminRoutes);


export default router;
