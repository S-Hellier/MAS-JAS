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
    if (!supabaseAdmin) {
      return res.status(500).json({
        success: false,
        error: 'Database connection not available',
      });
    }

    const dbService = DatabaseService.getInstance();

    // Get total users from users table (more accurate)
    const { count: totalUsers, error: usersError } = await supabaseAdmin
      .from('users')
      .select('*', { count: 'exact', head: true });

    if (usersError) {
      console.warn('Error fetching users, falling back to pantry_items count:', usersError);
      // Fallback to counting from pantry_items if users table query fails
      const { data: distinctUsers } = await supabaseAdmin
        .from('pantry_items')
        .select('user_id')
        .not('user_id', 'is', null);
      
      const uniqueUserCount = distinctUsers 
        ? new Set(distinctUsers.map(u => u.user_id)).size 
        : 0;
      
      res.status(200).json({
        success: true,
        data: {
          totalUsers: uniqueUserCount,
          totalPantryItems: 0,
          totalRecipes: 0,
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

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
        totalUsers: totalUsers || 0,
        totalPantryItems: totalItems || 0,
        totalRecipes: totalRecipes,
        timestamp: new Date().toISOString(),
      },
    });
    return;
  } catch (error) {
    console.error('Error fetching overview metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch overview metrics',
    });
    return;
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
    if (!supabaseAdmin) {
      return res.status(500).json({
        success: false,
        error: 'Database connection not available',
      });
    }

    // Check if recipes table exists and has generation_time column
    let totalRecipes = 0;
    let averageGenerationTime = 0;
    let averageWeeklyRecipesPerUser = 0;
    let totalActiveUsers = 0;

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

        // Get total number of users from users table
        const { count: totalUsersCount, error: usersError } = await supabaseAdmin
          .from('users')
          .select('*', { count: 'exact', head: true });

        if (!usersError && totalUsersCount !== null) {
          totalActiveUsers = totalUsersCount;
        }

        // Calculate average weekly recipes per user
        // This calculates the average across all weeks where recipes were generated
        if (recipes.length > 0 && totalActiveUsers > 0) {
          // Group recipes by week
          const recipesByWeek = new Map<string, { recipes: number; users: Set<string> }>();
          
          recipes.forEach((recipe) => {
            const createdAt = new Date(recipe.created_at);
            // Get the start of the week (Monday)
            const weekStart = new Date(createdAt);
            const dayOfWeek = weekStart.getDay();
            const diff = weekStart.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust to Monday
            weekStart.setDate(diff);
            weekStart.setHours(0, 0, 0, 0);
            
            const weekKey = weekStart.toISOString().split('T')[0];
            
            if (!recipesByWeek.has(weekKey)) {
              recipesByWeek.set(weekKey, { recipes: 0, users: new Set() });
            }
            
            const weekData = recipesByWeek.get(weekKey)!;
            weekData.recipes += 1;
            if (recipe.user_id) {
              weekData.users.add(recipe.user_id);
            }
          });

          // Calculate average recipes per user per week
          // Method 1: Average across all weeks (total recipes / total weeks / total users)
          const totalWeeks = recipesByWeek.size;
          if (totalWeeks > 0) {
            averageWeeklyRecipesPerUser = totalRecipes / totalWeeks / totalActiveUsers;
          }

          // Alternative: Calculate for the most recent week
          const oneWeekAgo = new Date();
          oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
          
          const recentRecipes = recipes.filter(r => {
            const createdAt = new Date(r.created_at);
            return createdAt >= oneWeekAgo;
          });

          const usersThisWeek = new Set(
            recentRecipes.map(r => r.user_id).filter(Boolean)
          );

          // If we have data for the current week, we can also provide that metric
          const currentWeekRecipesPerUser = usersThisWeek.size > 0
            ? recentRecipes.length / usersThisWeek.size
            : 0;
          
          // Use the overall average, but you could also return currentWeekRecipesPerUser
          // For now, we'll use the average across all weeks
        }
      }
    } catch (e) {
      console.log('recipe_generations table not found or missing columns');
    }

    res.status(200).json({
      success: true,
      data: {
        totalRecipes,
        averageGenerationTimeMs: Math.round(averageGenerationTime),
        averageWeeklyRecipesPerUser: Math.round(averageWeeklyRecipesPerUser * 100) / 100,
        totalActiveUsers,
        timestamp: new Date().toISOString(),
      },
    });
    return;
  } catch (error) {
    console.error('Error fetching recipe metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch recipe metrics',
    });
    return;
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
    if (!supabaseAdmin) {
      res.status(500).json({
        success: false,
        error: 'Database connection not available',
      });
      return;
    }

    const dbService = DatabaseService.getInstance();

    // Get total users from users table (more accurate)
    const { count: totalUsers, error: usersError } = await supabaseAdmin
      .from('users')
      .select('*', { count: 'exact', head: true });

    let uniqueUserCount = totalUsers || 0;
    
    // Fallback to pantry_items if users table query fails
    if (usersError) {
      console.warn('Error fetching users, falling back to pantry_items count:', usersError);
      const { data: distinctUsers } = await supabaseAdmin
        .from('pantry_items')
        .select('user_id')
        .not('user_id', 'is', null);

      uniqueUserCount = distinctUsers 
        ? new Set(distinctUsers.map(u => u.user_id)).size 
        : 0;
    }

    // Get total pantry items
    const { count: totalItems } = await supabaseAdmin
      .from('pantry_items')
      .select('*', { count: 'exact', head: true });

    // Get recipe metrics
    let totalRecipes = 0;
    let averageGenerationTime = 0;
    let averageWeeklyRecipesPerUser = 0;

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

        // Calculate average weekly recipes per user across all weeks
        if (recipes.length > 0 && uniqueUserCount > 0) {
          // Group recipes by week
          const recipesByWeek = new Map<string, { recipes: number; users: Set<string> }>();
          
          recipes.forEach((recipe) => {
            const createdAt = new Date(recipe.created_at);
            // Get the start of the week (Monday)
            const weekStart = new Date(createdAt);
            const dayOfWeek = weekStart.getDay();
            const diff = weekStart.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust to Monday
            weekStart.setDate(diff);
            weekStart.setHours(0, 0, 0, 0);
            
            const weekKey = weekStart.toISOString().split('T')[0];
            
            if (!recipesByWeek.has(weekKey)) {
              recipesByWeek.set(weekKey, { recipes: 0, users: new Set() });
            }
            
            const weekData = recipesByWeek.get(weekKey)!;
            weekData.recipes += 1;
            if (recipe.user_id) {
              weekData.users.add(recipe.user_id);
            }
          });

          // Calculate average recipes per user per week
          const totalWeeks = recipesByWeek.size;
          if (totalWeeks > 0) {
            averageWeeklyRecipesPerUser = totalRecipes / totalWeeks / uniqueUserCount;
          }
        }
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
        averageWeeklyRecipesPerUser: Math.round(averageWeeklyRecipesPerUser * 100) / 100,
        timestamp: new Date().toISOString(),
      },
    });
    return;
  } catch (error) {
    console.error('Error fetching all metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch metrics',
    });
    return;
  }
};

