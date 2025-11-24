import { Request, Response } from 'express';
import { supabaseAdmin } from '@/config/supabase';
import { AuthService } from '@/services/auth.service';

const authService = AuthService.getInstance();

/**
 * Admin User Management Controller
 * 
 * Provides endpoints for managing admin status of users
 * Note: These endpoints use the ADMIN_API_KEY authentication (not user-based)
 */

/**
 * Set a user as admin by email
 * 
 * @route POST /api/v1/admin/users/set-admin
 * @body { email: string }
 */
export const setUserAsAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!supabaseAdmin) {
      res.status(500).json({
        success: false,
        error: 'Database connection not available',
      });
      return;
    }

    const { email } = req.body;

    if (!email || typeof email !== 'string') {
      res.status(400).json({
        success: false,
        error: 'Email is required and must be a string',
      });
      return;
    }

    // Find user by email
    const user = await authService.getUserByEmail(email);

    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User not found',
      });
      return;
    }

    // Update user to admin
    const { data: updatedUser, error } = await supabaseAdmin
      .from('users')
      .update({ is_admin: true })
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating user to admin:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to set user as admin',
        details: error.message || 'Unknown database error',
        hint: error.message?.includes('column') 
          ? 'The is_admin column may not exist. Run migration 006_add_admin_role.sql'
          : undefined,
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: `User ${email} has been set as admin`,
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error in setUserAsAdmin:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

/**
 * Remove admin status from a user by email
 * 
 * @route POST /api/v1/admin/users/remove-admin
 * @body { email: string }
 */
export const removeUserAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!supabaseAdmin) {
      res.status(500).json({
        success: false,
        error: 'Database connection not available',
      });
      return;
    }

    const { email } = req.body;

    if (!email || typeof email !== 'string') {
      res.status(400).json({
        success: false,
        error: 'Email is required and must be a string',
      });
      return;
    }

    // Find user by email
    const user = await authService.getUserByEmail(email);

    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User not found',
      });
      return;
    }

    // Update user to remove admin status
    const { data: updatedUser, error } = await supabaseAdmin
      .from('users')
      .update({ is_admin: false })
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error removing admin status:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to remove admin status',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: `Admin status removed from ${email}`,
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error in removeUserAdmin:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

/**
 * Get all admin users
 * 
 * @route GET /api/v1/admin/users/admins
 */
export const getAllAdmins = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!supabaseAdmin) {
      res.status(500).json({
        success: false,
        error: 'Database connection not available',
      });
      return;
    }

    const { data: admins, error } = await supabaseAdmin
      .from('users')
      .select('id, email, name, is_admin, created_at')
      .eq('is_admin', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching admins:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch admin users',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        admins: admins || [],
        count: admins?.length || 0,
      },
    });
  } catch (error) {
    console.error('Error in getAllAdmins:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

/**
 * Check if a user is an admin by email
 * 
 * @route GET /api/v1/admin/users/check-admin/:email
 */
export const checkUserAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!supabaseAdmin) {
      res.status(500).json({
        success: false,
        error: 'Database connection not available',
      });
      return;
    }

    const { email } = req.params;

    if (!email) {
      res.status(400).json({
        success: false,
        error: 'Email parameter is required',
      });
      return;
    }

    const user = await authService.getUserByEmail(email);

    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        email: user.email,
        is_admin: user.is_admin || false,
      },
    });
  } catch (error) {
    console.error('Error in checkUserAdmin:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

