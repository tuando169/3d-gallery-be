export enum VisibilityEnum {
  Public = 'public',
  Private = 'private',
}

const data = [
  { id: VisibilityEnum.Public, label: 'Public' },
  { id: VisibilityEnum.Private, label: 'Private' },
];

export const VisibilityMap = new Map(data.map((item) => [item.id, item]));