/**
 * Get daily growth metrics for the past 7 days
 * 
 * @route GET /api/v1/admin/metrics/daily
 * @returns Daily breakdown of recipes generated and active users for the past 7 days
 */
export const getDailyMetrics = async (req: Request, res: Response) => {
  try {
    if (!supabaseAdmin) {
      return res.status(500).json({
        success: false,
        error: 'Database connection not available',
      });
    }

    // Calculate date range (past 7 days, including today)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6); // 6 days ago + today = 7 days

    // Initialize daily data structure for all 7 days
    const dailyData: Array<{
      date: string;
      dateFormatted: string;
      recipesGenerated: number;
      activeUsers: number;
      cumulativeRecipes: number;
      cumulativeUsers: number;
    }> = [];

    // Initialize all 7 days with zero values
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dateFormatted = date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      });

      dailyData.push({
        date: dateStr,
        dateFormatted,
        recipesGenerated: 0,
        activeUsers: 0,
        cumulativeRecipes: 0,
        cumulativeUsers: 0,
      });
    }

    // Get recipes generated in the past 7 days
    try {
      const { data: recipes, error: recipesError } = await supabaseAdmin
        .from('recipe_generations')
        .select('user_id, created_at')
        .gte('created_at', sevenDaysAgo.toISOString())
        .lte('created_at', new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1).toISOString()); // End of today

      if (!recipesError && recipes) {
        // Group recipes by date
        recipes.forEach((recipe) => {
          const createdAt = new Date(recipe.created_at);
          const dateStr = createdAt.toISOString().split('T')[0];
          
          const dayData = dailyData.find(d => d.date === dateStr);
          if (dayData) {
            dayData.recipesGenerated += 1;
          }
        });
      }
    } catch (e) {
      console.log('Error fetching recipe generations:', e);
    }

    // Get active users per day (users who generated recipes OR added pantry items)
    try {
      // Get users who generated recipes each day
      const { data: recipes, error: recipesError } = await supabaseAdmin
        .from('recipe_generations')
        .select('user_id, created_at')
        .gte('created_at', sevenDaysAgo.toISOString())
        .lte('created_at', new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1).toISOString());

      if (!recipesError && recipes) {
        // Group active users by date from recipe generations
        const usersByDate = new Map<string, Set<string>>();
        
        recipes.forEach((recipe) => {
          const createdAt = new Date(recipe.created_at);
          const dateStr = createdAt.toISOString().split('T')[0];
          
          if (!usersByDate.has(dateStr)) {
            usersByDate.set(dateStr, new Set());
          }
          
          if (recipe.user_id) {
            usersByDate.get(dateStr)!.add(recipe.user_id);
          }
        });

        // Update daily data with active users from recipes
        usersByDate.forEach((users, dateStr) => {
          const dayData = dailyData.find(d => d.date === dateStr);
          if (dayData) {
            dayData.activeUsers = users.size;
          }
        });
      }

      // Also get users who added pantry items (alternative activity metric)
      const { data: pantryItems, error: pantryError } = await supabaseAdmin
        .from('pantry_items')
        .select('user_id, created_at')
        .gte('created_at', sevenDaysAgo.toISOString())
        .lte('created_at', new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1).toISOString());

      if (!pantryError && pantryItems) {
        // Combine users from both recipes and pantry items
        const allUsersByDate = new Map<string, Set<string>>();
        
        // Add recipe users
        if (recipes) {
          recipes.forEach((recipe) => {
            const createdAt = new Date(recipe.created_at);
            const dateStr = createdAt.toISOString().split('T')[0];
            
            if (!allUsersByDate.has(dateStr)) {
              allUsersByDate.set(dateStr, new Set());
            }
            
            if (recipe.user_id) {
              allUsersByDate.get(dateStr)!.add(recipe.user_id);
            }
          });
        }

        // Add pantry item users
        pantryItems.forEach((item) => {
          const createdAt = new Date(item.created_at);
          const dateStr = createdAt.toISOString().split('T')[0];
          
          if (!allUsersByDate.has(dateStr)) {
            allUsersByDate.set(dateStr, new Set());
          }
          
          if (item.user_id) {
            allUsersByDate.get(dateStr)!.add(item.user_id);
          }
        });

        // Update daily data with combined active users
        allUsersByDate.forEach((users, dateStr) => {
          const dayData = dailyData.find(d => d.date === dateStr);
          if (dayData) {
            dayData.activeUsers = users.size;
          }
        });
      }
    } catch (e) {
      console.log('Error fetching active users:', e);
    }

    // Get all unique users who were active during this period for cumulative calculation
    const allUniqueUsers = new Set<string>();
    try {
      const { data: allRecipes } = await supabaseAdmin
        .from('recipe_generations')
        .select('user_id, created_at')
        .gte('created_at', sevenDaysAgo.toISOString())
        .lte('created_at', new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1).toISOString());

      const { data: allPantryItems } = await supabaseAdmin
        .from('pantry_items')
        .select('user_id, created_at')
        .gte('created_at', sevenDaysAgo.toISOString())
        .lte('created_at', new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1).toISOString());

      if (allRecipes) {
        allRecipes.forEach((r) => {
          if (r.user_id) allUniqueUsers.add(r.user_id);
        });
      }
      if (allPantryItems) {
        allPantryItems.forEach((item) => {
          if (item.user_id) allUniqueUsers.add(item.user_id);
        });
      }
    } catch (e) {
      console.log('Error fetching all users for cumulative calculation:', e);
    }

    // Calculate cumulative totals
    let cumulativeRecipes = 0;
    const seenUsersCumulative = new Set<string>();
    
    // Get users by date for cumulative tracking
    const usersByDateMap = new Map<string, Set<string>>();
    try {
      const { data: recipesForCumulative } = await supabaseAdmin
        .from('recipe_generations')
        .select('user_id, created_at')
        .gte('created_at', sevenDaysAgo.toISOString())
        .lte('created_at', new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1).toISOString());

      const { data: pantryItemsForCumulative } = await supabaseAdmin
        .from('pantry_items')
        .select('user_id, created_at')
        .gte('created_at', sevenDaysAgo.toISOString())
        .lte('created_at', new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1).toISOString());

      if (recipesForCumulative) {
        recipesForCumulative.forEach((r) => {
          const dateStr = new Date(r.created_at).toISOString().split('T')[0];
          if (!usersByDateMap.has(dateStr)) {
            usersByDateMap.set(dateStr, new Set());
          }
          if (r.user_id) {
            usersByDateMap.get(dateStr)!.add(r.user_id);
          }
        });
      }

      if (pantryItemsForCumulative) {
        pantryItemsForCumulative.forEach((item) => {
          const dateStr = new Date(item.created_at).toISOString().split('T')[0];
          if (!usersByDateMap.has(dateStr)) {
            usersByDateMap.set(dateStr, new Set());
          }
          if (item.user_id) {
            usersByDateMap.get(dateStr)!.add(item.user_id);
          }
        });
      }
    } catch (e) {
      console.log('Error building users by date map:', e);
    }
    
    dailyData.forEach((day) => {
      cumulativeRecipes += day.recipesGenerated;
      day.cumulativeRecipes = cumulativeRecipes;
      
      // Add users from this day to cumulative set
      const dayUsers = usersByDateMap.get(day.date);
      if (dayUsers) {
        dayUsers.forEach(userId => seenUsersCumulative.add(userId));
      }
      
      day.cumulativeUsers = seenUsersCumulative.size;
    });

    // Calculate growth metrics
    const totalRecipes = dailyData.reduce((sum, day) => sum + day.recipesGenerated, 0);
    const totalActiveUsers = allUniqueUsers.size;

    // Calculate week-over-week growth (if we have data)
    const firstDayRecipes = dailyData[0]?.recipesGenerated || 0;
    const lastDayRecipes = dailyData[dailyData.length - 1]?.recipesGenerated || 0;
    const recipesGrowth = firstDayRecipes > 0 
      ? ((lastDayRecipes - firstDayRecipes) / firstDayRecipes) * 100 
      : 0;

    res.status(200).json({
      success: true,
      data: {
        dailyBreakdown: dailyData,
        summary: {
          totalRecipes: totalRecipes,
          totalActiveUsers: totalActiveUsers,
          averageRecipesPerDay: Math.round((totalRecipes / 7) * 100) / 100,
          averageActiveUsersPerDay: Math.round((dailyData.reduce((sum, d) => sum + d.activeUsers, 0) / 7) * 100) / 100,
          recipesGrowthPercent: Math.round(recipesGrowth * 100) / 100,
        },
        dateRange: {
          startDate: sevenDaysAgo.toISOString().split('T')[0],
          endDate: today.toISOString().split('T')[0],
        },
        timestamp: new Date().toISOString(),
      },
    });
    return;
  } catch (error) {
    console.error('Error fetching daily metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch daily metrics',
    });
    return;
  }
};

