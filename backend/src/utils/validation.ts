import { z } from 'zod';

/**
 * Common validation schemas
 */
export const uuidSchema = z.string().uuid('Invalid UUID format');

export const dateStringSchema = z.string().regex(
  /^\d{4}-\d{2}-\d{2}$/,
  'Date must be in YYYY-MM-DD format'
);

export const positiveNumberSchema = z.number().positive('Must be a positive number');

export const nonEmptyStringSchema = z.string().min(1, 'String cannot be empty');

/**
 * Validate and parse request parameters
 */
export function validateParams<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
      throw new Error(`Validation error: ${errorMessages.join(', ')}`);
    }
    throw error;
  }
}

/**
 * Validate request body
 */
export function validateBody<T>(schema: z.ZodSchema<T>, body: unknown): T {
  return validateParams(schema, body);
}

/**
 * Validate query parameters
 */
export function validateQuery<T>(schema: z.ZodSchema<T>, query: unknown): T {
  return validateParams(schema, query);
}
