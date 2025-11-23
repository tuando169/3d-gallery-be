export enum NewsItemTypeEnum {
  Image = 'image',
  Object3D = 'object3d',
  Text = 'text',
}

const data = [
  { id: NewsItemTypeEnum.Image, label: 'Image' },
  { id: NewsItemTypeEnum.Object3D, label: '3D Object' },
  { id: NewsItemTypeEnum.Text, label: 'Text' },
];

export const NewsItemTypeMap = new Map(data.map((item) => [item.id, item]));
