export interface Object3DModel {
  id: string;

  owner_id?: string;
  file_url: string;

  poly_count?: number;
  bounds?: Record<string, any>;

  source_type: string;

  created_at: string;

  room_id: string;
}
