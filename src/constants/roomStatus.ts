export enum RoomStatusEnum {
  Pending = 'pending',
  Published = 'published',
}

const data = [
  { id: RoomStatusEnum.Pending, label: 'Pending' },
  { id: RoomStatusEnum.Published, label: 'Published' },
];

export const RoomStatusMap = new Map(data.map((item) => [item.id, item]));
