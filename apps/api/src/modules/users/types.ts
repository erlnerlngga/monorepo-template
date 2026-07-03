export type UserListItem = {
  createdAt: Date;
  email: string;
  id: string;
  name: string;
  role: string;
  updatedAt: Date;
};

export type UsersResponse = {
  nextCursor: string | null;
  users: UserListItem[];
};
