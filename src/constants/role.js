
export const RoleEnum = Object.freeze({
  Designer: 'designer',
  Viewer: 'viewer',
  Admin: 'admin',
});

const data = [
  { id: RoleEnum.Admin, label: 'Admin' },
  { id: RoleEnum.Designer, label: 'Designer' },
  { id: RoleEnum.Viewer, label: 'Viewer' },
];

export const RoleMap = new Map(data.map((item) => [item.id, item]));
