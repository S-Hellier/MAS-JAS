import { Router, Request, Response, NextFunction } from 'express';
import { getOverviewMetrics, getRecipeMetrics, getAllMetrics } from '../controllers/admin.controller';

/**
 * Admin Routes
 * 
 * These routes provide metrics and analytics for admin dashboard
 * All routes require ADMIN_API_KEY in request header
 */
const router = Router();

/**
 * Middleware to verify admin API key
 */
const verifyAdminKey = (req: Request, res: Response, next: NextFunction) => {
  const adminKey = req.headers['x-admin-api-key'] as string;
  const expectedKey = process.env.ADMIN_API_KEY;

  if (!expectedKey) {
    console.warn('ADMIN_API_KEY not set in environment variables');
    return res.status(500).json({
      success: false,
      error: 'Admin API key not configured',
    });
  }

  if (!adminKey || adminKey !== expectedKey) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized - Invalid admin API key',
    });
  }

  next();
};

// Apply admin key verification to all routes
router.use(verifyAdminKey);

/**
 * GET /api/v1/admin/metrics
 * Get all metrics in one call
 */
router.get('/metrics', getAllMetrics);

/**
 * GET /api/v1/admin/metrics/overview
 * Get overview metrics (users, items, recipes)
 */
router.get('/metrics/overview', getOverviewMetrics);

/**
 * GET /api/v1/admin/metrics/recipes
 * Get recipe generation metrics
 */
router.get('/metrics/recipes', getRecipeMetrics);

export default router;

