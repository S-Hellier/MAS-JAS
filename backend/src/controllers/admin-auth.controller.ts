import { Request, Response } from 'express';
import { AuthenticatedAdminRequest } from '@/middleware/admin-auth.middleware';
import { AuthService } from '@/services/auth.service';

const authService = AuthService.getInstance();

/**
 * Admin Authentication Controller
 * 
 * Provides endpoints for admin dashboard authentication
 */

/**
 * Verify if current user is an admin
 * 
 * @route GET /api/v1/admin/auth/verify
 * @access Requires x-user-id header
 * @returns Admin user information if user is an admin
 */
export const verifyAdminStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.headers['x-user-id'] as string;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'User ID required. Provide x-user-id header.',
      });
      return;
    }

    const user = await authService.getUserById(userId);

    if (!user) {
      res.status(401).json({
        success: false,
        error: 'User not found',
      });
      return;
    }

    if (!user.is_admin) {
      res.status(403).json({
        success: false,
        error: 'Admin access required. This user does not have admin privileges.',
        is_admin: false,
      });
      return;
    }

    // User is an admin
    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          is_admin: user.is_admin,
        },
        is_admin: true,
      },
    });
  } catch (error) {
    console.error('Error in verifyAdminStatus:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to verify admin status',
    });
  }
};

/**
 * Get current admin user (if authenticated via user-based auth)
 * 
 * @route GET /api/v1/admin/auth/me
 * @access Requires user-based admin authentication
 * @returns Current admin user information
 */
export const getCurrentAdminUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const adminReq = req as AuthenticatedAdminRequest;

    if (!adminReq.adminUser) {
      // This endpoint requires user-based auth, not API key
      res.status(401).json({
        success: false,
        error: 'User-based authentication required. This endpoint requires x-user-id header with admin user.',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        user: adminReq.adminUser,
      },
    });
  } catch (error) {
    console.error('Error in getCurrentAdminUser:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get admin user',
    });
  }
};

