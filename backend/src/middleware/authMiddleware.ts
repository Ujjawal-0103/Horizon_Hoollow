import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/authService';

export interface AuthenticatedUser {
  id: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
  try {
    let token: string | undefined;

    // 1. Check Authorization: Bearer <token>
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7).trim();
    }

    // 2. Check cookie if authorization header is not present
    if (!token && (req as any).cookies?.mindtrace_token) {
      token = (req as any).cookies.mindtrace_token;
    }

    if (!token) {
      res.status(401).json({
        success: false,
        error: { message: 'Authentication required. Please log in.' }
      });
      return;
    }

    const payload = authService.verifyToken(token);
    req.user = {
      id: payload.sub,
      role: payload.role || 'STUDENT'
    };

    next();
  } catch (err: any) {
    res.status(401).json({
      success: false,
      error: { message: 'Invalid or expired session. Please log in again.' }
    });
  }
};

export const optionalAuth = (req: Request, res: Response, next: NextFunction): void => {
  try {
    let token: string | undefined;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7).trim();
    }
    if (!token && (req as any).cookies?.mindtrace_token) {
      token = (req as any).cookies.mindtrace_token;
    }
    if (token) {
      const payload = authService.verifyToken(token);
      req.user = {
        id: payload.sub,
        role: payload.role || 'STUDENT'
      };
    }
  } catch {
    // Ignore invalid tokens for optional auth
  }
  next();
};

export const requireOwnership = (paramKey: string = 'userId') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: { message: 'Authentication required.' }
      });
      return;
    }

    const targetId = req.params[paramKey];

    // If param is literally 'me', allow it
    if (targetId === 'me' || targetId === req.user.id) {
      return next();
    }

    // Admin override
    if (req.user.role === 'ADMIN') {
      return next();
    }

    res.status(403).json({
      success: false,
      error: { message: 'Access forbidden. You cannot view or modify another student’s learning data.' }
    });
  };
};
