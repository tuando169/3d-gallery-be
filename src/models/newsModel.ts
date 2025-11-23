import { NewsItemTypeEnum } from '../constants/newsItemType';

export interface NewsModel {
  id: string;
  owner_id: string;

  title?: string;
  slug: string;
  description?: string;

  layout_json: Record<string, any>;

  visibility: string;

  created_at: string;
  updated_at: string;
}

export interface NewsItemModel {
  id: string;

  magazine_id: string;
  item_type: NewsItemTypeEnum;

  ref_id?: string;
  sort_index?: number;

  props_json?: Record<string, any>;

  created_at: string;
}
