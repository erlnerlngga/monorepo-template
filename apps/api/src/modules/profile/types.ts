export type ProfileUser = {
  createdAt: Date;
  email: string;
  emailVerified: boolean;
  id: string;
  image: string | null;
  name: string;
  role: string | null;
  updatedAt: Date;
};

export type ProfileResponse = {
  user: ProfileUser;
};
