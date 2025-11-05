// config/supabase.js
import { createClient } from "@supabase/supabase-js";
import { config } from "./env.js";

// Service role client (dùng cho storage/upload và các tác vụ admin)
export const supabaseAdmin = createClient(
  config.supabaseUrl,
  config.serviceRole,
  {
    auth: { persistSession: false },
  }
);

// Client theo user (forward Bearer token cho RLS)
export const getUserClient = (accessToken) => {
  // Create a client that forwards the user's JWT for RLS
  return createClient(config.supabaseUrl, config.anonKey, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    auth: { persistSession: false },
  });
};

export const getUserIdFromToken = async (req) => {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ")
    ? auth.slice("Bearer ".length)
    : null;
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error) throw error;
  return data.user.id; // <-- đây là user_id
};
