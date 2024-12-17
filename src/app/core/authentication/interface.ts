// interface.ts

export interface User {
  [prop: string]: any | null;
  userId?: number | string | null;
  username?: string;
  email?: string;
  avatar?: string | null;
  role?: string;
  roles?: any[] | null;
  permissions?: any[] | null;
  isAuthenticated?: boolean;
}

export interface Token {
  [prop: string]: any;
  access_token: string;
  token_type?: string;
  expires_in?: number;
  exp?: number;
  refresh_token?: string;
}
