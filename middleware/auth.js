import createError from 'http-errors';
import { supabaseAdmin } from '../config/supabase.js';

export const requireAuth = async (req, _res, next) => {
  try {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice('Bearer '.length) : null;
    if (!token) throw createError(401, 'Missing Bearer token');

    // Validate token and attach user
    const { data, error } = await supabaseAdmin.auth.getUser(token);
    if (error) throw createError(401, error.message);
    req.user = data.user;
    req.accessToken = token;
    next();
  } catch (err) {
    next(err);
  }
};
