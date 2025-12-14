export interface Object3DModel {
  id: string;
  title: string;
  owner_id: string;
  file_url: string;
  metadata?: Record<string, any>;

  created_at: string;

  room_ids?: string[];
}
