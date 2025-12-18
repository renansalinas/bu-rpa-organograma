export type User = {
  id: string;
  email: string;
  name: string;
  role: 'master' | 'user';
  is_active?: boolean;
  created_at: string;
  updated_at: string;
};

export type CreateUserPayload = {
  email: string;
  name: string;
  password: string;
  role?: 'master' | 'user';
};

export type UpdateUserPayload = {
  id: string;
  email?: string;
  name?: string;
  role?: 'master' | 'user';
  is_active?: boolean;
};

