import { NextFunction, Request, Response } from 'express';
import { supabaseAdmin } from '../lib/supabase/admin';
import { AppError } from '../shared/errors/AppError';

export function requireRole(...allowedRoles: string[]) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AppError(401, 'Authentication required', 'UNAUTHORIZED');
      }

      const { data: profile, error } = await supabaseAdmin
        .from('profiles')
        .select('role, is_active')
        .eq('id', req.user.id)
        .single();

      if (error || !profile || !profile.is_active) {
        throw new AppError(403, 'User is not active', 'FORBIDDEN');
      }

      if (!allowedRoles.includes(profile.role)) {
        throw new AppError(403, 'Insufficient permissions', 'FORBIDDEN');
      }

      req.userRole = profile.role;
      next();
    } catch (error) {
      next(error);
    }
  };
}

export const requireAdmin = requireRole('admin', 'super_admin');
