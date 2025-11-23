import { Request, Response } from 'express';
import { DatabaseService } from '@/services/database.service';
import { supabaseAdmin } from '@/config/supabase';

/**
 * Admin Controller
 * 
 * Provides metrics and analytics endpoints for admin dashboard
 * All endpoints require admin API key authentication
 */

/**
 * Get overview metrics
 * 
 * @route GET /api/v1/admin/metrics/overview
 * @returns Overview statistics including total users, items, recipes, etc.
 */
export const getOverviewMetrics = async (req: Request, res: Response) => {
  try {
    const dbService = DatabaseService.getInstance();

    // Get total users (count distinct user_ids)
    const { count: totalUsers, error: usersError } = await supabaseAdmin
      .from('pantry_items')
      .select('user_id', { count: 'exact', head: true });

    if (usersError) throw usersError;

    // Get distinct user count
    const { data: distinctUsers, error: distinctError } = await supabaseAdmin
      .from('pantry_items')
      .select('user_id')
      .not('user_id', 'is', null);

    const uniqueUserCount = distinctUsers 
      ? new Set(distinctUsers.map(u => u.user_id)).size 
      : 0;

    // Get total pantry items
    const { count: totalItems, error: itemsError } = await supabaseAdmin
      .from('pantry_items')
      .select('*', { count: 'exact', head: true });

    if (itemsError) throw itemsError;

    // Get total recipes generated
    let totalRecipes = 0;
    try {
      const { count, error: recipesError } = await supabaseAdmin
        .from('recipe_generations')
        .select('*', { count: 'exact', head: true });
      
      if (!recipesError && count !== null) {
        totalRecipes = count;
      }
    } catch (e) {
      // Table might not exist yet - that's okay
      console.log('recipe_generations table not found, defaulting to 0');
    }

    res.status(200).json({
      success: true,
      data: {
        totalUsers: uniqueUserCount,
        totalPantryItems: totalItems || 0,
        totalRecipes: totalRecipes,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error fetching overview metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch overview metrics',
    });
  }
};

/**
 * Get recipe generation metrics
 * 
 * @route GET /api/v1/admin/metrics/recipes
 * @returns Recipe generation statistics including average time, weekly averages, etc.
 */
export const getRecipeMetrics = async (req: Request, res: Response) => {
  try {
    // Check if recipes table exists and has generation_time column
    let totalRecipes = 0;
    let averageGenerationTime = 0;
    let weeklyRecipesPerUser = 0;

    try {
      const { data: recipes, error: recipesError } = await supabaseAdmin
        .from('recipe_generations')
        .select('*');

      if (!recipesError && recipes) {
        totalRecipes = recipes.length;

        // Calculate average generation time
        const recipesWithTime = recipes.filter(r => r.generation_time_ms);
        if (recipesWithTime.length > 0) {
          const totalTime = recipesWithTime.reduce(
            (sum, r) => sum + (r.generation_time_ms || 0),
            0
          );
          averageGenerationTime = totalTime / recipesWithTime.length;
        }

        // Calculate weekly recipes per user
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const recentRecipes = recipes.filter(r => {
          const createdAt = new Date(r.created_at);
          return createdAt >= oneWeekAgo;
        });

        // Get unique users who generated recipes this week
        const usersThisWeek = new Set(
          recentRecipes.map(r => r.user_id).filter(Boolean)
        );

        weeklyRecipesPerUser = usersThisWeek.size > 0
          ? recentRecipes.length / usersThisWeek.size
          : 0;
      }
    } catch (e) {
      console.log('recipe_generations table not found or missing columns');
    }

    res.status(200).json({
      success: true,
      data: {
        totalRecipes,
        averageGenerationTimeMs: Math.round(averageGenerationTime),
        averageWeeklyRecipesPerUser: Math.round(weeklyRecipesPerUser * 100) / 100,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error fetching recipe metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch recipe metrics',
    });
  }
};

/**
 * Get all metrics in one call
 * 
 * @route GET /api/v1/admin/metrics
 * @returns All available metrics
 */
export const getAllMetrics = async (req: Request, res: Response) => {
  try {
    const dbService = DatabaseService.getInstance();

    // Get total users
    const { data: distinctUsers } = await supabaseAdmin
      .from('pantry_items')
      .select('user_id')
      .not('user_id', 'is', null);

    const uniqueUserCount = distinctUsers 
      ? new Set(distinctUsers.map(u => u.user_id)).size 
      : 0;

    // Get total pantry items
    const { count: totalItems } = await supabaseAdmin
      .from('pantry_items')
      .select('*', { count: 'exact', head: true });

    // Get recipe metrics
    let totalRecipes = 0;
    let averageGenerationTime = 0;
    let weeklyRecipesPerUser = 0;

    try {
      const { data: recipes } = await supabaseAdmin
        .from('recipe_generations')
        .select('*');

      if (recipes) {
        totalRecipes = recipes.length;

        const recipesWithTime = recipes.filter(r => r.generation_time_ms);
        if (recipesWithTime.length > 0) {
          const totalTime = recipesWithTime.reduce(
            (sum, r) => sum + (r.generation_time_ms || 0),
            0
          );
          averageGenerationTime = totalTime / recipesWithTime.length;
        }

        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const recentRecipes = recipes.filter(r => {
          const createdAt = new Date(r.created_at);
          return createdAt >= oneWeekAgo;
        });

        const usersThisWeek = new Set(
          recentRecipes.map(r => r.user_id).filter(Boolean)
        );

        weeklyRecipesPerUser = usersThisWeek.size > 0
          ? recentRecipes.length / usersThisWeek.size
          : 0;
      }
    } catch (e) {
      // recipe_generations table might not exist
    }

    res.status(200).json({
      success: true,
      data: {
        totalUsers: uniqueUserCount,
        totalPantryItems: totalItems || 0,
        totalRecipes,
        averageGenerationTimeMs: Math.round(averageGenerationTime),
        averageWeeklyRecipesPerUser: Math.round(weeklyRecipesPerUser * 100) / 100,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error fetching all metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch metrics',
    });
  }
};

