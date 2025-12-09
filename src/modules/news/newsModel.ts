import { NewsItemTypeEnum } from "../../constants/newsItemType";

export interface NewsModel {
  id: string;
  owner_id: string;

  thumbnail?: string;
  title?: string;
  slug: string;
  description?: string;

  layout_json: Array<{
    type: NewsItemTypeEnum;
    content: string;
  }>;

  visibility: string;

  created_at: string;
  updated_at: string;
}

export interface NewsUploadModel {
  owner_id: string;

  thumbnail?: File;
  title?: string;
  slug: string;
  description?: string;

  layout_json: Array<{
    type: NewsItemTypeEnum;
    content: string | File;
  }>;

  visibility: string;

  created_at: string;
  updated_at: string;
}
