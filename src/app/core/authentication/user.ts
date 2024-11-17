import { User } from './interface';

export const admin: User = {
  id: 1,
  name: 'User',
  email: 'user@example.com',
  avatar: 'images/avatar.png',
};

export const guest: User = {
  name: 'unknown',
  email: 'unknown',
  avatar: 'images/avatar.png',
};
