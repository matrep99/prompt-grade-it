import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@prisma/client';

interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
}

declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
      prisma: any;
    }
  }
}

interface AuthOptions
{
  allowDevBypass?: boolean;
}

export const requireAuth = (requiredRole?: UserRole, options: AuthOptions = {}) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.cookies.auth_token;
      const isDev = process.env.NODE_ENV !== 'production';
      
      if (!token) {
        if (isDev && options.allowDevBypass) {
          // In dev, allow bypass without auth
          return next();
        }
        return res.status(401).json({
          error: {
            code: 'UNAUTHORIZED',
            message: 'Accesso non autorizzato'
          }
        });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
      req.user = decoded;

      // Check role if required
      if (requiredRole && decoded.role !== requiredRole && decoded.role !== 'ADMIN') {
        return res.status(403).json({
          error: {
            code: 'INSUFFICIENT_PERMISSIONS',
            message: 'Permessi insufficienti'
          }
        });
      }

      next();
    } catch (error) {
      console.error('Auth error:', error);
      const isDev = process.env.NODE_ENV !== 'production';
      
      if (isDev && options.allowDevBypass) {
        // In dev, allow bypass on auth errors
        return next();
      }
      
      return res.status(401).json({
        error: {
          code: 'INVALID_TOKEN',
          message: 'Token non valido'
        }
      });
    }
  };
};

export const requireOwnership = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const testId = req.params.id;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Accesso non autorizzato'
        }
      });
    }

    // ADMIN can access everything
    if (req.user?.role === 'ADMIN') {
      return next();
    }

    const test = await req.prisma.test.findFirst({
      where: { id: testId },
      select: { ownerId: true }
    });

    if (!test) {
      return res.status(404).json({
        error: {
          code: 'TEST_NOT_FOUND',
          message: 'Verifica non trovata'
        }
      });
    }

    if (test.ownerId !== userId) {
      return res.status(403).json({
        error: {
          code: 'INSUFFICIENT_PERMISSIONS',
          message: 'Non hai i permessi per accedere a questa verifica'
        }
      });
    }

    next();
  } catch (error) {
    console.error('Ownership check error:', error);
    return res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Errore interno del server'
      }
    });
  }
};