export interface ImageModel {
  id: string;
  title?: string;
  description?: string;

  room_id?: string;
  owner_id?: string;
  file_url: string;

  width?: number;
  height?: number;

  created_at: string;
}
