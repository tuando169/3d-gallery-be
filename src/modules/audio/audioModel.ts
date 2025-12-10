export interface AudioModel {
  id: string;
  title?: string;
  owner_id: string;

  file_url: string;
  room_ids: string[];

  metadata?: Record<string, any>;

  created_at: string;
}
