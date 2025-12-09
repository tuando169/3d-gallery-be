export interface TextureModel {
  id: string;
  title: string;
  alb_url?: string;
  nor_url?: string;
  orm_url?: string;
  texture_for: string;
}

export interface TextureUploadData {
  title: string;
  alb?: File;
  nor?: File;
  orm?: File;
  texture_for: string;
}
