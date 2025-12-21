import { AxiosResponse } from 'axios';
import { Request } from 'express';
import { supabaseAdmin } from './config/supabase';
import { UserModel } from './modules/user/userModel';
import { UserService } from './modules/user/userService';
import { supabaseService } from './modules/supabase/supabaseService';
import { ThirdPartyService } from './modules/third-party/thirdPartyService';
import { ImageService } from './modules/image/imageService';
import { Object3DService } from './modules/object3d/object3dService';
import { AudioService } from './modules/audio/audioService';

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
  const exists = await supabaseService.bucketExists(bucketName);

  if (!exists)
    throw { status: 400, message: `Bucket "${bucketName}" missing.` };

  // Kiểm duyệt nội dung (giữ nguyên)
  if (bucketName === 'images' || bucketName === 'textures') {
    const isValid = await ThirdPartyService.isValidImage(file);

    if (!isValid) {
      throw {
        status: 422,
        message: 'Media file is not approved!',
      };
    }
  }

  const safe = (file.originalname || 'upload.bin').replace(/[^\w.\-]/g, '_');
  const path = `${Date.now()}_${safe}`;

  // Upload (upsert = true)
  await supabaseService.uploadObject(
    bucketName,
    path,
    file.buffer,
    file.mimetype,
    true
  );

  // ✅ TẠO PUBLIC URL
  const publicUrl = supabaseService.getPublicUrl(bucketName, path);

  return publicUrl;
}

export async function deleteFileFromBucket(
  bucketName: string,
  publicUrl: string
) {
  try {
    if (!publicUrl) return;

    const url = new URL(publicUrl);

    // pathname:
    // /storage/v1/object/public/images/xxx.jpg
    const parts = url.pathname.split('/object/public/');

    if (parts.length < 2) return;

    // images/xxx.jpg
    const fullPath = parts[1];

    // Bỏ bucket name nếu đã có
    const path = fullPath.startsWith(bucketName + '/')
      ? fullPath.slice(bucketName.length + 1)
      : fullPath;

    const { error } = await supabaseAdmin.storage
      .from(bucketName)
      .remove([path]);

    if (error) {
      console.error('Delete public file error:', error.message);
    }
  } catch (err) {
    console.error('Fail to delete public file:', err);
  }
}

export async function getOwnedMediaCount(token: string): Promise<number> {
  const imageCount = await ImageService.getOwnedImageCount(token);
  const audioCount = await AudioService.getOwnedAudioCount(token);
  const objectCount = await Object3DService.getOwnedObjectCount(token);
  return Promise.resolve(imageCount + audioCount + objectCount);
}
