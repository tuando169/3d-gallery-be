import { AxiosResponse } from 'axios';
import { Request } from 'express';
import { supabaseAdmin } from './config/supabase';
import { User } from '@supabase/supabase-js';

export const isSuccessfulResponse = (response: AxiosResponse): boolean => {
  return response && response.status >= 200 && response.status < 300;
};

export const getUserFromToken = async (
  token: string
): Promise<{ user?: User; error?: string }> => {
  const { data, error } = await supabaseAdmin.auth.getUser(token);

  if (error) {
    // Token hết hạn hoặc không hợp lệ
    // Console.log lỗi ra để debug nếu cần
    console.error('Auth Error:', error.message);
    return { user: undefined, error: error.message };
  }

  return { user: data.user, error: undefined };
};
