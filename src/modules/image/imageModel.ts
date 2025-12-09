export interface ImageModel {
  id: string;
  title?: string;

  room_id?: string;
  owner_id?: string;
  file_url: string;

  metadata?: Record<string, any>;

  created_at: string;
}

export interface ImageAnalyzeModel {
  ok: boolean;
  is_nsfw: boolean;
}
