export enum RoleEnum {
  Admin = 'admin',
  Designer = 'designer',
  Client = 'client',
}

const data = [
  { id: RoleEnum.Admin, label: 'Admin' },
  { id: RoleEnum.Designer, label: 'Designer' },
  { id: RoleEnum.Client, label: 'Client' },
];

export const RoleMap = new Map(data.map((item) => [item.id, item]));
