import { RoleEnum } from "../constants/role";

export interface UserModel {
  id: string;
  email: string;
  password_hash?: string;
  name?: string;
  phone?: string;
  role: RoleEnum;
  position?: string;
  created_at: string;
}