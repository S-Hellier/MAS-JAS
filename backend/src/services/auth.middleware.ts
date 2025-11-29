import { Request, Response, NextFunction } from "express";
import { AuthService } from "@/services/auth.service";

const authService = AuthService.getInstance();

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.headers['x-user-id'] as string | undefined;

  console.log("🔐 [AUTH] Middleware triggered");
  console.log("🔐 [AUTH] Headers received:", req.headers);
  console.log("🔐 [AUTH] User ID from header:", userId);

  if (!userId) {
    console.error("🔐 [AUTH] ❌ Missing user ID");
    return res.status(401).json({ error: 'Unauthorized: missing user id' });
  }

  try {
    console.log("🔐 [AUTH] Looking up user in database...");
    
    // Check if user exists in DB
    const user = await authService.getUserById(userId);
    
    console.log("🔐 [AUTH] User lookup result:", user);
    
    if (!user) {
      console.error("🔐 [AUTH] ❌ User not found in database for ID:", userId);
      return res.status(404).json({ error: 'User not found' });
    }

    console.log("🔐 [AUTH] ✅ User authenticated:", userId);
    
    // Attach user object to request
    (req as any).user = { id: userId };
    next();
    return;
  } catch (err: any) {
    console.error("🔐 [AUTH] ❌ Auth middleware error:", err);
    console.error("🔐 [AUTH] Error details:", err.message);
    console.error("🔐 [AUTH] Error stack:", err.stack);
    res.status(500).json({ error: 'Internal server error' });
    return;
  }
};