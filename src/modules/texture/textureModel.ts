export interface TextureModel {
  id: string;
  name: string;
  alb_url?: string;
  nor_url?: string;
  orm_url?: string;
  object3d_id: string;
}

export interface TextureUploadData {
  name: string;
  alb?: File;
  nor?: File;
  orm?: File;
  object3d_id: string;
}
