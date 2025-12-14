import { NewsItemTypeEnum } from "../../constants/newsItemType";
import { getUserFromToken, uploadFileToBucket } from "../../util";
import { supabaseService } from "../supabase/supabaseService";
import { LicenseModel, LicenseUploadModel } from "./licenseModel";

const TABLE = "licenses";

export const LicenseService = {
  async getAll(): Promise<LicenseModel[]> {
    return await supabaseService.findAllAdmin(TABLE, "*", (q: any) => q);
  },

  async create(token: string, body: LicenseUploadModel) {


    return await supabaseService.create(token, TABLE, body);
  },

  async update(
    token: string,
    id: string,
    body: LicenseUploadModel,
  ) {

    return await supabaseService.updateById(
      token,
      TABLE,
      id,
      body
    );
  },

  async remove(token: string, id: string): Promise<boolean> {
    return await supabaseService.deleteById(token, TABLE, id);
  },
};
