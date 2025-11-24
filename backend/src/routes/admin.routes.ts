import { Router } from 'express';
import { getOverviewMetrics, getRecipeMetrics, getAllMetrics, getDailyMetrics } from '../controllers/admin.controller';
import { setUserAsAdmin, removeUserAdmin, getAllAdmins, checkUserAdmin } from '../controllers/admin-user.controller';
import { verifyAdminStatus, getCurrentAdminUser } from '../controllers/admin-auth.controller';
import { authenticateAdmin, requireAdminUser } from '../middleware/admin-auth.middleware';

/**
 * Admin Routes
 * 
 * These routes provide metrics and analytics for admin dashboard
 * 
 * Authentication:
 * - Supports API Key authentication (x-admin-api-key header) for external services
 * - Supports User-based authentication (x-user-id header) for admin dashboard
 * - User-based auth requires the user to have is_admin = true
 * 
 * Either authentication method is valid, providing flexibility for different use cases.
 */
const router = Router();

/**
 * GET /api/v1/admin/auth/verify
 * Verify if current user (from x-user-id header) is an admin
 * Useful for admin dashboard login verification
 * Does NOT require admin authentication - just checks user status
 * 
 * IMPORTANT: This route must be BEFORE the authenticateAdmin middleware
 * because users need to verify their admin status before they can authenticate
 */
router.get('/auth/verify', verifyAdminStatus);

// Apply flexible admin authentication to all routes below
// This allows either API key OR user-based authentication
router.use(authenticateAdmin);

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

/**
 * GET /api/v1/admin/metrics/daily
 * Get daily growth metrics for the past 7 days
 */
router.get('/metrics/daily', getDailyMetrics);

/**
 * POST /api/v1/admin/users/set-admin
 * Set a user as admin by email
 */
router.post('/users/set-admin', setUserAsAdmin);

/**
 * POST /api/v1/admin/users/remove-admin
 * Remove admin status from a user by email
 */
router.post('/users/remove-admin', removeUserAdmin);

/**
 * GET /api/v1/admin/users/admins
 * Get all admin users
 */
router.get('/users/admins', getAllAdmins);

/**
 * GET /api/v1/admin/users/check-admin/:email
 * Check if a user is an admin by email
 */
router.get('/users/check-admin/:email', checkUserAdmin);

/**
 * GET /api/v1/admin/auth/me
 * Get current admin user information
 * Requires user-based admin authentication (not API key)
 */
router.get('/auth/me', requireAdminUser, getCurrentAdminUser);

export default router;

