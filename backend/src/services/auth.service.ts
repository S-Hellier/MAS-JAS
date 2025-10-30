import { supabase } from '@/config/supabase';
import { User, LoginRequest, UpdatePreferencesRequest } from '@/types/auth.types';

export class AuthService {
  private static instance: AuthService;

  private constructor() {}

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * Helper to parse food_restrictions from JSON string to array
   */
  private parseUserData(data: any): User {
    if (data.food_restrictions && typeof data.food_restrictions === 'string') {
      try {
        data.food_restrictions = JSON.parse(data.food_restrictions);
      } catch (e) {
        data.food_restrictions = [];
      }
    }
    return data as User;
  }

  /**
   * Login or create user by email
   * If user exists, return existing user
   * If user doesn't exist, create new user
   */
  async loginOrCreateUser(request: LoginRequest): Promise<User> {
    try {
      // Check if user exists
      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('email', request.email.toLowerCase().trim())
        .single();

      if (existingUser) {
        // User exists, return it (parse food_restrictions)
        return this.parseUserData(existingUser);
      }

      // User doesn't exist, create new user
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          email: request.email.toLowerCase().trim(),
          name: request.name || null,
        })
        .select()
        .single();

      if (createError) {
        throw new Error(`Failed to create user: ${createError.message}`);
      }

      if (!newUser) {
        throw new Error('Failed to create user: No data returned');
      }

      return this.parseUserData(newUser);
    } catch (error) {
      throw new Error(`Login/Create user failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // User not found
          return null;
        }
        throw new Error(`Failed to get user: ${error.message}`);
      }

      return this.parseUserData(data);
    } catch (error) {
      throw new Error(`Get user failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email.toLowerCase().trim())
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // User not found
          return null;
        }
        throw new Error(`Failed to get user: ${error.message}`);
      }

      return this.parseUserData(data);
    } catch (error) {
      throw new Error(`Get user by email failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update user name
   */
  async updateUserName(userId: string, name: string): Promise<User> {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({ name })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update user: ${error.message}`);
      }

      if (!data) {
        throw new Error('Failed to update user: No data returned');
      }

      return this.parseUserData(data);
    } catch (error) {
      throw new Error(`Update user failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update user preferences (diet, goals, food restrictions)
   */
  async updateUserPreferences(userId: string, preferences: UpdatePreferencesRequest): Promise<User> {
    try {
      const updateData: any = {};

      if (preferences.diet !== undefined) {
        updateData.diet = preferences.diet;
      }
      if (preferences.goals !== undefined) {
        updateData.goals = preferences.goals;
      }
      if (preferences.food_restrictions !== undefined) {
        updateData.food_restrictions = JSON.stringify(preferences.food_restrictions);
      }
      if (preferences.profile_completed !== undefined) {
        updateData.profile_completed = preferences.profile_completed;
      }

      const { data, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update preferences: ${error.message}`);
      }

      if (!data) {
        throw new Error('Failed to update preferences: No data returned');
      }

      return this.parseUserData(data);
    } catch (error) {
      throw new Error(`Update preferences failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
