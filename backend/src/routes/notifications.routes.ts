import { Router } from 'express';
import { getExpiringItems } from '../controllers/notifications.controller';

/**
 * Notification Routes
 * 
 * These routes handle expiration notifications
 */
const router = Router();

/**
 * GET /api/v1/notifications/expiring
 * Get items that need expiration notifications
 * Uses rule-based logic to determine smart notification timing based on shelf life
 */
router.get('/expiring', getExpiringItems);

export default router;

