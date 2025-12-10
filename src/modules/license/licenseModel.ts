export interface LicenseModel {
  id: string;
  title: string;

  price: number
  media_limit: number
  space_limit: number
}

export interface LicenseUploadModel {
  title: string;

  price: number
  media_limit: number
  space_limit: number
}
