import { AuthResponse, UserResponse } from '@supabase/supabase-js';

import { supabaseAdmin, supabasePublic } from '../../config/supabase';
import { uploadFileToBucket } from '../../util';

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
    name: string;
    role: string;
    avatar: Express.Multer.File;
  }) {
    const { email, password, name, role } = params;

    // 1. Tạo user trong Supabase Auth
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // auto verify
      });

    if (authError) throw authError;

    const userId = authData.user?.id;
    if (!userId) throw new Error('Không lấy được userId từ Supabase');
    console.log('User ID:', params.avatar);

    const avatarUrl = await uploadFileToBucket('images', params.avatar);
    // 2. Insert/update bảng users

    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .upsert(
        {
          id: userId,
          email,
          name,
          role,
          avatar: avatarUrl,
        },
        { onConflict: 'id' }
      )
      .select()
      .single();

    if (userError) throw userError;

    return userData;
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
  async refresh(refresh_token: string): Promise<AuthResponse['data']> {
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
  async logout(accessToken: string): Promise<void> {
    const { error } = await supabaseAdmin.auth.admin.signOut(accessToken);

    if (error) throw error;
    return Promise.resolve();
  },
};
