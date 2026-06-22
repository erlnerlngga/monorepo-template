export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type RegisterInput = {
  email: string;
  password: string;
  name?: string;
};

export type AuthResponse = {
  user: AuthUser;
  error?: string;
};
