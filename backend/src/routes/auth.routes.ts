import { Router } from 'express';
import * as authController from '@/controllers/auth.controller';

const router = Router();

/**
 * @route   POST /api/v1/auth/login
 * @desc    Login or create user by email
 * @access  Public
 */
router.post('/login', authController.login);

/**
 * @route   GET /api/v1/auth/me
 * @desc    Get current user info
 * @access  Authenticated (requires x-user-id header)
 */
router.get('/me', authController.getCurrentUser);

/**
 * @route   PUT /api/v1/auth/me
 * @desc    Update current user
 * @access  Authenticated (requires x-user-id header)
 */
router.put('/me', authController.updateCurrentUser);

/**
 * @route   PUT /api/v1/auth/preferences
 * @desc    Update user preferences (diet, goals, food restrictions)
 * @access  Authenticated (requires x-user-id header)
 */
router.put('/preferences', authController.updatePreferences);

export default router;
