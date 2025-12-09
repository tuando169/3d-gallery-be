import { AxiosResponse } from 'axios';
import { Request } from 'express';
import { supabaseAdmin } from './config/supabase';
import { UserModel } from './modules/user/userModel';
import { UserService } from './modules/user/userService';
import { supabaseService } from './modules/supabase/supabaseService';

export const isSuccessfulResponse = (response: AxiosResponse): boolean => {
  return response && response.status >= 200 && response.status < 300;
};

export const getUserFromToken = async (
  token: string
): Promise<{ user?: UserModel; error?: string }> => {
  const { data, error } = await supabaseAdmin.auth.getUser(token);

  if (error) {
    // Token hết hạn hoặc không hợp lệ
    // Console.log lỗi ra để debug nếu cần
    console.error('Auth Error:', error.message);
    return { user: undefined, error: error.message };
  }
  const userId = data.user?.id;
  if (!userId) {
    return { user: undefined, error: 'User not found' };
  }
  const userData = await UserService.getById(userId);
  return { user: userData, error: undefined };
};

export async function uploadFileToBucket(
  bucketName: string,
  file: Express.Multer.File
): Promise<string> {
  const safe = (file.originalname || 'upload.bin').replace(/[^\w.\-]/g, '_');
  const path = `${Date.now()}_${safe}`;
  await supabaseService.uploadObject(
    bucketName,
    path,
    file.buffer,
    file.mimetype,
    true
  );
  const fileUrl = await supabaseService.createSignedUrl(bucketName, path);
  return fileUrl;
}
