import { Request, Response } from 'express';
import { AuthService } from '@/services/auth.service';
import { LoginRequest } from '@/types/auth.types';

const authService = AuthService.getInstance();

/**
 * Login or create user
 * POST /api/v1/auth/login
 */
export async function login(req: Request, res: Response) {
  try {
    const { email, name } = req.body as LoginRequest;

    // Validate email
    if (!email || typeof email !== 'string') {
      return res.status(400).json({
        error: 'Email is required and must be a string',
      });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'Invalid email format',
      });
    }

    const user = await authService.loginOrCreateUser({ email, name });

    return res.status(200).json({
      user,
      message: 'Login successful',
    });
  } catch (error) {
    console.error('Error in login:', error);
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
