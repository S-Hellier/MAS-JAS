import { supabase } from '@/config/supabase';
import { User, LoginRequest } from '@/types/auth.types';

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
        // User exists, return it
        return existingUser as User;
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

      return newUser as User;
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

      return data as User;
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

      return data as User;
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

      return data as User;
    } catch (error) {
      throw new Error(`Update user failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
