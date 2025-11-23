import createError from 'http-errors';
import { supabasePublic } from '../config/supabase.js';

export const requireAuth = async (req, _res, next) => {
  try {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ')
      ? auth.slice('Bearer '.length)
      : null;

    if (!token) throw createError(401, 'Missing Bearer token');

    // MUST use supabasePublic (anon client) to decode user token
    const { data, error } = await supabasePublic.auth.getUser(token);
    if (error || !data?.user)
      throw createError(401, 'Invalid or expired token');

    req.user = data.user;
    req.accessToken = token;
    console.log('UID from token:', data.user.id);

    next();
  } catch (err) {
    next(err);
  }
};
