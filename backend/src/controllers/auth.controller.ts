import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { LoginRequest, UpdatePreferencesRequest } from '../types/auth.types';

const authService = AuthService.getInstance();

/**
 * Login or create user
 * POST /api/v1/auth/login
 */
export async function login(req: Request, res: Response) {
  try {
    console.log('🔐 [LOGIN] Request received');
    console.log('🔐 [LOGIN] Headers:', req.headers);
    console.log('🔐 [LOGIN] Body:', req.body);
    
    const { email, name } = req.body as LoginRequest;

    // Validate email
    if (!email || typeof email !== 'string') {
      console.log('🔐 [LOGIN] ❌ Invalid email - missing or not string');
      return res.status(400).json({
        error: 'Email is required and must be a string',
      });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('🔐 [LOGIN] ❌ Invalid email format:', email);
      return res.status(400).json({
        error: 'Invalid email format',
      });
    }

    console.log('🔐 [LOGIN] Attempting to login/create user:', email);
    const user = await authService.loginOrCreateUser({ email, name });
    console.log('🔐 [LOGIN] ✅ User logged in/created:', user.id);

    return res.status(200).json({
      user,
      message: 'Login successful',
    });
  } catch (error) {
    console.error('🔐 [LOGIN] ❌ Error in login:', error);
    console.error('🔐 [LOGIN] Error details:', error instanceof Error ? error.message : 'Unknown error');
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
}

/**
 * Get current user info
 * GET /api/v1/auth/me
 */
export async function getCurrentUser(req: Request, res: Response) {
  try {
    const userId = req.headers['x-user-id'] as string;

    if (!userId) {
      return res.status(401).json({
        error: 'User ID not provided',
      });
    }

    const user = await authService.getUserById(userId);

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
      });
    }

    return res.status(200).json({
      user,
    });
  } catch (error) {
    console.error('Error getting current user:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
}

/**
 * Update user name
 * PUT /api/v1/auth/me
 */
export async function updateCurrentUser(req: Request, res: Response) {
  try {
    const userId = req.headers['x-user-id'] as string;
    const { name } = req.body;

    if (!userId) {
      return res.status(401).json({
        error: 'User ID not provided',
      });
    }

    if (!name || typeof name !== 'string') {
      return res.status(400).json({
        error: 'Name is required and must be a string',
      });
    }

    const user = await authService.updateUserName(userId, name);

    return res.status(200).json({
      user,
      message: 'User updated successfully',
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
}

/**
 * Update user preferences (diet, goals, food restrictions)
 * PUT /api/v1/auth/preferences
 */
export async function updatePreferences(req: Request, res: Response) {
  try {
    const userId = req.headers['x-user-id'] as string;
    const { diet, goals, food_restrictions, profile_completed } = req.body as UpdatePreferencesRequest;

    if (!userId) {
      return res.status(401).json({
        error: 'User ID not provided',
      });
    }

    // Validate diet if provided - accept any string
    if (diet !== undefined && typeof diet !== 'string') {
      return res.status(400).json({
        error: 'Diet must be a string',
      });
    }

    // Validate goals if provided - accept any string
    if (goals !== undefined && typeof goals !== 'string') {
      return res.status(400).json({
        error: 'Goals must be a string',
      });
    }

    // Validate food_restrictions if provided
    if (food_restrictions !== undefined && !Array.isArray(food_restrictions)) {
      return res.status(400).json({
        error: 'Food restrictions must be an array',
      });
    }

    const preferences: UpdatePreferencesRequest = {};
    if (diet !== undefined) preferences.diet = diet;
    if (goals !== undefined) preferences.goals = goals;
    if (food_restrictions !== undefined) preferences.food_restrictions = food_restrictions;
    if (profile_completed !== undefined) preferences.profile_completed = profile_completed;

    const user = await authService.updateUserPreferences(userId, preferences);

    return res.status(200).json({
      user,
      message: 'Preferences updated successfully',
    });
  } catch (error) {
    console.error('Error updating preferences:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
}
