import { RoomStatusEnum } from '../../constants/roomStatus';
import { VisibilityEnum } from '../../constants/visibility';

export interface RoomModel {
  id: string;
  title?: string;
  description?: string;

  owner_id: string;
  author: string;
  slug: string;

  room_json: Record<string, any>;
  visibility: VisibilityEnum;
  status: RoomStatusEnum;

  type?: string;

  tags?: string[];
  tag?: string;
  thumbnail?: string;

  created_at: string;
  updated_at: string;
}

export interface RoomCollabModel {
  user_id: string;
  room_id: string;
}
