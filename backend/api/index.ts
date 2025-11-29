// Vercel serverless function entry point
// This file must be in the api/ directory for Vercel to recognize it as a serverless function
// Vercel's @vercel/node builder compiles TypeScript on-the-fly

// Import the Express app
// Using relative path - Vercel will resolve this during build
import app from '../src/index';

// Export the Express app as the default export
// Vercel expects a default export from serverless functions
export default app;

