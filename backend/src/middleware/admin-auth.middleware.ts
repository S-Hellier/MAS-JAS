import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';

const authService = AuthService.getInstance();

/**
 * Extended Request interface to include admin user
 */
export interface AuthenticatedAdminRequest extends Request {
  adminUser?: {
    id: string;
    email: string;
    name?: string;
    is_admin: boolean;
  };
}

/**
 * Middleware to authenticate admin users
 * 
 * Supports two authentication methods:
 * 1. API Key authentication (for external dashboards/services)
 * 2. User-based authentication (for admin dashboard with user login)
 * 
 * Either method is valid - this provides flexibility for different use cases.
 */
export const authenticateAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Method 1: Check for API Key authentication
    const adminKey = req.headers['x-admin-api-key'] as string;
    const expectedKey = process.env.ADMIN_API_KEY;

    if (adminKey && expectedKey && adminKey === expectedKey) {
      // API key is valid, allow access
      // Note: No user object attached for API key auth
      next();
      return;
    }

    // Method 2: Check for user-based authentication
    const userId = req.headers['x-user-id'] as string;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Authentication required. Provide either x-admin-api-key or x-user-id header.',
      });
      return;
    }

    // Get user and verify admin status
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
      });
      return;
    }

    // User is authenticated and is an admin
    // Attach user to request for use in controllers
    (req as AuthenticatedAdminRequest).adminUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      is_admin: user.is_admin,
    };

    next();
  } catch (error) {
    console.error('Error in authenticateAdmin middleware:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to authenticate admin',
    });
  }
};

/**
 * Middleware to require user-based authentication (not API key)
 * Use this when you specifically need a user context, not just API key access
 */
export const requireAdminUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.headers['x-user-id'] as string;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'User authentication required. Provide x-user-id header.',
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
      });
      return;
    }

    // Attach user to request
    (req as AuthenticatedAdminRequest).adminUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      is_admin: user.is_admin,
    };

    next();
  } catch (error) {
    console.error('Error in requireAdminUser middleware:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to authenticate admin user',
    });
  }
};

