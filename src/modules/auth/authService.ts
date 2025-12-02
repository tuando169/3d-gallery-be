import { AuthResponse, UserResponse } from '@supabase/supabase-js';

import { supabaseAdmin, supabasePublic } from '../../config/supabase';

export const AuthService = {
  /**
   * ====================================
   *  SIGNUP — Admin tạo tài khoản
   *  (bỏ qua RLS, dùng Service Role)
   * ====================================
   */
  async signup(params: {
    email: string;
    password: string;
  }): Promise<UserResponse['data']> {
    const { email, password } = params;

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (error) throw error;
    return data; // { user }
  },

  /**
   * ====================================
   *  LOGIN — User đăng nhập (ANON)
   * ====================================
   */
  async login(params: {
    email: string;
    password: string;
  }): Promise<AuthResponse['data']> {
    const { email, password } = params;

    const { data, error } = await supabasePublic.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data; // { user, session }
  },

  /**
   * ====================================
   *  REFRESH TOKEN — ANON
   *  Trả về { user, session }
   * ====================================
   */
  async refresh(params: {
    refresh_token: string;
  }): Promise<AuthResponse['data']> {
    const { refresh_token } = params;

    const { data, error } = await supabasePublic.auth.refreshSession({
      refresh_token,
    });

    if (error) throw error;
    return data; // { user, session }
  },

  /**
   * ====================================
   *  LOGOUT — Revoke access token
   *  (Service Role)
   * ====================================
   */
  async logout(accessToken: string): Promise<{ ok: true }> {
    const { error } = await supabaseAdmin.auth.admin.signOut(accessToken);

    if (error) throw error;
    return { ok: true };
  },
};
