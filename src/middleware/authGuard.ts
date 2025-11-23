import type { Request, Response, NextFunction } from 'express';
import createError from 'http-errors';
import { supabasePublic } from '../config/supabase';

declare module 'express-serve-static-core' {
  interface Request {
    user?: any;
    accessToken?: string | null;
  }
}

function extractBearerToken(req: Request): string {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) {
    throw createError(401, 'Missing or invalid Authorization header');
  }
  return header.substring('Bearer '.length).trim();
}

export const AuthGuard = {
  verifyToken: async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const token = extractBearerToken(req);

      // MUST use ANON client — only anon can decode JWT
      const { data, error } = await supabasePublic.auth.getUser(token);

      if (error || !data?.user) {
        throw createError(401, 'Invalid or expired token');
      }

      req.user = data.user;
      req.accessToken = token;

      console.log(`🔐 Authenticated UID: ${data.user.id}`);

      next();
    } catch (err) {
      next(err);
    }
  },
};
