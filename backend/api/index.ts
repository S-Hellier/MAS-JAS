// Vercel serverless function entry point
// This file must be in the api/ directory for Vercel to recognize it as a serverless function
// Vercel's @vercel/node builder compiles TypeScript on-the-fly

// Register tsconfig-paths to resolve path aliases at runtime
// This must be done BEFORE any imports that use path aliases
import 'tsconfig-paths/register';

// Import the Express app
// Using relative path - Vercel will resolve this during build
import app from '../src/index';

// Export the Express app as the default export
// Vercel expects a default export from serverless functions
export default app;

